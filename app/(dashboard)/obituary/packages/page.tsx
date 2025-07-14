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
  basePrice: {
    country: {
      name: {
        en: { value: string }[]
        ta: { value: string }[]
        si: { value: string }[]
      }
      _id: string
      currencyCode: string
    }
    price: number
  }
  isActive: boolean
  addons: {
    _id: string
    name: {
      en: { name: string; value: string }[]
      ta: { name: string; value: string }[]
      si: { name: string; value: string }[]
    }
    priceList: {
      country: string
      price: number
    }[]
  }[]
  isObituary: boolean
  isRemembarace: boolean
  isPremium: boolean
  isPriority: boolean
  isFeatured: boolean
  duration: number
  isDeleted: boolean
  wordLimit: number
  priceList: {
    country: {
      name: {
        en: { value: string }[]
        ta: { value: string }[]
        si: { value: string }[]
      }
      _id: string
      currencyCode: string
    }
    currencyCode: string
    price: number
    _id: string
  }[]
  isTributeVideoUploading: boolean
  isAdditionalImages: boolean
  noofAdditionalImages: number
  noofContectDetails: number
  noofBgColors: number
  bgColors: {
    _id: string
    name: string
    colorCode: string
    isActive: boolean
  }[]
  noofPrimaryImageBgFrames: number
  primaryImageBgFrames: {
    _id: string
    frameImage: string
    isActive: boolean
  }[]
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
      // Keep addons, bgColors, and primaryImageBgFrames as they are (don't flatten them)
      addons: pkg.addons || [],
      bgColors: pkg.bgColors || [],
      primaryImageBgFrames: pkg.primaryImageBgFrames || [],
    })),
  }))
}

export default function PackagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewPackage, setViewPackage] = useState<Package | null>(null)
  const [viewPackageData, setViewPackageData] = useState<any | null>(null)
  const [isLoadingViewData, setIsLoadingViewData] = useState(false)
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
    console.log("Editing package:", packageId)
    router.push(`/obituary/packages/${packageId}`)
  }

  const fetchPackageDetails = async (packageId: string) => {
    setIsLoadingViewData(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/${packageId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch package details")
      }

      const packageData = await response.json()
      console.log("Fetched package details:", packageData)
      setViewPackageData(packageData)
    } catch (error) {
      console.error("Error fetching package details:", error)
      toast({
        title: "Error",
        description: "Failed to load package details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingViewData(false)
    }
  }

  const handleViewPackage = (pkg: Package) => {
    console.log("View button clicked - Package data:", pkg)
    setViewPackage(pkg)
    fetchPackageDetails(pkg.id)
  }

  const handleDeletePackage = async () => {
    if (!deletePackage) return
    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/${deletePackage.id}`, {
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
      accessorKey: "basePrice.price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" type="number" />,
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.basePrice?.price || 0} {row.original.basePrice?.country?.currencyCode || 'N/A'}
        </div>
      ),
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
          <Button variant="ghost" size="icon" onClick={() => handleViewPackage(row.original)}>
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

      <ViewDialog 
        open={!!viewPackage} 
        onOpenChange={(open) => {
          if (!open) {
            setViewPackage(null)
            setViewPackageData(null)
          }
        }} 
        title="Package Details"
      >
        {viewPackage && (
          <div className="space-y-8">
            {isLoadingViewData ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading package details...</div>
              </div>
            ) : viewPackageData ? (
              <>
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
                        <p className="font-medium">
                          {viewPackageData.name?.[lang]?.[0]?.value || 'N/A'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                        <p className="whitespace-pre-wrap">
                          {viewPackageData.description?.[lang]?.[0]?.value || 'N/A'}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Base Price</h3>
                    <p>{viewPackageData.basePrice?.price || 0} ({viewPackageData.basePrice?.country?.currencyCode || 'N/A'})</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                    <Badge variant={viewPackageData.isActive === true ? "default" : "secondary"}>
                      {viewPackageData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Duration</h3>
                    <p>{viewPackageData.duration} days</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Word Limit</h3>
                    <p>{viewPackageData.wordLimit}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Is Obituary</h3>
                    <p>{viewPackageData.isObituary ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Is Remembrance</h3>
                    <p>{viewPackageData.isRemembarace ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Is Premium</h3>
                    <p>{viewPackageData.isPremium ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Is Priority</h3>
                    <p>{viewPackageData.isPriority ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Is Featured</h3>
                    <p>{viewPackageData.isFeatured ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Additional Images</h3>
                    <p>{viewPackageData.isAdditionalImages ? `Yes (${viewPackageData.noofAdditionalImages})` : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Contact Details</h3>
                    <p>{viewPackageData.noofContectDetails}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Tribute Video Uploading</h3>
                    <p>{viewPackageData.isTributeVideoUploading ? "Yes" : "No"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Add-ons</h3>
                  {viewPackageData.addons && viewPackageData.addons.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {viewPackageData.addons.map((addon: any, index: number) => {
                        // Get the addon name, preferring English
                        const addonName = addon?.name?.en?.[0]?.value || 
                                         addon?.name?.ta?.[0]?.value || 
                                         addon?.name?.si?.[0]?.value || 
                                         'Unnamed Addon'
                        
                        // Get price if available
                        const price = addon?.priceList?.[0]?.price || 0
                        
                        return (
                          <li key={addon?._id || index}>
                            {addonName}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No add-ons included</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Price List</h3>
                  {viewPackageData.priceList && viewPackageData.priceList.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {viewPackageData.priceList.map((priceItem: any, index: number) => {
                        // Get the country name, preferring English
                        const countryName = priceItem?.country?.name?.en?.[0]?.value || 
                                          priceItem?.country?.name?.ta?.[0]?.value || 
                                          priceItem?.country?.name?.si?.[0]?.value || 
                                          'Unknown Country'
                        
                        return (
                          <li key={priceItem?._id || index}>
                            {countryName} ({priceItem?.country?.currencyCode || 'N/A'}): {priceItem?.price || 0}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No country-specific pricing available</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Background Colors</h3>
                  {viewPackageData.bgColors && viewPackageData.bgColors.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {viewPackageData.bgColors.map((color: any, index: number) => (
                        <li key={color?._id || index} className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: color?.colorCode || '#ccc' }}
                          />
                          <span>{color?.name || 'Unknown Color'}</span>
                          <span className="text-xs text-muted-foreground">({color?.colorCode || 'N/A'})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No background colors included</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Primary Image Background Frames</h3>
                  {viewPackageData.primaryImageBgFrames && viewPackageData.primaryImageBgFrames.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {viewPackageData.primaryImageBgFrames.map((frame: any, index: number) => (
                        <li key={frame._id || index} className="flex items-center gap-2">
                          <img
                            src={frame.frameImage}
                            alt={`Frame ${frame._id || index}`}
                            className="h-8 w-8 object-cover rounded border"
                            onError={(e) => {
                              // Hide broken images
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span>Frame {frame._id ? frame._id.slice(-4) : `#${index + 1}`}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No background frames included</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-lg text-destructive">Failed to load package details</div>
                <p className="text-muted-foreground mt-2">Please try again.</p>
              </div>
            )}
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