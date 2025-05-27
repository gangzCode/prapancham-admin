"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useSWR from "swr"

export default function ObituaryAddonsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState<any>(null)
  const [newAddon, setNewAddon] = useState({
    name: {
      en: [{ name: "", value: "" }],
      ta: [{ name: "", value: "" }],
      si: [{ name: "", value: "" }],
    },
    priceList: [{ country: "", currencyCode: "", price: "" }],
    isActive: true,
  })
  const [editAddon, setEditAddon] = useState({ id: 0, name: "", price: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)


  type AddonName = {
    name: string
    value: string
    _id: string
  }
  type PriceItem = {
    country: string
    currencyCode: string
    price: number
    _id: string
  }
  type ObituaryAddon = {
    _id: string
    name: {
      en: AddonName[]
      ta: AddonName[]
      si: AddonName[]
    }
    isDeleted: boolean
    priceList: PriceItem[]
    isActive: boolean
    __v: number
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
      addons: json.addons.map((addon: any) => ({
        ...addon,
        id: addon._id,
        // keep name.en, name.ta, name.si as arrays
        name: {
          en: addon.name.en,
          ta: addon.name.ta,
          si: addon.name.si,
        },
        priceList: addon.priceList,
        isActive: addon.isActive,
        isDeleted: addon.isDeleted,
      })),
    }))
  }

  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/addons/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  // const addons: ObituaryAddon[] = [
  //   {
  //     _id: "682273847da452cfd2e27c1a",
  //     name: {
  //       en: [{ name: "Candle Set", value: "White Candles", _id: "682273847da452cfd2e27c1b" }],
  //       ta: [{ name: "மின்சுடர் தொகுப்பு", value: "வெள்ளை மின்சுடர்", _id: "682273847da452cfd2e27c1c" }],
  //       si: [{ name: "මිනිසුන්ට මැවිලි", value: "සුදු මැවිලි", _id: "682273847da452cfd2e27c1d" }],
  //     },
  //     isDeleted: false,
  //     priceList: [
  //       { country: "Sri Lanka", currencyCode: "LKR", price: 1500, _id: "682273847da452cfd2e27c1e" },
  //       { country: "USA", currencyCode: "USD", price: 5, _id: "682273847da452cfd2e27c1f" },
  //     ],
  //     isActive: true,
  //     __v: 0,
  //   },
  // ]


  const handleView = (addon: any) => {
    setSelectedAddon(addon)
    setViewDialogOpen(true)
  }

  const handleEdit = (addon: any) => {
    setEditAddon({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (addon: any) => {
    setSelectedAddon(addon)
    setDeleteDialogOpen(true)
  }

  const handleAddSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon created",
        description: "The addon has been created successfully.",
      })

      setAddDialogOpen(false)
      setNewAddon({
        name: {
          en: [{ name: "", value: "" }],
          ta: [{ name: "", value: "" }],
          si: [{ name: "", value: "" }],
        },
        priceList: [{ country: "", currencyCode: "", price: "" }],
        isActive: true,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon updated",
        description: "The addon has been updated successfully.",
      })

      setEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon deleted",
        description: "The addon has been deleted successfully.",
      })

      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<ObituaryAddon>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
      cell: ({ row }) => (
        <span>{row.original.name.en[0]?.value || "-"}</span>
      ),
    },
    {
      accessorKey: "priceList",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" type="number" />,
      cell: ({ row }) => (
        <span>
          {row.original.priceList.map((p) => `${p.country}: ${p.currencyCode} ${p.price}`).join(", ")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Obituary Addons</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Addon
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.addons || []}
          searchKey="name"
          searchPlaceholder="Search addons..."
          currentPage={page}
          totalPages={data?.pagination.totalPages || 1}
          totalItems={data?.pagination.totalItems || 0}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
        />

      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Addon Details</DialogTitle>
            <DialogDescription>Detailed information about the addon.</DialogDescription>
          </DialogHeader>
          {selectedAddon && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ta">Tamil</TabsTrigger>
                  <TabsTrigger value="si">Sinhala</TabsTrigger>
                </TabsList>
                {["en", "ta", "si"].map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-2">
                    <div>
                      <Label>Name</Label>
                      <div>{selectedAddon.name[lang][0]?.name || "-"}</div>
                    </div>
                    <div>
                      <Label>Value</Label>
                      <div>{selectedAddon.name[lang][0]?.value || "-"}</div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              <div>
                <Label>Price List</Label>
                <ul className="list-disc pl-5">
                  {selectedAddon.priceList.map((p) => (
                    <li key={p._id}>
                      {p.country} ({p.currencyCode}): {p.price}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Status</Label>
                <div>{selectedAddon.isActive ? "Active" : "Inactive"}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Addon</DialogTitle>
            <DialogDescription>Create a new addon for obituary packages.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>
              {(["en", "ta", "si"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                      value={newAddon.name[lang][0]?.name || ""}
                      onChange={e => {
                        setNewAddon({
                          ...newAddon,
                          name: {
                            ...newAddon.name,
                            [lang]: [
                              {
                                ...newAddon.name[lang][0],
                                name: e.target.value,
                              },
                            ],
                          },
                        })
                      }}
                      className="col-span-3"
                      placeholder={`Enter ${lang === "en" ? "English" : lang === "ta" ? "Tamil" : "Sinhala"} name`}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Value</Label>
                    <Input
                      value={newAddon.name[lang][0]?.value || ""}
                      onChange={e => {
                        setNewAddon({
                          ...newAddon,
                          name: {
                            ...newAddon.name,
                            [lang]: [
                              {
                                ...newAddon.name[lang][0],
                                value: e.target.value,
                              },
                            ],
                          },
                        })
                      }}
                      className="col-span-3"
                      placeholder={`Enter ${lang === "en" ? "English" : lang === "ta" ? "Tamil" : "Sinhala"} value`}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <div>
              <Label>Price List</Label>
              {newAddon.priceList.map((p, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                  <Input
                    className="col-span-4"
                    placeholder="Country"
                    value={p.country}
                    onChange={e => {
                      const updated = [...newAddon.priceList]
                      updated[idx].country = e.target.value
                      setNewAddon({ ...newAddon, priceList: updated })
                    }}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="Currency"
                    value={p.currencyCode}
                    onChange={e => {
                      const updated = [...newAddon.priceList]
                      updated[idx].currencyCode = e.target.value
                      setNewAddon({ ...newAddon, priceList: updated })
                    }}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="Price"
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={e => {
                      const updated = [...newAddon.priceList]
                      updated[idx].price = e.target.value
                      setNewAddon({ ...newAddon, priceList: updated })
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="col-span-2"
                    onClick={() => {
                      const updated = newAddon.priceList.filter((_, i) => i !== idx)
                      setNewAddon({ ...newAddon, priceList: updated.length ? updated : [{ country: "", currencyCode: "", price: "" }] })
                    }}
                    disabled={newAddon.priceList.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() =>
                  setNewAddon({
                    ...newAddon,
                    priceList: [...newAddon.priceList, { country: "", currencyCode: "", price: "" }],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Price
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Button
                type="button"
                variant={newAddon.isActive ? "default" : "outline"}
                onClick={() => setNewAddon({ ...newAddon, isActive: true })}
                size="sm"
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!newAddon.isActive ? "default" : "outline"}
                onClick={() => setNewAddon({ ...newAddon, isActive: false })}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={
                isSubmitting ||
                !newAddon.name.en[0]?.name ||
                !newAddon.name.en[0]?.value ||
                newAddon.priceList.some(
                  p => !p.country || !p.currencyCode || !p.price
                )
              }
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Addon</DialogTitle>
            <DialogDescription>Update the addon details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>
              {(["en", "ta", "si"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Name</Label>
                    <Input
                      value={selectedAddon?.name[lang][0]?.name || ""}
                      onChange={e => {
                        if (!selectedAddon) return
                        setSelectedAddon({
                          ...selectedAddon,
                          name: {
                            ...selectedAddon.name,
                            [lang]: [
                              {
                                ...selectedAddon.name[lang][0],
                                name: e.target.value,
                              },
                            ],
                          },
                        })
                      }}
                      className="col-span-3"
                      placeholder={`Enter ${lang === "en" ? "English" : lang === "ta" ? "Tamil" : "Sinhala"} name`}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Value</Label>
                    <Input
                      value={selectedAddon?.name[lang][0]?.value || ""}
                      onChange={e => {
                        if (!selectedAddon) return
                        setSelectedAddon({
                          ...selectedAddon,
                          name: {
                            ...selectedAddon.name,
                            [lang]: [
                              {
                                ...selectedAddon.name[lang][0],
                                value: e.target.value,
                              },
                            ],
                          },
                        })
                      }}
                      className="col-span-3"
                      placeholder={`Enter ${lang === "en" ? "English" : lang === "ta" ? "Tamil" : "Sinhala"} value`}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <div>
              <Label>Price List</Label>
              {selectedAddon?.priceList.map((p: any, idx: number) => (
                <div key={p._id || idx} className="grid grid-cols-12 gap-2 mb-2">
                  <Input
                    className="col-span-4"
                    placeholder="Country"
                    value={p.country}
                    onChange={e => {
                      if (!selectedAddon) return
                      const updated = [...selectedAddon.priceList]
                      updated[idx].country = e.target.value
                      setSelectedAddon({ ...selectedAddon, priceList: updated })
                    }}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="Currency"
                    value={p.currencyCode}
                    onChange={e => {
                      if (!selectedAddon) return
                      const updated = [...selectedAddon.priceList]
                      updated[idx].currencyCode = e.target.value
                      setSelectedAddon({ ...selectedAddon, priceList: updated })
                    }}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="Price"
                    type="number"
                    min="0"
                    value={p.price}
                    onChange={e => {
                      if (!selectedAddon) return
                      const updated = [...selectedAddon.priceList]
                      updated[idx].price = e.target.value
                      setSelectedAddon({ ...selectedAddon, priceList: updated })
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="col-span-2"
                    onClick={() => {
                      if (!selectedAddon) return
                      const updated = selectedAddon.priceList.filter((_: any, i: number) => i !== idx)
                      setSelectedAddon({ ...selectedAddon, priceList: updated.length ? updated : [{ country: "", currencyCode: "", price: "" }] })
                    }}
                    disabled={selectedAddon.priceList.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => {
                  if (!selectedAddon) return
                  setSelectedAddon({
                    ...selectedAddon,
                    priceList: [...selectedAddon.priceList, { country: "", currencyCode: "", price: "" }],
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Price
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Button
                type="button"
                variant={selectedAddon?.isActive ? "default" : "outline"}
                onClick={() => selectedAddon && setSelectedAddon({ ...selectedAddon, isActive: true })}
                size="sm"
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!selectedAddon?.isActive ? "default" : "outline"}
                onClick={() => selectedAddon && setSelectedAddon({ ...selectedAddon, isActive: false })}
                size="sm"
              >
                Inactive
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={
                isSubmitting ||
                !selectedAddon?.name.en[0]?.name ||
                !selectedAddon?.name.en[0]?.value ||
                selectedAddon?.priceList.some(
                  (p: any) => !p.country || !p.currencyCode || !p.price
                )
              }
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the addon
              {selectedAddon && ` "${selectedAddon.name.en[0]?.name}"`} and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
