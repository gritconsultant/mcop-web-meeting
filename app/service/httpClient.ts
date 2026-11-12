import { showAlert } from "~/utils/alert";
import { useApi } from "~/composables/useApi";
import { useSession } from "~/composables/useSession";
import {
  ApiClientError,
  getUserFacingErrorMessage,
  normalizeApiError,
} from "~/utils/api/error";
import { suppressAutoLogin } from "~/utils/auth/keycloakSso";
import { alertSessionExpired } from "~/utils/auth/sessionExpired";

interface ClientOption {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, any>;
  data?: Record<string, any> | FormData;
  headers?: Record<string, string>;
  timeout?: number;
  silent?: boolean;
}

let logoutOnce = false;

const isAuthPath = (url: string) => url.includes("/auth/");

const forceLogout = async () => {
  const { clearTokens } = useSession();
  const store = useAuthStore();
  suppressAutoLogin();
  clearTokens();
  store.clearUser();
  await navigateTo("/login");
};

const handleUnauthorized = async () => {
  if (logoutOnce) {
    throw new ApiClientError("401", "unauthorizedError", null, 401);
  }

  logoutOnce = true;

  try {
    await alertSessionExpired();
    await forceLogout();
  } finally {
    setTimeout(() => {
      logoutOnce = false;
    }, 1200);
  }

  throw new ApiClientError("401", "unauthorizedError", null, 401);
};

const presentError = (error: ApiClientError, url: string, silent?: boolean) => {
  if (silent || error.message === "unauthorizedError") return;

  if (isAuthPath(url) && error.status === 401) {
    const text = getUserFacingErrorMessage(error, "");
    showAlert({
      type: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      ...(text ? { text } : {}),
      isToast: true,
    });
  }
};

export const client = async <T = unknown>(ops: ClientOption): Promise<T> => {
  const api = useApi();
  const controller = new AbortController();
  const timeoutMs = ops.timeout ?? 600_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await api<T>(ops.url, {
      method: ops.method,
      params: ops.params,
      body: ops.data,
      signal: controller.signal,
      headers: {
        ...(ops.headers ?? {}),
        "Accept-Language": "th-TH",
      },
    });
  } catch (rawError: unknown) {
    const err = rawError as { name?: string };

    if (err?.name === "AbortError") {
      const timeoutError = new ApiClientError(
        "408",
        "คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง",
        null,
        408,
      );
      presentError(timeoutError, ops.url, ops.silent);
      throw timeoutError;
    }

    const error = normalizeApiError(rawError);

    if (error.status === 401 || error.code === "401") {
      if (isAuthPath(ops.url)) {
        presentError(error, ops.url, ops.silent);
        throw error;
      }
      await handleUnauthorized();
    }

    presentError(error, ops.url, ops.silent);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
