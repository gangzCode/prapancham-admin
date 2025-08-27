"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Youtube, Loader2 } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"

// Type definitions for API response
type YoutubeNews = {
    _id: string
    title: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    description: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    isFeatured: boolean
    image: string
    featuredYoutubeImage: string
    youtubeLink: string
    youtubeRunTime: string
    isDeleted: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type ApiResponse = {
    youtubeNews: YoutubeNews[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

export default function YoutubeNewsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewNews, setViewNews] = useState<YoutubeNews | null>(null)
    const [deleteNews, setDeleteNews] = useState<YoutubeNews | null>(null)
    const [editNews, setEditNews] = useState<YoutubeNews | null>(null)
    const [createNews, setCreateNews] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [youtubeNews, setYoutubeNews] = useState<YoutubeNews[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    })

    const [pageSize, setPageSize] = useState(10)

    // Form state for editing
    const [editForm, setEditForm] = useState({
        title: {
            en: '',
            ta: '',
            si: ''
        },
        description: {
            en: '',
            ta: '',
            si: ''
        },
        youtubeLink: '',
        youtubeRunTime: '',
        isFeatured: false,
        isActive: false,
        image: null as File | null,
        featuredYoutubeImage: null as File | null
    })

    // Form state for creating
    const [createForm, setCreateForm] = useState({
        title: {
            en: '',
            ta: '',
            si: ''
        },
        description: {
            en: '',
            ta: '',
            si: ''
        },
        youtubeLink: '',
        youtubeRunTime: '',
        isFeatured: false,
        isActive: true,
        image: null as File | null,
        featuredYoutubeImage: null as File | null
    })

    // Fetch YouTube news from API
    const fetchYoutubeNews = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/youtube-news/all?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch YouTube news')
            }

            const data: ApiResponse = await response.json()
            setYoutubeNews(data.youtubeNews)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching YouTube news:', error)
            toast({
                title: "Error",
                description: "Failed to fetch YouTube news. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        fetchYoutubeNews(pagination.currentPage, pageSize)
    }, [])

    const handlePageChange = (page: number) => {
        fetchYoutubeNews(page, pageSize)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        fetchYoutubeNews(1, newPageSize)
    }

    const handleAddNews = () => {
        // Reset create form
        setCreateForm({
            title: { en: '', ta: '', si: '' },
            description: { en: '', ta: '', si: '' },
            youtubeLink: '',
            youtubeRunTime: '',
            isFeatured: false,
            isActive: true,
            image: null,
            featuredYoutubeImage: null
        })
        setCreateNews(true)
    }

    const handleEditNews = (newsId: string) => {
        const news = youtubeNews.find(n => n._id === newsId)
        if (news) {
            setEditNews(news)
            // Populate form with existing data
            setEditForm({
                title: {
                    en: news.title.en[0]?.value || '',
                    ta: news.title.ta[0]?.value || '',
                    si: news.title.si[0]?.value || ''
                },
                description: {
                    en: news.description.en[0]?.value || '',
                    ta: news.description.ta[0]?.value || '',
                    si: news.description.si[0]?.value || ''
                },
                youtubeLink: news.youtubeLink || '',
                youtubeRunTime: news.youtubeRunTime || '',
                isFeatured: news.isFeatured,
                isActive: news.isActive,
                image: null,
                featuredYoutubeImage: null
            })
        }
    }

    const handleDeleteNews = async () => {
        if (!deleteNews) return
        setIsDeleting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youtube-news/${deleteNews._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })
            if (!response.ok) {
                throw new Error('Failed to delete YouTube news')
            }
            toast({
                title: "YouTube news deleted",
                description: `"${deleteNews.title.en[0]?.value}" has been deleted successfully.`,
            })
            // Refresh the list
            fetchYoutubeNews(pagination.currentPage, pageSize)
        } catch (error) {
            console.error('Error deleting YouTube news:', error)
            toast({
                title: "Error",
                description: "Failed to delete YouTube news. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeleteNews(null)
        }
    }

    const handleUpdateNews = async () => {
        if (!editNews) return
        
        setIsUpdating(true)
        
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            // Add youtubeNewsId
            formData.append('youtubeNewsId', editNews._id)
            
            // Add title object
            const titleObject = {
                en: [{ name: "Title", value: editForm.title.en }],
                ta: [{ name: "தலைப்பு", value: editForm.title.ta }],
                si: [{ name: "සිරැස්තලය", value: editForm.title.si }]
            }
            formData.append('title', JSON.stringify(titleObject))
            
            // Add description object
            const descriptionObject = {
                en: [{ name: "Description", value: editForm.description.en }],
                ta: [{ name: "விவரணம்", value: editForm.description.ta }],
                si: [{ name: "විස්තරය", value: editForm.description.si }]
            }
            formData.append('description', JSON.stringify(descriptionObject))
            
            // Add other fields
            formData.append('youtubeLink', `"${editForm.youtubeLink}"`)
            formData.append('youtubeRunTime', `"${editForm.youtubeRunTime}"`)
            formData.append('isFeatured', editForm.isFeatured.toString())
            formData.append('isActive', editForm.isActive.toString())
            
            // Add images if selected
            if (editForm.image) {
                formData.append('image', editForm.image)
            }
            if (editForm.featuredYoutubeImage) {
                formData.append('featuredYoutubeImage', editForm.featuredYoutubeImage)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youtube-news/update`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update YouTube news')
            }
            
            const result = await response.json()
            
            toast({
                title: "YouTube news updated",
                description: `"${editForm.title.en}" has been updated successfully.`,
            })
            
            // Refresh the list and close modal
            fetchYoutubeNews(pagination.currentPage, pageSize)
            setEditNews(null)
            
        } catch (error) {
            console.error('Error updating YouTube news:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update YouTube news. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCreateNews = async () => {
        setIsCreating(true)
        
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            // Add title object
            const titleObject = {
                en: [{ name: "Title", value: createForm.title.en }],
                ta: [{ name: "தலைப்பு", value: createForm.title.ta }],
                si: [{ name: "සිරැස්තලය", value: createForm.title.si }]
            }
            formData.append('title', JSON.stringify(titleObject))
            
            // Add description object
            const descriptionObject = {
                en: [{ name: "Description", value: createForm.description.en }],
                ta: [{ name: "விවරணம்", value: createForm.description.ta }],
                si: [{ name: "විස්තරය", value: createForm.description.si }]
            }
            formData.append('description', JSON.stringify(descriptionObject))
            
            // Add other fields
            formData.append('youtubeLink', `"${createForm.youtubeLink}"`)
            formData.append('youtubeRunTime', `"${createForm.youtubeRunTime}"`)
            formData.append('isFeatured', createForm.isFeatured.toString())
            formData.append('isActive', createForm.isActive.toString())
            
            // Add images if selected
            if (createForm.image) {
                formData.append('image', createForm.image)
            }
            if (createForm.featuredYoutubeImage) {
                formData.append('featuredYoutubeImage', createForm.featuredYoutubeImage)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youtube-news`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create YouTube news')
            }
            
            const result = await response.json()
            
            toast({
                title: "YouTube news created",
                description: `"${createForm.title.en}" has been created successfully.`,
            })
            
            // Refresh the list and close modal
            fetchYoutubeNews(pagination.currentPage, pageSize)
            setCreateNews(false)
            
        } catch (error) {
            console.error('Error creating YouTube news:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create YouTube news. Please try again.",
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

    const getStatusBadges = (news: YoutubeNews) => {
        return (
            <div className="flex gap-1">
                {news.isFeatured && <Badge variant="default">Featured</Badge>}
                {news.isActive ? (
                    <Badge variant="outline">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                )}
            </div>
        )
    }

    const extractYoutubeVideoId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match ? match[1] : null
    }

    const columns: ColumnDef<YoutubeNews>[] = [
        {
            id: "title",
            accessorFn: (row) => row.title.en[0]?.value || 'Untitled',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.image || "/placeholder.svg"} alt={row.original.title.en[0]?.value} />
                        <AvatarFallback>{row.original.title.en[0]?.value?.charAt(0) || 'N'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium max-w-[200px] truncate">{row.original.title.en[0]?.value || 'Untitled'}</div>
                </div>
            ),
        },
        {
            id: "description",
            accessorFn: (row) => row.description.en[0]?.value || 'No description',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" type="text" />,
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.description.en[0]?.value || 'No description'}</div>,
        },
        {
            id: "youtubeLink",
            accessorFn: (row) => row.youtubeLink,
            header: ({ column }) => <DataTableColumnHeader column={column} title="YouTube Link" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    <a 
                        href={row.original.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-[150px] truncate"
                    >
                        YouTube Video
                    </a>
                </div>
            ),
        },
        {
            id: "runtime",
            accessorFn: (row) => row.youtubeRunTime,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Runtime" type="text" />,
            cell: ({ row }) => <div>{row.original.youtubeRunTime || 'N/A'}</div>,
        },
        {
            id: "status",
            accessorFn: (row) => `${row.isFeatured ? 'featured' : ''} ${row.isActive ? 'active' : 'inactive'}`,
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    <DataTableColumnHeader column={column} title="Status" type="status" />
                    <DataTableFacetedFilter
                        column={column}
                        title="Status"
                        options={[
                            { label: "Featured", value: "featured" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                        ]}
                    />
                </div>
            ),
            cell: ({ row }) => getStatusBadges(row.original),
            filterFn: (row, id, value) => {
                const statusString = row.getValue(id) as string
                return value.some((val: string) => statusString.includes(val))
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
                    <Button variant="ghost" size="icon" onClick={() => setViewNews(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditNews(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteNews(row.original)}>
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
                title="YouTube News"
                description="Manage YouTube news content"
                action={{
                    label: "Add News",
                    onClick: handleAddNews,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading YouTube news...</span>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={youtubeNews}
                    searchKey="title"
                    searchPlaceholder="Search news..."
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSize={pageSize}
                />
            )}

            <ViewDialog
                open={!!viewNews}
                onOpenChange={(open) => !open && setViewNews(null)}
                title={viewNews?.title.en[0]?.value || "YouTube News Details"}
                className="max-w-6xl w-[95vw] max-h-[90vh]"
            >
                {viewNews && (
                    <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                        {/* Header Section with Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{viewNews.title.en[0]?.value}</h2>
                                <p className="text-sm text-gray-600">{viewNews.description.en[0]?.value}</p>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadges(viewNews)}
                            </div>
                        </div>

                        {/* YouTube Video Section */}
                        {viewNews.youtubeLink && extractYoutubeVideoId(viewNews.youtubeLink) && (
                            <div className="bg-white rounded-lg border p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Youtube className="h-5 w-5 text-red-600" />
                                    <h3 className="text-lg font-semibold">YouTube Video</h3>
                                </div>
                                <div className="aspect-video mb-4">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYoutubeVideoId(viewNews.youtubeLink)}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full rounded-lg shadow-md"
                                    ></iframe>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Runtime:</span>
                                        <Badge variant="outline">{viewNews.youtubeRunTime}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Link:</span>
                                        <a 
                                            href={viewNews.youtubeLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            Watch on YouTube
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewNews.title.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewNews.description.en[0]?.value}</p>
                                        </div>
                                    </div>

                                    {/* Tamil */}
                                    <div className="border rounded-lg p-3 bg-orange-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-xs">TA</Badge>
                                            <span className="font-medium text-sm">Tamil</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewNews.title.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewNews.description.ta[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>

                                    {/* Sinhala */}
                                    <div className="border rounded-lg p-3 bg-green-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">SI</Badge>
                                            <span className="font-medium text-sm">Sinhala</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewNews.title.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewNews.description.si[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images and Metadata */}
                            <div className="space-y-6">
                                {/* Images Section */}
                                <div className="bg-white rounded-lg border p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Images
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Main Image</p>
                                            <img 
                                                src={viewNews.image || "/placeholder.svg"} 
                                                alt="Main image"
                                                className="w-full h-40 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Featured YouTube Image</p>
                                            <img 
                                                src={viewNews.featuredYoutubeImage || "/placeholder.svg"} 
                                                alt="Featured YouTube image"
                                                className="w-full h-40 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                            />
                                        </div>
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
                                            <span className="font-medium text-gray-700">Featured</span>
                                            <Badge variant={viewNews.isFeatured ? "default" : "secondary"}>
                                                {viewNews.isFeatured ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700">Status</span>
                                            <Badge variant={viewNews.isActive ? "outline" : "secondary"}>
                                                {viewNews.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700">Created</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewNews.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="font-medium text-gray-700">Last Updated</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewNews.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ViewDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editNews} onOpenChange={(open) => !open && setEditNews(null)}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit YouTube News</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="content" className="space-y-6 mt-6">
                                {/* Title Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Title</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="title-en">English Title</Label>
                                            <Input
                                                id="title-en"
                                                value={editForm.title.en}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, en: e.target.value }
                                                }))}
                                                placeholder="Enter English title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="title-ta">Tamil Title</Label>
                                            <Input
                                                id="title-ta"
                                                value={editForm.title.ta}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, ta: e.target.value }
                                                }))}
                                                placeholder="Enter Tamil title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="title-si">Sinhala Title</Label>
                                            <Input
                                                id="title-si"
                                                value={editForm.title.si}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, si: e.target.value }
                                                }))}
                                                placeholder="Enter Sinhala title"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Description</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="desc-en">English Description</Label>
                                            <Textarea
                                                id="desc-en"
                                                value={editForm.description.en}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, en: e.target.value }
                                                }))}
                                                placeholder="Enter English description"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="desc-ta">Tamil Description</Label>
                                            <Textarea
                                                id="desc-ta"
                                                value={editForm.description.ta}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, ta: e.target.value }
                                                }))}
                                                placeholder="Enter Tamil description"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="desc-si">Sinhala Description</Label>
                                            <Textarea
                                                id="desc-si"
                                                value={editForm.description.si}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, si: e.target.value }
                                                }))}
                                                placeholder="Enter Sinhala description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">YouTube Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="youtube-link">YouTube Link</Label>
                                            <Input
                                                id="youtube-link"
                                                value={editForm.youtubeLink}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    youtubeLink: e.target.value
                                                }))}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="runtime">Runtime</Label>
                                            <Input
                                                id="runtime"
                                                value={editForm.youtubeRunTime}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    youtubeRunTime: e.target.value
                                                }))}
                                                placeholder="e.g., 15 minutes video"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Main Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Main Image</h3>
                                        {editNews?.image && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-gray-600">Current Image</Label>
                                                <img 
                                                    src={editNews.image} 
                                                    alt="Current main image"
                                                    className="w-full h-40 object-cover rounded-lg border mt-1"
                                                />
                                            </div>
                                        )}
                                        {/* Selected file display */}
                                        {editForm.image && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-green-600">New Image Selected</Label>
                                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mt-1">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-green-700">{editForm.image.name}</span>
                                                    <span className="text-xs text-green-600">({(editForm.image.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Label htmlFor="main-image">Upload New Main Image (optional)</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="main-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        image: e.target.files?.[0] || null
                                                    }))}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    onClick={() => document.getElementById('main-image')?.click()}
                                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                                >
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Featured YouTube Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Featured YouTube Image</h3>
                                        {editNews?.featuredYoutubeImage && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-gray-600">Current Featured Image</Label>
                                                <img 
                                                    src={editNews.featuredYoutubeImage} 
                                                    alt="Current featured image"
                                                    className="w-full h-40 object-cover rounded-lg border mt-1"
                                                />
                                            </div>
                                        )}
                                        {/* Selected file display */}
                                        {editForm.featuredYoutubeImage && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-green-600">New Featured Image Selected</Label>
                                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mt-1">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-green-700">{editForm.featuredYoutubeImage.name}</span>
                                                    <span className="text-xs text-green-600">({(editForm.featuredYoutubeImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Label htmlFor="featured-image">Upload New Featured Image (optional)</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="featured-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        featuredYoutubeImage: e.target.files?.[0] || null
                                                    }))}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    onClick={() => document.getElementById('featured-image')?.click()}
                                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                                >
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube Preview */}
                                {editForm.youtubeLink && extractYoutubeVideoId(editForm.youtubeLink) && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">YouTube Video Preview</h3>
                                        <div className="aspect-video max-w-md">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${extractYoutubeVideoId(editForm.youtubeLink)}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full rounded-lg"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6 mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium">Featured</Label>
                                            <p className="text-sm text-gray-600">Mark this news as featured content</p>
                                        </div>
                                        <Switch
                                            checked={editForm.isFeatured}
                                            onCheckedChange={(checked) => setEditForm(prev => ({
                                                ...prev,
                                                isFeatured: checked
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium">Active</Label>
                                            <p className="text-sm text-gray-600">Make this news visible to users</p>
                                        </div>
                                        <Switch
                                            checked={editForm.isActive}
                                            onCheckedChange={(checked) => setEditForm(prev => ({
                                                ...prev,
                                                isActive: checked
                                            }))}
                                        />
                                    </div>

                                    {editNews && (
                                        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                            <h4 className="font-medium">Information</h4>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Created:</span> {formatDate(editNews.createdAt)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Last Updated:</span> {formatDate(editNews.updatedAt)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditNews(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateNews} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update News'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createNews} onOpenChange={(open) => !open && setCreateNews(false)}>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create New YouTube News</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="media">Media</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="content" className="space-y-6 mt-6">
                                {/* Title Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Title</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="create-title-en">English Title *</Label>
                                            <Input
                                                id="create-title-en"
                                                value={createForm.title.en}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, en: e.target.value }
                                                }))}
                                                placeholder="Enter English title"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="create-title-ta">Tamil Title</Label>
                                            <Input
                                                id="create-title-ta"
                                                value={createForm.title.ta}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, ta: e.target.value }
                                                }))}
                                                placeholder="Enter Tamil title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="create-title-si">Sinhala Title</Label>
                                            <Input
                                                id="create-title-si"
                                                value={createForm.title.si}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    title: { ...prev.title, si: e.target.value }
                                                }))}
                                                placeholder="Enter Sinhala title"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Description</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <Label htmlFor="create-desc-en">English Description *</Label>
                                            <Textarea
                                                id="create-desc-en"
                                                value={createForm.description.en}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, en: e.target.value }
                                                }))}
                                                placeholder="Enter English description"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="create-desc-ta">Tamil Description</Label>
                                            <Textarea
                                                id="create-desc-ta"
                                                value={createForm.description.ta}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, ta: e.target.value }
                                                }))}
                                                placeholder="Enter Tamil description"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="create-desc-si">Sinhala Description</Label>
                                            <Textarea
                                                id="create-desc-si"
                                                value={createForm.description.si}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, si: e.target.value }
                                                }))}
                                                placeholder="Enter Sinhala description"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">YouTube Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="create-youtube-link">YouTube Link *</Label>
                                            <Input
                                                id="create-youtube-link"
                                                value={createForm.youtubeLink}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    youtubeLink: e.target.value
                                                }))}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="create-runtime">Runtime</Label>
                                            <Input
                                                id="create-runtime"
                                                value={createForm.youtubeRunTime}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    youtubeRunTime: e.target.value
                                                }))}
                                                placeholder="e.g., 15 minutes video"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Main Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Main Image *</h3>
                                        {/* Selected file display */}
                                        {createForm.image && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-green-600">Image Selected</Label>
                                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mt-1 mb-2">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-green-700">{createForm.image.name}</span>
                                                    <span className="text-xs text-green-600">({(createForm.image.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Label className="text-sm text-gray-600">Preview</Label>
                                                    <img 
                                                        src={URL.createObjectURL(createForm.image)} 
                                                        alt="Main image preview"
                                                        className="w-full h-40 object-cover rounded-lg border mt-1"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Label htmlFor="create-main-image">Upload Main Image</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="create-main-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        image: e.target.files?.[0] || null
                                                    }))}
                                                    className="hidden"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    onClick={() => document.getElementById('create-main-image')?.click()}
                                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                                >
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Featured YouTube Image */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Featured YouTube Image</h3>
                                        {/* Selected file display */}
                                        {createForm.featuredYoutubeImage && (
                                            <div className="mb-4">
                                                <Label className="text-sm text-green-600">Featured Image Selected</Label>
                                                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mt-1 mb-2">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-green-700">{createForm.featuredYoutubeImage.name}</span>
                                                    <span className="text-xs text-green-600">({(createForm.featuredYoutubeImage.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Label className="text-sm text-gray-600">Preview</Label>
                                                    <img 
                                                        src={URL.createObjectURL(createForm.featuredYoutubeImage)} 
                                                        alt="Featured image preview"
                                                        className="w-full h-40 object-cover rounded-lg border mt-1"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Label htmlFor="create-featured-image">Upload Featured Image (optional)</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="create-featured-image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        featuredYoutubeImage: e.target.files?.[0] || null
                                                    }))}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    onClick={() => document.getElementById('create-featured-image')?.click()}
                                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                                >
                                                    Choose File
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube Preview */}
                                {createForm.youtubeLink && extractYoutubeVideoId(createForm.youtubeLink) && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">YouTube Video Preview</h3>
                                        <div className="aspect-video max-w-md">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${extractYoutubeVideoId(createForm.youtubeLink)}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full rounded-lg"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6 mt-6">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium">Featured</Label>
                                            <p className="text-sm text-gray-600">Mark this news as featured content</p>
                                        </div>
                                        <Switch
                                            checked={createForm.isFeatured}
                                            onCheckedChange={(checked) => setCreateForm(prev => ({
                                                ...prev,
                                                isFeatured: checked
                                            }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium">Active</Label>
                                            <p className="text-sm text-gray-600">Make this news visible to users</p>
                                        </div>
                                        <Switch
                                            checked={createForm.isActive}
                                            onCheckedChange={(checked) => setCreateForm(prev => ({
                                                ...prev,
                                                isActive: checked
                                            }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateNews(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateNews} 
                            disabled={isCreating || !createForm.title.en || !createForm.description.en || !createForm.youtubeLink || !createForm.image}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create News'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deleteNews}
                onOpenChange={(open) => !open && setDeleteNews(null)}
                title="Delete YouTube News"
                description={`Are you sure you want to delete "${deleteNews?.title.en[0]?.value}"? This action cannot be undone.`}
                onConfirm={handleDeleteNews}
                loading={isDeleting}
            />
        </div>
    )
}