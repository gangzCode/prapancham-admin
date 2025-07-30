"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react"

interface RowExpandableDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  currentPage?: number
  totalPages?: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  loading?: boolean
  expandedContent?: (row: TData) => React.ReactNode
  getRowId: (row: TData) => string
}

export function RowExpandableDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageChange,
  onPageSizeChange,
  loading = false,
  expandedContent,
  getRowId,
}: RowExpandableDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (expandedRows.has(rowId)) {
      newExpandedRows.delete(rowId)
    } else {
      newExpandedRows.add(rowId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleSearch = (value: string) => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    }
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-md shadow-sm">
      {/* Search */}
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => handleSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowId = getRowId(row.original)
                const isExpanded = expandedRows.has(rowId)
                
                return (
                  <React.Fragment key={row.id}>
                    {/* Main Row */}
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={isExpanded ? "border-b-0" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.column.id === "actions" && expandedContent ? (
                            <div className="flex items-center gap-2">
                              {flexRender(cell.column.columnDef.cell, {
                                ...cell.getContext(),
                                toggleExpansion: () => toggleRowExpansion(rowId),
                                isExpanded,
                              })}
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expanded Row */}
                    {isExpanded && expandedContent && (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="p-0">
                          <div className="border-t bg-muted/30">
                            {expandedContent(row.original)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex text-sm text-muted-foreground items-center">
            Showing
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange?.(Number(value));
                if (onPageChange) {
                  onPageChange(1);
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px] mx-2">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            of {totalItems} entries
          </div>
        </div>
        {data.length > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(i + 1)}
                  className={currentPage === i + 1 ? "bg-[#0B4157] text-white" : ""}
                >
                  {i + 1}
                </Button>
              )).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2),
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2">...</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 