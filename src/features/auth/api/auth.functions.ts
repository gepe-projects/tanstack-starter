import { createServerFn } from '@tanstack/react-start'

import { RegisterSchema, SignInSchema } from '#/features/auth/schemas'
import type { TokenResponse } from '#/features/auth/api/types'
import { useAppSession } from '#/server/session'

import type { ApiResult } from '#/lib/api/errors'
import { apiFetch } from '#/lib/api/client'
import {
  guestOnlyMiddleware,
  requireAuthMiddleware,
} from '#/server/auth-middleware'

export const login = createServerFn({ method: 'POST' })
  .middleware([guestOnlyMiddleware])
  .validator(SignInSchema)
  .handler(async ({ data }): Promise<ApiResult<{ userId: string }>> => {
    const result = await apiFetch<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: data,
    })
    if (!result.ok) return result

    const session = await useAppSession()
    await session.update({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      refreshTokenId: result.data.refreshTokenId,
      sessionId: result.data.sessionId,
      user: result.data.user,
    })
    return { ok: true, data: { userId: result.data.user.userId } }
  })

export const register = createServerFn({ method: 'POST' })
  .middleware([guestOnlyMiddleware])
  .validator(RegisterSchema)
  .handler(async ({ data }): Promise<ApiResult<{ userId: string }>> => {
    const result = await apiFetch<TokenResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: data,
    })
    if (!result.ok) return result

    const session = await useAppSession()
    await session.update({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      refreshTokenId: result.data.refreshTokenId,
      sessionId: result.data.sessionId,
      user: result.data.user,
    })
    return { ok: true, data: { userId: result.data.user.userId } }
  })

export const logout = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async () => {
    const session = await useAppSession()
    const refreshToken = session.data.refreshToken
    if (refreshToken) {
      await apiFetch<null>('/api/v1/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      })
    }
    await session.clear()
    return { ok: true }
  })

export const getSessionInfo = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const { user, sessionId } = session.data
    if (!user) return null
    return { user, sessionId: sessionId ?? null }
  },
)
