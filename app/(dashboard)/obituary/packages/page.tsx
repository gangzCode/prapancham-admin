"use client"
import useSWR from "swr"
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

type Package = {
  id: string
  name: {
    en: { value: string }
    ta: { value: string }
    si: { value: string }
  }
  description: {
    en: { value: string }
    ta: { value: string }
    si: { value: string }
  }
  price: number
  isActive: boolean
  addons: string[]
  isObituary: boolean
  isRemembarace: boolean
  isPremium: boolean
  duration: number
  isDeleted: boolean
  wordLimit: number
  priceList: {
    country: string
    currencyCode: string
    price: number
    _id: string
  }[]
  isTributeVideoUploading: boolean
  isAdditionalImages: boolean
  noofAdditionalImages: number
  noofContectDetails: number
  noofBgColors: number
  bgColors: string[]
  noofPrimaryImageBgFrames: number
  primaryImageBgFrames: string[]
}


const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch")
  }

  return res.json().then((json) => ({
    ...json,
    packages: json.obituaryRemembarancePackages.map((pkg: any) => ({
      ...pkg,
      id: pkg._id,
      name: {
        en: pkg.name.en[0],
        ta: pkg.name.ta[0],
        si: pkg.name.si[0],
      },
      description: {
        en: pkg.description.en[0],
        ta: pkg.description.ta[0],
        si: pkg.description.si[0],
      },
      addons: pkg.addons,
    })),
  }))
}

export default function PackagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewPackage, setViewPackage] = useState<Package | null>(null)
  const [deletePackage, setDeletePackage] = useState<Package | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const handleAddPackage = () => {
    router.push("/obituary/packages/new")
  }

  const handleEditPackage = (packageId: string) => {
    router.push(`/obituary/edit/${packageId}`)
  }

  const handleDeletePackage = async () => {
    if (!deletePackage) return
    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${deletePackage.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      toast({ title: "Package deleted", description: "The package has been deleted successfully." })
      mutate()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete package." })
    }

    setIsDeleting(false)
    setDeletePackage(null)
  }

  const columns: ColumnDef<Package>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
      cell: ({ row }) => <div className="font-medium max-w-[500px] truncate">{row.original.name.en.value}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" type="text" />,
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.description.en.value}</div>,
    },
    {
      accessorKey: "price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" type="number" />,
      cell: ({ row }) => <div className="font-medium">{row.original.price}</div>,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
        </div>
      ),
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
        title={t("packages")}
        description="Manage obituary packages"
        action={{
          label: "Add Package",
          onClick: handleAddPackage,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable
        columns={columns}
        data={data?.packages || []}
        searchKey="name"
        searchPlaceholder="Search Packages..."
        currentPage={page}
        totalPages={data?.pagination.totalPages || 1}
        totalItems={data?.pagination.totalItems || 0}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
      />

      <ViewDialog open={!!viewPackage} onOpenChange={(open) => !open && setViewPackage(null)} title="Package Details">
        {viewPackage && (
          <div className="space-y-8">
            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>

              {["en", "ta", "si"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="space-y-2 py-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                    <p className="font-medium">{viewPackage.name[lang as keyof typeof viewPackage.name].value}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                    <p className="whitespace-pre-wrap">{viewPackage.description[lang as keyof typeof viewPackage.description].value}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                <p>{viewPackage.price}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewPackage.isActive === true ? "default" : "secondary"}>
                  {viewPackage.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Duration</h3>
                <p>{viewPackage.duration} days</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Word Limit</h3>
                <p>{viewPackage.wordLimit}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Is Obituary</h3>
                <p>{viewPackage.isObituary ? "Yes" : "No"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Is Remembrance</h3>
                <p>{viewPackage.isRemembarace ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Is Premium</h3>
                <p>{viewPackage.isPremium ? "Yes" : "No"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Additional Images</h3>
                <p>{viewPackage.isAdditionalImages ? `Yes (${viewPackage.noofAdditionalImages})` : "No"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Contact Details</h3>
                <p>{viewPackage.noofContectDetails}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Add-ons</h3>
              <ul className="list-disc pl-5">
                {viewPackage.addons.map((addon, index) => (
                  <li key={index}>{addon}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Price List</h3>
              <ul className="list-disc pl-5">
                {viewPackage.priceList.map((priceItem) => (
                  <li key={priceItem._id}>
                    {priceItem.country} ({priceItem.currencyCode}): {priceItem.price}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Background Colors</h3>
              <ul className="list-disc pl-5">
                {viewPackage.bgColors.map((color, index) => (
                  <li key={index}>{color}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Primary Image Background Frames</h3>
              <ul className="list-disc pl-5">
                {viewPackage.primaryImageBgFrames.map((frame, index) => (
                  <li key={index}>{frame}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </ViewDialog>

      <ConfirmDialog
        open={!!deletePackage}
        onOpenChange={(open) => !open && setDeletePackage(null)}
        title="Delete Package"
        description="Are you sure you want to delete this package? This action cannot be undone."
        onConfirm={handleDeletePackage}
        loading={isDeleting}
      />
    </div>
  )
}