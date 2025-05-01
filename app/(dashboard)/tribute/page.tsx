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

// Sample data for tribute templates
type TributeTemplate = {
  id: string
  name: string
  type: "card" | "letter" | "flower"
  description: string
  price: number
  status: "active" | "inactive"
  imageUrl: string
}

const tributeTemplates: TributeTemplate[] = [
  {
    id: "1",
    name: "Classic Memorial Card",
    type: "card",
    description: "Elegant memorial card with customizable text and photo placement.",
    price: 25,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "Modern Tribute Card",
    type: "card",
    description: "Contemporary design with minimalist aesthetic for a modern tribute.",
    price: 30,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Sympathy Letter Template",
    type: "letter",
    description: "Formal sympathy letter template with customizable sections.",
    price: 15,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "Personal Condolence Letter",
    type: "letter",
    description: "Heartfelt personal condolence letter template with guidance for personalization.",
    price: 20,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "5",
    name: "Classic Rose Bouquet",
    type: "flower",
    description: "Traditional rose bouquet arrangement for memorial services.",
    price: 75,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "6",
    name: "Peaceful Lily Arrangement",
    type: "flower",
    description: "Elegant white lily arrangement symbolizing peace and remembrance.",
    price: 85,
    status: "active",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "7",
    name: "Seasonal Tribute Bouquet",
    type: "flower",
    description: "Bouquet featuring seasonal flowers for a colorful tribute.",
    price: 65,
    status: "inactive",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

export default function TributePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewTemplate, setViewTemplate] = useState<TributeTemplate | null>(null)
  const [deleteTemplate, setDeleteTemplate] = useState<TributeTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddTemplate = () => {
    router.push("/tribute/new")
  }

  const handleEditTemplate = (templateId: string) => {
    router.push(`/tribute/edit/${templateId}`)
  }

  const handleDeleteTemplate = async () => {
    if (!deleteTemplate) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Template deleted",
      description: `"${deleteTemplate.name}" has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeleteTemplate(null)
  }

  const columns: ColumnDef<TributeTemplate>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div className="capitalize">{row.original.type}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.description}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>${row.original.price}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewTemplate(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteTemplate(row.original)}>
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
        title={t("tribute")}
        description="Manage tribute card templates, letter templates, and flower bouquet types"
        action={{
          label: "Add Template",
          onClick: handleAddTemplate,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable columns={columns} data={tributeTemplates} searchKey="name" searchPlaceholder="Search templates..." />

      {/* View Template Dialog */}
      <ViewDialog
        open={!!viewTemplate}
        onOpenChange={(open) => !open && setViewTemplate(null)}
        title={viewTemplate?.name || "Template Details"}
      >
        {viewTemplate && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={viewTemplate.imageUrl || "/placeholder.svg"}
                  alt={viewTemplate.name}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
                <p className="capitalize">{viewTemplate.type}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewTemplate.status === "active" ? "default" : "secondary"}>
                  {viewTemplate.status}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p>{viewTemplate.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
              <p className="text-lg font-semibold">${viewTemplate.price}</p>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTemplate}
        onOpenChange={(open) => !open && setDeleteTemplate(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteTemplate?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteTemplate}
        loading={isDeleting}
      />
    </div>
  )
}
