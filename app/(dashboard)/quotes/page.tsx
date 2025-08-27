"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Quote, Loader2 } from "lucide-react"
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
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { useLanguage } from "@/contexts/language-context"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Type definitions for API response
type QuoteItem = {
    _id: string
    quote: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    name: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    posistion: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    image: string
    isDeleted: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type ApiResponse = {
    quote: QuoteItem[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

export default function QuotesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewQuote, setViewQuote] = useState<QuoteItem | null>(null)
    const [deleteQuote, setDeleteQuote] = useState<QuoteItem | null>(null)
    const [editQuote, setEditQuote] = useState<QuoteItem | null>(null)
    const [createQuote, setCreateQuote] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [quotes, setQuotes] = useState<QuoteItem[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })

    const [pageSize, setPageSize] = useState(10)

    // Form state for editing
    const [editForm, setEditForm] = useState({
        quote: {
            en: '',
            ta: '',
            si: ''
        },
        name: {
            en: '',
            ta: '',
            si: ''
        },
        posistion: {
            en: '',
            ta: '',
            si: ''
        },
        isActive: false,
        image: null as File | null
    })

    // Form state for creating
    const [createForm, setCreateForm] = useState({
        quote: {
            en: '',
            ta: '',
            si: ''
        },
        name: {
            en: '',
            ta: '',
            si: ''
        },
        posistion: {
            en: '',
            ta: '',
            si: ''
        },
        isActive: true,
        image: null as File | null
    })

    // Fetch quotes from API
    const fetchQuotes = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/quotes/all?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch quotes')
            }

            const data: ApiResponse = await response.json()
            setQuotes(data.quote)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching quotes:', error)
            toast({
                title: "Error",
                description: "Failed to fetch quotes. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        fetchQuotes(pagination.currentPage, pageSize)
    }, [])

    const handlePageChange = (page: number) => {
        fetchQuotes(page, pageSize)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        fetchQuotes(1, newPageSize)
    }

    const handleAddQuote = () => {
        // Reset create form
        setCreateForm({
            quote: { en: '', ta: '', si: '' },
            name: { en: '', ta: '', si: '' },
            posistion: { en: '', ta: '', si: '' },
            isActive: true,
            image: null
        })
        setCreateQuote(true)
    }

    const handleEditQuote = (quoteId: string) => {
        const quote = quotes.find(q => q._id === quoteId)
        if (quote) {
            setEditQuote(quote)
            // Populate form with existing data
            setEditForm({
                quote: {
                    en: quote.quote.en[0]?.value || '',
                    ta: quote.quote.ta[0]?.value || '',
                    si: quote.quote.si[0]?.value || ''
                },
                name: {
                    en: quote.name.en[0]?.value || '',
                    ta: quote.name.ta[0]?.value || '',
                    si: quote.name.si[0]?.value || ''
                },
                posistion: {
                    en: quote.posistion.en[0]?.value || '',
                    ta: quote.posistion.ta[0]?.value || '',
                    si: quote.posistion.si[0]?.value || ''
                },
                isActive: quote.isActive,
                image: null
            })
        }
    }

    const handleDeleteQuote = async () => {
        if (!deleteQuote) return
        setIsDeleting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes/${deleteQuote._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })
            if (!response.ok) {
                throw new Error('Failed to delete quote')
            }
            toast({
                title: "Quote deleted",
                description: `Quote by "${deleteQuote.name.en[0]?.value}" has been deleted successfully.`,
            })
            // Refresh the list
            fetchQuotes(pagination.currentPage, pageSize)
        } catch (error) {
            console.error('Error deleting quote:', error)
            toast({
                title: "Error",
                description: "Failed to delete quote. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeleteQuote(null)
        }
    }

    const handleUpdateQuote = async () => {
        if (!editQuote) return
        
        setIsUpdating(true)
        
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            // Add quoteId
            formData.append('quoteId', editQuote._id)
            
            // Add quote object
            const quoteObject = {
                en: [{ name: "Quote", value: editForm.quote.en }],
                ta: [{ name: "மேற்கோள்", value: editForm.quote.ta }],
                si: [{ name: "මූලපදය", value: editForm.quote.si }]
            }
            formData.append('quote', JSON.stringify(quoteObject))
            
            // Add name object
            const nameObject = {
                en: [{ name: "Quote Owner Name", value: editForm.name.en }],
                ta: [{ name: "மேற்கோள் உரிமையாளர் பெயர்", value: editForm.name.ta }],
                si: [{ name: "මූලකරුගේ නම", value: editForm.name.si }]
            }
            formData.append('name', JSON.stringify(nameObject))
            
            // Add posistion object
            const posistionObject = {
                en: [{ name: "Job Position", value: editForm.posistion.en }],
                ta: [{ name: "வேலைப்பதவி", value: editForm.posistion.ta }],
                si: [{ name: "රැකියා තනතුර", value: editForm.posistion.si }]
            }
            formData.append('posistion', JSON.stringify(posistionObject))
            
            // Add other fields
            formData.append('isActive', editForm.isActive.toString())
            
            // Add image if selected
            if (editForm.image) {
                formData.append('image', editForm.image)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes/update`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update quote')
            }
            
            const result = await response.json()
            
            toast({
                title: "Quote updated",
                description: `Quote by "${editForm.name.en}" has been updated successfully.`,
            })
            
            // Refresh the list and close modal
            fetchQuotes(pagination.currentPage, pageSize)
            setEditQuote(null)
            
        } catch (error) {
            console.error('Error updating quote:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update quote. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCreateQuote = async () => {
        setIsCreating(true)
        
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            // Add quote object
            const quoteObject = {
                en: [{ name: "Quote", value: createForm.quote.en }],
                ta: [{ name: "மேற்கோள்", value: createForm.quote.ta }],
                si: [{ name: "මූලපදය", value: createForm.quote.si }]
            }
            formData.append('quote', JSON.stringify(quoteObject))
            
            // Add name object
            const nameObject = {
                en: [{ name: "Quote Owner Name", value: createForm.name.en }],
                ta: [{ name: "மேற்கோள் உரிமையாளர் பெயர்", value: createForm.name.ta }],
                si: [{ name: "මූලකරුගේ නම", value: createForm.name.si }]
            }
            formData.append('name', JSON.stringify(nameObject))
            
            // Add posistion object
            const posistionObject = {
                en: [{ name: "Job Position", value: createForm.posistion.en }],
                ta: [{ name: "வேலைப்பதவி", value: createForm.posistion.ta }],
                si: [{ name: "රැකියා තනතුර", value: createForm.posistion.si }]
            }
            formData.append('posistion', JSON.stringify(posistionObject))
            
            // Add other fields
            formData.append('isActive', createForm.isActive.toString())
            
            // Add image if selected
            if (createForm.image) {
                formData.append('image', createForm.image)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create quote')
            }
            
            const result = await response.json()
            
            toast({
                title: "Quote created",
                description: `Quote by "${createForm.name.en}" has been created successfully.`,
            })
            
            // Refresh the list and close modal
            fetchQuotes(pagination.currentPage, pageSize)
            setCreateQuote(false)
            
        } catch (error) {
            console.error('Error creating quote:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create quote. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsCreating(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch (error) {
            return dateString
        }
    }

    const getStatusBadge = (quote: QuoteItem) => {
        return (
            <div className="flex gap-1">
                {quote.isActive ? (
                    <Badge variant="outline">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                )}
            </div>
        )
    }

    const uniquePositions = Array.from(new Set(quotes.map((quote) => quote.posistion?.en?.[0]?.value || 'Unknown'))).map((position) => ({
        label: position,
        value: position,
    }))

    const columns: ColumnDef<QuoteItem>[] = [
        {
            id: "quote",
            accessorFn: (row) => row.quote.en[0]?.value || 'No quote',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Quote" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.image || "/placeholder.svg"} alt={row.original.name.en[0]?.value} />
                        <AvatarFallback>{row.original.name.en[0]?.value?.charAt(0) || 'Q'}</AvatarFallback>
                    </Avatar>
                    <div className="max-w-[300px]">
                        <div className="font-medium text-sm truncate">{row.original.quote.en[0]?.value || 'No quote'}</div>
                        <div className="text-xs text-muted-foreground">by {row.original.name.en[0]?.value}</div>
                    </div>
                </div>
            ),
        },
        {
            id: "author",
            accessorFn: (row) => row.name.en[0]?.value || 'Unknown Author',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Author" type="text" />,
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.name.en[0]?.value || 'Unknown Author'}</div>,
        },
        {
            id: "position",
            accessorFn: (row) => row.posistion?.en?.[0]?.value || 'Unknown',
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    <DataTableColumnHeader column={column} title="Position" type="text" />
                    <DataTableFacetedFilter column={column} title="Position" options={uniquePositions} />
                </div>
            ),
            cell: ({ row }) => <div>{row.original.posistion?.en?.[0]?.value || 'Unknown'}</div>,
        },
        {
            id: "status",
            accessorFn: (row) => row.isActive ? 'active' : 'inactive',
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
            cell: ({ row }) => getStatusBadge(row.original),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            id: "createdAt",
            accessorFn: (row) => row.createdAt,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" type="date" />,
            cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewQuote(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditQuote(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteQuote(row.original)}>
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
                title="Quotes"
                description="Manage inspirational quotes"
                action={{
                    label: "Add Quote",
                    onClick: handleAddQuote,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading quotes...</span>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={quotes}
                    searchKey="quote"
                    searchPlaceholder="Search quotes..."
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSize={pageSize}
                />
            )}

            <ViewDialog
                open={!!viewQuote}
                onOpenChange={(open) => !open && setViewQuote(null)}
                title={viewQuote?.name.en[0]?.value || "Quote Details"}
                className="max-w-6xl w-[95vw] max-h-[90vh]"
            >
                {viewQuote && (
                    <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                        {/* Header Section with Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{viewQuote.name.en[0]?.value}</h2>
                                <p className="text-sm text-gray-600">{viewQuote.posistion.en[0]?.value}</p>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge(viewQuote)}
                            </div>
                        </div>

                        {/* Quote Display Section */}
                        <div className="bg-white rounded-lg border p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Quote className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">Quote</h3>
                            </div>
                            <div className="relative">
                                <blockquote className="text-xl italic text-gray-800 border-l-4 border-blue-500 pl-4 py-2 mb-4">
                                    "{viewQuote.quote.en[0]?.value}"
                                </blockquote>
                                <div className="text-right">
                                    <cite className="text-sm font-medium text-gray-600">
                                        — {viewQuote.name.en[0]?.value}
                                        {viewQuote.posistion.en[0]?.value && (
                                            <span className="text-gray-500">, {viewQuote.posistion.en[0]?.value}</span>
                                        )}
                                    </cite>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Content Section */}
                            <div className="bg-white rounded-lg border p-4 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Multilingual Content
                                </h3>
                                <div className="space-y-4">
                                    {/* English */}
                                    <div className="border rounded-lg p-3 bg-gray-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="default" className="text-xs">EN</Badge>
                                            <span className="font-medium text-sm">English</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Quote:</span> {viewQuote.quote.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Author:</span> {viewQuote.name.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Position:</span> {viewQuote.posistion.en[0]?.value}</p>
                                        </div>
                                    </div>

                                    {/* Tamil */}
                                    <div className="border rounded-lg p-3 bg-orange-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-xs">TA</Badge>
                                            <span className="font-medium text-sm">Tamil</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Quote:</span> {viewQuote.quote.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Author:</span> {viewQuote.name.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Position:</span> {viewQuote.posistion.ta[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>

                                    {/* Sinhala */}
                                    <div className="border rounded-lg p-3 bg-green-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">SI</Badge>
                                            <span className="font-medium text-sm">Sinhala</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Quote:</span> {viewQuote.quote.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Author:</span> {viewQuote.name.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Position:</span> {viewQuote.posistion.si[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image and Metadata */}
                            <div className="space-y-6">
                                {/* Image Section */}
                                <div className="bg-white rounded-lg border p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Author Image
                                    </h3>
                                    <div>
                                        <img 
                                            src={viewQuote.image || "/placeholder.svg"} 
                                            alt="Author"
                                            className="w-full h-64 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>

                                {/* Metadata Section */}
                                <div className="bg-white rounded-lg border p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700">Status</span>
                                            <Badge variant={viewQuote.isActive ? "outline" : "secondary"}>
                                                {viewQuote.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700">Created</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewQuote.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="font-medium text-gray-700">Last Updated</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewQuote.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ViewDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editQuote} onOpenChange={(open) => !open && setEditQuote(null)}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Quote</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="content" className="space-y-6 mt-6">
                                {/* English Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="default">EN</Badge>
                                            English Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quote-en">Quote *</Label>
                                            <Textarea
                                                id="quote-en"
                                                value={editForm.quote.en}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, en: e.target.value }
                                                }))}
                                                placeholder="Enter quote in English"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name-en">Author Name *</Label>
                                                <Input
                                                    id="name-en"
                                                    value={editForm.name.en}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter author name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="position-en">Position *</Label>
                                                <Input
                                                    id="position-en"
                                                    value={editForm.posistion.en}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter job position"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tamil Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="secondary">TA</Badge>
                                            Tamil Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quote-ta">Quote</Label>
                                            <Textarea
                                                id="quote-ta"
                                                value={editForm.quote.ta}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, ta: e.target.value }
                                                }))}
                                                placeholder="தமிழ் மேற்கோள்"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name-ta">Author Name</Label>
                                                <Input
                                                    id="name-ta"
                                                    value={editForm.name.ta}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, ta: e.target.value }
                                                    }))}
                                                    placeholder="ஆசிரியர் பெயர்"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="position-ta">Position</Label>
                                                <Input
                                                    id="position-ta"
                                                    value={editForm.posistion.ta}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, ta: e.target.value }
                                                    }))}
                                                    placeholder="வேலைப்பதவி"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sinhala Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="outline">SI</Badge>
                                            Sinhala Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quote-si">Quote</Label>
                                            <Textarea
                                                id="quote-si"
                                                value={editForm.quote.si}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, si: e.target.value }
                                                }))}
                                                placeholder="සිංහල උපුටා දැක්වීම"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name-si">Author Name</Label>
                                                <Input
                                                    id="name-si"
                                                    value={editForm.name.si}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, si: e.target.value }
                                                    }))}
                                                    placeholder="කතෘගේ නම"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="position-si">Position</Label>
                                                <Input
                                                    id="position-si"
                                                    value={editForm.posistion.si}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, si: e.target.value }
                                                    }))}
                                                    placeholder="රැකියා තනතුර"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                {/* Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Author Image</CardTitle>
                                        <CardDescription>
                                            Upload an image of the quote author (optional)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Current Image Display */}
                                            {editQuote?.image && !editForm.image && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Image</Label>
                                                    <div className="relative">
                                                        <img
                                                            src={editQuote.image}
                                                            alt="Current author image"
                                                            className="w-32 h-32 object-cover rounded-lg border"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="grid w-full items-center gap-2">
                                                <Label htmlFor="image-upload" className="text-sm font-medium">
                                                    {editQuote?.image ? "Replace Image" : "Choose Image"}
                                                </Label>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const input = document.getElementById('image-upload') as HTMLInputElement
                                                            input?.click()
                                                        }}
                                                        className="bg-black text-white hover:bg-gray-800 hover:text-white border-black"
                                                    >
                                                        Choose File
                                                    </Button>
                                                    <span className="text-sm text-gray-500">
                                                        {editForm.image ? editForm.image.name : "No file selected"}
                                                    </span>
                                                </div>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            setEditForm(prev => ({ ...prev, image: file }))
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </div>
                                            {editForm.image && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium mb-2">New Image Preview:</p>
                                                    <img
                                                        src={URL.createObjectURL(editForm.image)}
                                                        alt="New image preview"
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quote Settings</CardTitle>
                                        <CardDescription>
                                            Configure quote visibility and status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is-active">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this quote visible to users
                                                </p>
                                            </div>
                                            <Switch
                                                id="is-active"
                                                checked={editForm.isActive}
                                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditQuote(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateQuote} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Quote'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createQuote} onOpenChange={(open) => !open && setCreateQuote(false)}>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create New Quote</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="content" className="space-y-6 mt-6">
                                {/* English Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="default">EN</Badge>
                                            English Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-quote-en">Quote *</Label>
                                            <Textarea
                                                id="create-quote-en"
                                                value={createForm.quote.en}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, en: e.target.value }
                                                }))}
                                                placeholder="Enter quote in English"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name-en">Author Name *</Label>
                                                <Input
                                                    id="create-name-en"
                                                    value={createForm.name.en}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter author name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-position-en">Position *</Label>
                                                <Input
                                                    id="create-position-en"
                                                    value={createForm.posistion.en}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter job position"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Tamil Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="secondary">TA</Badge>
                                            Tamil Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-quote-ta">Quote</Label>
                                            <Textarea
                                                id="create-quote-ta"
                                                value={createForm.quote.ta}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, ta: e.target.value }
                                                }))}
                                                placeholder="தமிழ் மேற்கோள்"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name-ta">Author Name</Label>
                                                <Input
                                                    id="create-name-ta"
                                                    value={createForm.name.ta}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, ta: e.target.value }
                                                    }))}
                                                    placeholder="ஆசிரியர் பெயர்"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-position-ta">Position</Label>
                                                <Input
                                                    id="create-position-ta"
                                                    value={createForm.posistion.ta}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, ta: e.target.value }
                                                    }))}
                                                    placeholder="வேலைப்பதவி"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sinhala Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Badge variant="outline">SI</Badge>
                                            Sinhala Content
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-quote-si">Quote</Label>
                                            <Textarea
                                                id="create-quote-si"
                                                value={createForm.quote.si}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    quote: { ...prev.quote, si: e.target.value }
                                                }))}
                                                placeholder="සිංහල උපුටා දැක්වීම"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-name-si">Author Name</Label>
                                                <Input
                                                    id="create-name-si"
                                                    value={createForm.name.si}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        name: { ...prev.name, si: e.target.value }
                                                    }))}
                                                    placeholder="කතෘගේ නම"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-position-si">Position</Label>
                                                <Input
                                                    id="create-position-si"
                                                    value={createForm.posistion.si}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        posistion: { ...prev.posistion, si: e.target.value }
                                                    }))}
                                                    placeholder="රැකියා තනතුර"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                {/* Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Author Image</CardTitle>
                                        <CardDescription>
                                            Upload an image of the quote author *
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="grid w-full items-center gap-2">
                                                <Label htmlFor="create-image-upload" className="text-sm font-medium">
                                                    Choose Image *
                                                </Label>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const input = document.getElementById('create-image-upload') as HTMLInputElement
                                                            input?.click()
                                                        }}
                                                        className="bg-black text-white hover:bg-gray-800 hover:text-white border-black"
                                                    >
                                                        Choose File
                                                    </Button>
                                                    <span className="text-sm text-gray-500">
                                                        {createForm.image ? createForm.image.name : "No file selected"}
                                                    </span>
                                                </div>
                                                <input
                                                    id="create-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) {
                                                            setCreateForm(prev => ({ ...prev, image: file }))
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                            </div>
                                            {createForm.image && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                                    <img
                                                        src={URL.createObjectURL(createForm.image)}
                                                        alt="Preview"
                                                        className="w-32 h-32 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quote Settings</CardTitle>
                                        <CardDescription>
                                            Configure quote visibility and status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="create-is-active">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this quote visible to users
                                                </p>
                                            </div>
                                            <Switch
                                                id="create-is-active"
                                                checked={createForm.isActive}
                                                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateQuote(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateQuote} 
                            disabled={isCreating || !createForm.quote.en || !createForm.name.en || !createForm.posistion.en || !createForm.image}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Quote'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteQuote}
                onOpenChange={(open) => !open && setDeleteQuote(null)}
                title="Delete Quote"
                description={`Are you sure you want to delete the quote by "${deleteQuote?.name.en[0]?.value}"? This action cannot be undone.`}
                onConfirm={handleDeleteQuote}
                loading={isDeleting}
            />
        </div>
    )
}