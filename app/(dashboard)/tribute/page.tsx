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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

// Types based on the provided models
type TributeType = "flower" | "card" | "letter"

interface BaseTribute {
  id: string
  image: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  type: TributeType
}

interface FlowerTribute extends BaseTribute {
  type: "flower"
  name: string
  price: number
}

interface CardTribute extends BaseTribute {
  type: "card"
}

interface LetterTribute extends BaseTribute {
  type: "letter"
}

type Tribute = FlowerTribute | CardTribute | LetterTribute

// Sample data for tributes
const tributes: Tribute[] = [
  {
    id: "1",
    type: "flower",
    name: "Classic Rose Bouquet",
    price: 75,
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: false,
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    type: "flower",
    name: "Peaceful Lily Arrangement",
    price: 85,
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: false,
    createdAt: "2023-05-16T11:20:00Z",
    updatedAt: "2023-05-16T11:20:00Z",
  },
  {
    id: "3",
    type: "flower",
    name: "Seasonal Tribute Bouquet",
    price: 65,
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: true,
    createdAt: "2023-05-17T09:15:00Z",
    updatedAt: "2023-05-17T09:15:00Z",
  },
  {
    id: "4",
    type: "card",
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: false,
    createdAt: "2023-05-18T14:45:00Z",
    updatedAt: "2023-05-18T14:45:00Z",
  },
  {
    id: "5",
    type: "card",
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: false,
    createdAt: "2023-05-19T16:30:00Z",
    updatedAt: "2023-05-19T16:30:00Z",
  },
  {
    id: "6",
    type: "letter",
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: false,
    createdAt: "2023-05-20T13:10:00Z",
    updatedAt: "2023-05-20T13:10:00Z",
  },
  {
    id: "7",
    type: "letter",
    image: "/placeholder.svg?height=200&width=300",
    isDeleted: true,
    createdAt: "2023-05-21T10:05:00Z",
    updatedAt: "2023-05-21T10:05:00Z",
  },
]

export default function TributePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewTribute, setViewTribute] = useState<Tribute | null>(null)
  const [deleteTribute, setDeleteTribute] = useState<Tribute | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<TributeType>("flower")

  const handleAddTribute = () => {
    router.push(`/tribute/new?type=${activeTab}`)
  }

  const handleEditTribute = (tribute: Tribute) => {
    router.push(`/tribute/edit/${tribute.id}?type=${tribute.type}`)
  }

  const handleDeleteTribute = async () => {
    if (!deleteTribute) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Tribute deleted",
      description: `The tribute has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeleteTribute(null)
  }

  // Filter tributes based on active tab
  const filteredTributes = tributes.filter((tribute) => tribute.type === activeTab)

  // Define columns based on the active tab
  const getColumns = (): ColumnDef<Tribute>[] => {
    const baseColumns: ColumnDef<Tribute>[] = [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => (
          <div className="relative h-10 w-10">
            <img
              src={row.original.image || "/placeholder.svg?height=40&width=40"}
              alt="Tribute"
              className="h-10 w-10 rounded-md object-cover"
            />
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" type="date" />,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          return <div>{date.toLocaleDateString()}</div>
        },
      },
      {
        accessorKey: "isDeleted",
        accessorFn: (row) => (row.isDeleted ? "Deleted" : "Active"),
        header: ({ column }) => (
          <div className="flex items-center space-x-2">
            <DataTableColumnHeader column={column} title="Status" type="status" />
            <DataTableFacetedFilter
              column={column}
              title="Status"
              options={[
                { label: "Active", value: "Active" },
                { label: "Deleted", value: "Deleted" },
              ]}
            />
          </div>
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.isDeleted ? "secondary" : "default"}>
            {row.original.isDeleted ? "Deleted" : "Active"}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setViewTribute(row.original)}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEditTribute(row.original)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteTribute(row.original)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ),
      },
    ]

    // Add flower-specific columns if the active tab is "flower"
    if (activeTab === "flower") {
      return [
        {
          accessorKey: "name",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
          cell: ({ row }) => {
            const tribute = row.original as FlowerTribute
            return <div className="font-medium">{tribute.name}</div>
          },
        },
        {
          accessorKey: "price",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Price" type="number" />,
          cell: ({ row }) => {
            const tribute = row.original as FlowerTribute
            return <div>${tribute.price}</div>
          },
        },
        ...baseColumns,
      ]
    }

    return baseColumns
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("tribute")}
        description="Manage tribute flowers, cards, and letter templates"
        action={{
          label: "Add Tribute",
          onClick: handleAddTribute,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TributeType)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="flower">Flowers</TabsTrigger>
          <TabsTrigger value="card">Cards</TabsTrigger>
          <TabsTrigger value="letter">Letters</TabsTrigger>
        </TabsList>

        <TabsContent value="flower" className="mt-0">
          <DataTable
            columns={getColumns()}
            data={filteredTributes}
            searchKey={activeTab === "flower" ? "name" : "id"}
            searchPlaceholder={`Search ${activeTab}s...`}
          />
        </TabsContent>

        <TabsContent value="card" className="mt-0">
          <DataTable
            columns={getColumns()}
            data={filteredTributes}
            searchKey="id"
            searchPlaceholder={`Search ${activeTab}s...`}
          />
        </TabsContent>

        <TabsContent value="letter" className="mt-0">
          <DataTable
            columns={getColumns()}
            data={filteredTributes}
            searchKey="id"
            searchPlaceholder={`Search ${activeTab}s...`}
          />
        </TabsContent>
      </Tabs>

      {/* View Tribute Dialog */}
      <ViewDialog
        open={!!viewTribute}
        onOpenChange={(open) => !open && setViewTribute(null)}
        title={
          viewTribute?.type === "flower"
            ? (viewTribute as FlowerTribute).name
            : `${(viewTribute?.type ?? "").charAt(0).toUpperCase() + (viewTribute?.type ?? "").slice(1)} Template`
        }
      >
        {viewTribute && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={viewTribute.image || "/placeholder.svg"}
                  alt={viewTribute.type === "flower" ? (viewTribute as FlowerTribute).name : viewTribute.type}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
                <p className="capitalize">{viewTribute.type}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewTribute.isDeleted ? "secondary" : "default"}>
                  {viewTribute.isDeleted ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>

            {viewTribute.type === "flower" && (
              <>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                  <p>{(viewTribute as FlowerTribute).name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                  <p className="text-lg font-semibold">${(viewTribute as FlowerTribute).price}</p>
                </div>
              </>
            )}

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
              <p>{new Date(viewTribute.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
              <p>{new Date(viewTribute.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTribute}
        onOpenChange={(open) => !open && setDeleteTribute(null)}
        title="Delete Tribute"
        description={`Are you sure you want to delete this ${deleteTribute?.type}? This action cannot be undone.`}
        onConfirm={handleDeleteTribute}
        loading={isDeleting}
      />
    </div>
  )
}
