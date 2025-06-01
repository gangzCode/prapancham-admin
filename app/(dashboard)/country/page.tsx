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

type Country = {
    _id: string
    name: {
        en: { name: string; value: string; _id: string }[]
        ta: { name: string; value: string; _id: string }[]
        si: { name: string; value: string; _id: string }[]
    }
    isDeleted: boolean
    isActive: boolean
    image: string
    createdAt: string
    updatedAt: string
}

type LangKey = "en" | "ta" | "si"

const fetcher = async (url: string): Promise<{ countries: Country[]; pagination?: any }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
}

export default function CountryPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t, lang: dashboardLang = "en" } = useLanguage() as any
    const [viewCountry, setViewCountry] = useState<Country | null>(null)
    const [deleteCountry, setDeleteCountry] = useState<Country | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [previewLang, setPreviewLang] = useState<LangKey>(dashboardLang as LangKey)
    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/country/all?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleAddCountry = () => {
        router.push("/country/new")
    }

    const handleEditCountry = (countryId: string) => {
        router.push(`/country/edit/${countryId}`)
    }

    const handleDeleteCountry = async () => {
        if (!deleteCountry) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country/${deleteCountry._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            toast({
                title: "Country deleted",
                description: `"${deleteCountry.name.en[0]?.value}" has been deleted successfully.`,
            })
            mutate()
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete country." })
        }
        setIsDeleting(false)
        setDeleteCountry(null)
    }

    const columns: ColumnDef<Country>[] = [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => (
                <img
                    src={row.original.image}
                    alt={row.original.name.en[0]?.value}
                    width={40}
                    height={30}
                    className="rounded border"
                />
            ),
        },
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
                    <Button variant="ghost" size="icon" onClick={() => setViewCountry(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditCountry(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteCountry(row.original)}>
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
                title={t ? t("countries") : "Countries"}
                description="Manage countries"
                action={{
                    label: "Add Country",
                    onClick: handleAddCountry,
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
                    data={data?.countries || []}
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

            {/* View Country Dialog */}
            <ViewDialog
                open={!!viewCountry}
                onOpenChange={(open) => !open && setViewCountry(null)}
                title={
                    viewCountry?.name?.[previewLang]?.[0]?.value ||
                    viewCountry?.name?.en?.[0]?.value ||
                    "Country Details"
                }
            >
                {viewCountry && (
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
                                        <p className="font-medium">{viewCountry.name[lang]?.[0]?.value}</p>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                        <div className="flex justify-center">
                            <img
                                src={viewCountry.image}
                                alt={viewCountry.name[previewLang]?.[0]?.value || ""}
                                className="max-w-full h-auto border rounded"
                                width={120}
                                height={80}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                                <Badge variant={viewCountry.isActive ? "default" : "destructive"}>
                                    {viewCountry.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            {/* <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Deleted</h3>
                                <Badge variant={viewCountry.isDeleted ? "destructive" : "default"}>
                                    {viewCountry.isDeleted ? "Yes" : "No"}
                                </Badge>
                            </div> */}
                        </div>
                        {/* <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                                <p>{new Date(viewCountry.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground">Updated At</h3>
                                <p>{new Date(viewCountry.updatedAt).toLocaleString()}</p>
                            </div>
                        </div> */}
                    </div>
                )}
            </ViewDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteCountry}
                onOpenChange={(open) => !open && setDeleteCountry(null)}
                title="Delete Country"
                description={`Are you sure you want to delete "${deleteCountry?.name?.en?.[0]?.value || ""}"? This action cannot be undone.`}
                onConfirm={handleDeleteCountry}
                loading={isDeleting}
            />
        </div>
    )
}