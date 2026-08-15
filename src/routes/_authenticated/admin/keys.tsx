import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { parseAsStringEnum, useQueryState } from 'nuqs'

import {
  listSigningKeys,
  rotateSigningKey,
} from '#/features/admin/api/admin.functions'
import type { RotatedKeyResponse, SigningKeyInfo } from '#/features/admin/types'
import {
  createDataTableColumnHelper,
  DataTable,
} from '#/components/tables/data-table'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { toast } from '#/components/ui/toast'

export const Route = createFileRoute('/_authenticated/admin/keys')({
  component: AdminKeysPage,
})

const STATUS_FILTER_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PREVIOUS', label: 'Previous' },
  { value: 'RETIRED', label: 'Retired' },
] as const

const helper = createDataTableColumnHelper<SigningKeyInfo>()

const columns = helper.columns([
  helper.accessor('kid', {
    header: 'kid',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{getValue()}</span>
    ),
    meta: { filter: { type: 'text', placeholder: 'Filter kid…' } },
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
              : status === 'PREVIOUS'
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
  helper.accessor('notBefore', {
    header: 'Not before',
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
  }),
  helper.accessor('notAfter', {
    header: 'Not after',
    cell: ({ getValue }) => {
      const notAfter = getValue()
      return notAfter ? new Date(notAfter).toLocaleString() : '—'
    },
  }),
])

function AdminKeysPage() {
  const [keys, setKeys] = useState<SigningKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rotating, setRotating] = useState(false)
  const [lastRotated, setLastRotated] = useState<RotatedKeyResponse | null>(
    null,
  )
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum(STATUS_FILTER_OPTIONS.map((option) => option.value)),
  )

  const load = async () => {
    const result = await listSigningKeys()
    setLoading(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setKeys(result.data)
  }

  useEffect(() => {
    load()
  }, [])

  const rotate = async () => {
    setRotating(true)
    const result = await rotateSigningKey()
    setRotating(false)
    if (!result.ok) {
      toast.add({
        title: 'Rotation failed',
        description: result.error.message,
        type: 'error',
        timeout: 5000,
      })
      return
    }
    setLastRotated(result.data)
    toast.add({
      title: 'Signing key rotated',
      description: `New key ${result.data.kid.slice(0, 8)}… is now ACTIVE.`,
      type: 'success',
      timeout: 4000,
    })
    await load()
  }

  const filterState = useMemo(() => ({ status }), [status])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Signing Keys (RS256)</CardTitle>
        <Button onClick={rotate} disabled={rotating}>
          {rotating ? 'Rotating…' : 'Rotate key'}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {lastRotated && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            New ACTIVE key: <code className="font-mono">{lastRotated.kid}</code>{' '}
            (since {new Date(lastRotated.notBefore).toLocaleString()}). The
            previous key stays verifiable for 1 hour.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DataTable
          columns={columns}
          rowKey={(key) => key.kid}
          data={keys}
          loading={loading}
          search={{
            value: q,
            onValueChange: setQ,
            placeholder: 'Search kid, status…',
          }}
          filters={{
            state: filterState,
            onChange: (id, value) => {
              if (id === 'status') {
                setStatus(
                  typeof value === 'string'
                    ? (value as SigningKeyInfo['status'])
                    : null,
                )
              }
            },
          }}
          emptyMessage="No keys found."
          pageSize={5}
        />
      </CardContent>
    </Card>
  )
}
