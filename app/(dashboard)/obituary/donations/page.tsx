"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Edit3, Trash2, Loader2, Truck } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { RowExpandableDataTable } from "@/components/row-expandable-data-table"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import Image from "next/image"

// Types for the API response
type Order = {
  _id: string
  information: {
    title?: string
    firstName?: string
    lastName?: string
    preferredName?: string
    address: string
    dateofBirth: string
    dateofDeath: string
    description: string
    tributeVideo?: string
    shortDescription: string
  }
  basePackagePrice: {
    country: string
    price: number
  }
  finalPrice: {
    country: {
      _id: string
      currencyCode: string
    }
    price: number
  }
  finalPriceInCAD: {
    price: number
    currencyCode: string
  }
  accountDetails: {
    bankName: string
    branchName: string
    accountNumber: number
    accountHolderName: string
  }
  donationRecieved: {
    price: number
    currencyCode: string
  }
  donationGivenBack: {
    price: number
    currencyCode: string
  }
  username: string
  primaryImage: string
  thumbnailImage: string
  selectedAddons: any[]
  additionalImages: string[]
  slideshowImages: string[]
  isDeleted: boolean
  orderStatus: string
  tributeItems: any[]
  expiryDate: string
  recievedDonations: Array<{
    _id: string
    finalPrice: {
      country: string
      price: number
    }
    finalPriceInCAD: {
      price: number
      currencyCode: string
    }
    isDeleted: boolean
    email: string
    name: string
    address: string
    phoneNumber: string
    adminDonationStatus: string
    order: string
    createdAt: string
    updatedAt: string
  }>
  userDonationStatus: string
  contactDetails: any[]
  createdAt: string
  updatedAt: string
}

type ApiResponse = {
  orders: Order[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
  }
}

export default function ObituaryDonationsPage() {
  const { toast } = useToast()
  const { t } = useLanguage()
  
  // Helper function to get display title with priority logic
  const getDisplayTitle = (information: Order['information']) => {
    // Priority 1: Use title if available
    if (information.title && information.title.trim()) {
      return information.title
    }
    
    // Priority 2: Use firstName + lastName if both are available
    if (information.firstName && information.firstName.trim() && 
        information.lastName && information.lastName.trim()) {
      return `${information.firstName} ${information.lastName}`
    }
    
    // Priority 3: Use preferredName as fallback
    return information.preferredName || 'Unknown'
  }
  
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [donationsSummary, setDonationsSummary] = useState({
    totalDonationReceived: 0,
    totalDonationGivenBack: 0,
    netDonation: 0
  })

  // Donation management state
  const [selectedDonation, setSelectedDonation] = useState<any>(null)
  const [newDonationStatus, setNewDonationStatus] = useState<string>("")
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isDeletingDonation, setIsDeletingDonation] = useState(false)

  // Tribute management state
  const [selectedTribute, setSelectedTribute] = useState<any>(null)
  const [newTributeStatus, setNewTributeStatus] = useState<string>("")
  const [tributeStatusDialogOpen, setTributeStatusDialogOpen] = useState(false)
  const [tributeDeleteDialogOpen, setTributeDeleteDialogOpen] = useState(false)
  const [isUpdatingTributeStatus, setIsUpdatingTributeStatus] = useState(false)
  const [isDeletingTribute, setIsDeletingTribute] = useState(false)

  // Donation given back management state
  const [selectedOrderForDonationUpdate, setSelectedOrderForDonationUpdate] = useState<any>(null)
  const [newDonationGivenBackAmount, setNewDonationGivenBackAmount] = useState<string>("")
  const [donationGivenBackDialogOpen, setDonationGivenBackDialogOpen] = useState(false)
  const [isUpdatingDonationGivenBack, setIsUpdatingDonationGivenBack] = useState(false)

  // Flower delivery status management state
  const [selectedFlowerTribute, setSelectedFlowerTribute] = useState<any>(null)
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>("")
  const [deliveryStatusDialogOpen, setDeliveryStatusDialogOpen] = useState(false)
  const [isUpdatingDeliveryStatus, setIsUpdatingDeliveryStatus] = useState(false)

  // Valid donation statuses
  const donationStatusOptions = [
    { label: "Donation Recieved", value: "Donation Recieved" },
    { label: "Donation Refunded", value: "Donation Refunded" },
  ]

  // Valid tribute statuses
  const tributeStatusOptions = [
    { label: "Review Requested", value: "Review Requested" },
    { label: "Tribute Approved", value: "Tribute Approved" },
    { label: "Approval Denied", value: "Approval Denied" },
    { label: "Expired", value: "Expired" },
  ]

  // Valid delivery statuses for flowers
  const deliveryStatusOptions = [
    { label: "Payment Needs To Be Done", value: "Payment Needs To Be Done" },
    { label: "Needs To Be Delivered", value: "Needs To Be Delivered" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ]

  // Order status options
  const orderStatusOptions = [
    { label: "Review Requested", value: "Review Requested" },
    { label: "Post Approved", value: "Post Approved" },
    { label: "Approval Denied", value: "Approval Denied" },
    { label: "Requested for Changes", value: "Requested for Changes" },
    { label: "Expired", value: "Expired" },
    { label: "Refunded", value: "Refunded" },
  ]

  // Fetch data from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/all?page=${page}&limit=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const data: ApiResponse = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch donation data",
        variant: "destructive",
      })
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch donations summary from API
  const fetchDonationsSummary = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/donation/donations-summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch donations summary')
      }
      
      const data = await response.json()
      setDonationsSummary(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch donations summary",
        variant: "destructive",
      })
      console.error("Error fetching donations summary:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, pageSize])

  // Fetch summary on component mount
  useEffect(() => {
    fetchDonationsSummary()
  }, [])

  // Update donation status
  const updateDonationStatus = async () => {
    if (!selectedDonation || !newDonationStatus) return

    setIsUpdatingStatus(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/donation/${selectedDonation._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newStatus: newDonationStatus
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to update donation status')
      }
      
      toast({
        title: "Success",
        description: `Donation status updated to "${newDonationStatus}".`,
      })
      
      // Refresh data
      await fetchOrders()
      await fetchDonationsSummary()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update donation status",
        variant: "destructive",
      })
      console.error("Error updating donation status:", error)
    } finally {
      setIsUpdatingStatus(false)
      setStatusDialogOpen(false)
      setSelectedDonation(null)
      setNewDonationStatus("")
    }
  }

  // Delete donation
  const deleteDonation = async () => {
    if (!selectedDonation) return

    setIsDeletingDonation(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/donation/${selectedDonation._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to delete donation')
      }

    toast({
        title: "Success",
        description: "Donation deleted successfully.",
      })
      
      // Refresh data
      await fetchOrders()
      await fetchDonationsSummary()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete donation",
        variant: "destructive",
      })
      console.error("Error deleting donation:", error)
    } finally {
      setIsDeletingDonation(false)
      setDeleteDialogOpen(false)
      setSelectedDonation(null)
    }
  }

  // Handle donation status change
  const handleStatusChange = (donation: any) => {
    setSelectedDonation(donation)
    setNewDonationStatus(donation.adminDonationStatus)
    setStatusDialogOpen(true)
  }

  // Handle donation delete
  const handleDeleteDonation = (donation: any) => {
    setSelectedDonation(donation)
    setDeleteDialogOpen(true)
  }

  // Update tribute status
  const updateTributeStatus = async () => {
    if (!selectedTribute || !newTributeStatus) return

    setIsUpdatingTributeStatus(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/tribute/${selectedTribute._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tributeStatus: newTributeStatus
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to update tribute status')
      }
      
      toast({
        title: "Success",
        description: `Tribute status updated to "${newTributeStatus}".`,
      })
      
      // Refresh data
      await fetchOrders()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tribute status",
        variant: "destructive",
      })
      console.error("Error updating tribute status:", error)
    } finally {
      setIsUpdatingTributeStatus(false)
      setTributeStatusDialogOpen(false)
      setSelectedTribute(null)
      setNewTributeStatus("")
    }
  }

  // Delete tribute
  const deleteTribute = async () => {
    if (!selectedTribute) return

    setIsDeletingTribute(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/tribute/${selectedTribute._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to delete tribute')
      }

    toast({
        title: "Success",
        description: "Tribute deleted successfully.",
      })
      
      // Refresh data
      await fetchOrders()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tribute",
        variant: "destructive",
      })
      console.error("Error deleting tribute:", error)
    } finally {
      setIsDeletingTribute(false)
      setTributeDeleteDialogOpen(false)
      setSelectedTribute(null)
    }
  }

  // Handle tribute status change
  const handleTributeStatusChange = (tribute: any) => {
    setSelectedTribute(tribute)
    setNewTributeStatus(tribute.tributeStatus)
    setTributeStatusDialogOpen(true)
  }

  // Handle tribute delete
  const handleDeleteTribute = (tribute: any) => {
    setSelectedTribute(tribute)
    setTributeDeleteDialogOpen(true)
  }

  // Update flower delivery status
  const updateFlowerDeliveryStatus = async () => {
    if (!selectedFlowerTribute || !newDeliveryStatus) return

    setIsUpdatingDeliveryStatus(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/tribute/${selectedFlowerTribute._id}/flower-delivery-status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deliveryStatus: newDeliveryStatus
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to update flower delivery status')
      }
      
      toast({
        title: "Success",
        description: `Flower delivery status updated to "${newDeliveryStatus}".`,
      })
      
      // Refresh data
      await fetchOrders()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update flower delivery status",
        variant: "destructive",
      })
      console.error("Error updating flower delivery status:", error)
    } finally {
      setIsUpdatingDeliveryStatus(false)
      setDeliveryStatusDialogOpen(false)
      setSelectedFlowerTribute(null)
      setNewDeliveryStatus("")
    }
  }

  // Handle flower delivery status change
  const handleFlowerDeliveryStatusChange = (flowerTribute: any) => {
    setSelectedFlowerTribute(flowerTribute)
    setNewDeliveryStatus(flowerTribute.flower?.deliveryStatus || "")
    setDeliveryStatusDialogOpen(true)
  }

  // Update donation given back amount
  const updateDonationGivenBack = async () => {
    if (!selectedOrderForDonationUpdate || !newDonationGivenBackAmount) return

    setIsUpdatingDonationGivenBack(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/${selectedOrderForDonationUpdate._id}/donation-given-back`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price: parseFloat(newDonationGivenBackAmount)
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to update donation given back amount')
      }
      
      toast({
        title: "Success",
        description: `Donation given back amount updated to ${newDonationGivenBackAmount} ${selectedOrderForDonationUpdate.donationGivenBack.currencyCode}.`,
      })
      
      // Refresh data
      await fetchOrders()
      await fetchDonationsSummary()
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update donation given back amount",
        variant: "destructive",
      })
      console.error("Error updating donation given back amount:", error)
    } finally {
      setIsUpdatingDonationGivenBack(false)
      setDonationGivenBackDialogOpen(false)
      setSelectedOrderForDonationUpdate(null)
      setNewDonationGivenBackAmount("")
    }
  }

  // Handle donation given back edit
  const handleEditDonationGivenBack = (order: any) => {
    setSelectedOrderForDonationUpdate(order)
    setNewDonationGivenBackAmount(order.donationGivenBack?.price?.toString() || "")
    setDonationGivenBackDialogOpen(true)
  }

  const columns: ColumnDef<Order>[] = [
    {
      id: "obituary",
      accessorFn: (row) => getDisplayTitle(row.information),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Obituary" type="text" />,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 rounded overflow-hidden">
            <Image
              src={row.original.thumbnailImage || "/placeholder.jpg"}
              alt={getDisplayTitle(row.original.information)}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{getDisplayTitle(row.original.information)}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(row.original.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "donations",
      accessorFn: (row) => row.recievedDonations.length,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total donations received" type="number" />,
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{row.original.recievedDonations.length}</div>
          <div className="text-xs text-muted-foreground">donations</div>
        </div>
      ),
    },
    {
      id: "amountReceived",
      accessorFn: (row) => row.donationRecieved.price,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount Received" type="number" />,
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            {(row.original.donationRecieved.price || 0).toFixed(2)} {row.original.donationRecieved.currencyCode}
          </div>
        </div>
      ),
    },
    {
      id: "amountGivenBack",
      accessorFn: (row) => row.donationGivenBack.price,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount Given Back" type="number" />,
      cell: ({ row }) => (
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="font-medium">
              {row.original.donationGivenBack.price || 0} {row.original.donationGivenBack.currencyCode}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleEditDonationGivenBack(row.original)}
            >
              <Edit3 className="h-3 w-3" />
              <span className="sr-only">Edit donation given back amount</span>
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.orderStatus,
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableColumnHeader column={column} title="Status" type="status" />
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={orderStatusOptions}
          />
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.orderStatus
        let variant: "default" | "secondary" | "destructive" = "default"

        switch (status) {
          case "Post Approved":
            variant = "default"
            break
          case "Review Requested":
          case "Requested for Changes":
            variant = "secondary"
            break
          case "Approval Denied":
          case "Expired":
          case "Refunded":
            variant = "destructive"
            break
        }

        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row, table, ...context }: any) => {
        const toggleExpansion = (context as any).toggleExpansion
        const isExpanded = (context as any).isExpanded
        
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpansion}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="sr-only">Expand</span>
          </Button>
        )
      },
    },
  ]

  // Create the expanded content function
  const createExpandedContent = (order: Order) => (
    <div className="p-4">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="donations">
          <AccordionTrigger>Donations ({order.recievedDonations.length})</AccordionTrigger>
          <AccordionContent>
            {order.recievedDonations.length > 0 ? (
              <div className="space-y-4">
                {order.recievedDonations.map((donation, index) => (
                  <div key={donation._id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Donor Information */}
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Donor Information</h4>
                          <div className="space-y-1">
                            <p className="font-semibold">{donation.name}</p>
                            <p className="text-sm text-muted-foreground">{donation.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(donation.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Amount Information */}
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Amount</h4>
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-green-600">
                              {donation.finalPriceInCAD.price} {donation.finalPriceInCAD.currencyCode}
                            </p>
                            {donation.isDeleted && (
                              <Badge variant="destructive" className="text-xs">
                                Deleted
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Status Information */}
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                          <div className="space-y-2">
                            <Badge 
                              variant={donation.adminDonationStatus === "Donation Recieved" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {donation.adminDonationStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(donation)}
                          disabled={donation.isDeleted}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit Status
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDonation(donation)}
                          disabled={donation.isDeleted}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No donations received for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="messages">
          <AccordionTrigger>
            Messages ({order.tributeItems.filter(item => item.tributeOptions === 'message').length})
          </AccordionTrigger>
          <AccordionContent>
            {order.tributeItems.filter(item => item.tributeOptions === 'message').length > 0 ? (
              <div className="space-y-4">
                {order.tributeItems
                  .filter(item => item.tributeOptions === 'message')
                  .map((tribute, index) => (
                    <div key={tribute._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Sender Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sender Information</h4>
                            <div className="space-y-1">
                              <p className="font-semibold">{tribute.message.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tribute.message.relationship}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Country: {tribute.message.country}
                              </p>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
                            <div className="space-y-1">
                              <p className="text-sm rounded">
                                {tribute.message.message}
                              </p>
                              {tribute.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                            <div className="space-y-2">
                              <Badge 
                                variant={
                                  tribute.tributeStatus === "Tribute Approved" ? "default" :
                                  tribute.tributeStatus === "Review Requested" ? "secondary" :
                                  tribute.tributeStatus === "Approval Denied" ? "destructive" :
                                  "outline"
                                }
                                className="text-xs"
                              >
                                {tribute.tributeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTributeStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTribute(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tribute messages submitted for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="cards">
          <AccordionTrigger>
            Cards ({order.tributeItems.filter(item => item.tributeOptions === 'card').length})
          </AccordionTrigger>
          <AccordionContent>
            {order.tributeItems.filter(item => item.tributeOptions === 'card').length > 0 ? (
              <div className="space-y-4">
                {order.tributeItems
                  .filter(item => item.tributeOptions === 'card')
                  .map((tribute, index) => (
                    <div key={tribute._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Sender Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sender Information</h4>
                            <div className="space-y-1">
                              <p className="font-semibold">{tribute.card.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tribute.card.relationship}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Country: {tribute.card.country}
                              </p>
                            </div>
                          </div>

                          {/* Card Message */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
                            <div className="space-y-1">
                              <p className="text-sm rounded">
                                {tribute.card.message}
                              </p>
                              {tribute.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                            <div className="space-y-2">
                              <Badge 
                                variant={
                                  tribute.tributeStatus === "Tribute Approved" ? "default" :
                                  tribute.tributeStatus === "Review Requested" ? "secondary" :
                                  tribute.tributeStatus === "Approval Denied" ? "destructive" :
                                  "outline"
                                }
                                className="text-xs"
                              >
                                {tribute.tributeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTributeStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTribute(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tribute cards submitted for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="letters">
          <AccordionTrigger>
            Letters ({order.tributeItems.filter(item => item.tributeOptions === 'letter').length})
          </AccordionTrigger>
          <AccordionContent>
            {order.tributeItems.filter(item => item.tributeOptions === 'letter').length > 0 ? (
              <div className="space-y-4">
                {order.tributeItems
                  .filter(item => item.tributeOptions === 'letter')
                  .map((tribute, index) => (
                    <div key={tribute._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Sender Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sender Information</h4>
                            <div className="space-y-1">
                              <p className="font-semibold">{tribute.letter.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tribute.letter.relationship}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Country: {tribute.letter.country}
                              </p>
                            </div>
                          </div>

                          {/* Letter Message */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
                            <div className="space-y-1">
                              <p className="text-sm rounded">
                                {tribute.letter.message}
                              </p>
                              {tribute.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                            <div className="space-y-2">
                              <Badge 
                                variant={
                                  tribute.tributeStatus === "Tribute Approved" ? "default" :
                                  tribute.tributeStatus === "Review Requested" ? "secondary" :
                                  tribute.tributeStatus === "Approval Denied" ? "destructive" :
                                  "outline"
                                }
                                className="text-xs"
                              >
                                {tribute.tributeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTributeStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTribute(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tribute letters submitted for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="memories">
          <AccordionTrigger>
            Memories ({order.tributeItems.filter(item => item.tributeOptions === 'memory').length})
          </AccordionTrigger>
          <AccordionContent>
            {order.tributeItems.filter(item => item.tributeOptions === 'memory').length > 0 ? (
              <div className="space-y-4">
                {order.tributeItems
                  .filter(item => item.tributeOptions === 'memory')
                  .map((tribute, index) => (
                    <div key={tribute._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Sender Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sender Information</h4>
                            <div className="space-y-1">
                              <p className="font-semibold">{tribute.memory.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tribute.memory.relationship}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Country: {tribute.memory.country}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Email: {tribute.memory.email}
                              </p>
                            </div>
                          </div>

                          {/* Memory Image */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Memory Image</h4>
                            <div className="space-y-1">
                              {tribute.memory.images ? (
                                <div className="relative h-20 w-20 rounded overflow-hidden border">
                                  <Image
                                    src={tribute.memory.images}
                                    alt="Memory"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">No Image</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Memory Message */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
                            <div className="space-y-1">
                              <p className="text-sm rounded">
                                {tribute.memory.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Price: {tribute.memory.finalPriceInCAD.price} {tribute.memory.finalPriceInCAD.currencyCode}
                              </p>
                              {tribute.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                            <div className="space-y-2">
                              <Badge 
                                variant={
                                  tribute.tributeStatus === "Tribute Approved" ? "default" :
                                  tribute.tributeStatus === "Review Requested" ? "secondary" :
                                  tribute.tributeStatus === "Approval Denied" ? "destructive" :
                                  "outline"
                                }
                                className="text-xs"
                              >
                                {tribute.tributeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTributeStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTribute(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No memory tributes submitted for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="flowers">
          <AccordionTrigger>
            Flowers ({order.tributeItems.filter(item => item.tributeOptions === 'flower').length})
          </AccordionTrigger>
          <AccordionContent>
            {order.tributeItems.filter(item => item.tributeOptions === 'flower').length > 0 ? (
              <div className="space-y-4">
                {order.tributeItems
                  .filter(item => item.tributeOptions === 'flower')
                  .map((tribute, index) => (
                    <div key={tribute._id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Sender Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sender Information</h4>
                            <div className="space-y-1">
                              <p className="font-semibold">{tribute.flower.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tribute.flower.relationship}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Country: {tribute.flower.country}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Email: {tribute.flower.email}
                              </p>
                            </div>
                          </div>

                          {/* Flower Details */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Flower Details</h4>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Price: {tribute.flower.finalPriceInCAD.price} {tribute.flower.finalPriceInCAD.currencyCode}
                              </p>
                              <Badge 
                                variant={
                                  tribute.flower.deliveryStatus === "Payment Needs To Be Done" ? "destructive" :
                                  tribute.flower.deliveryStatus === "Delivered" ? "default" :
                                  tribute.flower.deliveryStatus === "Needs To Be Delivered" ? "secondary" :
                                  tribute.flower.deliveryStatus === "Cancelled" ? "destructive" :
                                  "outline"
                                }
                                className={`text-xs ${
                                  tribute.flower.deliveryStatus === "Delivered" ? "bg-green-100 text-green-800 border-green-200" :
                                  tribute.flower.deliveryStatus === "Needs To Be Delivered" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                  tribute.flower.deliveryStatus === "Cancelled" ? "bg-red-100 text-red-800 border-red-200" :
                                  tribute.flower.deliveryStatus === "Payment Needs To Be Done" ? "bg-red-100 text-red-800 border-red-200" :
                                  "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {tribute.flower.deliveryStatus}
                              </Badge>
                            </div>
                          </div>

                          {/* Flower Message */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
                            <div className="space-y-1">
                              <p className="text-sm rounded">
                                {tribute.flower.message}
                              </p>
                              {tribute.isDeleted && (
                                <Badge variant="destructive" className="text-xs">
                                  Deleted
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Status Information */}
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                            <div className="space-y-2">
                              <Badge 
                                variant={
                                  tribute.tributeStatus === "Tribute Approved" ? "default" :
                                  tribute.tributeStatus === "Review Requested" ? "secondary" :
                                  tribute.tributeStatus === "Approval Denied" ? "destructive" :
                                  "outline"
                                }
                                className="text-xs"
                              >
                                {tribute.tributeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlowerDeliveryStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Delivery Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTributeStatusChange(tribute)}
                            disabled={tribute.isDeleted}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTribute(tribute)}
                            disabled={tribute.isDeleted}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No flower tributes submitted for this obituary yet.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t("donations")} description="Manage donations made for obituary posts" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading donation data...</p>
        </div>
      ) : (
        <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Donations Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                  {donationsSummary.totalDonationReceived.toFixed(2)} CAD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Given Back to Families</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                  {donationsSummary.totalDonationGivenBack.toFixed(2)} CAD
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Company Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                  {donationsSummary.netDonation.toFixed(2)} CAD
            </div>
          </CardContent>
        </Card>
      </div>

          <div className="space-y-4">
            <RowExpandableDataTable
        columns={columns}
              data={orders}
              searchKey="obituary"
              searchPlaceholder="Search by obituary title..."
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setPage(1)
              }}
              expandedContent={createExpandedContent}
              getRowId={(order) => order._id}
            />
              </div>
        </>
      )}

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Donation Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedDonation && (
          <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedDonation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDonation.finalPriceInCAD.price} {selectedDonation.finalPriceInCAD.currencyCode}
              </p>
            </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    New Status
                  </label>
                  <Select value={newDonationStatus} onValueChange={setNewDonationStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {donationStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            </div>
          </div>
        )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStatusDialogOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateDonationStatus} 
              disabled={isUpdatingStatus || !newDonationStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Donation"
        description={`Are you sure you want to delete the donation from "${selectedDonation?.name}"? This action cannot be undone.`}
        onConfirm={deleteDonation}
        loading={isDeletingDonation}
      />

      {/* Tribute Status Change Dialog */}
      <Dialog open={tributeStatusDialogOpen} onOpenChange={setTributeStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Tribute Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedTribute && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {selectedTribute.tributeOptions === 'card' && selectedTribute.card?.name}
                    {selectedTribute.tributeOptions === 'letter' && selectedTribute.letter?.name}
                    {selectedTribute.tributeOptions === 'message' && selectedTribute.message?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTribute.tributeOptions.charAt(0).toUpperCase() + selectedTribute.tributeOptions.slice(1)} Tribute
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="tribute-status" className="text-sm font-medium">
                    New Status
                  </label>
                  <Select value={newTributeStatus} onValueChange={setNewTributeStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {tributeStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTributeStatusDialogOpen(false)}
              disabled={isUpdatingTributeStatus}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateTributeStatus} 
              disabled={isUpdatingTributeStatus || !newTributeStatus}
            >
              {isUpdatingTributeStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tribute Delete Confirmation Dialog */}
      <ConfirmDialog
        open={tributeDeleteDialogOpen}
        onOpenChange={setTributeDeleteDialogOpen}
        title="Delete Tribute"
        description={`Are you sure you want to delete this ${selectedTribute?.tributeOptions || 'tribute'}? This action cannot be undone.`}
        onConfirm={deleteTribute}
        loading={isDeletingTribute}
      />

      {/* Donation Given Back Edit Dialog */}
      <Dialog open={donationGivenBackDialogOpen} onOpenChange={setDonationGivenBackDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Donation Given Back Amount</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedOrderForDonationUpdate && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{getDisplayTitle(selectedOrderForDonationUpdate.information)}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {selectedOrderForDonationUpdate.donationGivenBack.price} {selectedOrderForDonationUpdate.donationGivenBack.currencyCode}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="donation-amount" className="text-sm font-medium">
                    New Amount ({selectedOrderForDonationUpdate.donationGivenBack.currencyCode})
                  </label>
                  <input
                    id="donation-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newDonationGivenBackAmount}
                    onChange={(e) => setNewDonationGivenBackAmount(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDonationGivenBackDialogOpen(false)}
              disabled={isUpdatingDonationGivenBack}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateDonationGivenBack} 
              disabled={isUpdatingDonationGivenBack || !newDonationGivenBackAmount || parseFloat(newDonationGivenBackAmount) < 0}
            >
              {isUpdatingDonationGivenBack ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Amount"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flower Delivery Status Dialog */}
      <Dialog open={deliveryStatusDialogOpen} onOpenChange={setDeliveryStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Flower Delivery Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedFlowerTribute && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedFlowerTribute.flower?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Flower Tribute • Current Status: {selectedFlowerTribute.flower?.deliveryStatus}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="delivery-status" className="text-sm font-medium">
                    New Delivery Status
                  </label>
                  <Select value={newDeliveryStatus} onValueChange={setNewDeliveryStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeliveryStatusDialogOpen(false)}
              disabled={isUpdatingDeliveryStatus}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateFlowerDeliveryStatus} 
              disabled={isUpdatingDeliveryStatus || !newDeliveryStatus}
            >
              {isUpdatingDeliveryStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
