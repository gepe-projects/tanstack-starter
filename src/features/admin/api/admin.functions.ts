import { createServerFn } from '@tanstack/react-start'

import {
  AssignRolesSchema,
  AuditPageParamsSchema,
  ChangeStatusSchema,
  UserIdParamsSchema,
  UserPageParamsSchema,
} from '#/features/admin/schemas'
import type {
  AdminUser,
  AdminUserDetail,
  AuditLog,
  CursorPage,
  RotatedKeyResponse,
  SigningKeyInfo,
} from '#/features/admin/types'
import type { ApiResult } from '#/lib/api/errors'
import { authedApi } from '#/lib/api/authed'
import { requireAdminMiddleware } from '#/server/auth-middleware'

// ── users ──────────────────────────────────────────────

export const listUsers = createServerFn({ method: 'POST' })
  .middleware([requireAdminMiddleware])
  .validator(UserPageParamsSchema)
  .handler(async ({ data }): Promise<ApiResult<CursorPage<AdminUser>>> => {
    const query = new URLSearchParams({ limit: String(data.limit) })
    if (data.cursor) query.set('cursor', data.cursor)
    if (data.status) query.set('status', data.status)
    if (data.search) query.set('search', data.search)
    return authedApi.request<CursorPage<AdminUser>>(
      `/api/v1/admin/users?${query}`,
      {
        method: 'GET',
      },
    )
  })

export const getUser = createServerFn({ method: 'POST' })
  .middleware([requireAdminMiddleware])
  .validator(UserIdParamsSchema)
  .handler(async ({ data }): Promise<ApiResult<AdminUserDetail>> => {
    return authedApi.request<AdminUserDetail>(
      `/api/v1/admin/users/${data.userId}`,
      {
        method: 'GET',
      },
    )
  })

export const changeUserStatus = createServerFn({ method: 'POST' })
  .middleware([requireAdminMiddleware])
  .validator(ChangeStatusSchema)
  .handler(async ({ data }): Promise<ApiResult<null>> => {
    return authedApi.request<null>(
      `/api/v1/admin/users/${data.userId}/status`,
      {
        method: 'PATCH',
        body: { status: data.status },
      },
    )
  })

export const assignUserRoles = createServerFn({ method: 'POST' })
  .middleware([requireAdminMiddleware])
  .validator(AssignRolesSchema)
  .handler(async ({ data }): Promise<ApiResult<null>> => {
    return authedApi.request<null>(`/api/v1/admin/users/${data.userId}/roles`, {
      method: 'PUT',
      body: { roles: data.roles },
    })
  })

// ── keys ───────────────────────────────────────────────

export const listSigningKeys = createServerFn({ method: 'GET' })
  .middleware([requireAdminMiddleware])
  .handler(async (): Promise<ApiResult<SigningKeyInfo[]>> => {
    return authedApi.request<SigningKeyInfo[]>('/api/v1/admin/keys', {
      method: 'GET',
    })
  })

export const rotateSigningKey = createServerFn({ method: 'GET' })
  .middleware([requireAdminMiddleware])
  .handler(async (): Promise<ApiResult<RotatedKeyResponse>> => {
    return authedApi.request<RotatedKeyResponse>('/api/v1/admin/keys/rotate', {
      method: 'POST',
    })
  })

// ── audit logs ─────────────────────────────────────────

export const listAuditLogs = createServerFn({ method: 'POST' })
  .middleware([requireAdminMiddleware])
  .validator(AuditPageParamsSchema)
  .handler(async ({ data }): Promise<ApiResult<CursorPage<AuditLog>>> => {
    const query = new URLSearchParams({ limit: String(data.limit) })
    if (data.cursor) query.set('cursor', data.cursor)
    if (data.search) query.set('search', data.search)
    if (data.from) query.set('from', data.from)
    if (data.to) query.set('to', data.to)
    return authedApi.request<CursorPage<AuditLog>>(
      `/api/v1/admin/audit-logs?${query}`,
      {
        method: 'GET',
      },
    )
  })
