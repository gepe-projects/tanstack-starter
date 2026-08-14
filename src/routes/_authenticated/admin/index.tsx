import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { listUsers } from '#/features/admin/api/admin.functions'
import type { AdminUser, CursorPage, UserStatus } from '#/features/admin/types'
import { Button } from '#/components/animate-ui/components/buttons/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminUsersPage,
})

const STATUS_OPTIONS: Array<{ value: UserStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DISABLED', label: 'Disabled' },
]

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [page, setPage] = useState<CursorPage<AdminUser> | null>(null)
  const [status, setStatus] = useState<UserStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (cursor?: string) => {
    setLoading(true)
    setError(null)
    const result = await listUsers({ data: { cursor, status: status || undefined, limit: 20 } })
    setLoading(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setUsers((prev) => (cursor ? [...prev, ...result.data.items] : result.data.items))
    setPage(result.data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users</CardTitle>
        <select
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as UserStatus | '')}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {loading && users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Roles</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId} className="border-b last:border-0">
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : user.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {user.roles.includes('SUPER_ADMIN') && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                            SUPER
                          </span>
                        )}
                        <span>{user.roles.join(', ') || '—'}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/admin/users/$userId" params={{ userId: user.userId }}>
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
            )}
          </div>
        )}
        {page?.hasNext && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" disabled={loading} onClick={() => load(page.nextCursor ?? undefined)}>
              {loading ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
