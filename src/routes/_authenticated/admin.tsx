import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'

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
  const base =
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors'
  const activeClass = `${base} bg-primary text-primary-foreground`
  const inactiveClass = `${base} text-muted-foreground hover:bg-accent`

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Admin</span>
            <nav className="flex items-center gap-1">
              <Link
                to="/admin"
                activeProps={{ className: activeClass }}
                inactiveProps={{ className: inactiveClass }}
              >
                Users
              </Link>
              <Link
                to="/admin/keys"
                activeProps={{ className: activeClass }}
                inactiveProps={{ className: inactiveClass }}
              >
                Keys
              </Link>
              <Link
                to="/admin/audit-logs"
                activeProps={{ className: activeClass }}
                inactiveProps={{ className: inactiveClass }}
              >
                Audit Logs
              </Link>
            </nav>
          </div>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
