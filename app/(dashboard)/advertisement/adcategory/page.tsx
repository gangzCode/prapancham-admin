"use client"

import { useState } from "react"
import { Eye, Pencil, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type adCategory = {
    _id: string
    name: {
        en: { name: string; value: string; _id: string }[]
        ta: { name: string; value: string; _id: string }[]
        si: { name: string; value: string; _id: string }[]
    }
    isActive: boolean
}

type LangKey = "en" | "ta" | "si"

const fetcher = async (url: string): Promise<{ adCategory: adCategory[]; pagination?: any }> => {
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
        adCategory: json.adCategory.map((adCategory: any) => ({
            ...adCategory,
        })),
    }))
}

export default function AdCategoryPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t, lang: dashboardLang = "en" } = useLanguage() as any
    const [viewadCategory, setViewadCategory] = useState<adCategory | null>(null)
    const [deleteadCategory, setDeleteadCategory] = useState<adCategory | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [previewLang, setPreviewLang] = useState<LangKey>(dashboardLang as LangKey)

    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addLangTab, setAddLangTab] = useState<"en" | "ta" | "si">("en");
    const [enName, setEnName] = useState("Name")
    const [enValue, setEnValue] = useState("")
    const [taName, setTaName] = useState("பெயர்")
    const [taValue, setTaValue] = useState("")
    const [siName, setSiName] = useState("නම")
    const [siValue, setSiValue] = useState("")
    const [loading, setLoading] = useState(false)

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editLangTab, setEditLangTab] = useState<"en" | "ta" | "si">("en");
    const [editId, setEditId] = useState<string | null>(null);
    const [editEnName, setEditEnName] = useState("Name");
    const [editEnValue, setEditEnValue] = useState("");
    const [editTaName, setEditTaName] = useState("பெயர்");
    const [editTaValue, setEditTaValue] = useState("");
    const [editSiName, setEditSiName] = useState("නම");
    const [editSiValue, setEditSiValue] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editIsActive, setEditIsActive] = useState<boolean>(true);
    const [isActive, setIsActive] = useState(true); // For Add


    const { data, error, isLoading, mutate } = useSWR<{ adCategory: adCategory[]; pagination?: any }>(
        `${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-category/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddadCategory = () => {
        setAddDialogOpen(true)
    }

    const handleEditadCategory = (categoryId: string) => {
        const cat = data?.adCategory.find(c => c._id === categoryId);
        if (!cat) return;
        setEditId(cat._id);
        setEditEnName(cat.name.en[0]?.name || "");
        setEditEnValue(cat.name.en[0]?.value || "");
        setEditTaName(cat.name.ta[0]?.name || "");
        setEditTaValue(cat.name.ta[0]?.value || "");
        setEditSiName(cat.name.si[0]?.name || "");
        setEditSiValue(cat.name.si[0]?.value || "");
        setEditLangTab("en");
        setEditIsActive(cat.isActive);
        setEditDialogOpen(true);
    };

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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Failed to add")
            toast({ title: "Success", description: "Category added." })
            setEnValue(""); setTaValue(""); setSiValue("");
            setAddDialogOpen(false)
            mutate()
        } catch {
            toast({ title: "Error", description: "Failed to add category." })
        }
        setLoading(false)
    }

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
                isActive: editIsActive,
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-category/${editId}`, {
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

    const handleDeleteadCategory = async () => {
        if (!deleteadCategory) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-category/${deleteadCategory._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            toast({
                title: "adCategory deleted",
                description: `"${deleteadCategory.name.en[0]?.value}" has been deleted successfully.`,
            })
            mutate()
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete adCategory." })
        }
        setIsDeleting(false)
        setDeleteadCategory(null)
    }

    const columns: ColumnDef<adCategory>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <span>{row.original.name[dashboardLang as LangKey]?.[0]?.value || row.original.name.en[0]?.value}</span>
            ),
            filterFn: (row, id, value) => {
                const name = row.original.name.en[0]?.value?.toLowerCase() || ""
                return name.includes(value.toLowerCase())
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) =>
                row.original.isActive ? (
                    <Badge variant="default">Active</Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewadCategory(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditadCategory(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteadCategory(row.original)}>
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
                title={t ? t("Ad Category") : "Ad Category"}
                description="Manage Ad Categories for advertisements."
                action={{
                    label: "Add adCategory",
                    onClick: handleAddadCategory,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />
    
            {isLoading ? (
                <div className="text-center">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500">Failed to load countries.</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={data?.adCategory || []}
                    searchKey="name"
                    searchPlaceholder="Search countries..."
                    currentPage={page}
                    totalPages={data?.pagination?.totalPages || 1}
                    totalItems={data?.pagination?.totalItems || 0}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            )}
    
            {/* View adCategory Dialog */}
            <ViewDialog
                open={!!viewadCategory}
                onOpenChange={(open) => !open && setViewadCategory(null)}
                title={
                    viewadCategory?.name?.[previewLang]?.[0]?.value ||
                    viewadCategory?.name?.en?.[0]?.value ||
                    "adCategory Details"
                }
            >
                {viewadCategory && (
                    <div className="space-y-6">
                        <Tabs
                            value={previewLang}
                            defaultValue={dashboardLang}
                            className="w-full"
                            onValueChange={(val) => setPreviewLang(val as LangKey)}
                        >
                            <TabsList>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>
                            {(["en", "ta", "si"] as LangKey[]).map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                    <div className="space-y-2 py-4">
                                        <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                                        <p className="font-medium">{viewadCategory.name[lang]?.[0]?.value}</p>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                                <Badge variant={viewadCategory.isActive ? "default" : "destructive"}>
                                    {viewadCategory.isActive ? "Active" : "Inactive"}
                                </Badge>
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
                                    <Label htmlFor="enValue" className="mt-2">English Value</Label>
                                    <Input id="enValue" value={enValue} onChange={e => setEnValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="ta">
                                <div>
                                    <Label htmlFor="taValue" className="mt-2">Tamil Value</Label>
                                    <Input id="taValue" value={taValue} onChange={e => setTaValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="si">
                                <div>
                                    <Label htmlFor="siValue" className="mt-2">Sinhala Value</Label>
                                    <Input id="siValue" value={siValue} onChange={e => setSiValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                        </Tabs>
    
                        {/* Add Status Switch */}
                        <div className="flex items-center space-x-2">
                            <Switch id="addStatus" checked={isActive} onCheckedChange={setIsActive} />
                            <Label htmlFor="addStatus">Active</Label>
                        </div>
    
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
                                    <Label htmlFor="editEnValue" className="mt-2">English Value</Label>
                                    <Input id="editEnValue" value={editEnValue} onChange={e => setEditEnValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="ta">
                                <div>
                                    <Label htmlFor="editTaValue" className="mt-2">Tamil Value</Label>
                                    <Input id="editTaValue" value={editTaValue} onChange={e => setEditTaValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                            <TabsContent value="si">
                                <div>
                                    <Label htmlFor="editSiValue" className="mt-2">Sinhala Value</Label>
                                    <Input id="editSiValue" value={editSiValue} onChange={e => setEditSiValue(e.target.value)} required />
                                </div>
                            </TabsContent>
                        </Tabs>
    
f                        <div className="flex items-center space-x-2">
                            <Switch id="editStatus" checked={editIsActive} onCheckedChange={setEditIsActive} />
                            <Label htmlFor="editStatus">Active</Label>
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
                open={!!deleteadCategory}
                onOpenChange={(open) => !open && setDeleteadCategory(null)}
                title="Delete adCategory"
                description={`Are you sure you want to delete "${deleteadCategory?.name?.en?.[0]?.value || ""}"? This action cannot be undone.`}
                onConfirm={handleDeleteadCategory}
                loading={isDeleting}
            />
        </div>
    );    
}