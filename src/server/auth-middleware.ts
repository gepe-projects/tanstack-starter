import { createMiddleware } from '@tanstack/react-start'
import { useAppSession } from './session'
import { redirect } from '@tanstack/react-router'

export const requireAuthMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const session = await useAppSession()
  const data = session.data

  if (!data.user) throw new Error('Unauthorized')

  return next({
    context: {
      user: data.user, // narrowing → `AppSessionUser`, bukan undefined
      sessionId: data.sessionId ?? null,
      accessToken: data.accessToken ?? null,
    },
  })
})

export const guestOnlyMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const session = await useAppSession()
  if (session.data.user) throw redirect({ to: '/dashboard' })
  return next()
})
