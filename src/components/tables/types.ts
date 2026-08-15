'use client'

import {
  columnVisibilityFeature,
  tableFeatures,
  type CellData,
  type RowData,
  type TableFeatures,
} from '@tanstack/react-table'

/**
 * Feature set shared by every DataTable instance.
 *
 * TanStack Table v9 requires explicit feature registration (v8 bundled every
 * feature by default). We only need column visibility; everything else
 * (search, filtering, cursor pagination) is driven by the DataTable itself.
 */
export const dataTableFeatures = tableFeatures({ columnVisibilityFeature })
export type DataTableFeatures = typeof dataTableFeatures

/** Declarative filter config, attached to a column via `meta.filter`. */
export type SelectFilterDef = {
  type: 'select'
  options: ReadonlyArray<{ value: string; label: string }>
  placeholder?: string
}

export type TextFilterDef = {
  type: 'text'
  placeholder?: string
}

export type DateRangeFilterDef = {
  type: 'date-range'
  fromPlaceholder?: string
  toPlaceholder?: string
}

export type ColumnFilterDef =
  SelectFilterDef | TextFilterDef | DateRangeFilterDef

/** Filter value shapes held in URL/table state. */
export type SelectFilterValue = string | null
export type DateRangeFilterValue = { from: string | null; to: string | null }
export type FilterValue = SelectFilterValue | DateRangeFilterValue

export function isDateRangeFilterValue(
  value: FilterValue | undefined | null,
): value is DateRangeFilterValue {
  return typeof value === 'object' && value !== null
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Renders a filter control for this column in the DataTable filter bar. */
    filter?: ColumnFilterDef
    /** Accessor used for client-side filtering (defaults to accessorKey/accessorFn). */
    filterValue?: (row: TData) => unknown
  }
}

/** Query sent to `fetchPage` in server mode. */
export interface DataTableQuery {
  cursor?: string
  search: string
  filters: Record<string, FilterValue>
}

/** Page contract returned by `fetchPage` in server mode. */
export interface DataTablePage<TData> {
  items: TData[]
  nextCursor: string | null
  hasNext: boolean
}
