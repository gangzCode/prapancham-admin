"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Adtype = {
    id: string
    imageSize: string
    type: string
    isDeleted: boolean
    isActive: boolean
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
        adTypes: json.adTypes.map((adType: any) => ({
            ...adType,
            id: adType._id,
            imageSize: adType.imageSize,
            type: adType.type,
            isDeleted: adType.isDeleted,
            isActive: adType.isActive,
        })),
    }))

}

export default function AddTypePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewAdType, setviewAdType] = useState<Adtype | null>(null)
    const [deleteAdType, setdeleteAdType] = useState<Adtype | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [type, setType] = useState("")
    const [imageSize, setImageSize] = useState("")
    const [loading, setLoading] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editAdType, setEditAdType] = useState<Adtype | null>(null)
    const [editType, setEditType] = useState("")
    const [editImageSize, setEditImageSize] = useState("")
    const [editLoading, setEditLoading] = useState(false)

    const { data, error, isLoading, mutate } = useSWR<{ adTypes: Adtype[]; pagination?: any }>(
        `${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-type/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddAdType = () => {
        setAddDialogOpen(true)
    }

    const handleEditAd = (adTypeId: string) => {
        const ad = data?.adTypes.find((a) => a.id === adTypeId)
        if (ad) {
            setEditAdType(ad)
            setEditType(ad.type)
            setEditImageSize(ad.imageSize)
            setEditDialogOpen(true)
        }
    }

    const handledeleteAdType = async () => {
        if (!deleteAdType) return

        setIsDeleting(true)

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-type/${deleteAdType.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })

            toast({
                title: "Advertisement Type deleted",
                description: `"${deleteAdType.type}" has been deleted successfully.`,
            })

            mutate()
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete advertisement." })
        }

        setIsDeleting(false)
        setdeleteAdType(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-type`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ type, imageSize }),
            })
            if (!res.ok) throw new Error("Failed to add")
            toast({ title: "Success", description: "Advertisement Type added." })
            setType("")
            setImageSize("")
            setAddDialogOpen(false)
            mutate()
        } catch {
            toast({ title: "Error", description: "Failed to add advertisement type." })
        }
        setLoading(false)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editAdType) return
        setEditLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-type/${editAdType.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ type: editType, imageSize: editImageSize }),
            })
            if (!res.ok) throw new Error("Failed to update")
            toast({ title: "Success", description: "Advertisement Type updated." })
            setEditDialogOpen(false)
            setEditAdType(null)
            mutate()
        } catch {
            toast({ title: "Error", description: "Failed to update advertisement type." })
        }
        setEditLoading(false)
    }

    const uniquePlacements = Array.from(new Set((data?.adTypes || []).map((ad: Adtype) => ad.imageSize))).map((placement) => ({
        label: String(placement),
        value: String(placement),
    }))

    const columns: ColumnDef<Adtype>[] = [
        {
            accessorKey: "type",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" type="text" />,
            cell: ({ row }) => <div className="font-medium">{row.original.type}</div>,
        },
        {
            accessorKey: "imageSize",
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    <DataTableFacetedFilter column={column} title="Image Size" options={uniquePlacements} />
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
            cell: ({ row }) => {
                const status = row.original.isActive ? "active" : "inactive"
                let variant: "default" | "secondary" | "destructive" | "outline" = "default"

                switch (status) {
                    case "active":
                        variant = "default"
                        break
                    case "inactive":
                        variant = "destructive"
                        break
                }

                return <Badge variant={variant}>{status}</Badge>
            },
            filterFn: (row, id, value) => {
                return value.includes(String(row.getValue(id)));
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setviewAdType(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditAd(row.original.id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setdeleteAdType(row.original)}>
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
                title={t("Advertisement Types")}
                description="Manage advertisement Types"
                action={{
                    label: "Add Advertisement Type",
                    onClick: handleAddAdType,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">Failed to load advertisements.</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data?.adTypes || []}
                    searchKey="type"
                    searchPlaceholder="Search advertisement types..."
                    currentPage={page}
                    totalPages={data?.pagination?.totalPages || 1}
                    totalItems={data?.pagination?.totalItems || 0}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            )}

            {/* View Advertisement Dialog */}
            <ViewDialog
                open={!!viewAdType}
                onOpenChange={(open) => !open && setviewAdType(null)}
                title={viewAdType?.type || "Advertisement Details"}
            >
                {viewAdType && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
                                <p>{viewAdType.type}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Size</h3>
                                <p>{viewAdType.imageSize}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                                <Badge variant={viewAdType.isActive === true ? "default" : "secondary"}> {viewAdType.isActive ? "Active" : "Inactive"}</Badge>
                            </div>
                        </div>

                    </div>
                )}
            </ViewDialog>

            {/* Add Advertisement Type Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Advertisement Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="type">Type</Label>
                            <Input id="type" value={type} onChange={e => setType(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="imageSize">Image Size</Label>
                            <Input id="imageSize" value={imageSize} onChange={e => setImageSize(e.target.value)} required placeholder="e.g. 300x250" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Adding..." : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Advertisement Type Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open)
                if (!open) setEditAdType(null)
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Advertisement Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-type">Type</Label>
                            <Input
                                id="edit-type"
                                value={editType}
                                onChange={e => setEditType(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-imageSize">Image Size</Label>
                            <Input
                                id="edit-imageSize"
                                value={editImageSize}
                                onChange={e => setEditImageSize(e.target.value)}
                                required
                                placeholder="e.g. 300x250"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={editLoading}>
                                {editLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteAdType}
                onOpenChange={(open) => !open && setdeleteAdType(null)}
                title="Delete Advertisement"
                description={`Are you sure you want to delete "${deleteAdType?.type}"? This action cannot be undone.`}
                onConfirm={handledeleteAdType}
                loading={isDeleting}
            />

        </div>
    )
}

