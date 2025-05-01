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

// Sample data for contact messages
type ContactMessage = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  country: string
}

const contactMessages: ContactMessage[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    phoneNumber: "+11234567890",
    country: "USA",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@example.com",
    phoneNumber: "+11234567891",
    country: "USA",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael@example.com",
    phoneNumber: "+11234567892",
    country: "USA",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily@example.com",
    phoneNumber: "+11234567893",
    country: "USA",
  },
  {
    id: "5",
    firstName: "Robert",
    lastName: "Wilson",
    email: "robert@example.com",
    phoneNumber: "+11234567894",
    country: "USA",

  },
]

export default function ContactPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<ContactMessage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleMarkAsRead = async (messageId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    toast({
      title: "Message marked as read",
      description: "The message has been marked as read.",
    })
  }

  const handleReply = (messageId: string) => {
    // In a real app, this would open a reply form or email client
    window.open(`mailto:${viewMessage?.email}?subject=Re: ${viewMessage?.firstName}`, "_blank")
  }

  const handleDeleteMessage = async () => {
    if (!deleteMessage) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Message deleted",
      description: "The message has been deleted successfully.",
    })

    setIsDeleting(false)
    setDeleteMessage(null)
  }

  const columns: ColumnDef<ContactMessage>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => <div className="font-medium">{row.original.firstName}</div>,
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      cell: ({ row }) => <div className="font-medium">{row.original.lastName}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "country",
      header: "Country",
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

      <DataTable columns={columns} data={contactMessages} searchKey="email" searchPlaceholder="Search email" />

      {/* View Message Dialog */}
      <ViewDialog
        open={!!viewMessage}
        onOpenChange={(open) => {
          if (!open) {
            setViewMessage(null)
          } else if (viewMessage) {
            handleMarkAsRead(viewMessage.id)
          }
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

            <div className="flex justify-end">
              <Button onClick={() => handleReply(viewMessage.id)} className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
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
