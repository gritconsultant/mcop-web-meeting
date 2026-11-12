import type { ApiResponse, LoginData } from '#shared/types'
import { buildRefreshTokenBody, resolveKeycloakConfig } from '~/utils/auth/keycloakSso'

type KeycloakTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  refresh_expires_in?: number
  id_token?: string
}

// refresh ที่กำลังทำอยู่ฝั่ง client ผู้เรียกพร้อมกันรอผลเดียวกัน (ฝั่ง server ไม่แชร์ข้าม request)
let refreshing: Promise<boolean> | null = null

const COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  secure: false,
  path: '/',
  maxAge: 60 * 60 * 24,
}

export interface SetTokensInput {
  accessToken: string
  refreshToken: string
  idToken?: string
  expiresIn?: number
  refreshExpiresIn?: number
}

export const useSession = () => {
  const config = useRuntimeConfig()

  const accessCookie = useCookie<string | null>('meeting_token', COOKIE_OPTIONS)
  const refreshCookie = useCookie<string | null>('meeting_rtoken', COOKIE_OPTIONS)
  const idTokenCookie = useCookie<string | null>('meeting_id_token', COOKIE_OPTIONS)
  const expiresCookie = useCookie<number | null>('meeting_token_expires_at', COOKIE_OPTIONS)
  const refreshExpiresCookie = useCookie<number | null>('meeting_rtoken_expires_at', COOKIE_OPTIONS)

  const accessToken = useState<string | null>('auth.access', () => accessCookie.value ?? null)
  const refreshToken = useState<string | null>('auth.refresh', () => refreshCookie.value ?? null)
  const idToken = useState<string | null>('auth.idToken', () => idTokenCookie.value ?? null)
  const accessExpiresAt = useState<number | null>('auth.expiresAt', () => expiresCookie.value ?? null)
  const refreshExpiresAt = useState<number | null>(
    'auth.refreshExpiresAt',
    () => refreshExpiresCookie.value ?? null,
  )

  const getApiBase = () =>
    `${config.public.WEB_API}/api/${config.public.API_VERSION}/`

  const setTokens = (tokens: SetTokensInput | LoginData) => {
    const access = 'access_token' in tokens ? tokens.access_token : tokens.accessToken
    const refresh = 'refresh_token' in tokens ? tokens.refresh_token : tokens.refreshToken
    const identity = 'access_token' in tokens ? tokens.id_token : tokens.idToken
    const expiresIn = 'access_token' in tokens ? tokens.expires_in : tokens.expiresIn
    const refreshExpiresIn = 'access_token' in tokens
      ? tokens.refresh_expires_in
      : tokens.refreshExpiresIn

    accessToken.value = access
    accessCookie.value = access
    refreshToken.value = refresh
    refreshCookie.value = refresh

    idToken.value = identity || null
    idTokenCookie.value = identity || null

    const accessExpiry = typeof expiresIn === 'number'
      ? Date.now() + expiresIn * 1000
      : null
    accessExpiresAt.value = accessExpiry
    expiresCookie.value = accessExpiry

    const refreshExpiry = typeof refreshExpiresIn === 'number'
      ? Date.now() + refreshExpiresIn * 1000
      : null
    refreshExpiresAt.value = refreshExpiry
    refreshExpiresCookie.value = refreshExpiry
  }

  const clearTokens = () => {
    accessToken.value = null
    accessCookie.value = null
    refreshToken.value = null
    refreshCookie.value = null
    idToken.value = null
    idTokenCookie.value = null
    accessExpiresAt.value = null
    expiresCookie.value = null
    refreshExpiresAt.value = null
    refreshExpiresCookie.value = null
  }

  const getIdToken = () => idToken.value ?? ''
  const isSsoSession = () => Boolean(getIdToken())

  const waitForAccess = async (timeoutMs = 1500): Promise<boolean> => {
    if (accessToken.value) return true
    if (import.meta.server) return false
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 50))
      if (accessToken.value) return true
    }
    return !!accessToken.value
  }

  const isAccessExpiring = (bufferMs = 60_000) => {
    if (!accessExpiresAt.value) return true
    return Date.now() > accessExpiresAt.value - bufferMs
  }

  const requestRefresh = async (token: string): Promise<SetTokensInput | LoginData> => {
    const keycloak = resolveKeycloakConfig(
      config.public as unknown as Record<string, unknown>,
    )
    // token ของ SSO ออกให้ client ของเว็บนี้ ต้อง refresh ที่ Keycloak ด้วย client เดียวกัน
    if (isSsoSession() && keycloak) {
      const res = await $fetch<KeycloakTokenResponse>(keycloak.endpoints.token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: buildRefreshTokenBody(keycloak.clientId, token),
        retry: 0,
        timeout: 20_000,
      })
      if (!res.access_token) throw new Error('Incomplete SSO token response')
      return {
        accessToken: res.access_token,
        refreshToken: res.refresh_token || token,
        idToken: res.id_token || getIdToken(),
        expiresIn: res.expires_in,
        refreshExpiresIn: res.refresh_expires_in,
      }
    }

    const res = await $fetch<ApiResponse<LoginData>>('member/auth/refresh-token', {
      baseURL: getApiBase(),
      method: 'POST',
      body: { refresh_token: token },
      headers: { 'Accept-Language': 'th-TH' },
    })
    return res.data
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    if (refreshing) return refreshing
    const token = refreshToken.value
    if (!token) return false

    const task = (async () => {
      try {
        setTokens(await requestRefresh(token))
        return true
      }
      catch {
        clearTokens()
        return false
      }
      finally {
        refreshing = null
      }
    })()
    if (import.meta.client) refreshing = task
    return task
  }

  const isLoggedIn = computed(() => !!accessToken.value)

  return {
    accessToken,
    refreshToken,
    idToken,
    accessExpiresAt,
    refreshExpiresAt,
    isLoggedIn,
    getApiBase,
    getIdToken,
    isSsoSession,
    setTokens,
    clearTokens,
    waitForAccess,
    isAccessExpiring,
    refreshAccessToken,
  }
}
