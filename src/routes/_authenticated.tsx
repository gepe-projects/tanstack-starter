import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { getSessionInfo, logout } from '#/features/auth/api/auth.functions'
import { AppLayout } from '#/components/layouts/app-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (!session) {
      throw redirect({ to: '/sign-in' })
    }
    return { session } // auto masuk context, bisa diakses di semua route anaknya
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { session } = Route.useRouteContext()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await logout()
    navigate({ to: '/sign-in' })
  }

  return (
    <AppLayout user={session.user} onSignOut={handleSignOut} />
  )
}
