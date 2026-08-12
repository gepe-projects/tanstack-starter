import { useAppSession } from '#/server/session'

import type { ApiError, ApiResult } from './errors'
import { apiFetch } from './client'
import { publicApi } from './public'

const SESSION_EXPIRED: ApiError = {
  status: 401,
  message: 'Your session has expired. Please sign in again.',
  errors: [],
}

const inflight = new Map<string, Promise<boolean>>()

async function refreshSession(): Promise<boolean> {
  const session = await useAppSession()
  const refreshToken = session.data.refreshToken
  if (!refreshToken) return false

  let pending = inflight.get(refreshToken)
  if (!pending) {
    pending = (async () => {
      const res = await publicApi.refresh(refreshToken)
      if (!res.ok) return false

      const next = await useAppSession()
      await next.update({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        refreshTokenId: res.data.refreshTokenId,
        sessionId: res.data.sessionId,
        user: res.data.user,
      })
      return true
    })().finally(() => {
      inflight.delete(refreshToken)
    })
    inflight.set(refreshToken, pending)
  }
  return pending
}

interface AuthedRequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
}

export const authedApi = {
  async request<T>(path: string, options: AuthedRequestOptions = {}): Promise<ApiResult<T>> {
    const session = await useAppSession()
    const token = session.data.accessToken
    if (!token) {
      return { ok: false, error: SESSION_EXPIRED }
    }

    const result = await apiFetch<T>(path, { ...options, token })
    if (result.ok || result.error.status !== 401) {
      return result
    }

    const refreshed = await refreshSession()
    if (!refreshed) {
      const current = await useAppSession()
      await current.clear()
      return { ok: false, error: SESSION_EXPIRED }
    }

    const next = await useAppSession()
    const nextToken = next.data.accessToken
    if (!nextToken) {
      return { ok: false, error: SESSION_EXPIRED }
    }
    return apiFetch<T>(path, { ...options, token: nextToken })
  },
}
