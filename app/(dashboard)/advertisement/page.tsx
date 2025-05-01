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

// Sample data for advertisements
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
}

const advertisements: Advertisement[] = [
  {
    id: "1",
    title: "Summer Sale Promotion",
    client: "Local Retail Store",
    placement: "Homepage Banner",
    size: "728x90",
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    price: 500,
    status: "active",
    imageUrl: "/placeholder.svg?height=90&width=728",
  },
  {
    id: "2",
    title: "New Restaurant Opening",
    client: "Fine Dining Restaurant",
    placement: "Sidebar",
    size: "300x250",
    startDate: "2023-05-15",
    endDate: "2023-06-15",
    price: 350,
    status: "active",
    imageUrl: "/placeholder.svg?height=250&width=300",
  },
  {
    id: "3",
    title: "Community Event",
    client: "Local Community Center",
    placement: "Article Footer",
    size: "970x250",
    startDate: "2023-06-01",
    endDate: "2023-06-15",
    price: 400,
    status: "scheduled",
    imageUrl: "/placeholder.svg?height=250&width=970",
  },
  {
    id: "4",
    title: "Job Fair Announcement",
    client: "City Employment Office",
    placement: "Homepage Banner",
    size: "728x90",
    startDate: "2023-04-15",
    endDate: "2023-05-15",
    price: 500,
    status: "expired",
    imageUrl: "/placeholder.svg?height=90&width=728",
  },
  {
    id: "5",
    title: "Holiday Special Offer",
    client: "Local Business Association",
    placement: "Sidebar",
    size: "300x600",
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    price: 600,
    status: "draft",
    imageUrl: "/placeholder.svg?height=600&width=300",
  },
]

export default function AdvertisementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewAd, setViewAd] = useState<Advertisement | null>(null)
  const [deleteAd, setDeleteAd] = useState<Advertisement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddAd = () => {
    router.push("/advertisement/new")
  }

  const handleEditAd = (adId: string) => {
    router.push(`/advertisement/edit/${adId}`)
  }

  const handleDeleteAd = async () => {
    if (!deleteAd) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Advertisement deleted",
      description: `"${deleteAd.title}" has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeleteAd(null)
  }

  const columns: ColumnDef<Advertisement>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "client",
      header: "Client",
    },
    {
      accessorKey: "placement",
      header: "Placement",
    },
    {
      accessorKey: "size",
      header: "Size",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
    },
    {
      accessorKey: "status",
      header: "Status",
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

      <DataTable
        columns={columns}
        data={advertisements}
        searchKey="title"
        searchPlaceholder="Search advertisements..."
      />

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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Placement</h3>
                <p>{viewAd.placement}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Size</h3>
                <p>{viewAd.size}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Start Date</h3>
                <p>{viewAd.startDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">End Date</h3>
                <p>{viewAd.endDate}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
              <p className="text-lg font-semibold">${viewAd.price}</p>
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
