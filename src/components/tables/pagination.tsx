'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'

export interface TablePaginationProps {
  info: string
  canPrevious: boolean
  canNext: boolean
  loading?: boolean
  onPrevious: () => void
  onNext: () => void
}

/** Prev/next pagination bar — server mode uses cursor stacks, client mode page indexes. */
export function TablePagination({
  info,
  canPrevious,
  canNext,
  loading = false,
  onPrevious,
  onNext,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{info}</p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrevious || loading}
          onClick={onPrevious}
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext || loading}
          onClick={onNext}
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
