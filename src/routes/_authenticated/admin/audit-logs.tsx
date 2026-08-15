import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { parseAsString, useQueryState } from 'nuqs'

import { listAuditLogs } from '#/features/admin/api/admin.functions'
import type { AuditLog } from '#/features/admin/types'
import {
  createDataTableColumnHelper,
  DataTable,
  isDateRangeFilterValue,
  type DataTablePage,
  type DataTableQuery,
} from '#/components/tables/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/admin/audit-logs')({
  component: AdminAuditLogsPage,
})

const helper = createDataTableColumnHelper<AuditLog>()

const columns = helper.columns([
  helper.accessor('createdAt', {
    header: 'Time',
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
    meta: { filter: { type: 'date-range' } },
  }),
  helper.accessor('actorUserId', {
    header: 'Actor',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">
        {String(getValue()).slice(0, 8)}…
      </span>
    ),
  }),
  helper.accessor('action', {
    header: 'Action',
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),
  helper.accessor('targetType', {
    header: 'Target',
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.targetType}:{row.original.targetId?.slice(0, 8) ?? '—'}…
      </span>
    ),
  }),
  helper.accessor('payload', {
    header: 'Payload',
    cell: ({ getValue }) => (
      <span className="max-w-52 truncate font-mono text-xs text-muted-foreground">
        {getValue() ?? '—'}
      </span>
    ),
  }),
])

function AdminAuditLogsPage() {
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  const [from, setFrom] = useQueryState('from', parseAsString)
  const [to, setTo] = useQueryState('to', parseAsString)

  const fetchPage = useCallback(
    async (query: DataTableQuery): Promise<DataTablePage<AuditLog>> => {
      const range = query.filters.createdAt
      const result = await listAuditLogs({
        data: {
          cursor: query.cursor,
          search: query.search || undefined,
          from: isDateRangeFilterValue(range)
            ? (range.from ?? undefined)
            : undefined,
          to: isDateRangeFilterValue(range)
            ? (range.to ?? undefined)
            : undefined,
          limit: 20,
        },
      })
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    [],
  )

  const filterState = useMemo(() => ({ createdAt: { from, to } }), [from, to])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DataTable
          columns={columns}
          rowKey={(log) => log.id}
          fetchPage={fetchPage}
          search={{
            value: q,
            onValueChange: setQ,
            placeholder: 'Search action or actor…',
          }}
          filters={{
            state: filterState,
            onChange: (id, value) => {
              if (id !== 'createdAt') return
              const range = isDateRangeFilterValue(value)
                ? value
                : { from: null, to: null }
              setFrom(range.from)
              setTo(range.to)
            },
          }}
          emptyMessage="No audit logs yet."
        />
      </CardContent>
    </Card>
  )
}
