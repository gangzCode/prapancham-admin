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
type BgColors = {
    id: string
    name: string
    colorCode: string
}

const bgColors: BgColors[] = [
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

export default function BgColorssPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [deleteBgColors, setdeleteBgColors] = useState<BgColors | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAddBgColors = () => {
        router.push("/obituary/bg-colors/new")
    }

    const handleEditBgColors = (addonId: string) => {
        router.push(`/obituary/bg-colors/edit/${addonId}`)
    }

    const handleDeleteBgColors = async () => {
        if (!deleteBgColors) return

        setIsDeleting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
            title: "bg-colors deleted",
            description: `${deleteBgColors.name} bg-colors has been deleted successfully.`,
        })

        setIsDeleting(false)
        setdeleteBgColors(null)
    }

    const columns: ColumnDef<BgColors>[] = [
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
                    <Button variant="ghost" size="icon" onClick={() => handleEditBgColors(row.original.id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setdeleteBgColors(row.original)}>
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
                title={t("Background Colors")}
                description="Manage Background Colors offered to users"
                action={{
                    label: "Add Bg Colors",
                    onClick: handleAddBgColors,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable columns={columns} data={bgColors} searchKey="name" searchPlaceholder="Search addons..." />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteBgColors}
                onOpenChange={(open) => !open && setdeleteBgColors(null)}
                title="Delete Background Color"
                description={`Are you sure you want to delete the "${deleteBgColors?.name}" addon? This action cannot be undone.`}
                onConfirm={handleDeleteBgColors}
                loading={isDeleting}
            />
        </div>
    )
}
