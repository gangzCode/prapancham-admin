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

// Sample data for obituary packages
type ObituaryPackage = {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  status: "active" | "inactive"
  createdAt: string
}

const obituaryPackages: ObituaryPackage[] = [
  {
    id: "1",
    name: "Basic",
    price: 99,
    description: "Essential obituary package for simple remembrance",
    features: [
      "Online obituary posting",
      "Basic photo gallery (5 photos)",
      "Guest book for condolences",
      "Share on social media",
    ],
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Standard",
    price: 199,
    description: "Enhanced obituary package with additional features",
    features: [
      "Online obituary posting",
      "Extended photo gallery (15 photos)",
      "Guest book for condolences",
      "Share on social media",
      "Featured on homepage for 3 days",
      "Print-ready obituary PDF",
    ],
    status: "active",
    createdAt: "2023-01-20",
  },
  {
    id: "3",
    name: "Premium",
    price: 299,
    description: "Comprehensive obituary package with all features",
    features: [
      "Online obituary posting",
      "Extended photo gallery (30 photos)",
      "Guest book for condolences",
      "Share on social media",
      "Featured on homepage for 7 days",
      "Print-ready obituary PDF",
      "Video tribute (up to 5 minutes)",
      "Memorial donation collection",
      "Personalized QR code for sharing",
    ],
    status: "active",
    createdAt: "2023-02-05",
  },
  {
    id: "4",
    name: "Memorial Plus",
    price: 399,
    description: "Premium package with extended memorial features",
    features: [
      "Online obituary posting",
      "Unlimited photo gallery",
      "Guest book for condolences",
      "Share on social media",
      "Featured on homepage for 14 days",
      "Print-ready obituary PDF",
      "Video tribute (up to 10 minutes)",
      "Memorial donation collection",
      "Personalized QR code for sharing",
      "Memorial website for 1 year",
      "Printed memorial cards (25 count)",
    ],
    status: "active",
    createdAt: "2023-03-10",
  },
  {
    id: "5",
    name: "Legacy",
    price: 599,
    description: "Complete legacy package for permanent remembrance",
    features: [
      "Online obituary posting",
      "Unlimited photo gallery",
      "Guest book for condolences",
      "Share on social media",
      "Featured on homepage for 30 days",
      "Print-ready obituary PDF",
      "Video tribute (up to 15 minutes)",
      "Memorial donation collection",
      "Personalized QR code for sharing",
      "Permanent memorial website",
      "Printed memorial cards (50 count)",
      "Leather-bound memorial book",
      "Professional obituary writing assistance",
    ],
    status: "inactive",
    createdAt: "2023-04-15",
  },
]

export default function ObituaryPackagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [viewPackage, setViewPackage] = useState<ObituaryPackage | null>(null)
  const [deletePackage, setDeletePackage] = useState<ObituaryPackage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddPackage = () => {
    router.push("/obituary/packages/new")
  }

  const handleEditPackage = (packageId: string) => {
    router.push(`/obituary/packages/edit/${packageId}`)
  }

  const handleDeletePackage = async () => {
    if (!deletePackage) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Package deleted",
      description: `${deletePackage.name} package has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeletePackage(null)
  }

  const columns: ColumnDef<ObituaryPackage>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>${row.original.price}</div>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.description}</div>,
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
          <Button variant="ghost" size="icon" onClick={() => setViewPackage(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditPackage(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletePackage(row.original)}>
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
        title="Obituary Packages"
        description="Manage obituary packages offered to users"
        action={{
          label: "Add Package",
          onClick: handleAddPackage,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable columns={columns} data={obituaryPackages} searchKey="name" searchPlaceholder="Search packages..." />

      {/* View Package Dialog */}
      <ViewDialog
        open={!!viewPackage}
        onOpenChange={(open) => !open && setViewPackage(null)}
        title={viewPackage?.name || "Package Details"}
      >
        {viewPackage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                <p className="text-lg font-semibold">${viewPackage.price}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewPackage.status === "active" ? "default" : "secondary"}>{viewPackage.status}</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p>{viewPackage.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Features</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {viewPackage.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
              <p>{viewPackage.createdAt}</p>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletePackage}
        onOpenChange={(open) => !open && setDeletePackage(null)}
        title="Delete Package"
        description={`Are you sure you want to delete the "${deletePackage?.name}" package? This action cannot be undone.`}
        onConfirm={handleDeletePackage}
        loading={isDeleting}
      />
    </div>
  )
}
