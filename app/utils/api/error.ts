export class ApiClientError extends Error {
  readonly code: string;
  readonly data: unknown;
  readonly status?: number;

  constructor(code: string, message: string, data?: unknown, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.data = data ?? null;
    this.status = status;
  }
}

export const DEFAULT_API_ERROR_MESSAGE =
  "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

const TECHNICAL_ERROR_PATTERN =
  /^\[(GET|POST|PUT|PATCH|DELETE)\]|^https?:\/\/|FetchError|NetworkError|unauthorizedError/i;

export const isTechnicalErrorMessage = (message?: string | null): boolean => {
  if (!message?.trim()) return true;
  return TECHNICAL_ERROR_PATTERN.test(message.trim());
};

/** คืนข้อความที่เหมาะกับ user — ไม่โชว์ URL / status ดิบจาก ofetch */
export const getUserFacingErrorMessage = (
  error?: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE,
): string => {
  if (!error) return fallback;

  const err = error as Record<string, unknown>;
  const response = err?.response as Record<string, unknown> | undefined;
  const data = (err?.data ?? response?._data) as
    | Record<string, unknown>
    | undefined;

  const candidates = [
    data?.message,
    error instanceof ApiClientError ? error.message : undefined,
    err?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (trimmed && !isTechnicalErrorMessage(trimmed)) {
      return trimmed;
    }
  }

  return fallback;
};

export const isApiClientError = (error: unknown): error is ApiClientError =>
  error instanceof ApiClientError;

export const normalizeApiError = (error: unknown): ApiClientError => {
  if (error instanceof ApiClientError) return error;

  const err = error as Record<string, unknown>;
  const response = err?.response as Record<string, unknown> | undefined;
  const data = (err?.data ?? response?._data) as
    | Record<string, unknown>
    | undefined;

  const status =
    Number(err?.statusCode ?? err?.status ?? response?.status ?? 0) ||
    undefined;
  const code = String(data?.code ?? status ?? "unknown");
  const message = getUserFacingErrorMessage(error);

  return new ApiClientError(code, message, data, status);
};
