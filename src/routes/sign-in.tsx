import { toast } from '#/components/ui/toast'
import { getSessionInfo } from '#/features/auth/api/auth.functions'
import SignInForm from '#/features/auth/components/SignInForm'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import z from 'zod'

const SignInSearchSchema = z.object({
  error: z.string().optional(),
})


export const Route = createFileRoute('/sign-in')({
  validateSearch: SignInSearchSchema,
  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { error } = Route.useSearch()

  useEffect(() => {
    if (!error) return
    toast.add({
      title: 'Sign-in failed',
      description: error,
      type: 'error',
      timeout: 8000,
    })
    navigate({ to: '/sign-in', search: { error: undefined }, replace: true })
  }, [error, navigate])
  return (
    <div className="flex h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
}
