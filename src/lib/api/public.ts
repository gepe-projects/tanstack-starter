import type { SignInInput, RegisterInput } from '#/features/auth/schemas'

import type { AppSessionUser } from '#/server/session'

import type { ApiResult } from './errors'
import { apiFetch } from './client'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  refreshTokenId: string
  sessionId: string
  user: AppSessionUser
}

export const publicApi = {
  login(data: SignInInput): Promise<ApiResult<TokenResponse>> {
    return apiFetch<TokenResponse>('/api/v1/auth/login', { method: 'POST', body: data })
  },

  register(data: RegisterInput): Promise<ApiResult<TokenResponse>> {
    return apiFetch<TokenResponse>('/api/v1/auth/register', { method: 'POST', body: data })
  },

  refresh(refreshToken: string): Promise<ApiResult<TokenResponse>> {
    return apiFetch<TokenResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    })
  },

  logout(refreshToken: string): Promise<ApiResult<null>> {
    return apiFetch<null>('/api/v1/auth/logout', {
      method: 'POST',
      body: { refreshToken },
    })
  },
}
