'use client'

import * as React from 'react'
import {
  createColumnHelper,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type RowData,
} from '@tanstack/react-table'
import { RotateCcwIcon, SearchIcon, XIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { ColumnVisibilityMenu } from './column-visibility'
import { TablePagination } from './pagination'
import {
  dataTableFeatures,
  isDateRangeFilterValue,
  type ColumnFilterDef,
  type DataTableFeatures,
  type DataTablePage,
  type DataTableQuery,
  type DateRangeFilterValue,
  type FilterValue,
} from './types'

const EMPTY_ROWS: never[] = []

const DEFAULT_SEARCH_DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = 20

function getColumnId<TData extends RowData>(
  def: ColumnDef<DataTableFeatures, TData, unknown>,
): string | undefined {
  if ('id' in def && typeof def.id === 'string') return def.id
  if ('accessorKey' in def && typeof def.accessorKey === 'string')
    return def.accessorKey
  return undefined
}

function resolveColumnValue<TData extends RowData>(
  def: ColumnDef<DataTableFeatures, TData, unknown>,
  row: TData,
): unknown {
  const meta = def.meta
  if (meta?.filterValue) return meta.filterValue(row)
  if ('accessorFn' in def) return def.accessorFn(row, 0)
  if ('accessorKey' in def && typeof def.accessorKey === 'string') {
    return (row as Record<string, unknown>)[def.accessorKey]
  }
  return undefined
}

function isFilterActive(value: FilterValue | undefined): value is FilterValue {
  if (value === undefined || value === null || value === '') return false
  if (isDateRangeFilterValue(value)) {
    return value.from !== null || value.to !== null
  }
  return true
}

function matchesFilter(
  def: ColumnFilterDef,
  value: FilterValue,
  raw: unknown,
): boolean {
  if (value === null || value === '') return true
  if (def.type === 'select') {
    return typeof value === 'string' && String(raw ?? '') === value
  }
  if (def.type === 'text') {
    return (
      typeof value === 'string' &&
      String(raw ?? '')
        .toLowerCase()
        .includes(value.toLowerCase())
    )
  }
  if (!isDateRangeFilterValue(value)) return true
  const time = new Date(String(raw ?? '')).getTime()
  if (Number.isNaN(time)) return false
  if (value.from && time < new Date(value.from).getTime()) return false
  if (value.to && time > new Date(value.to).getTime() + 86_400_000 - 1)
    return false
  return true
}

export interface DataTableSearch {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  /** Debounce between the last keystroke and `onValueChange` (default 300ms). */
  debounceMs?: number
}

export interface DataTableFilters {
  state: Record<string, FilterValue>
  onChange: (columnId: string, value: FilterValue) => void
}

export interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, unknown>[]
  rowKey: (row: TData) => string
  /**
   * Client mode — pass the full dataset; search, filters and pagination are
   * applied in the browser.
   */
  data?: TData[]
  /**
   * Server mode — fetch one page per query. Search/filters are forwarded and
   * cursor pagination (prev/next) is driven by a cursor stack. Keep the
   * callback stable (e.g. `useCallback`) to avoid refetch loops.
   */
  fetchPage?: (query: DataTableQuery) => Promise<DataTablePage<TData>>
  search?: DataTableSearch
  filters?: DataTableFilters
  pageSize?: number
  /** Starting column visibility; default: every column visible. */
  defaultColumnVisibility?: ColumnVisibilityState
  /** Extra actions rendered at the end of the toolbar (before the Columns menu). */
  toolbar?: React.ReactNode
  emptyMessage?: string
  /** External loading, e.g. while the client-mode dataset is still being fetched. */
  loading?: boolean
}

export function DataTable<TData extends RowData>({
  columns,
  rowKey,
  data,
  fetchPage,
  search,
  filters,
  pageSize = DEFAULT_PAGE_SIZE,
  defaultColumnVisibility,
  toolbar,
  emptyMessage = 'No data.',
  loading: externalLoading = false,
}: DataTableProps<TData>) {
  const mode = fetchPage ? 'server' : 'client'

  // ── column visibility ──────────────────────────────────────────────────
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>(defaultColumnVisibility ?? {})

  // ── search (instant input, debounced callback) ─────────────────────────
  const [searchInput, setSearchInput] = React.useState(search?.value ?? '')
  const [searchFocused, setSearchFocused] = React.useState(false)
  const searchDebounceRef =
    React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    if (!searchFocused) setSearchInput(search?.value ?? '')
  }, [search?.value, searchFocused])

  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (!search) return
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(
      () => search.onValueChange(value),
      search.debounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS,
    )
  }

  const searchValue = search?.value ?? ''
  const filterState = filters?.state ?? {}
  const serializedFilters = JSON.stringify(filterState)

  // ── server mode: fetch + cursor stack ──────────────────────────────────
  const [items, setItems] = React.useState<TData[]>(EMPTY_ROWS)
  const [page, setPage] = React.useState<DataTablePage<TData>>({
    items: [],
    nextCursor: null,
    hasNext: false,
  })
  const [cursorStack, setCursorStack] = React.useState<string[]>([])
  const [serverLoading, setServerLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const requestIdRef = React.useRef(0)
  const fetchPageRef = React.useRef(fetchPage)
  fetchPageRef.current = fetchPage
  const searchValueRef = React.useRef(searchValue)
  searchValueRef.current = searchValue
  const filterStateRef = React.useRef(filterState)
  filterStateRef.current = filterState

  const loadPage = React.useCallback(
    async (cursor: string | undefined, nextStack: string[]) => {
      const fetch = fetchPageRef.current
      if (!fetch) return
      const requestId = ++requestIdRef.current
      setServerLoading(true)
      setError(null)
      try {
        const result = await fetch({
          cursor,
          search: searchValueRef.current,
          filters: filterStateRef.current,
        })
        if (requestId !== requestIdRef.current) return
        setItems(result.items)
        setPage(result)
        setCursorStack(nextStack)
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setError(err instanceof Error ? err.message : 'Failed to load data.')
      } finally {
        if (requestId === requestIdRef.current) setServerLoading(false)
      }
    },
    // Only search/filter values change the fetch query; `fetchPage` is read
    // through a ref so an unstable callback cannot cause refetch loops.
    [searchValue, serializedFilters],
  )

  // Reset to the first page and refetch whenever the query (search/filters) changes.
  React.useEffect(() => {
    loadPage(undefined, [])
  }, [loadPage])

  const handleNext = () => {
    if (mode !== 'server' || !page.hasNext || !page.nextCursor) return
    loadPage(page.nextCursor, [...cursorStack, page.nextCursor])
  }

  const handlePrevious = () => {
    if (mode !== 'server' || cursorStack.length === 0) return
    const nextStack = cursorStack.slice(0, -1)
    loadPage(
      nextStack.length > 0 ? nextStack[nextStack.length - 1] : undefined,
      nextStack,
    )
  }

  // ── client mode: filter + page slicing ─────────────────────────────────
  const [clientPageIndex, setClientPageIndex] = React.useState(0)

  React.useEffect(() => {
    setClientPageIndex(0)
  }, [serializedFilters, searchValue])

  const filteredRows = React.useMemo(() => {
    if (!data) return EMPTY_ROWS
    const q = searchValue.trim().toLowerCase()
    const predicates: Array<(row: TData) => boolean> = []
    if (q) {
      predicates.push((row) =>
        columns.some((def) =>
          String(resolveColumnValue(def, row) ?? '')
            .toLowerCase()
            .includes(q),
        ),
      )
    }
    for (const def of columns) {
      const id = getColumnId(def)
      const filterDef = def.meta?.filter
      const value = id !== undefined ? filterState[id] : undefined
      if (id === undefined || !filterDef || !isFilterActive(value)) continue
      predicates.push((row) =>
        matchesFilter(filterDef, value, resolveColumnValue(def, row)),
      )
    }
    return predicates.length === 0
      ? data
      : data.filter((row) => predicates.every((p) => p(row)))
  }, [data, columns, searchValue, serializedFilters])

  const clientTotalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize),
  )
  const clientSafeIndex = Math.min(clientPageIndex, clientTotalPages - 1)
  const visibleRows = filteredRows.slice(
    clientSafeIndex * pageSize,
    (clientSafeIndex + 1) * pageSize,
  )

  const tableRows = mode === 'client' ? visibleRows : items

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: tableRows,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  })

  // ── toolbar: search + per-column filters ───────────────────────────────
  const filterColumns = columns
    .map((def) => ({ def, id: getColumnId(def), filterDef: def.meta?.filter }))
    .filter(
      (
        entry,
      ): entry is {
        def: ColumnDef<DataTableFeatures, TData, unknown>
        id: string
        filterDef: ColumnFilterDef
      } => entry.id !== undefined && entry.filterDef !== undefined,
    )

  const hasActiveFilters = Boolean(
    searchValue ||
    filterColumns.some(({ id }) => isFilterActive(filterState[id])),
  )

  const handleResetFilters = () => {
    // Cancel any pending debounced search write so it cannot re-apply after reset.
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = undefined
    }
    setSearchInput('')
    if (search) search.onValueChange('')
    for (const { id } of filterColumns) {
      if (isFilterActive(filterState[id])) filters?.onChange(id, null)
    }
  }

  const showSkeleton =
    (mode === 'server' ? serverLoading : externalLoading) &&
    tableRows.length === 0

  const showPagination =
    mode === 'server'
      ? page.hasNext || cursorStack.length > 0
      : filteredRows.length > pageSize

  const paginationInfo =
    mode === 'server'
      ? `${items.length} item${items.length === 1 ? '' : 's'}`
      : `Page ${clientSafeIndex + 1} of ${clientTotalPages} · ${filteredRows.length} item${filteredRows.length === 1 ? '' : 's'}`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <InputGroup className="w-64">
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={search.placeholder ?? 'Search…'}
              aria-label="Search"
            />
          </InputGroup>
        )}
        {filterColumns.map(({ id, filterDef }) => {
          const value = filterState[id] ?? null

          if (filterDef.type === 'select') {
            return (
              <Select
                key={id}
                value={typeof value === 'string' ? value : ''}
                onValueChange={(next) => filters?.onChange(id, next || null)}
              >
                <SelectTrigger size="sm">
                  <SelectValue
                    placeholder={filterDef.placeholder ?? 'Filter'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">
                      {filterDef.placeholder ?? 'All'}
                    </SelectItem>
                    {filterDef.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )
          }

          if (filterDef.type === 'text') {
            return (
              <Input
                key={id}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) =>
                  filters?.onChange(id, event.target.value || null)
                }
                placeholder={filterDef.placeholder ?? `Filter ${id}…`}
                className="h-8 w-44"
                aria-label={`Filter by ${id}`}
              />
            )
          }

          const range: DateRangeFilterValue = isDateRangeFilterValue(value)
            ? value
            : { from: null, to: null }

          return (
            <div key={id} className="flex items-center gap-1.5">
              <Input
                type="date"
                value={range.from ?? ''}
                onChange={(event) =>
                  filters?.onChange(id, {
                    from: event.target.value || null,
                    to: range.to,
                  })
                }
                className="h-8 w-36"
                aria-label={`${id} from`}
              />
              <span className="text-sm text-muted-foreground">–</span>
              <Input
                type="date"
                value={range.to ?? ''}
                onChange={(event) =>
                  filters?.onChange(id, {
                    from: range.from,
                    to: event.target.value || null,
                  })
                }
                className="h-8 w-36"
                aria-label={`${id} to`}
              />
            </div>
          )
        })}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <XIcon data-icon="inline-start" />
            Reset
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <ColumnVisibilityMenu table={table} />
        </div>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {showSkeleton ? (
            Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                {table.getVisibleLeafColumns().map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : tableRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm"
              >
                {error ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-destructive">{error}</p>
                    {mode === 'server' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPage(undefined, [])}
                      >
                        <RotateCcwIcon data-icon="inline-start" />
                        Retry
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{emptyMessage}</p>
                )}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={rowKey(row.original)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <TablePagination
          info={paginationInfo}
          canPrevious={
            mode === 'server' ? cursorStack.length > 0 : clientSafeIndex > 0
          }
          canNext={
            mode === 'server'
              ? page.hasNext
              : clientSafeIndex < clientTotalPages - 1
          }
          loading={mode === 'server' ? serverLoading : externalLoading}
          onPrevious={
            mode === 'server'
              ? handlePrevious
              : () => setClientPageIndex(clientSafeIndex - 1)
          }
          onNext={
            mode === 'server'
              ? handleNext
              : () => setClientPageIndex(clientSafeIndex + 1)
          }
        />
      )}
    </div>
  )
}

/**
 * Column helper pre-wired to the DataTable feature set, so column `meta`
 * (filter defs, …) and cells stay fully typed.
 *
 * ```tsx
 * const helper = createDataTableColumnHelper<AdminUser>()
 * const columns = helper.columns([
 *   helper.accessor('status', {
 *     header: 'Status',
 *     meta: { filter: { type: 'select', options: STATUS_OPTIONS } },
 *   }),
 * ])
 * ```
 */
export function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

export type {
  ColumnFilterDef,
  DataTablePage,
  DataTableQuery,
  DateRangeFilterValue,
  FilterValue,
} from './types'
export { isDateRangeFilterValue } from './types'
