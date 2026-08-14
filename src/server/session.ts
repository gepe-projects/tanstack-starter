import { useSession } from '@tanstack/react-start/server'

import { env } from '#/env'

export interface AppSessionUser {
  userId: string
  email: string
  emailVerified: boolean
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED'
  roles: string[]
}

export interface AppSessionData {
  accessToken?: string
  refreshToken?: string
  refreshTokenId?: string
  sessionId?: string
  user?: AppSessionUser
}

export function useAppSession() {
  return useSession<AppSessionData>({
    name: 'app-session',
    password: env.SESSION_SECRET,
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      path: '/',
    },
  })
}
