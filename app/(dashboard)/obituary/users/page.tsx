"use client"

import { useState, useEffect } from "react"
import { Eye, Pencil, Trash2 } from "lucide-react"
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
import { useLanguage } from "@/contexts/language-context"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

// API response types
type Order = {
  _id: string
  selectedPackage: {
    name: {
      en: Array<{
        name: string
        value: string
        _id: string
      }>
    }
  }
  createdAt: string
  finalPriceInCAD: {
    price: number
    currencyCode: string
  }
  orderStatus: string
}

type User = {
  _id: string
  username: string
  email: string
  password: string
  isDeleted: boolean
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  __v: number
  address?: string
  country?: string
  phone?: string
  orders: Order[]
}

type UsersResponse = {
  user: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

// Component types
type ObituaryUser = {
  id: string
  name: string
  email: string
  phone: string
  registeredDate: string
  lastActive: string
  status: "active" | "inactive"
  avatar?: string
  orders: Order[]
}

export default function ObituaryUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [users, setUsers] = useState<ObituaryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewUser, setViewUser] = useState<ObituaryUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<ObituaryUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [pageSize, setPageSize] = useState(10)

  // Fetch users from API
  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setLoading(true)
      setError(null)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/user/all?page=${page}&limit=${limit}`, {
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      const data: UsersResponse = await response.json()
      
      // Transform API data to component format
      const transformedUsers: ObituaryUser[] = data.user.map((user: User) => ({
        id: user._id,
        name: user.username,
        email: user.email,
        phone: user.phone || 'N/A',
        registeredDate: new Date(user.createdAt).toLocaleDateString(),
        lastActive: new Date(user.updatedAt).toLocaleDateString(),
        status: user.isActive ? 'active' : 'inactive',
        avatar: user.image,
        orders: user.orders || []
      }))

      setUsers(transformedUsers)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(pagination.currentPage, pageSize)
  }, [])

  const handlePageChange = (page: number) => {
    fetchUsers(page, pageSize)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    fetchUsers(1, newPageSize) // Reset to first page when changing page size
  }

  const handleEditUser = (userId: string) => {
    router.push(`/obituary/users/edit/${userId}`)
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return

    setIsDeleting(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/user/${deleteUser.id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast({
        title: "User deleted",
        description: `${deleteUser.name} has been deleted successfully.`,
      })

      // Refresh the users list
      fetchUsers(pagination.currentPage, pageSize)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
      console.error('Error deleting user:', err)
    } finally {
      setIsDeleting(false)
      setDeleteUser(null)
    }
  }

  const columns: ColumnDef<ObituaryUser>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
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
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "registeredDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered Date" type="date" />,
    },
    {
      accessorKey: "packages",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Packages" type="number" />,
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium">{row.original.orders?.length || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Status" type="status" />
          {/* <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          /> */}
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewUser(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          {/* <Button variant="ghost" size="icon" onClick={() => handleEditUser(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button> */}
          <Button variant="ghost" size="icon" onClick={() => setDeleteUser(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t("users")} description="Manage users who have purchased obituary packages" />

      {loading && <div className="text-center py-8">Loading users...</div>}
      
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>Error: {error}</p>
          <Button onClick={() => fetchUsers(pagination.currentPage, pageSize)} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <DataTable 
          columns={columns} 
          data={users} 
          searchKey="name" 
          searchPlaceholder="Search users..."
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSize={pageSize}
        />
      )}

      {/* View User Dialog */}
      <ViewDialog
        open={!!viewUser}
        onOpenChange={(open) => !open && setViewUser(null)}
        title={viewUser?.name || "User Details"}
      >
        {viewUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={viewUser.avatar || "/placeholder.svg"} alt={viewUser.name} />
                <AvatarFallback>{viewUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{viewUser.name}</h2>
                <p className="text-muted-foreground">{viewUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                <p>{viewUser.phone}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewUser.status === "active" ? "default" : "secondary"}>{viewUser.status}</Badge>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Registered Date</h3>
                <p>{viewUser.registeredDate}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Last Active</h3>
                <p>{viewUser.lastActive}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-base mb-2">Purchased Packages</h3>
              {viewUser.orders && viewUser.orders.length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Package
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Purchased Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-gray-200">
                      {viewUser.orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {order.selectedPackage?.name?.en?.[0]?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {order.finalPriceInCAD?.price?.toFixed(2) || '0.00'} {order.finalPriceInCAD?.currencyCode || 'CAD'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              variant={
                                order.orderStatus === "Complete"
                                  ? "default"
                                  : order.orderStatus === "Review Requested"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {order.orderStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground py-4">This user has not purchased any packages.</p>
              )}
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteUser?.name}? This action cannot be undone and will remove all associated data.`}
        onConfirm={handleDeleteUser}
        loading={isDeleting}
      />
    </div>
  )
}
