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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for admin users
type AdminUser = {
  id: string
  name: string
  email: string
  role: "admin" | "super_admin"
  permissions: string[]
  lastLogin: string
  status: "active" | "inactive"
  avatar?: string
}

const adminUsers: AdminUser[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@prapancham.com",
    role: "super_admin",
    permissions: ["all"],
    lastLogin: "2023-05-15 09:30:45",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@prapancham.com",
    role: "admin",
    permissions: ["dashboard", "obituary", "news", "events"],
    lastLogin: "2023-05-14 14:22:10",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@prapancham.com",
    role: "admin",
    permissions: ["dashboard", "news", "events", "contact"],
    lastLogin: "2023-05-13 11:15:32",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@prapancham.com",
    role: "admin",
    permissions: ["dashboard", "obituary", "tribute"],
    lastLogin: "2023-05-12 16:45:20",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@prapancham.com",
    role: "super_admin",
    permissions: ["all"],
    lastLogin: "2023-05-11 08:10:15",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
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
      description: `${deleteAdmin.name} has been removed from admin users.`,
    })

    setIsDeleting(false)
    setDeleteAdmin(null)
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar || "/placeholder.svg"} alt={row.original.name} />
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.role === "super_admin" ? (
            <ShieldAlert className="h-4 w-4 text-red-500" />
          ) : (
            <Shield className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize">{row.original.role.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
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
            disabled={row.original.role === "super_admin"}
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

      <DataTable columns={columns} data={adminUsers} searchKey="name" searchPlaceholder="Search admins..." />

      {/* View Admin Dialog */}
      <ViewDialog open={!!viewAdmin} onOpenChange={(open) => !open && setViewAdmin(null)} title="Admin Details">
        {viewAdmin && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewAdmin.avatar || "/placeholder.svg"} alt={viewAdmin.name} />
                <AvatarFallback>{viewAdmin.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{viewAdmin.name}</h2>
                <p className="text-muted-foreground">{viewAdmin.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Role</h3>
                <div className="flex items-center gap-2 mt-1">
                  {viewAdmin.role === "super_admin" ? (
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  ) : (
                    <Shield className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="capitalize">{viewAdmin.role.replace("_", " ")}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewAdmin.status === "active" ? "default" : "secondary"} className="mt-1">
                  {viewAdmin.status}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Last Login</h3>
              <p>{viewAdmin.lastLogin}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Permissions</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {viewAdmin.permissions.includes("all") ? (
                  <Badge variant="outline" className="bg-red-50">
                    All Permissions
                  </Badge>
                ) : (
                  viewAdmin.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                    </Badge>
                  ))
                )}
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
        description={`Are you sure you want to remove ${deleteAdmin?.name} from admin users? This action cannot be undone.`}
        onConfirm={handleDeleteAdmin}
        loading={isDeleting}
      />
    </div>
  )
}
