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

interface TributeLetterTemplate {
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
        tributeLetterTemplate: json.tributeLetterTemplate.map((letterType: any) => ({
            ...letterType,
        })),
    }))
}

export default function TributeLettersPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewLetter, setViewLetter] = useState<TributeLetterTemplate | null>(null)
    const [deleteLetter, setDeleteLetter] = useState<TributeLetterTemplate | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addName, setAddName] = useState("")
    const [addImage, setAddImage] = useState<File | null>(null)
    const [addLoading, setAddLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editLetterId, setEditLetterId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")
    const [editIsActive, setEditIsActive] = useState(true)
    const [editImage, setEditImage] = useState<File | null>(null)
    const [editLoading, setEditLoading] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/letter-template/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddLetter = () => {
        setAddDialogOpen(true)
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
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/letter-template`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to add letter")
            toast({
                title: "letter added",
                description: "The letter tribute has been added successfully.",
            })
            setAddDialogOpen(false)
            setAddName("")
            setAddImage(null)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add the letter.",
                variant: "destructive",
            })
        }
        setAddLoading(false)
    }

    const openEditDialog = (letter: TributeLetterTemplate) => {
        setEditLetterId(letter._id)
        setEditName(letter.name)
        setEditImage(null)
        setEditIsActive(letter.isActive)
        setEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editLetterId || !editName) return
        setEditLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()
            formData.append("letterTemplateId", editLetterId)
            formData.append("name", editName)
            formData.append("isActive", String(editIsActive))

            if (editImage) {
                formData.append("image", editImage)
            }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/letter-template/update`,
                {
                    method: "POST",
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: formData,
                }
            )
            if (!res.ok) throw new Error("Failed to update letter")
            toast({
                title: "Letter updated",
                description: "The letter tribute has been updated successfully.",
            })
            setEditDialogOpen(false)
            setEditLetterId(null)
            setEditImage(null)
            setEditName("")
            setEditIsActive(true)
            mutate()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update the letter.",
                variant: "destructive",
            })
        }
        setEditLoading(false)
    }

    const handleEditLetter = (letter: TributeLetterTemplate) => {
        openEditDialog(letter)
    }

    const handleDeleteLetter = async () => {
        if (!deleteLetter) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tribute-items/letter-template/${deleteLetter._id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            )
            toast({
                title: "Letter deleted",
                description: `The tribute letter has been deleted successfully.`,
            })
            mutate()
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete letter.",
                variant: "destructive",
            })
        }
        setIsDeleting(false)
        setDeleteLetter(null)
    }

    const columns: ColumnDef<TributeLetterTemplate>[] = [
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
                    <Button variant="ghost" size="icon" onClick={() => setViewLetter(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditLetter(row.original)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteLetter(row.original)}>
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
                title={t("Tribute Letters")}
                description="Manage tribute letter templates"
                action={{
                    label: "Add Letter",
                    onClick: handleAddLetter,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable
                columns={columns}
                data={data?.tributeLetterTemplate || []}
                searchKey="name"
                searchPlaceholder="Search letters..."
                currentPage={page}
                totalPages={data?.pagination.totalPages || 1}
                totalItems={data?.pagination.totalItems || 0}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => setPageSize(newSize)}
            />

            {/* View Letter Dialog */}
            <ViewDialog
                open={!!viewLetter}
                onOpenChange={(open) => !open && setViewLetter(null)}
                title={viewLetter?.name ?? ""}
            >
                {viewLetter && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative border rounded-md overflow-hidden">
                                <img
                                    src={viewLetter.image}
                                    alt={viewLetter.name}
                                    className="max-w-full h-auto"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                            <Badge variant={viewLetter.isActive ? "default" : "secondary"}>
                                {viewLetter.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        {/* <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Created</h3>
                            <p>{new Date(viewLetter.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                            <p>{new Date(viewLetter.updatedAt).toLocaleString()}</p>
                        </div> */}
                    </div>
                )}
            </ViewDialog>

            {/* Add letter Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Letter template</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="letter-name">Name</Label>
                            <Input
                                id="letter-name"
                                value={addName}
                                onChange={e => setAddName(e.target.value)}
                                required
                                placeholder="Enter letter name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="letter-image">Image</Label>
                            <Input
                                id="letter-image"
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

            {/* Update letter Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Letter</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-letter-name">Name</Label>
                            <Input
                                id="edit-letter-name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                placeholder="Enter letter name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="letter-image">Image</Label>
                            <Input
                                id="letter-image"
                                type="file"
                                accept="image/*"
                                onChange={e => setEditImage(e.target.files?.[0] || null)}
                                required
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteLetter}
                onOpenChange={(open) => !open && setDeleteLetter(null)}
                title="Delete Letter"
                description={`Are you sure you want to delete this letter? This action cannot be undone.`}
                onConfirm={handleDeleteLetter}
                loading={isDeleting}
            />
        </div>
    )
}