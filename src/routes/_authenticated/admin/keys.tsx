import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { listSigningKeys, rotateSigningKey } from '#/features/admin/api/admin.functions'
import type { RotatedKeyResponse, SigningKeyInfo } from '#/features/admin/types'
import { Button } from '#/components/animate-ui/components/buttons/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { toast } from '#/components/ui/toast'

export const Route = createFileRoute('/_authenticated/admin/keys')({
  component: AdminKeysPage,
})

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PREVIOUS: 'bg-amber-100 text-amber-700',
  RETIRED: 'bg-gray-100 text-gray-600',
}

function AdminKeysPage() {
  const [keys, setKeys] = useState<SigningKeyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [rotating, setRotating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRotated, setLastRotated] = useState<RotatedKeyResponse | null>(null)

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
      toast.add({ title: 'Rotation failed', description: result.error.message, type: 'error', timeout: 5000 })
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Signing Keys (RS256)</CardTitle>
        <Button onClick={rotate} disabled={rotating}>
          {rotating ? 'Rotating…' : 'Rotate key'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRotated && (
          <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            New ACTIVE key: <code className="font-mono">{lastRotated.kid}</code> (since{' '}
            {new Date(lastRotated.notBefore).toLocaleString()}). The previous key stays
            verifiable for 1 hour.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">kid</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Not before</th>
                  <th className="py-2 font-medium">Not after</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.kid} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{key.kid}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[key.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {key.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{new Date(key.notBefore).toLocaleString()}</td>
                    <td className="py-2">
                      {key.notAfter ? new Date(key.notAfter).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {keys.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No keys found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
