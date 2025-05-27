"use client"

import { useState } from "react"
import { Eye, Trash2, Mail } from "lucide-react"
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
import useSWR from "swr"

type ContactMessage = {
  id: string
  firstName: string
  lastName: string
  email: string
  description: string
  phoneNumber: string
  country: string
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
    contacts: json.contactUsForm?.map((msg: any) => ({
      id: msg._id || msg.id,
      firstName: msg.firstName,
      lastName: msg.lastName,
      email: msg.email,
      description: msg.description,
      phoneNumber: msg.phoneNumber,
      country: msg.country,
    })) || [],
  }))
}

export default function ContactPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<ContactMessage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/contact-us?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const handleMarkAsRead = async (messageId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast({
      title: "Message marked as read",
      description: "The message has been marked as read.",
    })
  }

  const handleReply = (messageId: string) => {
    window.open(`mailto:${viewMessage?.email}?subject=Re: ${viewMessage?.firstName}`, "_blank")
  }

  const handleDeleteMessage = async () => {
    if (!deleteMessage) return
    setIsDeleting(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-us/${deleteMessage.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )
      if (!res.ok) throw new Error("Failed to delete message")
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      })
      setDeleteMessage(null)
      mutate()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the message.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<ContactMessage>[] = [
    {
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="First Name" type="text" />,
      cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Name" type="text" />,
      cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "PhoneNumber",
    },
    {
      accessorKey: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Country" type="text" />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewMessage(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteMessage(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t("contact")} description="Manage contact form submissions and inquiries" />
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load contact messages.</div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.contacts || []}
          searchKey={["email", "firstName", "lastName"]}
          searchPlaceholder="Search email, first or last name"
          currentPage={page}
          totalPages={data?.pagination?.totalPages || 1}
          totalItems={data?.pagination?.totalItems || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      <ViewDialog
        open={!!viewMessage}
        onOpenChange={(open) => {
          if (!open) setViewMessage(null)
          else if (viewMessage) handleMarkAsRead(viewMessage.id)
        }}
        title={viewMessage?.firstName || "Message Details"}
      >
        {viewMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">First Name</h3>
                <p>{viewMessage.firstName}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Name</h3>
                <p>{viewMessage.lastName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Phone Number</h3>
                <p>{viewMessage.phoneNumber}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p>{viewMessage.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                <p className="break-words whitespace-normal">{viewMessage.description}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => handleReply(viewMessage.id)} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </ViewDialog>
      <ConfirmDialog
        open={!!deleteMessage}
        onOpenChange={(open) => !open && setDeleteMessage(null)}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={handleDeleteMessage}
        loading={isDeleting}
      />
    </div>
  )
}
