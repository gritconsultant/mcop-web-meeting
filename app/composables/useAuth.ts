import { jwtDecode } from "jwt-decode";
import type {
  ApiResponse,
  LoginData,
  LoginInput,
  AuthUser,
  EmployeeProfile,
} from "#shared/types";
import { useApi } from "~/composables/useApi";
import { useSession } from "~/composables/useSession";
import type { EmployeePermission } from "#shared/types/permissions";
import {
  KEYCLOAK_TRANSACTION_KEY,
  buildLogoutUrl,
  resolveKeycloakConfig,
  suppressAutoLogin,
} from "~/utils/auth/keycloakSso";
import {
  MeetingAccessDeniedError,
  canAccessMeeting,
} from "~/utils/auth/role";

interface JwtPayload {
  user_id: string;
  preferred_username: string;
  name: string;
  given_name?: string;
  family_name?: string;
  user_type?: string;
}

const decodeUser = (token: string): AuthUser => {
  const p = jwtDecode<JwtPayload>(token);
  return {
    user_id: p.user_id,
    username: p.preferred_username,
    name: p.name,
    given_name: p.given_name,
    family_name: p.family_name,
    user_type: p.user_type,
  };
};

export const useAuth = () => {
  const { accessToken, getApiBase, getIdToken, setTokens, clearTokens } =
    useSession();
  const runtimeConfig = useRuntimeConfig();
  const store = useAuthStore();
  const api = useApi();
  const nuxtApp = useNuxtApp();

  const getProfile = async () => {
    try {
      const res = await api<ApiResponse<EmployeeProfile>>("hrm/me/employee");
      const employeeId = res.data?.id;
      if (!employeeId) throw new Error("Employee profile is missing an id");

      const permissions = await api<ApiResponse<EmployeePermission>>(
        `hrm/permissions/${employeeId}`,
      );
      if (
        !permissions.data ||
        !Array.isArray(permissions.data.role_keys) ||
        !permissions.data.role_keys.every((key) => typeof key === "string")
      ) {
        throw new Error("Invalid employee permissions response");
      }
      if (!canAccessMeeting(permissions.data))
        throw new MeetingAccessDeniedError();

      nuxtApp.runWithContext(() => {
        store.$patch({ profile: res.data, permissions: permissions.data });
      });
      return res.data;
    } catch (error) {
      nuxtApp.runWithContext(() => {
        suppressAutoLogin();
        clearTokens();
        store.$patch(() => store.clearUser());
      });
      throw error;
    }
  };

  const login = async (payload: LoginInput) => {
    const res = await $fetch<ApiResponse<LoginData>>(
      "member/auth/manage/login",
      {
        baseURL: getApiBase(),
        method: "POST",
        body: payload,
        headers: { "Accept-Language": "th-TH" },
      },
    );
    setTokens(res.data);
    store.setUser(decodeUser(res.data.access_token));
    store.isFirstLogin = res.data.is_first_login;

    try {
      await getProfile();
    } catch (error) {
      await navigateTo({ path: "/login" });
      throw error;
    }
    return res;
  };

  const ensureUser = () => {
    if (!store.user && accessToken.value) {
      try {
        store.setUser(decodeUser(accessToken.value));
      } catch {
        // token เสีย — ปล่อยให้ middleware จัดการ
      }
    }
  };

  const logout = async () => {
    let ssoLogoutUrl = "";
    const currentIdToken = getIdToken();

    // Keycloak logout — เตรียมไว้แล้ว จะใช้เมื่อเปิด SSO
    if (import.meta.client) {
      if (currentIdToken) {
        const keycloak = resolveKeycloakConfig(
          runtimeConfig.public as unknown as Record<string, unknown>,
        );
        if (keycloak) {
          ssoLogoutUrl = buildLogoutUrl(
            keycloak,
            currentIdToken,
            new URL("/login", window.location.origin).toString(),
          );
        }
      }

      sessionStorage.removeItem(KEYCLOAK_TRANSACTION_KEY);
      suppressAutoLogin();
    }

    clearTokens();
    store.clearUser();

    // Keycloak SSO logout — เก็บ ssoLogoutUrl ไว้เมื่อพร้อมเปิดใช้
    void ssoLogoutUrl;
    return await navigateTo("/login");
  };

  return { login, getProfile, ensureUser, logout };
};
