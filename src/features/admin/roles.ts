import type { RoleType } from '#/features/admin/types'

/**
 * Rank role untuk UI admin — harus sinkron dengan hierarki backend
 * (UserAdminServiceImpl: SUPER_ADMIN(3) > ADMIN(2) > OPERATION(1) > USER(0)).
 * Backend tetap sumber kebenaran; ini hanya untuk enable/disable kontrol UI.
 */
export const ROLE_RANK: Record<RoleType, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  OPERATION: 1,
  USER: 0,
}

export function maxRank(roles: string[]): number {
  return roles.reduce((max, role) => {
    const rank = ROLE_RANK[role as RoleType] ?? 0
    return Math.max(max, rank)
  }, 0)
}

/**
 * Apakah principal termasuk tier admin (ADMIN ke atas). SUPER_ADMIN menurunkan
 * semua hak ADMIN — sinkron dengan RoleHierarchy backend (ROLE_SUPER_ADMIN > ROLE_ADMIN).
 */
export function hasAdminTier(roles: string[]): boolean {
  return maxRank(roles) >= ROLE_RANK.ADMIN
}

export function isRoleType(role: string): role is RoleType {
  return role in ROLE_RANK
}
