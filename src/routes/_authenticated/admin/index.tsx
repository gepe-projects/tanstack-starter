import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import { listUsers } from '#/features/admin/api/admin.functions'
import type { AdminUser, UserStatus } from '#/features/admin/types'
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTablePage,
  type DataTableQuery,
} from '#/components/tables/data-table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: AdminUsersPage,
})

const STATUS_FILTER_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DISABLED', label: 'Disabled' },
] as const

const helper = createDataTableColumnHelper<AdminUser>()

const columns = helper.columns([
  helper.accessor('email', { header: 'Email' }),
  helper.accessor('emailVerified', {
    header: 'Verified',
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="outline">—</Badge>
      ),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <Badge
          variant={
            status === 'ACTIVE'
              ? 'default'
              : status === 'SUSPENDED'
                ? 'secondary'
                : 'outline'
          }
        >
          {status}
        </Badge>
      )
    },
    meta: {
      filter: {
        type: 'select',
        options: STATUS_FILTER_OPTIONS,
        placeholder: 'All statuses',
      },
    },
  }),
  helper.accessor('roles', {
    header: 'Roles',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">
        {getValue().join(', ') || '—'}
      </span>
    ),
  }),
  helper.display({
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link
          to="/admin/users/$userId"
          params={{ userId: row.original.userId }}
        >
          Manage
        </Link>
      </Button>
    ),
  }),
])

function AdminUsersPage() {
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum(STATUS_FILTER_OPTIONS.map((option) => option.value)),
  )

  const fetchPage = useCallback(
    async (query: DataTableQuery): Promise<DataTablePage<AdminUser>> => {
      const result = await listUsers({
        data: {
          cursor: query.cursor,
          search: query.search || undefined,
          status: (query.filters.status as UserStatus | undefined) ?? undefined,
          limit: 20,
        },
      })
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    [],
  )

  const filterState = useMemo(() => ({ status }), [status])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          rowKey={(user) => user.userId}
          fetchPage={fetchPage}
          search={{
            value: q,
            onValueChange: setQ,
            placeholder: 'Search email…',
          }}
          filters={{
            state: filterState,
            onChange: (id, value) => {
              if (id === 'status') {
                setStatus(
                  typeof value === 'string' ? (value as UserStatus) : null,
                )
              }
            },
          }}
          emptyMessage="No users found."
        />
      </CardContent>
    </Card>
  )
}
