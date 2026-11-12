import type { Query } from "#shared/types/query";

/** สิทธิ์รายคน — key = permission item key */
export type PermissionStaffMatrix = Record<string, string>;

export interface QueryPermission extends Query {
  position_id?: string;
  role_key?: string;
  employee_no?: string;
  is_enable?: boolean;
}

export interface PermissionResponse {
  id: string;
  employee_no: string;
  prefix_id: string;
  prefix_name_th: string;
  first_name_th: string;
  last_name_th: string;
  position_id: string;
  position_name: string;
  division_id: string;
  division_name: string;
  is_enable: boolean;
  role_keys: string[];
  created_at: string;
  updated_at: string;
}

export type EmployeePermission = Pick<
  PermissionResponse,
  "id" | "is_enable" | "role_keys"
>;
