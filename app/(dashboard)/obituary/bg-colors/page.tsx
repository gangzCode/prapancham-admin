"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import useSWR from "swr"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"


type BGCOLOR = {
    id: string
    name:string
    colorCode:string
    listingNumber: number
    isActive: boolean
    isDeleted: boolean
}

const fetcher = async (url: string): Promise<{ bgColor: BGCOLOR[]; pagination?: any }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json().then((json) => ({
      ...json,
      bgColor: (json.bgColor || json.data || []).map((bgc: any) => ({
        id: bgc._id || bgc.id,
        isActive: bgc.isActive,
        isDeleted: bgc.isDeleted,
        name:bgc.name,
        colorCode:bgc.colorCode
      })),
    }))
  }

export default function BgColorssPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewBgColor, setViewBgColor] = useState<BGCOLOR | null>(null)
    const [deleteBgColor, setDeleteBgColor] = useState<BGCOLOR | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-color/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddBgColors = () => {
        router.push("/obituary/bg-colors/new")
    }

    const handleEditBgColors = (bgColorId: string) => {
        router.push(`/obituary/bg-colors/edit/${bgColorId}`)
    }

    const handleDeleteBgColors = async () => {
        if (!deleteBgColor) return
        setIsDeleting(true)
    
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-color/${deleteBgColor.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          })
          toast({ title: "Background-Color deleted", description: "The background color has been deleted successfully." })
          mutate()
        } catch (e) {
          toast({ title: "Error", description: "Failed to delete background color." })
        }
    
        setIsDeleting(false)
        setDeleteBgColor(null)
    }

    const columns: ColumnDef<BGCOLOR>[] = [
        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "colorCode",
          header: "Color Code",
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: row.original.colorCode }} />
              <span>{row.original.colorCode}</span>
            </div>
          ),
        },
        {
          accessorKey: "isActive",
          header: "Status",
          cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "default" : "secondary"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          ),
        },
        {
          id: "actions",
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setViewBgColor(row.original)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleEditBgColors(row.original.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteBgColor(row.original)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        },
      ]

      return (
        <div className="space-y-6">
          <PageHeader
            title={t("Background Colors")}
            description="Manage Background Colors offered to users"
            action={{
              label: "Add Bg Color",
              onClick: handleAddBgColors,
              icon: <Plus className="mr-2 h-4 w-4" />,
            }}
          />
    
          <DataTable
            columns={columns}
            data={data?.bgColor || []}
            searchKey="name"
            searchPlaceholder="Search colors..."
            currentPage={page}
            totalPages={data?.pagination?.totalPages || 1}
            totalItems={data?.pagination?.totalItems || 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
    
          {/* View Dialog */}
          <ViewDialog
            open={!!viewBgColor}
            onOpenChange={(open) => !open && setViewBgColor(null)}
            title="Background Color Details"
          >
            {viewBgColor && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-muted-foreground">Name</h3>
                  <p className="font-medium">{viewBgColor.name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Color</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: viewBgColor.colorCode }} />
                    <p>{viewBgColor.colorCode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Order</h3>
                  <p>{viewBgColor.listingNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Status</h3>
                  <Badge variant={viewBgColor.isActive ? "default" : "secondary"}>
                    {viewBgColor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            )}
          </ViewDialog>
    
          {/* Delete Confirmation */}
          <ConfirmDialog
            open={!!deleteBgColor}
            onOpenChange={(open) => !open && setDeleteBgColor(null)}
            title="Delete Background Color"
            description={`Are you sure you want to delete "${deleteBgColor?.name}"? This action cannot be undone.`}
            onConfirm={handleDeleteBgColors}
            loading={isDeleting}
          />
        </div>
      )
}
