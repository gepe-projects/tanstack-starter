import { getSessionInfo } from '#/features/auth/api/auth.functions'
import SignInForm from '#/features/auth/components/SignInForm'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
}
