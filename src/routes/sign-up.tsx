import { toast } from '#/components/ui/toast'
import { getSessionInfo } from '#/features/auth/api/auth.functions'
import RegisterForm from '#/features/auth/components/RegisterForm'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import z from 'zod'

const SignUpSearchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/sign-up')({
  validateSearch: SignUpSearchSchema,
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
      title: 'Sign-up failed',
      description: error,
      type: 'error',
      timeout: 8000,
    })
    navigate({ to: '/sign-up', search: { error: undefined }, replace: true })
  }, [error, navigate])
  return (
    <div className="flex h-screen items-center justify-center">
      <RegisterForm />
    </div>
  )
}
