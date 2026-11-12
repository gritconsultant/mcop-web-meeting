export const shouldRefresh = (
  status: number | undefined,
  url: string,
  retried: boolean,
): boolean => status === 401 && !url.includes('/auth/') && !retried
