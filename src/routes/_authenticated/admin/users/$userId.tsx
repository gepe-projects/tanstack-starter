import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { assignUserRoles, changeUserStatus, getUser } from '#/features/admin/api/admin.functions'
import { isRoleType, maxRank } from '#/features/admin/roles'
import type { AdminUserDetail, RoleType, UserStatus } from '#/features/admin/types'
import { Button } from '#/components/animate-ui/components/buttons/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { toast } from '#/components/ui/toast'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetailPage,
})

const ALL_ROLES: RoleType[] = ['USER', 'ADMIN', 'OPERATION', 'SUPER_ADMIN']

function AdminUserDetailPage() {
  const { userId } = Route.useParams()
  const { session } = Route.useRouteContext()
  const actorRoles = session.user.roles
  const actorIsSuperAdmin = actorRoles.includes('SUPER_ADMIN')
  const actorRank = maxRank(actorRoles)

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getUser({ data: { userId } }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setUser(result.data)
      setSelectedRoles(result.data.roles.filter(isRoleType))
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  // target protected = rank target >= rank actor (hanya SUPER_ADMIN yang bisa
  // mengubah SUPER_ADMIN, dan akun biasa tidak bisa mengubah dirinya sendiri)
  const targetProtected = user ? maxRank(user.roles) >= actorRank : false
  const isSelf = user?.userId === session.user.userId

  const applyStatus = async (status: UserStatus) => {
    if (!user) return
    setBusy(true)
    const result = await changeUserStatus({ data: { userId: user.userId, status } })
    setBusy(false)
    if (!result.ok) {
      toast.add({ title: 'Update failed', description: result.error.message, type: 'error', timeout: 5000 })
      return
    }
    toast.add({ title: 'Status updated', description: `Account is now ${status}`, type: 'success', timeout: 3000 })
    setUser({ ...user, status })
  }

  const saveRoles = async () => {
    if (!user) return
    setBusy(true)
    const result = await assignUserRoles({ data: { userId: user.userId, roles: selectedRoles } })
    setBusy(false)
    if (!result.ok) {
      toast.add({ title: 'Update failed', description: result.error.message, type: 'error', timeout: 5000 })
      return
    }
    toast.add({
      title: 'Roles updated',
      description: 'All sessions of this user were revoked — they must sign in again.',
      type: 'success',
      timeout: 5000,
    })
    setUser({ ...user, roles: selectedRoles })
  }

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
  }

  if (error || !user) {
    return <p className="py-8 text-center text-sm text-destructive">{error ?? 'User not found'}</p>
  }

  const toggleRole = (role: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to users
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.email}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {targetProtected && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {isSelf && actorIsSuperAdmin
                ? 'This is your own account — you may manage it as the SUPER_ADMIN.'
                : 'This account is protected (role rank ≥ yours). Only a SUPER_ADMIN can modify SUPER_ADMIN accounts, and regular accounts cannot modify themselves.'}
            </p>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{user.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email verified</dt>
              <dd className="font-medium">{user.emailVerified ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{new Date(user.createdAt).toLocaleString()}</dd>
            </div>
          </dl>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busy || targetProtected || user.status === 'ACTIVE'}
              onClick={() => applyStatus('ACTIVE')}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || targetProtected || user.status === 'SUSPENDED'}
              onClick={() => applyStatus('SUSPENDED')}
            >
              Suspend
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy || targetProtected || user.status === 'DISABLED'}
              onClick={() => applyStatus('DISABLED')}
            >
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Role changes take effect on the user&apos;s next sign-in (all their sessions are revoked).
          </p>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLES.filter((role) => role !== 'SUPER_ADMIN' || actorIsSuperAdmin).map((role) => (
              <label
                key={role}
                className={`flex items-center gap-2 text-sm ${targetProtected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  disabled={targetProtected}
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="size-4"
                />
                {role}
              </label>
            ))}
          </div>
          {!actorIsSuperAdmin && (
            <p className="text-xs text-muted-foreground">
              Only a SUPER_ADMIN can grant the SUPER_ADMIN role.
            </p>
          )}
          <Button
            size="sm"
            disabled={busy || targetProtected || selectedRoles.length === 0}
            onClick={saveRoles}
          >
            Save roles
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
