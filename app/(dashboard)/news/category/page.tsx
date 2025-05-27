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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type } from "os"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type NewsCategory = {
    id: string
    name: {
        en: { name: string; value: string }[]
        ta: { name: string; value: string }[]
        si: { name: string; value: string }[]
    }
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
        newsCategory: json.newsCategory.map((category: any) => ({
            ...category,
            id: category._id,
            name: {
                en: category.name.en,
                ta: category.name.ta,
                si: category.name.si,
            },
            isDeleted: category.isDeleted,
            isActive: category.isActive,
        })),
    }))

}

export default function CategoryPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addLangTab, setAddLangTab] = useState<"en" | "ta" | "si">("en");
    const [enName, setEnName] = useState("")
    const [enValue, setEnValue] = useState("")
    const [taName, setTaName] = useState("")
    const [taValue, setTaValue] = useState("")
    const [siName, setSiName] = useState("")
    const [siValue, setSiValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [viewCategory, setviewCategory] = useState<NewsCategory | null>(null)
    const [deleteCategory, setdeleteCategory] = useState<NewsCategory | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // New states for editing
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editLangTab, setEditLangTab] = useState<"en" | "ta" | "si">("en");
    const [editId, setEditId] = useState<string | null>(null);
    const [editEnName, setEditEnName] = useState("");
    const [editEnValue, setEditEnValue] = useState("");
    const [editTaName, setEditTaName] = useState("");
    const [editTaValue, setEditTaValue] = useState("");
    const [editSiName, setEditSiName] = useState("");
    const [editSiValue, setEditSiValue] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const { data, error, isLoading, mutate } = useSWR<{ newsCategory: NewsCategory[]; pagination?: any }>(
        `${process.env.NEXT_PUBLIC_API_URL}/news/news-category/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddCategory = () => {
        setAddDialogOpen(true)
    }

    // Edit handler
    const handleEditCategory = (categoryId: string) => {
        const cat = data?.newsCategory.find(c => c.id === categoryId);
        if (!cat) return;
        setEditId(cat.id);
        setEditEnName(cat.name.en[0]?.name || "");
        setEditEnValue(cat.name.en[0]?.value || "");
        setEditTaName(cat.name.ta[0]?.name || "");
        setEditTaValue(cat.name.ta[0]?.value || "");
        setEditSiName(cat.name.si[0]?.name || "");
        setEditSiValue(cat.name.si[0]?.value || "");
        setEditLangTab("en");
        setEditDialogOpen(true);
    };

    const handledeleteCategory = async () => {
        if (!deleteCategory) return

        setIsDeleting(true)

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/news-category/${deleteCategory.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })

            toast({
                title: "Advertisement Type deleted",
                description: `"${deleteCategory.name.en[0].value}" has been deleted successfully.`,
            })

            mutate()
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete advertisement." })
        }

        setIsDeleting(false)
        setdeleteCategory(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const body = {
                name: {
                    en: [{ name: enName, value: enValue }],
                    ta: [{ name: taName, value: taValue }],
                    si: [{ name: siName, value: siValue }],
                },
                isDeleted: false,
                isActive: true,
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/news-category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Failed to add")
            toast({ title: "Success", description: "Category added." })
            setEnName(""); setEnValue(""); setTaName(""); setTaValue(""); setSiName(""); setSiValue("");
            setAddDialogOpen(false)
            mutate()
        } catch {
            toast({ title: "Error", description: "Failed to add category." })
        }
        setLoading(false)
    }

    // Edit submit handler
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId) return;
        setEditLoading(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const body = {
                name: {
                    en: [{ name: editEnName, value: editEnValue }],
                    ta: [{ name: editTaName, value: editTaValue }],
                    si: [{ name: editSiName, value: editSiValue }],
                },
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/news-category/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast({ title: "Success", description: "Category updated." });
            setEditDialogOpen(false);
            mutate();
        } catch {
            toast({ title: "Error", description: "Failed to update category." });
        }
        setEditLoading(false);
    };

    const columns: ColumnDef<NewsCategory>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Type" type="text" />,
            cell: ({ row }) => <div className="font-medium">{row.original.name.en[0].value}</div>,
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    {/* <DataTableColumnHeader column={column} title="Status" type="status" /> */}
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
                    <Button variant="ghost" size="icon" onClick={() => setviewCategory(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCategory(row.original.id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setdeleteCategory(row.original)}>
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
                title={t("Categories")}
                description="Manage Categories here"
                action={{
                    label: "Add Category",
                    onClick: handleAddCategory,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            <DataTable
                columns={columns}
                data={data?.newsCategory || []}
                searchKey="name"
                searchPlaceholder="Search event types..."
                currentPage={page}
                totalPages={data?.pagination?.totalPages || 1}
                totalItems={data?.pagination?.totalItems || 0}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />

            {/* View Advertisement Dialog */}
            <ViewDialog
                open={!!viewCategory}
                onOpenChange={(open) => !open && setviewCategory(null)}
                title={viewCategory?.name.en[0].value || "Category Details"}
            >
                {viewCategory && (
                    <div className="space-y-4">
                        <Tabs defaultValue="en" className="w-full">
                            <TabsList>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>

                            {["en", "ta", "si"].map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                                            <p>{viewCategory.name[lang as keyof typeof viewCategory.name][0]?.name}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-muted-foreground">value</h3>
                                            <p>{viewCategory.name[lang as keyof typeof viewCategory.name][0]?.value}</p>
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                                {(() => {
                                    const badgeVariant = viewCategory.isActive === true ? "default" : "secondary";
                                    return (
                                        <Badge variant={badgeVariant}>
                                            {viewCategory.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    );
                                })()}
                            </div>
                        </div>

                    </div>
                )}
            </ViewDialog>

            {/* Add Category Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Tabs value={addLangTab} onValueChange={v => setAddLangTab(v as "en" | "ta" | "si")}>
                            <TabsList>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>
                            <TabsContent value="en">
                                <div>
                                    <Label htmlFor="enName">English Name</Label>
                                    <Input id="enName" value={enName} onChange={e => setEnName(e.target.value)} required />
                                    <Label htmlFor="enValue" className="mt-2">English Value</Label>
                                    <Input id="enValue" value={enValue} onChange={e => setEnValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="ta">
                                <div>
                                    <Label htmlFor="taName">Tamil Name</Label>
                                    <Input id="taName" value={taName} onChange={e => setTaName(e.target.value)} required />
                                    <Label htmlFor="taValue" className="mt-2">Tamil Value</Label>
                                    <Input id="taValue" value={taValue} onChange={e => setTaValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="si">
                                <div>
                                    <Label htmlFor="siName">Sinhala Name</Label>
                                    <Input id="siName" value={siName} onChange={e => setSiName(e.target.value)} required />
                                    <Label htmlFor="siValue" className="mt-2">Sinhala Value</Label>
                                    <Input id="siValue" value={siValue} onChange={e => setSiValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                        </Tabs>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Adding..." : "Add"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <Tabs value={editLangTab} onValueChange={v => setEditLangTab(v as "en" | "ta" | "si")}>
                            <TabsList>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>
                            <TabsContent value="en">
                                <div>
                                    <Label htmlFor="editEnName">English Name</Label>
                                    <Input id="editEnName" value={editEnName} onChange={e => setEditEnName(e.target.value)} required />
                                    <Label htmlFor="editEnValue" className="mt-2">English Value</Label>
                                    <Input id="editEnValue" value={editEnValue} onChange={e => setEditEnValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="ta">
                                <div>
                                    <Label htmlFor="editTaName">Tamil Name</Label>
                                    <Input id="editTaName" value={editTaName} onChange={e => setEditTaName(e.target.value)} required />
                                    <Label htmlFor="editTaValue" className="mt-2">Tamil Value</Label>
                                    <Input id="editTaValue" value={editTaValue} onChange={e => setEditTaValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="si">
                                <div>
                                    <Label htmlFor="editSiName">Sinhala Name</Label>
                                    <Input id="editSiName" value={editSiName} onChange={e => setEditSiName(e.target.value)} required />
                                    <Label htmlFor="editSiValue" className="mt-2">Sinhala Value</Label>
                                    <Input id="editSiValue" value={editSiValue} onChange={e => setEditSiValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                        </Tabs>
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
                open={!!deleteCategory}
                onOpenChange={(open) => !open && setdeleteCategory(null)}
                title="Delete Advertisement"
                description={`Are you sure you want to delete "${deleteCategory?.name.en[0].value}"? This action cannot be undone.`}
                onConfirm={handledeleteCategory}
                loading={isDeleting}
            />
        </div>
    )
}
