import { defineStore } from 'pinia'
import type { AuthUser, EmployeeProfile } from '#shared/types/auth'
import type { UserRole } from '#shared/types/role'
import type { EmployeePermission } from '#shared/types/permissions'
import { getUserRole, hasRole, isEmployeeUser, isMemberUser } from '~/utils/auth/role'

interface AuthState {
  user: AuthUser | null
  profile: EmployeeProfile | null
  permissions: EmployeePermission | null
  isFirstLogin: boolean
}

export const useAuthStore = defineStore('meeting-auth', {
  persist: {
    pick: ['user', 'profile', 'isFirstLogin'],
  },

  state: (): AuthState => ({
    user: null,
    profile: null,
    permissions: null,
    isFirstLogin: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state): UserRole | null => getUserRole(state.user),
    isEmployee: (state) => isEmployeeUser(state.user),
    isMember: (state) => isMemberUser(state.user),
    hasRole: (state) => (roles: UserRole | UserRole[]) => hasRole(state.user, roles),
    roleKeys: (state): string[] => state.permissions?.role_keys ?? [],
    hasPermission: (state) => (key: string): boolean =>
      state.permissions?.is_enable === true && (state.permissions.role_keys ?? []).includes(key),
    displayName: (state) => {
      if (state.profile) {
        const prefix = state.profile.prefix_name_th ?? state.profile.prefix_name ?? ''
        const first = state.profile.first_name_th ?? ''
        const last = state.profile.last_name_th ?? ''
        const fullName = `${prefix}${first} ${last}`.trim()
        if (fullName) return fullName
      }
      return state.user?.name ?? ''
    },
  },

  actions: {
    setUser(user: AuthUser) {
      this.user = user
    },
    setProfile(profile: EmployeeProfile) {
      this.profile = profile
    },
    setPermissions(permissions: EmployeePermission | null) {
      this.permissions = permissions
    },
    clearUser() {
      this.user = null
      this.profile = null
      this.permissions = null
      this.isFirstLogin = false
    },
  },
})
