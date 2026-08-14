import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { listAuditLogs } from '#/features/admin/api/admin.functions'
import type { AuditLog, CursorPage } from '#/features/admin/types'
import { Button } from '#/components/animate-ui/components/buttons/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/_authenticated/admin/audit-logs')({
  component: AdminAuditLogsPage,
})

function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState<CursorPage<AuditLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async (cursor?: string) => {
    if (!cursor) setLoading(true)
    const result = await listAuditLogs({ data: { cursor, limit: 20 } })
    setLoading(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    setLogs((prev) => (cursor ? [...prev, ...result.data.items] : result.data.items))
    setPage(result.data)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {loading && logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Actor</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Target</th>
                  <th className="py-2 font-medium">Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{log.actorUserId.slice(0, 8)}…</td>
                    <td className="py-2 pr-4 font-medium">{log.action}</td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {log.targetType}:{log.targetId?.slice(0, 8) ?? '—'}…
                    </td>
                    <td className="max-w-52 truncate font-mono text-xs text-muted-foreground">
                      {log.payload ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && !loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">No audit logs yet.</p>
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
