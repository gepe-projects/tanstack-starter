'use client'

import type { RowData, Table } from '@tanstack/react-table'
import { Columns3Icon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '#/components/ui/popover'
import type { DataTableFeatures } from './types'

/**
 * Popover to toggle which columns are visible. Columns with
 * `enableHiding: false` are excluded. Default: every column visible.
 */
export function ColumnVisibilityMenu<TData extends RowData>({
  table,
}: {
  table: Table<DataTableFeatures, TData>
}) {
  const columns = table.getAllColumns().filter((column) => column.getCanHide())

  if (columns.length === 0) {
    return null
  }

  const allVisible = table.getIsAllColumnsVisible()
  const someVisible = table.getIsSomeColumnsVisible()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label="Toggle column visibility"
          >
            <Columns3Icon data-icon="inline-start" />
            Columns
          </Button>
        }
      />
      <PopoverContent align="end" className="w-56 gap-2">
        <PopoverHeader>
          <PopoverTitle>Columns</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-0.5">
          {columns.map((column) => (
            <Label
              key={column.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted"
            >
              <Checkbox
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              />
              <span className="truncate">
                {typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id}
              </span>
            </Label>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={allVisible}
            onClick={() => table.toggleAllColumnsVisible(true)}
          >
            Show all
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!someVisible}
            onClick={() => table.toggleAllColumnsVisible(false)}
          >
            Hide all
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
