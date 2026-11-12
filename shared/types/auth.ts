import type { InferOutput } from 'valibot'
import { LoginSchema } from '#shared/schemas/auth'

export type LoginInput = InferOutput<typeof LoginSchema>

export interface LoginData {
  access_token: string
  refresh_token: string
  id_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
  scope: string
  is_first_login: boolean
}

export interface AuthUser {
  user_id: string
  username: string
  name: string
  given_name?: string
  family_name?: string
  user_type?: string
}

export interface EmployeeProfile {
  id?: string
  employee_no?: string
  position_id?: string
  position_name?: string
  division_id?: string
  division_name?: string
  citizen_id?: string
  prefix_id?: string
  prefix_name?: string
  prefix_name_th?: string
  prefix_name_en?: string
  first_name_th?: string
  last_name_th?: string
  first_name_en?: string
  last_name_en?: string
  gender_id?: string
  gender_name?: string
  email?: string
  profile_image_id?: string | null
  profile_image?: { id: string; url: string; file_names?: string } | null
  created_at?: string
  updated_at?: string
}

