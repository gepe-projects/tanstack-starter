import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getSessionInfo } from '#/features/auth/api/auth.functions'
import { hasAdminTier } from '#/features/admin/roles'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async () => {
    const session = await getSessionInfo()
    if (!session) {
      throw redirect({ to: '/sign-in' })
    }
    if (!hasAdminTier(session.user.roles)) {
      throw redirect({ to: '/dashboard' })
    }
    return { session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}
