import { env } from '#/env'

import type { ApiResult, SpringValidationError } from './errors'

const SERVER_URL = env.SERVER_URL ?? 'http://localhost:8080'

interface ApiFetchOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
  const { method = 'POST', body, token } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${SERVER_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return {
      ok: false,
      error: { status: 0, message: 'Could not reach the server. Check your connection and try again.', errors: [] },
    }
  }

  const text = await response.text()
  let payload: { message?: string; errors?: unknown; data?: T } | null = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        status: response.status,
        message: payload?.message ?? response.statusText,
        errors: Array.isArray(payload?.errors)
          ? (payload.errors as SpringValidationError[])
          : [],
      },
    }
  }

  return { ok: true, data: payload?.data as T }
}
