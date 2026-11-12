import { useSession } from '~/composables/useSession'
import { shouldRefresh } from '~/utils/api/authRetry'

type ApiOptions = Parameters<typeof $fetch>[1]

export const useApi = () => {
  const { accessToken, getApiBase, waitForAccess, refreshAccessToken } = useSession()

  const request = async <T>(
    url: string,
    opts: ApiOptions = {},
    _retried = false,
  ): Promise<T> => {
    const isAuthEndpoint = url.includes('/auth/')

    if (!isAuthEndpoint) await waitForAccess()

    const headers: Record<string, string> = {
      'Accept-Language': 'th-TH',
      ...(opts?.headers as Record<string, string> | undefined),
    }
    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    try {
      return await $fetch<T>(url, { baseURL: getApiBase(), ...opts, headers } as ApiOptions)
    }
    catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode

      if (shouldRefresh(status, url, _retried)) {
        const ok = await refreshAccessToken()
        if (ok) return request<T>(url, opts, true)
      }
      throw err
    }
  }

  return request
}
