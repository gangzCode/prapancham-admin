"use client"
import useSWR from "swr"
import { useState, useEffect } from "react"
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
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for flower tribute
interface Price {
    country: string
    currencyCode: string
    price: number
    _id: string
}

interface TributeFlowerType {
    _id: string
    image: string
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

    return res.json().then((json) => ({
        ...json,
        tributeFlowerType: json.tributeFlowerType.map((flowerType: any) => ({
            ...flowerType,
        })),
    }))

}

export default function TributeFlowersPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewFlower, setViewFlower] = useState<TributeFlowerType | null>(null)
    const [deleteFlower, setDeleteFlower] = useState<TributeFlowerType | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addName, setAddName] = useState("")
    const [addImage, setAddImage] = useState<File | null>(null)
    const [addLoading, setAddLoading] = useState(false)
    const [addPriceList, setAddPriceList] = useState([
        { country: "", currencyCode: "", price: "" }
    ])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editFlowerId, setEditFlowerId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editPriceList, setEditPriceList] = useState([{ country: "", currencyCode: "", price: "" }])
    const [editIsActive, setEditIsActive] = useState(true)
    const [editImage, setEditImage] = useState<File | null>(null)
    const [editLoading, setEditLoading] = useState(false)
    const [countries, setCountries] = useState<any[]>([]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/flower-type/all?page=${page}&limit=${pageSize}`,
        fetcher
    )


    const handleAddFlower = () => {
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
        if (!addName || !addImage) return
        // Validate priceList
        if (addPriceList.some(p => !p.country || !p.price)) {
            toast({
                title: "Error",
                description: "Please fill all price fields.",
                variant: "destructive",
            })
            return
        }
        setAddLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()
            formData.append("name", addName)
            formData.append("image", addImage)
            formData.append("priceList", JSON.stringify(
                addPriceList.map(p => ({
                    country: p.country,
                    price: Number(p.price)
                }))
            ))

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/flower-type`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to add flower")
            toast({
                title: "Flower added",
                description: "The flower tribute has been added successfully.",
            })
            setAddDialogOpen(false)
            setAddName("")
            setAddImage(null)
            setAddPriceList([{ country: "", currencyCode: "", price: "" }])
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add the flower.",
                variant: "destructive",
            })
        }
        setAddLoading(false)
    }

    const openEditDialog = (flower: TributeFlowerType) => {
        setEditFlowerId(flower._id)
        setEditName(flower.name)
        setEditImage(null)
        setEditPriceList(
            flower.priceList.map(p => ({
                country: p.country,
                currencyCode: getCurrencyCode(p.country),
                price: p.price.toString()
            }))
        )
        setEditIsActive(flower.isActive)
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
        if (!editFlowerId || !editName) return
        if (editPriceList.some(p => !p.country || !p.price)) {
            toast({
                title: "Error",
                description: "Please fill all price fields.",
                variant: "destructive",
            })
            return
        }
        setEditLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()
            formData.append("flowerTypeId", editFlowerId)
            formData.append("name", editName)
            formData.append("isActive", String(editIsActive))
            formData.append(
                "priceList",
                JSON.stringify(
                    editPriceList.map(p => ({
                        country: p.country,
                        price: Number(p.price)
                    }))
                )
            )
            if (editImage) {
                formData.append("image", editImage)
            }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/flower-type/update`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to update flower")
            toast({
                title: "Flower updated",
                description: "The flower tribute has been updated successfully.",
            })
            setEditDialogOpen(false)
            setEditFlowerId(null)
            setEditImage(null)
            setEditName("")
            setEditPriceList([{ country: "", currencyCode: "", price: "" }])
            setEditIsActive(true)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update the flower.",
                variant: "destructive",
            })
        }
        setEditLoading(false)
    }

    const handleEditFlower = (flower: TributeFlowerType) => {
        openEditDialog(flower)
    }

    const handleDeleteFlower = async () => {
        if (!deleteFlower) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/flower-type/${deleteFlower._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            if (!res.ok) {
                throw new Error("Failed to delete flower")
            }
            toast({
                title: "Flower deleted",
                description: `The flower tribute has been deleted successfully.`,
            })
            mutate() // Refresh the list
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete the flower.",
                variant: "destructive",
            })
        }
        setIsDeleting(false)
        setDeleteFlower(null)
    }

    const columns: ColumnDef<TributeFlowerType>[] = [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => (
                <div className="relative h-10 w-10">
                    <img
                        src={row.original.image}
                        alt={row.original.name}
                        className="h-10 w-10 rounded-md object-cover"
                    />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        // {
        //     accessorKey: "priceList",
        //     header: ({ column }) => <DataTableColumnHeader column={column} title="Prices" type="number" />,
        //     cell: ({ row }) => (
        //         <ul>
        //             {row.original.priceList.map((price) => (
        //                 <li key={price._id}>
        //                     {price.currencyCode} {price.price}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        // },
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
        // {
        //     accessorKey: "createdAt",
        //     header: ({ column }) => <DataTableColumnHeader column={column} title="Created" type="date" />,
        //     cell: ({ row }) => {
        //         const date = new Date(row.original.createdAt)
        //         return <div>{date.toLocaleDateString()}</div>
        //     },
        // },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewFlower(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditFlower(row.original)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteFlower(row.original)}>
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
                title={t("Tribute Flowers")}
                description="Manage tribute flower types and prices"
                action={{
                    label: "Add Flower",
                    onClick: handleAddFlower,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable
                columns={columns}
                data={data?.tributeFlowerType ?? []}
                searchKey="name"
                searchPlaceholder="Search letters..."
                currentPage={page}
                totalPages={data?.pagination.totalPages || 1}
                totalItems={data?.pagination.totalItems || 0}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
            />

            {/* View Flower Dialog */}
            <ViewDialog
                open={!!viewFlower}
                onOpenChange={(open) => !open && setViewFlower(null)}
                title={viewFlower?.name ?? ""}
            >
                {viewFlower && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative border rounded-md overflow-hidden">
                                <img
                                    src={viewFlower.image}
                                    alt={viewFlower.name}
                                    className="max-w-full h-auto"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                            <Badge variant={viewFlower.isActive ? "default" : "secondary"}>
                                {viewFlower.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Prices</h3>
                            <ul>
                                {viewFlower.priceList.map((price) => (
                                    <li key={price._id}>
                                        {getCountryName(price.country)}: {getCurrencyCode(price.country)} {price.price}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                            <p>{new Date(viewFlower.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                            <p>{new Date(viewFlower.updatedAt).toLocaleString()}</p>
                        </div> */}
                    </div>
                )}
            </ViewDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteFlower}
                onOpenChange={(open) => !open && setDeleteFlower(null)}
                title="Delete Flower"
                description={`Are you sure you want to delete this flower? This action cannot be undone.`}
                onConfirm={handleDeleteFlower}
                loading={isDeleting}
            />

            {/* Add Flower Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Flower</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="flower-name">Name</Label>
                            <Input
                                id="flower-name"
                                value={addName}
                                onChange={e => setAddName(e.target.value)}
                                required
                                placeholder="Enter flower name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="flower-image">Image</Label>
                            <Input
                                id="flower-image"
                                type="file"
                                accept="image/*"
                                onChange={e => setAddImage(e.target.files?.[0] || null)}
                                required
                                className="file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                        </div>
                        <div>
                            <Label>Prices</Label>
                            <div className="space-y-2">
                                {addPriceList.map((price, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <Select
                                            value={price.country || ""}
                                            onValueChange={(value) => handlePriceChange(idx, "country", value)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter(country => 
                                                        !addPriceList.some((p, i) => i !== idx && p.country === country._id)
                                                    )
                                                    .map((country) => (
                                                        <SelectItem key={country._id} value={country._id}>
                                                            {country.name?.en?.[0]?.value || country._id}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            className="flex-1"
                                            placeholder="Currency"
                                            value={price.currencyCode || ""}
                                            readOnly
                                            disabled
                                        />
                                        <Input
                                            className="flex-1"
                                            placeholder="Price"
                                            type="number"
                                            min="0"
                                            value={price.price || ""}
                                            onChange={e => handlePriceChange(idx, "price", e.target.value)}
                                            required
                                        />
                                        {addPriceList.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemovePriceRow(idx)}
                                            >
                                                -
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleAddPriceRow}
                                    disabled={
                                        !addPriceList[0]?.country || 
                                        !addPriceList[0]?.price ||
                                        addPriceList.length >= countries.length
                                    }
                                >
                                    + Add Price
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={addLoading}>
                                {addLoading ? "Adding..." : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Update Flower Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Flower</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-flower-name">Name</Label>
                            <Input
                                id="edit-flower-name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                placeholder="Enter flower name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="flower-image">Image (optional - leave empty to keep current image)</Label>
                            <Input
                                id="flower-image"
                                type="file"
                                accept="image/*"
                                onChange={e => setEditImage(e.target.files?.[0] || null)}
                                className="file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                            />
                        </div>
                        <div>
                            <Label>Prices</Label>
                            <div className="space-y-2">
                                {editPriceList.map((price, idx) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <Select
                                            value={price.country || ""}
                                            onValueChange={(value) => handleEditPriceChange(idx, "country", value)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter(country => 
                                                        !editPriceList.some((p, i) => i !== idx && p.country === country._id)
                                                    )
                                                    .map((country) => (
                                                        <SelectItem key={country._id} value={country._id}>
                                                            {country.name?.en?.[0]?.value || country._id}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            className="flex-1"
                                            placeholder="Currency"
                                            value={price.currencyCode || ""}
                                            readOnly
                                            disabled
                                        />
                                        <Input
                                            className="flex-1"
                                            placeholder="Price"
                                            type="number"
                                            min="0"
                                            value={price.price || ""}
                                            onChange={e => handleEditPriceChange(idx, "price", e.target.value)}
                                            required
                                        />
                                        {editPriceList.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleEditRemovePriceRow(idx)}
                                            >
                                                -
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleEditPriceRow}
                                    disabled={
                                        !editPriceList[0]?.country || 
                                        !editPriceList[0]?.price ||
                                        editPriceList.length >= countries.length
                                    }
                                >
                                    + Add Price
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant={editIsActive ? "default" : "outline"}
                                    onClick={() => setEditIsActive(true)}
                                    size="sm"
                                >
                                    Active
                                </Button>
                                <Button
                                    type="button"
                                    variant={!editIsActive ? "default" : "outline"}
                                    onClick={() => setEditIsActive(false)}
                                    size="sm"
                                >
                                    Inactive
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? "Updating..." : "Update"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}