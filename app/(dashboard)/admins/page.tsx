"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Shield, ShieldAlert, Loader2 } from "lucide-react"
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

// Types for API response
type AdminUser = {
  _id: string
  username: string
  email: string
  password: string
  isAdmin: boolean
  isSuperAdmin: boolean
  isDeleted: boolean
  phone: string
  adminAccessPages: string[]
  createdAt: string
  updatedAt: string
  __v: number
}

type ApiResponse = {
  adminUsers: AdminUser[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export default function AdminsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // State management
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  
  // Dialog states
  const [viewAdmin, setViewAdmin] = useState<AdminUser | null>(null)
  const [deleteAdmin, setDeleteAdmin] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch admin users from API
  const fetchAdminUsers = async () => {
    try {
      setLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin-user/all?page=${page}&limit=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin users')
      }
      
      const data: ApiResponse = await response.json()
      setAdminUsers(data.adminUsers)
      setPagination(data.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      })
      console.error("Error fetching admin users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminUsers()
  }, [page, pageSize])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  const handleAddAdmin = () => {
    router.push("/admins/new")
  }

  const handleEditAdmin = (adminId: string) => {
    router.push(`/admins/edit/${adminId}`)
  }

  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return

    // Prevent deletion of Super Admins
    if (deleteAdmin.isSuperAdmin) {
      toast({
        title: "Cannot delete Super Admin",
        description: "Super Admins cannot be deleted for security reasons.",
        variant: "destructive",
      })
      setDeleteAdmin(null)
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin-user/${deleteAdmin._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to delete admin user')
      }
      
      toast({
        title: "Admin deleted",
        description: `${deleteAdmin.username} has been removed from admin users.`,
      })
      
      // Refresh the data
      await fetchAdminUsers()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete admin user",
        variant: "destructive",
      })
      console.error("Error deleting admin user:", error)
    } finally {
      setIsDeleting(false)
      setDeleteAdmin(null)
    }
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
          <Button variant="ghost" size="icon" onClick={() => handleEditAdmin(row.original._id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteAdmin(row.original)}
            disabled={row.original.isSuperAdmin}
            title={row.original.isSuperAdmin ? "Super Admins cannot be deleted" : "Delete admin"}
          >
            <Trash2 className={`h-4 w-4 ${row.original.isSuperAdmin ? 'text-muted-foreground' : ''}`} />
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

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading admin users...</span>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={adminUsers} 
          searchKey="username" 
          searchPlaceholder="Search admins..."
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

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

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Access Pages</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {viewAdmin.isSuperAdmin ? (
                  <Badge variant="default">
                    All Pages (Super Admin)
                  </Badge>
                ) : viewAdmin.adminAccessPages.length > 0 ? (
                  viewAdmin.adminAccessPages.map((page, index) => (
                    <Badge key={index} variant="outline">
                      {page}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No access pages assigned</span>
                )}
              </div>
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

      {/* Delete Confirmation Dialog - Only for regular admins */}
      {deleteAdmin && !deleteAdmin.isSuperAdmin && (
        <ConfirmDialog
          open={!!deleteAdmin}
          onOpenChange={(open) => !open && setDeleteAdmin(null)}
          title="Delete Admin"
          description={`Are you sure you want to remove ${deleteAdmin?.username} from admin users? This action cannot be undone.`}
          onConfirm={handleDeleteAdmin}
          loading={isDeleting}
        />
      )}
    </div>
  )
}
