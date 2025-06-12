"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

type Advertisement = {
  id: string
  title: string
  client: string
  placement: string
  size: string
  startDate: string
  endDate: string
  price: number
  status: "active" | "scheduled" | "expired" | "draft"
  imageUrl: string
  adCategory: string // Added adCategory
}

const fetcher = async (url: string): Promise<{ advertisements: Advertisement[]; pagination?: any }> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json().then(async (json) => ({
    advertisements: await Promise.all(
      (json.advertisements || json.data || []).map(async (ad: any) => {
        // Format date as "Dec 12 2025"
        const formatDate = (dateStr: string) => {
          if (!dateStr) return ""
          const date = new Date(dateStr)
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        }

        let size = ""
        if (ad.adType && typeof ad.adType === "string") {
          try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const adTypeRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-type/${ad.adType}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(token && { Authorization: `Bearer ${token}` }),
                },
              }
            )
            if (adTypeRes.ok) {
              const adTypeData = await adTypeRes.json()
              size = adTypeData?.imageSize || ""
            }
          } catch (e) {
            size = ""
          }
        } else if (ad.adType && typeof ad.adType === "object") {
          size = ad.adType.imageSize || ""
        }

        const adCategoryName = ad.adCategory?.name?.en?.[0]?.value || "" // Extract adCategory name

        return {
          id: ad._id || ad.id,
          title: ad.adPageName || "",
          client: "",
          placement: ad.adPageName || "",
          size,
          startDate: formatDate(ad.uploadedDate),
          endDate: formatDate(ad.expiryDate),
          price: 0,
          status: ad.isActive
            ? "active"
            : ad.expiryDate && new Date(ad.expiryDate) < new Date()
              ? "expired"
              : "draft",
          imageUrl: ad.image || "",
          adCategory: adCategoryName, // Assign extracted adCategory
        }
      })
    ),
    pagination: {
      currentPage: json.pagination.currentPage,
      totalPages: json.pagination.totalPages,
      totalItems: json.pagination.totalItems,
    },
  }))
}

export default function AdvertisementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewAd, setViewAd] = useState<Advertisement | null>(null)
  const [deleteAd, setDeleteAd] = useState<Advertisement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, error, isLoading, mutate } = useSWR<{ advertisements: Advertisement[]; pagination?: any }>(
    `${process.env.NEXT_PUBLIC_API_URL}/advertistment/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const handleAddAd = () => {
    router.push("/advertisement/new")
  }

  const handleEditAd = (adId: string) => {
    router.push(`/advertisement/edit/${adId}`)
  }

  const handleDeleteAd = async () => {
    if (!deleteAd) return

    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/${deleteAd.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      toast({
        title: "Advertisement deleted",
        description: `"${deleteAd.title}" has been deleted successfully.`,
      })

      mutate()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete advertisement." })
    }

    setIsDeleting(false)
    setDeleteAd(null)
  }

  const uniquePlacements = Array.from(new Set((data?.advertisements || []).map((ad: Advertisement) => ad.placement))).map((placement) => ({
    label: String(placement),
    value: String(placement),
  }))

  const columns: ColumnDef<Advertisement>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" type="text" />,
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    // Original lines that were commented out
    // {
    //   accessorKey: "client",
    //   header: ({ column }) => <DataTableColumnHeader column={column} title="Client" type="text" />,
    // },
    {
      accessorKey: "adCategory", // New column for Ad Category
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ad Category" type="text" />,
    },
    {
      accessorKey: "placement",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          {/* <DataTableColumnHeader column={column} title="Placement" type="text" /> */}
          <DataTableFacetedFilter column={column} title="Placement" options={uniquePlacements} />
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Size" type="text" />,
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" type="date" />,
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" type="date" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          {/* <DataTableColumnHeader column={column} title="Status" type="status" /> */}
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Expired", value: "expired" },
              { label: "Draft", value: "draft" },
            ]}
          />
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status
        let variant: "default" | "secondary" | "destructive" | "outline" = "default"

        switch (status) {
          case "active":
            variant = "default"
            break
          case "scheduled":
            variant = "secondary"
            break
          case "expired":
            variant = "destructive"
            break
          case "draft":
            variant = "outline"
            break
        }

        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewAd(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditAd(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteAd(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("advertisement")}
        description="Manage advertisements and placements"
        action={{
          label: "Add Advertisement",
          onClick: handleAddAd,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load advertisements.</div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.advertisements || []}
          searchKey="title"
          searchPlaceholder="Search advertisements..."
          currentPage={page}
          totalPages={data?.pagination?.totalPages || 1}
          totalItems={data?.pagination?.totalItems || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* View Advertisement Dialog */}
      <ViewDialog
        open={!!viewAd}
        onOpenChange={(open) => !open && setViewAd(null)}
        title={viewAd?.title || "Advertisement Details"}
      >
        {viewAd && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative border rounded-md overflow-hidden">
                <img src={viewAd.imageUrl || "/placeholder.svg"} alt={viewAd.title} className="max-w-full h-auto" />
              </div>
            </div>

            {/* Original commented out section */}
            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Client</h3>
                <p>{viewAd.client}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge
                  variant={
                    viewAd.status === "active"
                      ? "default"
                      : viewAd.status === "scheduled"
                        ? "secondary"
                        : viewAd.status === "expired"
                          ? "destructive"
                          : "outline"
                  }
                >
                  {viewAd.status}
                </Badge>
              </div>
            </div> */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Ad Category</h3> {/* New field */}
                <p>{viewAd.adCategory}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Placement</h3>
                <p>{viewAd.placement}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Size</h3>
                <p>{viewAd.size}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Start Date</h3>
                <p>{viewAd.startDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">End Date</h3>
                <p>{viewAd.endDate}</p>
              </div>
              {/* Original commented out section */}
              {/* <div>
                <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                <p className="text-lg font-semibold">${viewAd.price}</p>
              </div> */}
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAd}
        onOpenChange={(open) => !open && setDeleteAd(null)}
        title="Delete Advertisement"
        description={`Are you sure you want to delete "${deleteAd?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteAd}
        loading={isDeleting}
      />
    </div>
  )
}