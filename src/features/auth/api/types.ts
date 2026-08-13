import type { AppSessionUser } from '#/server/session'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  refreshTokenId: string
  sessionId: string
  user: AppSessionUser
}
