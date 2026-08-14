import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { logout } from '#/features/auth/api/auth.functions'
import { Button } from '#/components/animate-ui/components/buttons/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: Dashboard,
})

function Dashboard() {
  const { session } = Route.useRouteContext()
  const navigate = useNavigate()
  const isAdmin = session.user.roles.includes('ADMIN')

  const handleSignOut = async () => {
    await logout()
    navigate({ to: '/sign-in' })
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You are signed in as {session.user.email}.</p>
          <p className="text-muted-foreground text-sm">
            Roles: {session.user.roles.join(', ')}
          </p>
          <div className="mt-6 flex gap-2">
            {isAdmin && (
              <Button asChild variant="outline">
                <Link to="/admin">Admin</Link>
              </Button>
            )}
            <Button onClick={handleSignOut}>Sign out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
