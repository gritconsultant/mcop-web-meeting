import { useAuth } from "~/composables/useAuth";
import { useSession } from "~/composables/useSession";
import { DEFAULT_ROUTE } from "~/composables/useNavigation";
import { sanitizeReturnTo, suppressAutoLogin } from "~/utils/auth/keycloakSso";
import {
  MEETING_NO_ACCESS_ERROR,
  isMeetingAccessDeniedError,
} from "~/utils/auth/role";
import { alertSessionExpired } from "~/utils/auth/sessionExpired";

/** เปิดเป็น true เมื่อพร้อมบังคับ login จริง */
const AUTH_REQUIRED = false;

const PUBLIC_PAGES = ["/login", "/auth/sso/callback"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (!AUTH_REQUIRED) return;

  const { isLoggedIn, clearTokens, isAccessExpiring, refreshAccessToken } =
    useSession();
  const store = useAuthStore();
  const isPublic = PUBLIC_PAGES.includes(to.path) || Boolean(to.meta.public);

  if (!isLoggedIn.value) {
    if (isPublic) return;
    const returnTo = sanitizeReturnTo(to.fullPath);
    return navigateTo({
      path: "/login",
      query: returnTo ? { returnTo } : undefined,
    });
  }

  if (to.path === "/login") {
    return navigateTo(DEFAULT_ROUTE);
  }

  const { ensureUser, getProfile } = useAuth();
  ensureUser();

  if (
    import.meta.client &&
    isAccessExpiring() &&
    !(await refreshAccessToken())
  ) {
    if (!isPublic) await alertSessionExpired();
    suppressAutoLogin();
    store.clearUser();
    return navigateTo({ path: "/login", query: { manual: "1" } });
  }

  if (!store.profile || !store.permissions) {
    try {
      await getProfile();
    } catch (error) {
      suppressAutoLogin();
      clearTokens();
      store.clearUser();
      return navigateTo({
        path: "/login",
        query: isMeetingAccessDeniedError(error)
          ? { error: MEETING_NO_ACCESS_ERROR }
          : { manual: "1" },
      });
    }
  }
});
