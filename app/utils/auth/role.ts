import type { UserRole } from "#shared/types/role";
import type { AuthUser } from "#shared/types/auth";
import type { EmployeePermission } from "#shared/types/permissions";

/**
 * Role keys สำหรับเข้าใช้งานระบบประชุม
 * ตอนนี้ยังไม่มี role เฉพาะ meeting — เปิดให้ employee ที่ is_enable เข้าได้ก่อน
 * แล้วค่อยเติม key จริงทีหลัง
 */
export const MEETING_ACCESS_ROLE_KEYS: string[] = [
  // 'web-meeting.admin',
  // 'web-meeting.user',
];

export const MEETING_NO_ACCESS_ERROR = "no-access";

export class MeetingAccessDeniedError extends Error {
  constructor() {
    super("Employee has no Meeting access role");
    this.name = "MeetingAccessDeniedError";
  }
}

export const isMeetingAccessDeniedError = (
  error: unknown,
): error is MeetingAccessDeniedError =>
  error instanceof MeetingAccessDeniedError;

export const canAccessMeeting = (
  permission: EmployeePermission | null | undefined,
): boolean => {
  if (permission?.is_enable !== true) return false;
  // ยังไม่มี role เฉพาะ — อนุญาตทุกคนที่ enable
  if (!MEETING_ACCESS_ROLE_KEYS.length) return true;
  return MEETING_ACCESS_ROLE_KEYS.some((key) =>
    permission.role_keys.includes(key),
  );
};

export const getUserRole = (
  user: AuthUser | null | undefined,
): UserRole | null => {
  if (user?.user_type === "employee" || user?.user_type === "member") {
    return user.user_type;
  }
  return null;
};

export const hasRole = (
  user: AuthUser | null | undefined,
  roles: UserRole | UserRole[],
): boolean => {
  const role = getUserRole(user);
  if (!role) return false;

  const allowed = Array.isArray(roles) ? roles : [roles];
  if (allowed.includes("member") && role === "employee") return true;
  return allowed.includes(role);
};

export const isEmployeeUser = (user: AuthUser | null | undefined) =>
  getUserRole(user) === "employee";

export const isMemberUser = (user: AuthUser | null | undefined) =>
  hasRole(user, "member");
