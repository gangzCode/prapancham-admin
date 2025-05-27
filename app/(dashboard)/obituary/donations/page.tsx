"use client"

import { useState } from "react"
import { Eye, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

// Sample data for donations
type Donation = {
  id: string
  obituaryId: string
  obituaryName: string
  donorName: string
  donorEmail: string
  amount: number
  amountToFamily: number
  date: string
  status: "processed" | "pending" | "failed"
  message?: string
}

const donations: Donation[] = [
  {
    id: "1",
    obituaryId: "obit-1",
    obituaryName: "James Wilson",
    donorName: "John Smith",
    donorEmail: "john@example.com",
    amount: 100,
    amountToFamily: 85,
    date: "2023-05-15",
    status: "processed",
    message: "Our deepest condolences to the family.",
  },
  {
    id: "2",
    obituaryId: "obit-1",
    obituaryName: "James Wilson",
    donorName: "Sarah Johnson",
    donorEmail: "sarah@example.com",
    amount: 50,
    amountToFamily: 42.5,
    date: "2023-05-14",
    status: "processed",
    message: "Thinking of you during this difficult time.",
  },
  {
    id: "3",
    obituaryId: "obit-2",
    obituaryName: "Mary Johnson",
    donorName: "Michael Brown",
    donorEmail: "michael@example.com",
    amount: 200,
    amountToFamily: 170,
    date: "2023-05-13",
    status: "processed",
    message: "May you find comfort in loving memories.",
  },
  {
    id: "4",
    obituaryId: "obit-3",
    obituaryName: "David Brown",
    donorName: "Emily Davis",
    donorEmail: "emily@example.com",
    amount: 75,
    amountToFamily: 63.75,
    date: "2023-05-12",
    status: "pending",
  },
  {
    id: "5",
    obituaryId: "obit-4",
    obituaryName: "Sarah Miller",
    donorName: "Robert Wilson",
    donorEmail: "robert@example.com",
    amount: 150,
    amountToFamily: 127.5,
    date: "2023-05-11",
    status: "processed",
    message: "With heartfelt sympathy.",
  },
  {
    id: "6",
    obituaryId: "obit-5",
    obituaryName: "Thomas Davis",
    donorName: "Jennifer Lee",
    donorEmail: "jennifer@example.com",
    amount: 25,
    amountToFamily: 21.25,
    date: "2023-05-10",
    status: "failed",
  },
]

export default function ObituaryDonationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewDonation, setViewDonation] = useState<Donation | null>(null)
  const [editDonation, setEditDonation] = useState<Donation | null>(null)
  const [amountToFamily, setAmountToFamily] = useState<number>(0)

  const handleEditDonation = (donation: Donation) => {
    setEditDonation(donation)
    setAmountToFamily(donation.amountToFamily)
  }

  const handleSaveEdit = async () => {
    if (!editDonation) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Donation updated",
      description: `Amount to family has been updated successfully.`,
    })

    setEditDonation(null)
  }

  const uniqueObituaries = Array.from(new Set(donations.map((donation) => donation.obituaryName))).map((name) => ({
    label: name,
    value: name,
  }))

  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: "obituaryName",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Obituary" type="text" />
          <DataTableFacetedFilter column={column} title="Obituary" options={uniqueObituaries} />
        </div>
      ),
    },
    {
      accessorKey: "donorName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Donor" type="text" />,
      cell: ({ row }) => (
        <div>
          <div>{row.original.donorName}</div>
          <div className="text-xs text-muted-foreground">{row.original.donorEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" type="number" />,
      cell: ({ row }) => <div>${row.original.amount.toFixed(2)}</div>,
    },
    {
      accessorKey: "amountToFamily",
      header: ({ column }) => <DataTableColumnHeader column={column} title="To Family" type="number" />,
      cell: ({ row }) => <div>${row.original.amountToFamily.toFixed(2)}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" type="date" />,
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
              { label: "Processed", value: "processed" },
              { label: "Pending", value: "pending" },
              { label: "Failed", value: "failed" },
            ]}
          />
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status
        let variant: "default" | "secondary" | "destructive" = "default"

        switch (status) {
          case "processed":
            variant = "default"
            break
          case "pending":
            variant = "secondary"
            break
          case "failed":
            variant = "destructive"
            break
        }

        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewDonation(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditDonation(row.original)}
            disabled={row.original.status !== "processed"}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t("donations")} description="Manage donations made for obituary posts" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donations.reduce((sum, donation) => sum + donation.amount, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Amount to Families</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donations.reduce((sum, donation) => sum + donation.amountToFamily, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Company Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                donations.reduce((sum, donation) => sum + donation.amount, 0) -
                donations.reduce((sum, donation) => sum + donation.amountToFamily, 0)
              ).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable columns={columns} data={donations} searchKey="obituaryName" searchPlaceholder="Search donations..." />

      {/* View Donation Dialog */}
      <ViewDialog
        open={!!viewDonation}
        onOpenChange={(open) => !open && setViewDonation(null)}
        title="Donation Details"
      >
        {viewDonation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Obituary</h3>
                <p>{viewDonation.obituaryName}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
                <p>{viewDonation.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Donor</h3>
                <p>{viewDonation.donorName}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p>{viewDonation.donorEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Amount</h3>
                <p className="text-lg font-semibold">${viewDonation.amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Amount to Family</h3>
                <p className="text-lg font-semibold">${viewDonation.amountToFamily.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <Badge
                variant={
                  viewDonation.status === "processed"
                    ? "default"
                    : viewDonation.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {viewDonation.status}
              </Badge>
            </div>

            {viewDonation.message && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Message</h3>
                <p className="mt-1 p-3 bg-muted rounded-md">{viewDonation.message}</p>
              </div>
            )}
          </div>
        )}
      </ViewDialog>

      {/* Edit Donation Dialog */}
      <ViewDialog open={!!editDonation} onOpenChange={(open) => !open && setEditDonation(null)} title="Edit Donation">
        {editDonation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Obituary</h3>
                <p>{editDonation.obituaryName}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Donor</h3>
                <p>{editDonation.donorName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Total Amount</h3>
                <p className="text-lg font-semibold">${editDonation.amount.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Current Amount to Family</h3>
                <p>${editDonation.amountToFamily.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountToFamily">New Amount to Family</Label>
              <Input
                id="amountToFamily"
                type="number"
                step="0.01"
                min="0"
                max={editDonation.amount}
                value={amountToFamily}
                onChange={(e) => setAmountToFamily(Number.parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Company fee: ${(editDonation.amount - amountToFamily).toFixed(2)} (
                {Math.round(((editDonation.amount - amountToFamily) / editDonation.amount) * 100)}%)
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </ViewDialog>
    </div>
  )
}
