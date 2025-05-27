"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2, Shield, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

// Sample data for admin users based on the provided model
type AdminUser = {
  id: string
  username: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isDeleted: boolean
  phone?: string
  createdAt: string
  updatedAt: string
}

const adminUsers: AdminUser[] = [
  {
    id: "1",
    username: "johnsmith",
    email: "john@prapancham.com",
    isAdmin: true,
    isSuperAdmin: true,
    isDeleted: false,
    phone: "+1 (555) 123-4567",
    createdAt: "2023-05-15T09:30:45Z",
    updatedAt: "2023-05-15T09:30:45Z",
  },
  {
    id: "2",
    username: "sarahjohnson",
    email: "sarah@prapancham.com",
    isAdmin: true,
    isSuperAdmin: false,
    isDeleted: false,
    phone: "+1 (555) 234-5678",
    createdAt: "2023-05-14T14:22:10Z",
    updatedAt: "2023-05-14T14:22:10Z",
  },
  {
    id: "3",
    username: "michaelbrown",
    email: "michael@prapancham.com",
    isAdmin: true,
    isSuperAdmin: false,
    isDeleted: false,
    phone: "+1 (555) 345-6789",
    createdAt: "2023-05-13T11:15:32Z",
    updatedAt: "2023-05-13T11:15:32Z",
  },
  {
    id: "4",
    username: "emilydavis",
    email: "emily@prapancham.com",
    isAdmin: true,
    isSuperAdmin: false,
    isDeleted: true,
    phone: "+1 (555) 456-7890",
    createdAt: "2023-05-12T16:45:20Z",
    updatedAt: "2023-05-12T16:45:20Z",
  },
  {
    id: "5",
    username: "robertwilson",
    email: "robert@prapancham.com",
    isAdmin: true,
    isSuperAdmin: true,
    isDeleted: false,
    phone: "+1 (555) 567-8901",
    createdAt: "2023-05-11T08:10:15Z",
    updatedAt: "2023-05-11T08:10:15Z",
  },
]

export default function AdminsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [viewAdmin, setViewAdmin] = useState<AdminUser | null>(null)
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddAdmin = () => {
    router.push("/admins/new")
  }

  const handleEditAdmin = (adminId: string) => {
    router.push(`/admins/edit/${adminId}`)
  }

  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Admin deleted",
      description: `${deleteAdmin.username} has been removed from admin users.`,
    })

    setIsDeleting(false)
    setDeleteAdmin(null)
  }

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Username" type="text" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{row.original.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.username}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      accessorFn: (row) => (row.isSuperAdmin ? "Super Admin" : row.isAdmin ? "Admin" : "User"),
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Role" type="text" />
          <DataTableFacetedFilter
            column={column}
            title="Role"
            options={[
              { label: "Super Admin", value: "Super Admin" },
              { label: "Admin", value: "Admin" },
              { label: "User", value: "User" },
            ]}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isSuperAdmin ? (
            <>
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span>Super Admin</span>
            </>
          ) : row.original.isAdmin ? (
            <>
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Admin</span>
            </>
          ) : (
            <span>User</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span>{row.original.phone || "—"}</span>,
    },
    {
      accessorKey: "status",
      accessorFn: (row) => (row.isDeleted ? "Deleted" : "Active"),
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Status" type="status" />
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "Active" },
              { label: "Deleted", value: "Deleted" },
            ]}
          />
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
          {row.original.isDeleted ? "Deleted" : "Active"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewAdmin(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditAdmin(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteAdmin(row.original)}
            disabled={row.original.isSuperAdmin}
          >
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
        title="Admin Management"
        description="Manage admin users and their permissions"
        action={{
          label: "Add Admin",
          onClick: handleAddAdmin,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable columns={columns} data={adminUsers} searchKey="username" searchPlaceholder="Search admins..." />

      {/* View Admin Dialog */}
      <ViewDialog open={!!viewAdmin} onOpenChange={(open) => !open && setViewAdmin(null)} title="Admin Details">
        {viewAdmin && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{viewAdmin.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{viewAdmin.username}</h2>
                <p className="text-muted-foreground">{viewAdmin.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Role</h3>
                <div className="flex items-center gap-2 mt-1">
                  {viewAdmin.isSuperAdmin ? (
                    <>
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      <span>Super Admin</span>
                    </>
                  ) : viewAdmin.isAdmin ? (
                    <>
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <span>User</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewAdmin.isDeleted ? "destructive" : "default"} className="mt-1">
                  {viewAdmin.isDeleted ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
              <p>{viewAdmin.phone || "—"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                <p>{formatDate(viewAdmin.createdAt)}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                <p>{formatDate(viewAdmin.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAdmin}
        onOpenChange={(open) => !open && setDeleteAdmin(null)}
        title="Delete Admin"
        description={`Are you sure you want to remove ${deleteAdmin?.username} from admin users? This action cannot be undone.`}
        onConfirm={handleDeleteAdmin}
        loading={isDeleting}
      />
    </div>
  )
}
