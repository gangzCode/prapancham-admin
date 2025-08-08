"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/data-table"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ViewDialog } from "@/components/view-dialog"
import { PageHeader } from "@/components/page-header"
import { useLanguage } from "@/contexts/language-context"
import { Eye, Pencil, Trash2, Plus } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import useSWR from "swr"

// Types for memory pricing
interface Price {
    country: {
        name: {
            en: [{ name: string; value: string; _id: string }]
            ta: [{ name: string; value: string; _id: string }]
            si: [{ name: string; value: string; _id: string }]
        }
        _id: string
        currencyCode: string
        isDeleted: boolean
        isActive: boolean
        image: string
        createdAt: string
        updatedAt: string
        __v: number
    }
    price: number
    _id: string
}

interface MemoryPricingType {
    _id: string
    name: string
    isDeleted: boolean
    isActive: boolean
    priceList: Price[]
    createdAt: string
    updatedAt: string
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

    return res.json()
}

export default function TributeMemoriesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewMemory, setViewMemory] = useState<MemoryPricingType | null>(null)
    const [deleteMemory, setDeleteMemory] = useState<MemoryPricingType | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addName, setAddName] = useState("")
    const [addLoading, setAddLoading] = useState(false)
    const [addPriceList, setAddPriceList] = useState([
        { country: "", currencyCode: "", price: "" }
    ])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editMemoryId, setEditMemoryId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editPriceList, setEditPriceList] = useState([{ country: "", currencyCode: "", price: "" }])
    const [editIsActive, setEditIsActive] = useState(true)
    const [editLoading, setEditLoading] = useState(false)
    const [countries, setCountries] = useState<any[]>([])

    useEffect(() => {
        const fetchCountries = async () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country/all`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setCountries(data.countries);
        };

        fetchCountries();
    }, []);

    const getCountryName = (id: string, lang: "en" | "ta" | "si" = "en") => {
        if (!Array.isArray(countries)) return id;
        const country = countries.find((c) => c._id === id);
        return country?.name?.[lang]?.[0]?.value || id;
    };

    const getCurrencyCode = (id: string) => {
        if (!Array.isArray(countries)) return "";
        const country = countries.find((c) => c._id === id);
        return country?.currencyCode || "";
    };

    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/memory-pricing/all`,
        fetcher
    )

    const handleAddMemory = () => {
        setAddDialogOpen(true)
    }

    const handleAddPriceRow = () => {
        setAddPriceList([...addPriceList, { country: "", currencyCode: "", price: "" }])
    }

    const handleRemovePriceRow = (idx: number) => {
        setAddPriceList(addPriceList.filter((_, i) => i !== idx))
    }

    const handlePriceChange = (idx: number, field: string, value: string) => {
        setAddPriceList(addPriceList.map((item, i) => {
            if (i === idx) {
                if (field === "country") {
                    // Auto-set currency code when country changes
                    const currencyCode = getCurrencyCode(value);
                    return { ...item, [field]: value, currencyCode };
                }
                return { ...item, [field]: value };
            }
            return item;
        }))
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addName) return
        
        // Validate priceList
        if (addPriceList.some(p => !p.country || !p.price)) {
            toast({
                title: "Error",
                description: "Please fill all price fields.",
                variant: "destructive",
            })
            return
        }

        // Check for duplicate countries
        const countries = addPriceList.map(p => p.country).filter(Boolean)
        const uniqueCountries = [...new Set(countries)]
        if (countries.length !== uniqueCountries.length) {
            toast({
                title: "Error",
                description: "Please select different countries for each price entry.",
                variant: "destructive",
            })
            return
        }

        setAddLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

            const requestBody = {
                name: addName,
                priceList: addPriceList.map(p => ({
                    country: p.country,
                    price: Number(p.price)
                })),
                isActive: true
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/memory-pricing`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(requestBody),
                }
            )
            if (!res.ok) throw new Error("Failed to add memory")
            toast({
                title: "Memory added",
                description: "The memory tribute has been added successfully.",
            })
            setAddDialogOpen(false)
            setAddName("")
            setAddPriceList([{ country: "", currencyCode: "", price: "" }])
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add the memory.",
                variant: "destructive",
            })
        }
        setAddLoading(false)
    }

    const openEditDialog = (memory: MemoryPricingType) => {
        setEditMemoryId(memory._id)
        setEditName(memory.name)
        setEditPriceList(
            memory.priceList.map(p => ({
                country: p.country._id,
                currencyCode: p.country.currencyCode,
                price: p.price.toString()
            }))
        )
        setEditIsActive(memory.isActive)
        setEditDialogOpen(true)
    }

    const handleEditPriceRow = () => {
        setEditPriceList([...editPriceList, { country: "", currencyCode: "", price: "" }])
    }

    const handleEditRemovePriceRow = (idx: number) => {
        setEditPriceList(editPriceList.filter((_, i) => i !== idx))
    }

    const handleEditPriceChange = (idx: number, field: string, value: string) => {
        setEditPriceList(editPriceList.map((item, i) => {
            if (i === idx) {
                if (field === "country") {
                    // Auto-set currency code when country changes
                    const currencyCode = getCurrencyCode(value);
                    return { ...item, [field]: value, currencyCode };
                }
                return { ...item, [field]: value };
            }
            return item;
        }))
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editMemoryId || !editName) return
        
        if (editPriceList.some(p => !p.country || !p.price)) {
            toast({
                title: "Error",
                description: "Please fill all price fields.",
                variant: "destructive",
            })
            return
        }

        // Check for duplicate countries
        const countries = editPriceList.map(p => p.country).filter(Boolean)
        const uniqueCountries = [...new Set(countries)]
        if (countries.length !== uniqueCountries.length) {
            toast({
                title: "Error",
                description: "Please select different countries for each price entry.",
                variant: "destructive",
            })
            return
        }

        setEditLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            
            const requestBody = {
                name: editName,
                priceList: editPriceList.map(p => ({
                    country: p.country,
                    price: Number(p.price)
                })),
                isActive: editIsActive
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/memory-pricing/${editMemoryId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify(requestBody),
                }
            )
            if (!res.ok) throw new Error("Failed to update memory")
            toast({
                title: "Memory updated",
                description: "The memory tribute has been updated successfully.",
            })
            setEditDialogOpen(false)
            setEditMemoryId(null)
            setEditName("")
            setEditPriceList([{ country: "", currencyCode: "", price: "" }])
            setEditIsActive(true)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update the memory.",
                variant: "destructive",
            })
        }
        setEditLoading(false)
    }

    const handleEditMemory = (memory: MemoryPricingType) => {
        openEditDialog(memory)
    }

    const handleDeleteMemory = async () => {
        if (!deleteMemory) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/memory-pricing/${deleteMemory._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            if (!res.ok) {
                throw new Error("Failed to delete memory")
            }
            toast({
                title: "Memory deleted",
                description: `The memory tribute has been deleted successfully.`,
            })
            mutate() // Refresh the list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the memory.",
                variant: "destructive",
            })
        }
        setIsDeleting(false)
        setDeleteMemory(null)
    }

    const columns: ColumnDef<MemoryPricingType>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: "priceList",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Prices" type="number" />,
            cell: ({ row }) => (
                <ul className="space-y-1">
                    {row.original.priceList.map((price) => (
                        <li key={price._id} className="text-sm">
                            {price.country.currencyCode} {price.price} - {price.country.name.en[0]?.value}
                        </li>
                    ))}
                </ul>
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
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)));
            },
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
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewMemory(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditMemory(row.original)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteMemory(row.original)}>
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
                title={t("Tribute Memories")}
                description="Manage tribute memory pricing and settings"
                action={{
                    label: "Add Memory",
                    onClick: handleAddMemory,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable
                columns={columns}
                data={data ?? []}
                searchKey="name"
                searchPlaceholder="Search memories..."
                currentPage={page}
                totalPages={Math.ceil((data?.length || 0) / pageSize)}
                totalItems={data?.length || 0}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
            />

            {/* View Memory Dialog */}
            <ViewDialog
                open={!!viewMemory}
                onOpenChange={(open) => !open && setViewMemory(null)}
                title={viewMemory?.name ?? ""}
            >
                {viewMemory && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                            <p>{viewMemory.name}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                            <Badge variant={viewMemory.isActive ? "default" : "secondary"}>
                                {viewMemory.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Pricing</h3>
                            <div className="space-y-2">
                                {viewMemory.priceList.map((price) => (
                                    <div key={price._id} className="flex justify-between items-center p-2 bg-muted rounded">
                                        <span>{price.country.name.en[0]?.value}</span>
                                        <span className="font-medium">{price.country.currencyCode} {price.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                            <p>{new Date(viewMemory.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                            <p>{new Date(viewMemory.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </ViewDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteMemory}
                onOpenChange={(open) => !open && setDeleteMemory(null)}
                title="Delete Memory"
                description={`Are you sure you want to delete this memory? This action cannot be undone.`}
                onConfirm={handleDeleteMemory}
                loading={isDeleting}
            />

            {/* Add Memory Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Memory</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="memory-name">Name</Label>
                            <Input
                                id="memory-name"
                                value={addName}
                                onChange={e => setAddName(e.target.value)}
                                required
                                placeholder="Enter memory name"
                            />
                        </div>
                        <div>
                            <Label>Price List</Label>
                            <div className="space-y-2">
                                {addPriceList.map((priceItem, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Select 
                                            value={priceItem.country} 
                                            onValueChange={(value) => handlePriceChange(idx, "country", value)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter((country) => {
                                                        // Show current selection or countries not already selected
                                                        const alreadySelected = addPriceList
                                                            .filter((_, i) => i !== idx) // Exclude current row
                                                            .map(p => p.country)
                                                            .filter(Boolean); // Remove empty values
                                                        return !alreadySelected.includes(country._id);
                                                    })
                                                    .map((country) => (
                                                        <SelectItem key={country._id} value={country._id}>
                                                            {getCountryName(country._id)}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Currency"
                                            value={priceItem.currencyCode}
                                            disabled
                                            className="w-20"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            value={priceItem.price}
                                            onChange={(e) => handlePriceChange(idx, "price", e.target.value)}
                                            required
                                            className="w-24"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleRemovePriceRow(idx)}
                                            disabled={addPriceList.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddPriceRow}
                                    disabled={
                                        !addPriceList[0]?.country || 
                                        !addPriceList[0]?.price ||
                                        addPriceList.length >= countries.length
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Price
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addLoading}>
                                {addLoading ? "Adding..." : "Add Memory"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Update Memory Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Memory</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-memory-name">Name</Label>
                            <Input
                                id="edit-memory-name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                placeholder="Enter memory name"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-is-active"
                                checked={editIsActive}
                                onCheckedChange={setEditIsActive}
                            />
                            <Label htmlFor="edit-is-active">Active</Label>
                        </div>
                        <div>
                            <Label>Price List</Label>
                            <div className="space-y-2">
                                {editPriceList.map((priceItem, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <Select 
                                            value={priceItem.country} 
                                            onValueChange={(value) => handleEditPriceChange(idx, "country", value)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter((country) => {
                                                        // Show current selection or countries not already selected
                                                        const alreadySelected = editPriceList
                                                            .filter((_, i) => i !== idx) // Exclude current row
                                                            .map(p => p.country)
                                                            .filter(Boolean); // Remove empty values
                                                        return !alreadySelected.includes(country._id);
                                                    })
                                                    .map((country) => (
                                                        <SelectItem key={country._id} value={country._id}>
                                                            {getCountryName(country._id)}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Currency"
                                            value={priceItem.currencyCode}
                                            disabled
                                            className="w-20"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            value={priceItem.price}
                                            onChange={(e) => handleEditPriceChange(idx, "price", e.target.value)}
                                            required
                                            className="w-24"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleEditRemovePriceRow(idx)}
                                            disabled={editPriceList.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditPriceRow}
                                    disabled={
                                        !editPriceList[0]?.country || 
                                        !editPriceList[0]?.price ||
                                        editPriceList.length >= countries.length
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Price
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? "Updating..." : "Update Memory"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}