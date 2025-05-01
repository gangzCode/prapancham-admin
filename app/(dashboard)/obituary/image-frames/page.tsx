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

// Sample data for obituary addons
type ImageFrame = {
    id: string
    name: string
    colorCode: string
}

const imageFrames: ImageFrame[] = [
    {
        id: "1",
        name: "Extended Photo Gallery",
        colorCode: "49",
    },
    {
        id: "2",
        name: "Video Tribute",
        colorCode: "99",
    },
    {
        id: "3",
        name: "Memorial Website",
        colorCode: "149",
    },
    {
        id: "4",
        name: "Printed Memorial Cards",
        colorCode: "79",
    },
    {
        id: "5",
        name: "Donation Collection",
        colorCode: "59",
    },
]

export default function ImageFramesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [deleteImageFrame, setdeleteImageFrame] = useState<ImageFrame | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAddImageFrame = () => {
        router.push("/obituary/image-frames/new")
    }

    const handleEditImageFrame = (addonId: string) => {
        router.push(`/obituary/image-frames/edit/${addonId}`)
    }

    const handleDeleteImageFrame = async () => {
        if (!deleteImageFrame) return

        setIsDeleting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
            title: "bg-colors deleted",
            description: `${deleteImageFrame.name} bg-colors has been deleted successfully.`,
        })

        setIsDeleting(false)
        setdeleteImageFrame(null)
    }

    const columns: ColumnDef<ImageFrame>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "colorCode",
            header: "Color Code",
        },

        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditImageFrame(row.original.id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setdeleteImageFrame(row.original)}>
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

            <DataTable columns={columns} data={imageFrames} searchKey="name" searchPlaceholder="Search addons..." />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteImageFrame}
                onOpenChange={(open) => !open && setdeleteImageFrame(null)}
                title="Delete Image Frame"
                description={`Are you sure you want to delete the "${deleteImageFrame?.name}" Image frame? This action cannot be undone.`}
                onConfirm={handleDeleteImageFrame}
                loading={isDeleting}
            />
        </div>
    )
}
