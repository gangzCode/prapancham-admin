"use client"

import { useState } from "react"
import useSWR from "swr"
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

interface TributeCardTemplate {
    _id: string
    image: string
    isDeleted: boolean
    isActive: boolean
    name: string
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
        tributeCardTemplate: json.tributeCardTemplate.map((letterType: any) => ({
            ...letterType,
        })),
    }))
}

export default function TributeCardsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewCard, setViewCard] = useState<TributeCardTemplate | null>(null)
    const [deleteCard, setDeleteCard] = useState<TributeCardTemplate | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addName, setAddName] = useState("")
    const [addImage, setAddImage] = useState<File | null>(null)
    const [addLoading, setAddLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editCardId, setEditCardId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editIsActive, setEditIsActive] = useState(true)
    const [editImage, setEditImage] = useState<File | null>(null)
    const [editLoading, setEditLoading] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/card-template/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddCard = () => setAddDialogOpen(true)

    const openEditDialog = (card: TributeCardTemplate) => {
        setEditCardId(card._id)
        setEditName(card.name)
        setEditIsActive(card.isActive)
        setEditImage(null)
        setEditDialogOpen(true)
    }

    const handleEditCard = (card: TributeCardTemplate) => {
        openEditDialog(card)
    }

    const handleDeleteCard = async () => {
        if (!deleteCard) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/card-template/${deleteCard._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            toast({
                title: "Card deleted",
                description: `The tribute card has been deleted successfully.`,
            })
            mutate()
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete card.",
                variant: "destructive",
            })
        }
        setIsDeleting(false)
        setDeleteCard(null)
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addName || !addImage) return

        setAddLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()
            formData.append("name", addName)
            formData.append("image", addImage)

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/card-template`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to add card")
            toast({
                title: "Card added",
                description: "The tribute card has been added successfully.",
            })
            setAddDialogOpen(false)
            setAddName("")
            setAddImage(null)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add the card.",
                variant: "destructive",
            })
        }
        setAddLoading(false)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editCardId || !editName) return
        setEditLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()
            formData.append("cardTemplateId", editCardId)
            formData.append("name", editName)
            formData.append("isActive", String(editIsActive))
            if (editImage) {
                formData.append("image", editImage)
            }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/card-template/update`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to update card")
            toast({
                title: "Card updated",
                description: "The tribute card has been updated successfully.",
            })
            setEditDialogOpen(false)
            setEditCardId(null)
            setEditName("")
            setEditIsActive(true)
            setEditImage(null)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update the card.",
                variant: "destructive",
            })
        }
        setEditLoading(false)
    }

    const columns: ColumnDef<TributeCardTemplate>[] = [
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
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewCard(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCard(row.original)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteCard(row.original)}>
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
                title={t("Tribute Cards")}
                description="Manage tribute card templates"
                action={{
                    label: "Add Card",
                    onClick: handleAddCard,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable
                columns={columns}
                data={data?.tributeCardTemplate ?? []}
                searchKey="name"
                searchPlaceholder="Search cards..."
                currentPage={page}
                totalPages={data?.pagination.totalPages || 1}
                totalItems={data?.pagination.totalItems || 0}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
            />

            {/* View Card Dialog */}
            <ViewDialog
                open={!!viewCard}
                onOpenChange={(open) => !open && setViewCard(null)}
                title={viewCard?.name ?? ""}
            >
                {viewCard && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative border rounded-md overflow-hidden">
                                <img
                                    src={viewCard.image}
                                    alt={viewCard.name}
                                    className="max-w-full h-auto"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                            <Badge variant={viewCard.isActive ? "default" : "secondary"}>
                                {viewCard.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        {/* <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                            <p>{new Date(viewCard.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                            <p>{new Date(viewCard.updatedAt).toLocaleString()}</p>
                        </div> */}
                    </div>
                )}
            </ViewDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteCard}
                onOpenChange={(open) => !open && setDeleteCard(null)}
                title="Delete Card"
                description={`Are you sure you want to delete this card? This action cannot be undone.`}
                onConfirm={handleDeleteCard}
                loading={isDeleting}
            />

            {/* Add Card Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Card Template</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="card-name">Name</Label>
                            <Input
                                id="card-name"
                                value={addName}
                                onChange={e => setAddName(e.target.value)}
                                required
                                placeholder="Enter card name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="card-image">Image</Label>
                            <Input
                                id="card-image"
                                type="file"
                                accept="image/*"
                                onChange={e => setAddImage(e.target.files?.[0] || null)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={addLoading}>
                                {addLoading ? "Adding..." : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Card Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Card</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-card-name">Name</Label>
                            <Input
                                id="edit-card-name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                placeholder="Enter card name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-card-image">Image</Label>
                            <Input
                                id="edit-card-image"
                                type="file"
                                accept="image/*"
                                onChange={e => setEditImage(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full border rounded px-2 py-1"
                                value={editIsActive ? "true" : "false"}
                                onChange={e => setEditIsActive(e.target.value === "true")}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
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