"use client"

import { useState } from "react"
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

// Sample data for obituary users
type ObituaryUser = {
  id: string
  name: string
  email: string
  phone: string
  registeredDate: string
  lastActive: string
  packagesPurchased: number
  status: "active" | "inactive"
  avatar?: string
}

const obituaryUsers: ObituaryUser[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    registeredDate: "2023-01-15",
    lastActive: "2023-05-15",
    packagesPurchased: 2,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 234-5678",
    registeredDate: "2023-02-20",
    lastActive: "2023-05-14",
    packagesPurchased: 1,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 345-6789",
    registeredDate: "2023-03-10",
    lastActive: "2023-05-10",
    packagesPurchased: 3,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 456-7890",
    registeredDate: "2023-04-05",
    lastActive: "2023-04-25",
    packagesPurchased: 1,
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert@example.com",
    phone: "+1 (555) 567-8901",
    registeredDate: "2023-05-01",
    lastActive: "2023-05-12",
    packagesPurchased: 2,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Sample data for user packages
type UserPackage = {
  id: string
  packageName: string
  purchaseDate: string
  price: number
  status: "active" | "expired" | "cancelled"
}

export default function ObituaryUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewUser, setViewUser] = useState<ObituaryUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<ObituaryUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEditUser = (userId: string) => {
    router.push(`/obituary/users/edit/${userId}`)
  }

  const handleDeleteUser = async () => {
    if (!deleteUser) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "User deleted",
      description: `${deleteUser.name} has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeleteUser(null)
  }

  // Sample user packages for the view dialog
  const userPackages: Record<string, UserPackage[]> = {
    "1": [
      {
        id: "p1",
        packageName: "Premium",
        purchaseDate: "2023-02-15",
        price: 299,
        status: "active",
      },
      {
        id: "p2",
        packageName: "Standard",
        purchaseDate: "2023-04-10",
        price: 199,
        status: "active",
      },
    ],
    "2": [
      {
        id: "p3",
        packageName: "Basic",
        purchaseDate: "2023-03-05",
        price: 99,
        status: "active",
      },
    ],
    "3": [
      {
        id: "p4",
        packageName: "Premium",
        purchaseDate: "2023-03-15",
        price: 299,
        status: "active",
      },
      {
        id: "p5",
        packageName: "Memorial Plus",
        purchaseDate: "2023-04-20",
        price: 399,
        status: "active",
      },
      {
        id: "p6",
        packageName: "Standard",
        purchaseDate: "2023-01-10",
        price: 199,
        status: "expired",
      },
    ],
    "4": [
      {
        id: "p7",
        packageName: "Basic",
        purchaseDate: "2023-04-10",
        price: 99,
        status: "cancelled",
      },
    ],
    "5": [
      {
        id: "p8",
        packageName: "Standard",
        purchaseDate: "2023-05-05",
        price: 199,
        status: "active",
      },
      {
        id: "p9",
        packageName: "Basic",
        purchaseDate: "2023-02-20",
        price: 99,
        status: "expired",
      },
    ],
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
      accessorKey: "packagesPurchased",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Packages" type="number" />,
      cell: ({ row }) => <div>{row.original.packagesPurchased}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Status" type="status" />
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
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

      <DataTable columns={columns} data={obituaryUsers} searchKey="name" searchPlaceholder="Search users..." />

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
                        Purchase Date
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
                    {userPackages[viewUser.id]?.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{pkg.packageName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{pkg.purchaseDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">${pkg.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge
                            variant={
                              pkg.status === "active"
                                ? "default"
                                : pkg.status === "expired"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {pkg.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
