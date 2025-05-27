"use client"
import useSWR from "swr"
import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "recharts"


type FAQ = {
  id: string
  question: {
    en: { name: string; value: string };
    ta: { name: string; value: string };
    si: { name: string; value: string };
  }
  answer: {
    en: { name: string; value: string };
    ta: { name: string; value: string };
    si: { name: string; value: string };
  }
  listingNumber: number
  isActive: boolean
  isDeleted: boolean
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
    faqs: json.faqs.map((faq: any) => ({
      ...faq,
      id: faq._id,
      question: {
        en: faq.question.en[0],
        ta: faq.question.ta[0],
        si: faq.question.si[0],
      },
      answer: {
        en: faq.answer.en[0],
        ta: faq.answer.ta[0],
        si: faq.answer.si[0],
      },
    })),
  }))

}


export default function FAQPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewFAQ, setViewFAQ] = useState<FAQ | null>(null)
  const [deleteFAQ, setDeleteFAQ] = useState<FAQ | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [statusFAQ, setStatusFAQ] = useState<FAQ | null>(null)
  const [newActiveStatus, setNewActiveStatus] = useState<boolean>(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)





  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/faq/all?page=${page}&limit=${pageSize}`,
    fetcher
  )


  const handleAddFAQ = () => {
    router.push("/faq/new")
  }

  const handleEditFAQ = (faqId: string) => {
    router.push(`/faq/edit/${faqId}`)
  }


  const handleDeleteFAQ = async () => {
    if (!deleteFAQ) return
    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq/${deleteFAQ.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      toast({ title: "FAQ deleted", description: "The FAQ has been deleted successfully." })
      mutate()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete FAQ." })
    }

    setIsDeleting(false)
    setDeleteFAQ(null)
  }

  const handleOpenStatusChange = (faq: FAQ) => {
    setStatusFAQ(faq)
    setNewActiveStatus(faq.isActive)
  }

  const handleStatusChange = async () => {
    if (!statusFAQ) return
    setIsUpdatingStatus(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq/${statusFAQ.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          isActive: newActiveStatus,
        }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      toast({
        title: "Status updated",
        description: `Status for \"${statusFAQ.question.en.value}\" has been updated.`,
      })
      mutate()
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update FAQ status.",
      })
    }
    setIsUpdatingStatus(false)
    setStatusFAQ(null)
  }

  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: "listingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Order" type="number" />,
    },
    {
      accessorKey: "question",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Question" type="text" />,
      cell: ({ row }) => <div className="font-medium max-w-[500px] truncate">{row.original.question.en.value}</div>,
      filterFn: (row, id, value) => {
        const question = row.original.question.en.value.toLowerCase();
        return question.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "answer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Answer" type="text" />,
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.answer.en.value}</div>,
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
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleOpenStatusChange(row.original)}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
      enableSorting: true,
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewFAQ(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditFAQ(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteFAQ(row.original)}>
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
        title={t("faq")}
        description="Manage frequently asked questions"
        action={{
          label: "Add FAQ",
          onClick: handleAddFAQ,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable
        columns={columns}
        data={data?.faqs || []}
        searchKey="question"
        searchPlaceholder="Search FAQs..."
        currentPage={page}
        totalPages={data?.pagination.totalPages || 1}
        totalItems={data?.pagination.totalItems || 0}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
      />


      {/* {isLoading && <div className="text-center">Loading...</div>} */}
      {/* View FAQ Dialog */}
      <ViewDialog open={!!viewFAQ} onOpenChange={(open) => !open && setViewFAQ(null)} title="FAQ Details">
        {viewFAQ && (
          <div className="space-y-8">
            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>

              {["en", "ta", "si"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="space-y-2 py-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Question</h3>
                    <p className="font-medium">{viewFAQ.question[lang as keyof typeof viewFAQ.question].value}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Answer</h3>
                    <p className="whitespace-pre-wrap">{viewFAQ.answer[lang as keyof typeof viewFAQ.answer].value}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Order</h3>
                <p>{viewFAQ.listingNumber}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewFAQ.isActive === true ? "default" : "secondary"}> {viewFAQ.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
          </div>
        )}
      </ViewDialog>

      <ConfirmDialog
        open={!!deleteFAQ}
        onOpenChange={(open) => !open && setDeleteFAQ(null)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        onConfirm={handleDeleteFAQ}
        loading={isDeleting}
      />

      {/* Status Change Dialog */}
      <Dialog open={!!statusFAQ} onOpenChange={(open) => !open && setStatusFAQ(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change FAQ Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {statusFAQ && (
              <div className="text-sm">
                <p className="font-medium mb-2">FAQ: {statusFAQ.question.en.name}</p>
                <p className="text-muted-foreground">Update the status of this FAQ</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Active FAQs are visible to users</p>
              </div>
              <Switch id="active-status" checked={newActiveStatus} onCheckedChange={setNewActiveStatus} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusFAQ(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Updating..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
