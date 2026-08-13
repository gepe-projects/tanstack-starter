import { getSessionInfo } from '#/features/auth/api/auth.functions'
import { exchangeGoogleCode } from '#/features/auth/api/oauth.functions'
import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import z from 'zod'


const CallbackSearchSchema = z.object({
  code: z.string().min(1).optional(),
  error: z.string().optional(),
})

const GENERIC_OAUTH_ERROR = 'Google sign-in canceled or failed. Please try again.'

function oauthErrorToMessage(error: string): string {
  if (error === 'access_denied') {
    return 'You cancelled Google sign-in. Please try again.'
  }
  return GENERIC_OAUTH_ERROR
}

export const Route = createFileRoute('/auth/google/callback')({
  validateSearch: CallbackSearchSchema,
  beforeLoad: async ({ search }) => {
    const session = await getSessionInfo()
    if (session) throw redirect({ to: '/dashboard' })

    // Backend redirect ke sini dengan ?error=... saat user batal di Google
    if (search.error) {
      throw redirect({
        to: '/sign-in',
        search: { error: oauthErrorToMessage(search.error) },
      })
    }

    // URL callback tapi tidak ada code? (misal user batal / redirect manual)
    if (!search.code) {
      throw redirect({
        to: '/sign-in',
        search: { error: GENERIC_OAUTH_ERROR },
      })
    }

    // tuker one time code dari backend
    const result = await exchangeGoogleCode({ data: { code: search.code } })
    if (!result.ok) {
      throw redirect({
        to: '/sign-in',
        search: { error: result.error.message },
      })
    }
  },
  component: RouteComponent,

})

function RouteComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
      <Navigate to="/dashboard" />
    </div>
  )

}
