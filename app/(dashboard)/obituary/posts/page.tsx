"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Calendar as CalendarIcon, Loader2 } from "lucide-react"
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
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"

// Type definitions for API response
type ObituaryPost = {
    _id: string
    orderId?: string
    username: string
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
        shortDescription?: string
    }
    primaryImage: string
    thumbnailImage: string
    selectedPackage: {
        name: {
            en: Array<{ name: string; value: string; _id: string }>
            ta: Array<{ name: string; value: string; _id: string }>
            si: Array<{ name: string; value: string; _id: string }>
        }
        _id: string
        duration: number
    }
    orderStatus: string
    expiryDate: string
    contactDetails: Array<{
        country: string
        address: string
        phoneNumber: string
        name: string
        relationship: string
        email: string
        _id: string
    }>
    additionalImages: string[]
    slideshowImages: string[]
    selectedBgColor?: {
        colorCode: string
    }
    createdAt: string
    updatedAt: string
}

type ApiResponse = {
    orders: ObituaryPost[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

export default function ObituaryPostsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    
    // Helper function to get display title with priority logic
    const getDisplayTitle = (information: ObituaryPost['information']) => {
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
    
    const [viewPost, setViewPost] = useState<ObituaryPost | null>(null)
    const [deletePost, setDeletePost] = useState<ObituaryPost | null>(null)
    const [statusPost, setStatusPost] = useState<ObituaryPost | null>(null)
    const [newStatus, setNewStatus] = useState<string>("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [obituaryPosts, setObituaryPosts] = useState<ObituaryPost[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })

    const [pageSize, setPageSize] = useState(10)

    // Date editing state
    const [expiryDatePost, setExpiryDatePost] = useState<ObituaryPost | null>(null)
    const [newExpiryDate, setNewExpiryDate] = useState<string>("")
    const [isUpdatingExpiryDate, setIsUpdatingExpiryDate] = useState(false)

    // Fetch obituary posts from API
    const fetchObituaryPosts = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/order/all?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch obituary posts')
            }

            const data: ApiResponse = await response.json()
            setObituaryPosts(data.orders)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching obituary posts:', error)
            toast({
                title: "Error",
                description: "Failed to fetch obituary posts. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        fetchObituaryPosts(pagination.currentPage, pageSize)
    }, [])

    const handlePageChange = (page: number) => {
        fetchObituaryPosts(page, pageSize)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        fetchObituaryPosts(1, newPageSize)
    }

    const handleAddPost = () => {
        router.push("/obituary/posts/new")
    }

    const handleEditPost = (postId: string) => {
        router.push(`/obituary/posts/${postId}`)
    }

    const handleDeletePost = async () => {
        if (!deletePost) return
        setIsDeleting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order/${deletePost._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })
            if (!response.ok) {
                throw new Error('Failed to delete obituary post')
            }
            toast({
                title: "Obituary post deleted",
                description: `"${getDisplayTitle(deletePost.information)}" has been deleted successfully.`,
            })
            // Refresh the list
            fetchObituaryPosts(pagination.currentPage, pageSize)
        } catch (error) {
            console.error('Error deleting obituary post:', error)
            toast({
                title: "Error",
                description: "Failed to delete obituary post. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeletePost(null)
        }
    }

    const handleOpenStatusChange = (post: ObituaryPost) => {
        setStatusPost(post)
        setNewStatus(post.orderStatus)
    }

    const handleStatusChange = async () => {
        if (!statusPost || !newStatus) return

        setIsUpdatingStatus(true)

        const updatedStatusPost = {
            orderStatus: newStatus,
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

        const response = await fetch(`${apiUrl}/order/${statusPost._id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatedStatusPost),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to update obituary post status')
        }

        toast({
            title: "Status updated",
            description: `The status for "${getDisplayTitle(statusPost.information)}" has been updated to "${newStatus}".`,
        })

        setIsUpdatingStatus(false)
        setStatusPost(null)
        fetchObituaryPosts(pagination.currentPage, pageSize)
    }

    const handleExpiryDateUpdate = async () => {
        if (!expiryDatePost || !newExpiryDate) return

        setIsUpdatingExpiryDate(true)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

            const response = await fetch(`${apiUrl}/order/${expiryDatePost._id}/expiry-date`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    expiryDate: newExpiryDate
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update expiry date')
            }

            toast({
                title: "Expiry date updated",
                description: `The expiry date for "${getDisplayTitle(expiryDatePost.information)}" has been updated to ${format(new Date(newExpiryDate), "PPP")}.`,
            })

            // Refresh the list
            fetchObituaryPosts(pagination.currentPage, pageSize)
            
        } catch (error) {
            console.error('Error updating expiry date:', error)
            toast({
                title: "Error",
                description: "Failed to update expiry date. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUpdatingExpiryDate(false)
            setExpiryDatePost(null)
            setNewExpiryDate("")
        }
    }

    const handleEditExpiryDate = (post: ObituaryPost) => {
        setExpiryDatePost(post)
        
        // Set current expiry date as default
        let currentDate: Date
        if (!post.expiryDate) {
            const createdDate = new Date(post.createdAt)
            const duration = post.selectedPackage?.duration || 30
            currentDate = new Date(createdDate.getTime() + (duration * 24 * 60 * 60 * 1000))
        } else {
            currentDate = new Date(post.expiryDate)
        }
        setNewExpiryDate(format(currentDate, "yyyy-MM-dd"))
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "PPP")
        } catch (error) {
            return dateString
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "post approved":
                return <Badge variant="default">Post Approved</Badge>
            case "review requested":
                return <Badge variant="outline">Review Requested</Badge>
            case "approval denied":
                return <Badge variant="destructive">Approval Denied</Badge>
            case "requested for changes":
                return <Badge variant="secondary">Requested for Changes</Badge>
            case "expired":
                return <Badge variant="secondary">Expired</Badge>
            case "refunded":
                return <Badge variant="outline">Refunded</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const uniquePackages = Array.from(new Set(obituaryPosts.map((post) => post.selectedPackage?.name?.en?.[0]?.name || 'Unknown'))).map((packageName) => ({
        label: packageName,
        value: packageName,
    }))

    const columns: ColumnDef<ObituaryPost>[] = [
        {
            id: "title",
            accessorFn: (row) => getDisplayTitle(row.information),
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.thumbnailImage || row.original.primaryImage || "/placeholder.svg"} alt={getDisplayTitle(row.original.information)} />
                        <AvatarFallback>{getDisplayTitle(row.original.information).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{getDisplayTitle(row.original.information)}</div>
                </div>
            ),
        },
        {
            id: "description",
            accessorFn: (row) => row.information.shortDescription || row.information.description,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" type="text" />,
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.information.shortDescription || row.original.information.description}</div>,
        },
        {
            id: "package",
            accessorFn: (row) => row.selectedPackage?.name?.en?.[0]?.name || 'Unknown',
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    <DataTableColumnHeader column={column} title="Package" type="text" />
                    <DataTableFacetedFilter column={column} title="Package" options={uniquePackages} />
                </div>
            ),
            cell: ({ row }) => <div>{row.original.selectedPackage?.name?.en?.[0]?.name || 'Unknown'}</div>,
        },
        {
            id: "expiryDate",
            accessorFn: (row) => {
                if (!row.expiryDate) {
                    const createdDate = new Date(row.createdAt)
                    const duration = row.selectedPackage?.duration || 30
                    const expiryDate = new Date(createdDate.getTime() + (duration * 24 * 60 * 60 * 1000))
                    return expiryDate.toISOString()
                }
                return row.expiryDate
            },
            header: ({ column }) => <DataTableColumnHeader column={column} title="Expiry Date" type="date" />,
            cell: ({ row }) => {
                let currentDate: Date
                
                if (!row.original.expiryDate) {
                    // Calculate expiry date from creation date + package duration
                    const createdDate = new Date(row.original.createdAt)
                    const duration = row.original.selectedPackage?.duration || 30
                    currentDate = new Date(createdDate.getTime() + (duration * 24 * 60 * 60 * 1000))
                } else {
                    currentDate = new Date(row.original.expiryDate)
                }

                return (
                    <Button
                        variant="ghost"
                        className="h-auto p-2 font-normal justify-start text-left"
                        onClick={() => handleEditExpiryDate(row.original)}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDate(currentDate.toISOString())}
                    </Button>
                )
            },
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
                        options={[
                            { label: "Review Requested", value: "Review Requested" },
                            { label: "Post Approved", value: "Post Approved" },
                            { label: "Approval Denied", value: "Approval Denied" },
                            { label: "Requested for Changes", value: "Requested for Changes" },
                            { label: "Expired", value: "Expired" },
                            { label: "Refunded", value: "Refunded" },
                        ]}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="cursor-pointer" onClick={() => handleOpenStatusChange(row.original)}>
                    {getStatusBadge(row.original.orderStatus)}
                </div>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewPost(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPost(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletePost(row.original)}>
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
                title="Obituary Posts"
                description="Manage obituary posts"
            // action={{
            //     label: "Add Post",
            //     onClick: handleAddPost,
            //     icon: <Plus className="mr-2 h-4 w-4" />,
            // }}
            />

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading obituary posts...</span>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={obituaryPosts}
                    searchKey="title"
                    searchPlaceholder="Search posts..."
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSize={pageSize}
                />
            )}

            <ViewDialog
                open={!!viewPost}
                onOpenChange={(open) => !open && setViewPost(null)}
                title={viewPost ? getDisplayTitle(viewPost.information) : "Obituary Details"}
                className="max-w-6xl w-[90vw]"
            >
                {viewPost && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div
                                className="bg-gray-100 md:p-10 p-4"
                                style={{ backgroundColor: viewPost.selectedBgColor?.colorCode || '#f3f4f6' }}
                            >
                                <div className="bg-black w-full shadow-md">
                                    <div className="pt-4 pb-2 text-center max-w-lg mx-auto px-4">
                                        <h1 className="text-xl font-bold text-white mb-6">
                                            {viewPost.information.shortDescription || "In loving memory"}
                                        </h1>

                                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
                                            <div className="text-gray-300 text-center flex md:flex-col">
                                                <p>Birth<span className="md:hidden mr-1 ml-1">:</span></p>
                                                <p>{viewPost.information.dateofBirth ? formatDate(viewPost.information.dateofBirth) : 'N/A'}</p>
                                            </div>

                                            <img
                                                alt={`Portrait of ${getDisplayTitle(viewPost.information)}`}
                                                className="w-40 sm:w-60 shadow-md aspect-square object-cover mx-auto sm:mx-4"
                                                src={viewPost.primaryImage || "/placeholder.svg"}
                                            />

                                            <div className="text-gray-300 text-center flex md:flex-col">
                                                <p>Death<span className="md:hidden mr-1 ml-1">:</span></p>
                                                <p>{viewPost.information.dateofDeath ? formatDate(viewPost.information.dateofDeath) : 'N/A'}</p>
                                            </div>
                                        </div>

                                        <p className="text-white font-medium">
                                            {getDisplayTitle(viewPost.information)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-justify mt-4">
                                {viewPost.information.description || "No description available"}
                            </p>

                            <div className="flex justify-end gap-2 items-center self-stretch mt-4">
                                <button className="gap-2.5 self-stretch shrink-0 px-4 py-3 my-auto text-body-xs text-[#0B4157] rounded border border-teal-900 border-solid min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                    Post Tribute
                                </button>
                                <button className="gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                    Donate
                                </button>
                            </div>

                            <div className="mt-8">
                                <div className="flex-shrink min-w-0 max-w-full">
                                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Contacts</h3>
                                </div>
                                {viewPost.contactDetails.map((contact, index) => (
                                    <div key={contact._id} className="bg-white p-6 shadow-md mb-4 flex md:flex-row flex-col justify-between md:items-center">
                                        <div>
                                            <p className="text-[#880002]">{contact.name}</p>
                                            <p>{contact.address}</p>
                                            <p>{contact.phoneNumber}</p>
                                            <p>{contact.relationship}</p>
                                        </div>
                                        <button className="mb-0 gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                            Request to Contact
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side - overview and information */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-2 shadow-md">
                                <div className="flex-shrink min-w-0 max-w-full mt-2">
                                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Overview</h3>
                                </div>
                                <div className="space-y-2 mt-2 p-2">
                                    <p><span className="font-medium">Name:</span> {getDisplayTitle(viewPost.information)}</p>
                                    <p><span className="font-medium">Birth Date:</span> {viewPost.information.dateofBirth ? format(new Date(viewPost.information.dateofBirth), "d/M/yyyy") : 'N/A'}</p>
                                    <p><span className="font-medium">Death Date:</span> {viewPost.information.dateofDeath ? format(new Date(viewPost.information.dateofDeath), "d/M/yyyy") : 'N/A'}</p>
                                    <p><span className="font-medium">Age:</span> {
                                        viewPost.information.dateofBirth && viewPost.information.dateofDeath
                                            ? Math.floor((new Date(viewPost.information.dateofDeath).getTime() - new Date(viewPost.information.dateofBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                                            : 'N/A'
                                    }</p>
                                    <p><span className="font-medium">Address:</span> {viewPost.information.address || 'N/A'}</p>
                                </div>

                                <div className="flex-shrink min-w-0 max-w-full mt-4">
                                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Poster's Information</h3>
                                </div>
                                <div className="space-y-2 mt-2 p-2">
                                    {viewPost.contactDetails.length > 0 ? (
                                        <>
                                            <p><span className="font-medium">Name:</span> {viewPost.contactDetails[0].name}</p>
                                            <p><span className="font-medium">Relationship:</span> {viewPost.contactDetails[0].relationship}</p>
                                            <p><span className="font-medium">Phone:</span> {viewPost.contactDetails[0].phoneNumber}</p>
                                            <p><span className="font-medium">Email:</span> {viewPost.contactDetails[0].email}</p>
                                            <p><span className="font-medium">Address:</span> {viewPost.contactDetails[0].address}</p>
                                        </>
                                    ) : (
                                        <p>No contact information available</p>
                                    )}
                                    <p><span className="font-medium">Posted:</span> {formatDate(viewPost.createdAt)}</p>
                                </div>

                                <button className="w-full gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                    Request to Contact
                                </button>

                                {(viewPost.additionalImages.length > 0 || viewPost.slideshowImages.length > 0) && (
                                    <>
                                        <div className="flex-shrink min-w-0 max-w-full mt-8 mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Pictures</h3>
                                        </div>
                                        <div className="p-2">
                                            <div className="bg-white p-2 shadow-md">
                                                <div className="grid grid-cols-2 gap-2 pb-4">
                                                    {viewPost.slideshowImages.length > 0 ? (
                                                        viewPost.slideshowImages.slice(0, 4).map((image, index) => (
                                                            <img
                                                                key={`slide-${index}`}
                                                                alt={`Slideshow image ${index + 1}`}
                                                                className="w-full shadow-md aspect-square object-cover"
                                                                src={image}
                                                            />
                                                        ))
                                                    ) : (
                                                        viewPost.additionalImages.slice(0, 4).map((image, index) => (
                                                            <img
                                                                key={index}
                                                                alt={`Additional image ${index + 1}`}
                                                                className="w-full shadow-md aspect-square object-cover"
                                                                src={image}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                                <button className="w-full gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                                    View All Images
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </ViewDialog>

            <ConfirmDialog
                open={!!deletePost}
                onOpenChange={(open) => !open && setDeletePost(null)}
                title="Delete Obituary Post"
                description={`Are you sure you want to delete the obituary post for "${deletePost ? getDisplayTitle(deletePost.information) : ''}"? This action cannot be undone.`}
                onConfirm={handleDeletePost}
                loading={isDeleting}
            />

            {/* Status Change Dialog */}
            <Dialog open={!!statusPost} onOpenChange={(open) => !open && setStatusPost(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Change Status</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status for {statusPost ? getDisplayTitle(statusPost.information) : ''}</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Review Requested">Review Requested</SelectItem>
                                    <SelectItem value="Post Approved">Post Approved</SelectItem>
                                    <SelectItem value="Approval Denied">Approval Denied</SelectItem>
                                    <SelectItem value="Requested for Changes">Requested for Changes</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusPost(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusChange} disabled={isUpdatingStatus}>
                            {isUpdatingStatus ? "Updating..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Expiry Date Change Dialog */}
            <Dialog open={!!expiryDatePost} onOpenChange={(open) => !open && setExpiryDatePost(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Expiry Date</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {expiryDatePost && (
                            <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-medium">{getDisplayTitle(expiryDatePost.information)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Current expiry: {(() => {
                                            if (!expiryDatePost.expiryDate) {
                                                const createdDate = new Date(expiryDatePost.createdAt)
                                                const duration = expiryDatePost.selectedPackage?.duration || 30
                                                const currentDate = new Date(createdDate.getTime() + (duration * 24 * 60 * 60 * 1000))
                                                return formatDate(currentDate.toISOString())
                                            }
                                            return formatDate(expiryDatePost.expiryDate)
                                        })()}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">New Expiry Date</Label>
                                    <Input
                                        id="expiry-date"
                                        type="date"
                                        value={newExpiryDate}
                                        onChange={(e) => setNewExpiryDate(e.target.value)}
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExpiryDatePost(null)} disabled={isUpdatingExpiryDate}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleExpiryDateUpdate} 
                            disabled={isUpdatingExpiryDate || !newExpiryDate}
                        >
                            {isUpdatingExpiryDate ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Expiry Date"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
