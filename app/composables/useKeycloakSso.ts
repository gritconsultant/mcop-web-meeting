import {
  KEYCLOAK_TRANSACTION_KEY,
  assertValidCallback,
  buildAuthorizationUrl,
  buildTokenExchangeBody,
  createPkceTransaction,
  resolveKeycloakConfig,
  resolveRedirectUri,
  validateIdToken,
  verifyIdTokenSignature,
  type PkceTransaction,
} from '~/utils/auth/keycloakSso'

type KeycloakTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  refresh_expires_in?: number
  id_token?: string
}

const queryValue = (value: unknown) => typeof value === 'string' ? value : ''

const parseTransaction = (raw: string | null): PkceTransaction => {
  if (!raw) throw new Error('Missing SSO transaction')

  try {
    const value = JSON.parse(raw) as Partial<PkceTransaction>
    if (
      typeof value.verifier !== 'string'
      || typeof value.challenge !== 'string'
      || typeof value.state !== 'string'
      || typeof value.nonce !== 'string'
      || typeof value.redirectUri !== 'string'
      || typeof value.createdAt !== 'number'
    ) {
      throw new Error('Invalid SSO transaction')
    }
    return value as PkceTransaction
  }
  catch {
    throw new Error('Invalid SSO transaction')
  }
}

export const useKeycloakSso = () => {
  const runtimeConfig = useRuntimeConfig()
  const keycloakConfig = computed(() =>
    resolveKeycloakConfig(
      runtimeConfig.public as unknown as Record<string, unknown>,
    ),
  )
  const isEnabled = computed(() => Boolean(keycloakConfig.value))

  const startLogin = async (options?: { prompt?: string }) => {
    if (!import.meta.client) throw new Error('SSO requires a browser')
    const config = keycloakConfig.value
    if (!config) throw new Error('SSO is not configured')

    const redirectUri = resolveRedirectUri(window.location.origin, config.redirectPath)
    const transaction = await createPkceTransaction(redirectUri)
    sessionStorage.setItem(KEYCLOAK_TRANSACTION_KEY, JSON.stringify(transaction))
    window.location.assign(buildAuthorizationUrl(config, transaction, options))
  }

  const completeLogin = async (query: Record<string, unknown>) => {
    if (!import.meta.client) throw new Error('SSO requires a browser')
    const config = keycloakConfig.value
    if (!config) throw new Error('SSO is not configured')

    const state = queryValue(query.state)
    const rawTransaction = sessionStorage.getItem(KEYCLOAK_TRANSACTION_KEY)
    sessionStorage.removeItem(KEYCLOAK_TRANSACTION_KEY)
    const transaction = parseTransaction(rawTransaction)
    assertValidCallback(state, transaction)

    if (queryValue(query.error)) {
      throw new Error('SSO authorization was not completed')
    }

    const code = queryValue(query.code)
    if (!code) throw new Error('Missing SSO callback parameters')

    const expectedRedirectUri = resolveRedirectUri(
      window.location.origin,
      config.redirectPath,
    )
    if (transaction.redirectUri !== expectedRedirectUri) {
      throw new Error('Invalid SSO redirect URI')
    }

    const response = await $fetch<KeycloakTokenResponse>(config.endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildTokenExchangeBody({
        code,
        clientId: config.clientId,
        redirectUri: transaction.redirectUri,
        verifier: transaction.verifier,
      }),
      retry: 0,
      timeout: 20_000,
    })

    if (!response.access_token || !response.refresh_token || !response.id_token) {
      throw new Error('Incomplete SSO token response')
    }

    await verifyIdTokenSignature(response.id_token, config)
    validateIdToken(response.id_token, config, transaction.nonce)

    useSession().setTokens({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      refreshExpiresIn: response.refresh_expires_in,
      idToken: response.id_token,
    })
  }

  return { isEnabled, startLogin, completeLogin }
}
