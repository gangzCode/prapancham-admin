"use client"

import { useState } from "react"
import useSWR from "swr"
import { Eye, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table-column-header"

type Newsletter = {
    _id: string
    email: string
    isDeleted: boolean
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
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json().then((json) => ({
        ...json,
        newsletter: json.newsletter.map((item: any) => ({
            ...item,
            id: item._id,
        })),
    }))
}

export default function NewsletterPage() {
    const { toast } = useToast()
    const [deleteNewsletter, setDeleteNewsletter] = useState<Newsletter | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_URL}/news-letters?page=${page}&limit=${pageSize}`,
        fetcher
    )

    const handleDeleteNewsletter = async () => {
        if (!deleteNewsletter) return
        setIsDeleting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news-letters/${deleteNewsletter._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            toast({ title: "Deleted", description: "Newsletter email deleted successfully." })
            mutate()
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete newsletter email." })
        }
        setIsDeleting(false)
        setDeleteNewsletter(null)
    }

    const columns = [
        {
            accessorKey: "email",
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Email" type="text" />,
            cell: ({ row }: any) => <span>{row.original.email}</span>,
        },
        // {
        //     accessorKey: "isDeleted",
        //     header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" type="text" />,
        //     cell: ({ row }: any) => (
        //         <Badge variant={row.original.isDeleted ? "secondary" : "default"}>
        //             {row.original.isDeleted ? "Deleted" : "Active"}
        //         </Badge>
        //     ),
        // },
        {
            id: "actions",
            header: "Delete",
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteNewsletter(row.original)}>
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
                title="Newsletter Subscribers"
                description="Manage newsletter subscriber emails"
            />

            <DataTable
                columns={columns}
                data={data?.newsletter || []}
                searchKey="email"
                searchPlaceholder="Search emails..."
                currentPage={page}
                totalPages={data?.pagination?.totalPages || 1}
                totalItems={data?.pagination?.totalItems || 0}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
            />

            <ConfirmDialog
                open={!!deleteNewsletter}
                onOpenChange={(open) => !open && setDeleteNewsletter(null)}
                title="Delete Newsletter Email"
                description="Are you sure you want to delete this newsletter email? This action cannot be undone."
                onConfirm={handleDeleteNewsletter}
                loading={isDeleting}
            />
        </div>
    )
}