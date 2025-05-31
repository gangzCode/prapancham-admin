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
    const { data, error, isLoading, mutate } = useSWR<{ adCategory: adCategory[]; pagination?: any }>(
        `${process.env.NEXT_PUBLIC_API_URL}/advertistment/ad-category/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddadCategory = () => {
        router.push("/adcategory/new")
    }

    const handleEditadCategory = (adCategoryId: string) => {
        router.push(`/adcategory/edit/${adCategoryId}`)
    }

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
    )
}