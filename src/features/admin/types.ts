export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
export type RoleType = 'USER' | 'ADMIN' | 'OPERATION' | 'SUPER_ADMIN'

export interface AdminUser {
  userId: string
  email: string
  emailVerified: boolean
  status: UserStatus
  roles: string[]
}

export interface AdminUserDetail extends AdminUser {
  statusChangedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
  hasNext: boolean
}

export interface SigningKeyInfo {
  kid: string
  algorithm: string
  status: 'ACTIVE' | 'PREVIOUS' | 'RETIRED'
  notBefore: string
  notAfter: string | null
  createdAt: string
}

export interface RotatedKeyResponse {
  kid: string
  status: string
  notBefore: string
}

export interface AuditLog {
  id: string
  actorUserId: string
  action: string
  targetType: string
  targetId: string | null
  payload: string | null
  createdAt: string
}
