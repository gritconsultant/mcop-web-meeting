export const USER_ROLES = ['employee', 'member'] as const

export type UserRole = (typeof USER_ROLES)[number]
