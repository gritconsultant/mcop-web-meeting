import { jwtDecode } from 'jwt-decode'

export const KEYCLOAK_TRANSACTION_KEY = 'mcop-meeting:keycloak:pkce'
export const KEYCLOAK_TRANSACTION_TTL_MS = 10 * 60 * 1000
export const KEYCLOAK_RETURN_TO_KEY = 'mcop-meeting:keycloak:returnTo'
export const KEYCLOAK_SKIP_AUTO_LOGIN_KEY = 'mcop-meeting:keycloak:skipAutoLogin'

export type KeycloakConfig = {
  baseUrl: string
  realm: string
  clientId: string
  idpHint: string
  redirectPath: string
  issuer: string
  endpoints: {
    authorization: string
    token: string
    userinfo: string
    logout: string
    jwks: string
  }
}

export type PkceTransaction = {
  verifier: string
  challenge: string
  state: string
  nonce: string
  redirectUri: string
  createdAt: number
}

type IdTokenClaims = {
  iss?: string
  aud?: string | string[]
  azp?: string
  nonce?: string
  exp?: number
  [claim: string]: unknown
}

type SigningJwk = {
  kid?: string
  kty?: string
  alg?: string
  use?: string
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

const isSafeRedirectPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !/[?#]/.test(path)

const isAllowedBaseUrl = (url: URL) => {
  if (url.username || url.password || url.search || url.hash) return false
  if (url.protocol === 'https:') return true
  return url.protocol === 'http:'
    && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
}

export const resolveKeycloakConfig = (
  publicConfig: Record<string, unknown>,
): KeycloakConfig | null => {
  const rawBaseUrl = text(publicConfig.KEYCLOAK_BASE_URL)
  const realm = text(publicConfig.KEYCLOAK_REALM)
  const clientId = text(publicConfig.KEYCLOAK_CLIENT_ID)
  const idpHint = text(publicConfig.KEYCLOAK_IDP_HINT)
  const redirectPath = text(publicConfig.KEYCLOAK_REDIRECT_PATH) || '/auth/sso/callback'

  if (!rawBaseUrl || !realm || !clientId || !isSafeRedirectPath(redirectPath)) {
    return null
  }

  try {
    const parsedBaseUrl = new URL(rawBaseUrl)
    if (!isAllowedBaseUrl(parsedBaseUrl)) return null

    const baseUrl = parsedBaseUrl.toString().replace(/\/$/, '')
    const issuer = `${baseUrl}/realms/${encodeURIComponent(realm)}`
    const oidc = `${issuer}/protocol/openid-connect`

    return {
      baseUrl,
      realm,
      clientId,
      idpHint,
      redirectPath,
      issuer,
      endpoints: {
        authorization: `${oidc}/auth`,
        token: `${oidc}/token`,
        userinfo: `${oidc}/userinfo`,
        logout: `${oidc}/logout`,
        jwks: `${oidc}/certs`,
      },
    }
  }
  catch {
    return null
  }
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

const randomBase64Url = (cryptoImpl: Crypto) => {
  const bytes = new Uint8Array(32)
  cryptoImpl.getRandomValues(bytes)
  return base64Url(bytes)
}

export const createCodeChallenge = async (
  verifier: string,
  cryptoImpl: Crypto = globalThis.crypto,
) => {
  const digest = await cryptoImpl.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  )
  return base64Url(new Uint8Array(digest))
}

export const createPkceTransaction = async (
  redirectUri: string,
  cryptoImpl: Crypto = globalThis.crypto,
  now = Date.now(),
): Promise<PkceTransaction> => {
  const verifier = randomBase64Url(cryptoImpl)
  return {
    verifier,
    challenge: await createCodeChallenge(verifier, cryptoImpl),
    state: randomBase64Url(cryptoImpl),
    nonce: randomBase64Url(cryptoImpl),
    redirectUri,
    createdAt: now,
  }
}

export const resolveRedirectUri = (origin: string, redirectPath: string) => {
  if (!isSafeRedirectPath(redirectPath)) {
    throw new Error('Invalid SSO redirect path')
  }
  const parsedOrigin = new URL(origin)
  if (!isAllowedBaseUrl(parsedOrigin)) {
    throw new Error('Invalid SSO application origin')
  }
  return new URL(redirectPath, `${parsedOrigin.origin}/`).toString()
}

export const sanitizeReturnTo = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null
  let path = value

  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(path)
      if (decoded === path) break
      path = decoded
    }
    catch {
      return null
    }
  }

  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (/[\\\r\n\t]/.test(path)) return null
  if (path === '/login' || path.startsWith('/login/')) return null
  if (path.startsWith('/auth/sso/')) return null
  return path
}

export const rememberReturnTo = (path: unknown) => {
  if (import.meta.server) return
  const safe = sanitizeReturnTo(path)
  if (!safe || safe === '/') return
  sessionStorage.setItem(KEYCLOAK_RETURN_TO_KEY, safe)
}

export const takeReturnTo = (fallback = '/'): string => {
  if (import.meta.server) return sanitizeReturnTo(fallback) ?? '/'
  const stored = sessionStorage.getItem(KEYCLOAK_RETURN_TO_KEY)
  sessionStorage.removeItem(KEYCLOAK_RETURN_TO_KEY)
  return sanitizeReturnTo(stored) ?? sanitizeReturnTo(fallback) ?? '/'
}

export const suppressAutoLogin = () => {
  if (import.meta.server) return
  sessionStorage.setItem(KEYCLOAK_SKIP_AUTO_LOGIN_KEY, '1')
}

export const consumeAutoLoginSuppression = () => {
  if (import.meta.server) return false
  const skip = sessionStorage.getItem(KEYCLOAK_SKIP_AUTO_LOGIN_KEY) === '1'
  sessionStorage.removeItem(KEYCLOAK_SKIP_AUTO_LOGIN_KEY)
  return skip
}

export type AuthorizationUrlOptions = {
  prompt?: string
}

export const buildAuthorizationUrl = (
  config: KeycloakConfig,
  transaction: PkceTransaction,
  options?: AuthorizationUrlOptions,
) => {
  const url = new URL(config.endpoints.authorization)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', transaction.redirectUri)
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', transaction.state)
  url.searchParams.set('nonce', transaction.nonce)
  url.searchParams.set('code_challenge', transaction.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  if (config.idpHint) url.searchParams.set('kc_idp_hint', config.idpHint)
  if (options?.prompt) url.searchParams.set('prompt', options.prompt)
  return url.toString()
}

export const buildTokenExchangeBody = (input: {
  code: string
  clientId: string
  redirectUri: string
  verifier: string
}) => new URLSearchParams({
  grant_type: 'authorization_code',
  client_id: input.clientId,
  code: input.code,
  redirect_uri: input.redirectUri,
  code_verifier: input.verifier,
})

export const buildRefreshTokenBody = (clientId: string, refreshToken: string) =>
  new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  })

export const assertValidCallback = (
  callbackState: string,
  transaction: PkceTransaction,
  now = Date.now(),
) => {
  if (!callbackState || callbackState !== transaction.state) {
    throw new Error('Invalid SSO state')
  }
  const age = now - transaction.createdAt
  if (age < 0 || age > KEYCLOAK_TRANSACTION_TTL_MS) {
    throw new Error('SSO transaction expired')
  }
}

const base64UrlToBytes = (value: string) => {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  return Uint8Array.from(binary, character => character.charCodeAt(0))
}

const jwksCache = new Map<string, { keys: SigningJwk[], fetchedAt: number }>()
const JWKS_TTL_MS = 10 * 60 * 1000
const JWKS_REFRESH_COOLDOWN_MS = 30 * 1000
const JWKS_TIMEOUT_MS = 5000

const isRsaSigningKey = (key: SigningJwk) =>
  key.kty === 'RSA'
  && (key.use === undefined || key.use === 'sig')
  && (key.alg === undefined || key.alg === 'RS256')

const loadJwks = async (config: KeycloakConfig, forceRefresh = false) => {
  const cached = jwksCache.get(config.endpoints.jwks)
  if (cached) {
    const age = Date.now() - cached.fetchedAt
    if (forceRefresh ? age < JWKS_REFRESH_COOLDOWN_MS : age < JWKS_TTL_MS) {
      return cached.keys
    }
  }

  let body: { keys?: SigningJwk[] }
  try {
    const response = await fetch(config.endpoints.jwks, {
      signal: AbortSignal.timeout(JWKS_TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    body = await response.json() as { keys?: SigningJwk[] }
  }
  catch (cause) {
    throw new Error("Cannot reach the identity provider's signing keys", { cause })
  }

  const keys = (Array.isArray(body.keys) ? body.keys : []).filter(isRsaSigningKey)
  jwksCache.set(config.endpoints.jwks, { keys, fetchedAt: Date.now() })
  return keys
}

export const verifyIdTokenSignature = async (
  idToken: string,
  config: KeycloakConfig,
) => {
  const [rawHeader, rawPayload, rawSignature] = idToken.split('.')
  if (!rawHeader || !rawPayload) throw new Error('Invalid ID token')

  let header: { alg?: string, kid?: string }
  try {
    header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(rawHeader)))
  }
  catch {
    throw new Error('Invalid ID token')
  }

  if (header.alg !== 'RS256') {
    throw new Error('Unsupported ID token algorithm')
  }
  if (!rawSignature) throw new Error('Invalid ID token signature')

  let keys = await loadJwks(config)
  let key = keys.find(candidate => candidate.kid === header.kid)
  if (!key) {
    keys = await loadJwks(config, true)
    key = keys.find(candidate => candidate.kid === header.kid)
  }
  if (!key) throw new Error('Unknown ID token signing key')

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    { ...key, ext: true, key_ops: ['verify'] } as JsonWebKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    base64UrlToBytes(rawSignature),
    new TextEncoder().encode(`${rawHeader}.${rawPayload}`),
  )
  if (!verified) throw new Error('Invalid ID token signature')
}

export const validateIdToken = (
  idToken: string,
  config: KeycloakConfig,
  expectedNonce: string,
  nowSeconds = Math.floor(Date.now() / 1000),
) => {
  let claims: IdTokenClaims
  try {
    claims = jwtDecode<IdTokenClaims>(idToken)
  }
  catch {
    throw new Error('Invalid ID token')
  }

  if (claims.iss !== config.issuer) throw new Error('Invalid ID token issuer')
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  if (!audiences.includes(config.clientId)) {
    throw new Error('Invalid ID token audience')
  }
  if (audiences.length > 1 && claims.azp !== config.clientId) {
    throw new Error('Invalid ID token authorized party')
  }
  if (!claims.nonce || claims.nonce !== expectedNonce) {
    throw new Error('Invalid ID token nonce')
  }
  if (typeof claims.exp !== 'number' || claims.exp <= nowSeconds) {
    throw new Error('Expired ID token')
  }
  return claims
}

export const buildLogoutUrl = (
  config: KeycloakConfig,
  idToken: string,
  postLogoutRedirectUri: string,
) => {
  const url = new URL(config.endpoints.logout)
  url.searchParams.set('client_id', config.clientId)
  if (idToken) url.searchParams.set('id_token_hint', idToken)
  url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri)
  return url.toString()
}
