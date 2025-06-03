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

type BGFRAME = {
  id: string
  frameImage: string
  isActive: boolean
  isDeleted: boolean
}
const fetcher = async (url: string): Promise<{ bgFrame: BGFRAME[], pagination: any }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
  
    if (!res.ok) throw new Error("Failed to fetch")
  
    const json = await res.json()
  
    return {
      bgFrame: (json?.bgFrames || []).map((bgf: any) => ({
        id: bgf._id,
        frameImage: bgf.frameImage,
        isActive: bgf.isActive,
        isDeleted: bgf.isDeleted,
      })),
      pagination: json.pagination,
    }
}
  
  

export default function ImageFramesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [deleteImageFrame, setDeleteImageFrame] = useState<BGFRAME | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewBgFrame, setViewBgFrame] = useState<BGFRAME | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-frame/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const imageFrames = data?.bgFrame || []

  const handleAddImageFrame = () => {
    router.push("/obituary/image-frames/new")
  }

  const handleEditImageFrame = (id: string) => {
    router.push(`/obituary/image-frames/edit/${id}`)
  }

  const handleDeleteBgFrame = async () => {
    if (!deleteImageFrame) return
    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-frame/${deleteImageFrame.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      toast({ title: "Background-Frame deleted", description: "The background frame has been deleted successfully." })
      mutate()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete background frame." })
    }

    setIsDeleting(false)
    setDeleteImageFrame(null)
}

  const columns: ColumnDef<BGFRAME>[] = [
    {
      header: "Image",
      cell: ({ row }) => {
        const src = row.original.frameImage
        return (
          <img
            src={src !== "TEMP" ? src : "/placeholder-image.jpg"}
            alt="Frame Preview"
            className="h-16 w-16 object-cover rounded"
          />
        )
      },
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewBgFrame(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditImageFrame(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteImageFrame(row.original)}>
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
        title={t("Image Frames")}
        description="Manage Image Frames offered to users"
        action={{
          label: "Add Image Frame",
          onClick: handleAddImageFrame,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable
        columns={columns}
        data={imageFrames}
        searchKey="id"
        searchPlaceholder="Search by ID..."
        isLoading={isLoading}
      />

      {/* View Dialog */}
      <ViewDialog
        open={!!viewBgFrame}
        onOpenChange={(open) => !open && setViewBgFrame(null)}
        title="Image Frame Preview"
        description={`ID: ${viewBgFrame?.id}`}
      >
        <img
          src={viewBgFrame?.frameImage}
          alt="Preview"
          className="max-w-full max-h-[400px] object-contain rounded"
        />
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
            open={!!deleteImageFrame}
            onOpenChange={(open) => !open && setDeleteImageFrame(null)}
            title="Delete Background Color"
            description={`Are you sure you want to delete "${deleteImageFrame?.id}"? This action cannot be undone.`}
            onConfirm={handleDeleteBgFrame}
            loading={isDeleting}
          />
    </div>
  )
}