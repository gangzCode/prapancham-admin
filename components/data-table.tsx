"use client"

import { useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string | string[]
  searchPlaceholder?: string
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 50, 100],
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter: searchValue,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (Array.isArray(searchKey)) {
        return searchKey.some((key) => {
          const cellValue = (row.original as any)[key]
          return cellValue && cellValue.toString().toLowerCase().includes(filterValue.toLowerCase())
        })
      }
      return true
    },
  })

  function onPageSizeChangeInternal(newPageSize: number) {
    table.setPageSize(newPageSize)
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize)
    }
  }

  function handlePageChange(newPage: number) {
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-md shadow-sm">
      {searchKey && (
        <div className="flex items-center">
          <Input
            placeholder={searchPlaceholder}
            value={Array.isArray(searchKey)
              ? searchValue
              : (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              if (Array.isArray(searchKey)) {
                setSearchValue(event.target.value)
                // Custom filter logic for multiple fields
                const value = event.target.value.toLowerCase()
                table.setGlobalFilter(value)
              } else {
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
            }}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex text-sm text-muted-foreground items-center">
            Showing
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
              onPageSizeChangeInternal(Number(value));
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
              onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(i + 1)}
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
              onClick={() => handlePageChange(currentPage + 1)}
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


