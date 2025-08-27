"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Mic, Loader2 } from "lucide-react"
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
type Podcast = {
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
    creatorName: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    podcastCategory: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    image: string
    podcastLink: string
    podcastRunTime: string
    isDeleted: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type ApiResponse = {
    podcast: Podcast[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

export default function PodcastPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewPodcast, setViewPodcast] = useState<Podcast | null>(null)
    const [deletePodcast, setDeletePodcast] = useState<Podcast | null>(null)
    const [editPodcast, setEditPodcast] = useState<Podcast | null>(null)
    const [createPodcast, setCreatePodcast] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [podcasts, setPodcasts] = useState<Podcast[]>([])
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
        creatorName: {
            en: '',
            ta: '',
            si: ''
        },
        podcastCategory: {
            en: '',
            ta: '',
            si: ''
        },
        podcastLink: '',
        podcastRunTime: '',
        isActive: false,
        image: null as File | null
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
        creatorName: {
            en: '',
            ta: '',
            si: ''
        },
        podcastCategory: {
            en: '',
            ta: '',
            si: ''
        },
        podcastLink: '',
        podcastRunTime: '',
        isActive: true,
        image: null as File | null
    })

    // Fetch podcasts from API
    const fetchPodcasts = async (page: number = 1, limit: number = 10) => {
        setLoading(true)
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/podcast/all?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to fetch podcasts')
            }

            const data: ApiResponse = await response.json()
            setPodcasts(data.podcast)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching podcasts:', error)
            toast({
                title: "Error",
                description: "Failed to fetch podcasts. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    // Load data on component mount
    useEffect(() => {
        fetchPodcasts(pagination.currentPage, pageSize)
    }, [])

    const handlePageChange = (page: number) => {
        fetchPodcasts(page, pageSize)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
        fetchPodcasts(1, newPageSize)
    }

    const handleAddPodcast = () => {
        // Reset create form
        setCreateForm({
            title: { en: '', ta: '', si: '' },
            description: { en: '', ta: '', si: '' },
            creatorName: { en: '', ta: '', si: '' },
            podcastCategory: { en: '', ta: '', si: '' },
            podcastLink: '',
            podcastRunTime: '',
            isActive: true,
            image: null
        })
        setCreatePodcast(true)
    }

    const handleEditPodcast = (podcastId: string) => {
        const podcast = podcasts.find(p => p._id === podcastId)
        if (podcast) {
            setEditPodcast(podcast)
            // Populate form with existing data
            setEditForm({
                title: {
                    en: podcast.title.en[0]?.value || '',
                    ta: podcast.title.ta[0]?.value || '',
                    si: podcast.title.si[0]?.value || ''
                },
                description: {
                    en: podcast.description.en[0]?.value || '',
                    ta: podcast.description.ta[0]?.value || '',
                    si: podcast.description.si[0]?.value || ''
                },
                creatorName: {
                    en: podcast.creatorName.en[0]?.value || '',
                    ta: podcast.creatorName.ta[0]?.value || '',
                    si: podcast.creatorName.si[0]?.value || ''
                },
                podcastCategory: {
                    en: podcast.podcastCategory.en[0]?.value || '',
                    ta: podcast.podcastCategory.ta[0]?.value || '',
                    si: podcast.podcastCategory.si[0]?.value || ''
                },
                podcastLink: podcast.podcastLink.replace(/"/g, '') || '',
                podcastRunTime: podcast.podcastRunTime.replace(/"/g, '') || '',
                isActive: podcast.isActive,
                image: null
            })
        }
    }

    const handleDeletePodcast = async () => {
        if (!deletePodcast) return
        setIsDeleting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/podcast/${deletePodcast._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
            })
            if (!response.ok) {
                throw new Error('Failed to delete podcast')
            }
            toast({
                title: "Podcast deleted",
                description: `"${deletePodcast.title.en[0]?.value}" has been deleted successfully.`,
            })
            // Refresh the list
            fetchPodcasts(pagination.currentPage, pageSize)
        } catch (error) {
            console.error('Error deleting podcast:', error)
            toast({
                title: "Error",
                description: "Failed to delete podcast. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setDeletePodcast(null)
        }
    }

    const handleUpdatePodcast = async () => {
        if (!editPodcast) return
        
        setIsUpdating(true)
        
        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            
            // Add podcastId
            formData.append('podcastId', editPodcast._id)
            
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
            
            // Add creatorName object
            const creatorNameObject = {
                en: [{ name: "Creator Name", value: editForm.creatorName.en }],
                ta: [{ name: "படைப்பாளர் பெயர்", value: editForm.creatorName.ta }],
                si: [{ name: "නිර්මාතෘ නම", value: editForm.creatorName.si }]
            }
            formData.append('creatorName', JSON.stringify(creatorNameObject))
            
            // Add podcastCategory object
            const podcastCategoryObject = {
                en: [{ name: "Category", value: editForm.podcastCategory.en }],
                ta: [{ name: "வகை", value: editForm.podcastCategory.ta }],
                si: [{ name: "වර්ගය", value: editForm.podcastCategory.si }]
            }
            formData.append('podcastCategory', JSON.stringify(podcastCategoryObject))
            
            // Add other fields
            formData.append('podcastLink', `"${editForm.podcastLink}"`)
            formData.append('podcastRunTime', `"${editForm.podcastRunTime}"`)
            formData.append('isActive', editForm.isActive.toString())
            
            // Add image if selected
            if (editForm.image) {
                formData.append('image', editForm.image)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/podcast/update`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update podcast')
            }
            
            const result = await response.json()
            
            toast({
                title: "Podcast updated",
                description: `"${editForm.title.en}" has been updated successfully.`,
            })
            
            // Refresh the list and close modal
            fetchPodcasts(pagination.currentPage, pageSize)
            setEditPodcast(null)
            
        } catch (error) {
            console.error('Error updating podcast:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update podcast. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCreatePodcast = async () => {
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
                ta: [{ name: "விவரণம்", value: createForm.description.ta }],
                si: [{ name: "විස්තරය", value: createForm.description.si }]
            }
            formData.append('description', JSON.stringify(descriptionObject))
            
            // Add creatorName object
            const creatorNameObject = {
                en: [{ name: "Creator Name", value: createForm.creatorName.en }],
                ta: [{ name: "படைப்பாளர் பெயர்", value: createForm.creatorName.ta }],
                si: [{ name: "නිර්මාතෘ නම", value: createForm.creatorName.si }]
            }
            formData.append('creatorName', JSON.stringify(creatorNameObject))
            
            // Add podcastCategory object
            const podcastCategoryObject = {
                en: [{ name: "Category", value: createForm.podcastCategory.en }],
                ta: [{ name: "வகை", value: createForm.podcastCategory.ta }],
                si: [{ name: "වර්ගය", value: createForm.podcastCategory.si }]
            }
            formData.append('podcastCategory', JSON.stringify(podcastCategoryObject))
            
            // Add other fields
            formData.append('podcastLink', `"${createForm.podcastLink}"`)
            formData.append('podcastRunTime', `"${createForm.podcastRunTime}"`)
            formData.append('isActive', createForm.isActive.toString())
            
            // Add image if selected
            if (createForm.image) {
                formData.append('image', createForm.image)
            }
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/podcast`, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                body: formData,
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create podcast')
            }
            
            const result = await response.json()
            
            toast({
                title: "Podcast created",
                description: `"${createForm.title.en}" has been created successfully.`,
            })
            
            // Refresh the list and close modal
            fetchPodcasts(pagination.currentPage, pageSize)
            setCreatePodcast(false)
            
        } catch (error) {
            console.error('Error creating podcast:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create podcast. Please try again.",
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

    const getStatusBadge = (podcast: Podcast) => {
        return (
            <div className="flex gap-1">
                {podcast.isActive ? (
                    <Badge variant="outline">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                )}
            </div>
        )
    }

    const extractYoutubeVideoId = (url: string) => {
        // Remove quotes if present
        const cleanUrl = url.replace(/"/g, '')
        const match = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match ? match[1] : null
    }

    const uniqueCategories = Array.from(new Set(podcasts.map((podcast) => podcast.podcastCategory?.en?.[0]?.value || 'Unknown'))).map((category) => ({
        label: category,
        value: category,
    }))

    const columns: ColumnDef<Podcast>[] = [
        {
            id: "title",
            accessorFn: (row) => row.title.en[0]?.value || 'Untitled',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.image || "/placeholder.svg"} alt={row.original.title.en[0]?.value} />
                        <AvatarFallback>{row.original.title.en[0]?.value?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium max-w-[200px] truncate">{row.original.title.en[0]?.value || 'Untitled'}</div>
                </div>
            ),
        },
        {
            id: "creator",
            accessorFn: (row) => row.creatorName.en[0]?.value || 'Unknown Creator',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Creator" type="text" />,
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.original.creatorName.en[0]?.value || 'Unknown Creator'}</div>,
        },
        {
            id: "category",
            accessorFn: (row) => row.podcastCategory?.en?.[0]?.value || 'Unknown',
            header: ({ column }) => (
                <div className="flex items-center space-x-2">
                    <DataTableColumnHeader column={column} title="Category" type="text" />
                    <DataTableFacetedFilter column={column} title="Category" options={uniqueCategories} />
                </div>
            ),
            cell: ({ row }) => <div>{row.original.podcastCategory?.en?.[0]?.value || 'Unknown'}</div>,
        },
        {
            id: "podcastLink",
            accessorFn: (row) => row.podcastLink,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Podcast Link" type="text" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-600" />
                    <a 
                        href={row.original.podcastLink.replace(/"/g, '')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-[150px] truncate"
                    >
                        Listen to Podcast
                    </a>
                </div>
            ),
        },
        {
            id: "runtime",
            accessorFn: (row) => row.podcastRunTime,
            header: ({ column }) => <DataTableColumnHeader column={column} title="Runtime" type="text" />,
            cell: ({ row }) => <div>{row.original.podcastRunTime.replace(/"/g, '') || 'N/A'}</div>,
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
                    <Button variant="ghost" size="icon" onClick={() => setViewPodcast(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPodcast(row.original._id)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletePodcast(row.original)}>
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
                title="Podcasts"
                description="Manage podcast content"
                action={{
                    label: "Add Podcast",
                    onClick: handleAddPodcast,
                    icon: <Plus className="mr-2 h-4 w-4" />,
                }}
            />

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading podcasts...</span>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={podcasts}
                    searchKey="title"
                    searchPlaceholder="Search podcasts..."
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSize={pageSize}
                />
            )}

            <ViewDialog
                open={!!viewPodcast}
                onOpenChange={(open) => !open && setViewPodcast(null)}
                title={viewPodcast?.title.en[0]?.value || "Podcast Details"}
                className="max-w-6xl w-[95vw] max-h-[90vh]"
            >
                {viewPodcast && (
                    <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                        {/* Header Section with Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{viewPodcast.title.en[0]?.value}</h2>
                                <p className="text-sm text-gray-600">{viewPodcast.description.en[0]?.value}</p>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge(viewPodcast)}
                            </div>
                        </div>

                        {/* Podcast Audio/Video Section */}
                        {viewPodcast.podcastLink && extractYoutubeVideoId(viewPodcast.podcastLink) && (
                            <div className="bg-white rounded-lg border p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Mic className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold">Podcast Audio/Video</h3>
                                </div>
                                <div className="aspect-video mb-4">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYoutubeVideoId(viewPodcast.podcastLink)}`}
                                        title="Podcast player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full rounded-lg shadow-md"
                                    ></iframe>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Runtime:</span>
                                        <Badge variant="outline">{viewPodcast.podcastRunTime.replace(/"/g, '')}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Link:</span>
                                        <a 
                                            href={viewPodcast.podcastLink.replace(/"/g, '')} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            Listen to Podcast
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
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewPodcast.title.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewPodcast.description.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Creator:</span> {viewPodcast.creatorName.en[0]?.value}</p>
                                            <p><span className="font-medium text-gray-700">Category:</span> {viewPodcast.podcastCategory.en[0]?.value}</p>
                                        </div>
                                    </div>

                                    {/* Tamil */}
                                    <div className="border rounded-lg p-3 bg-orange-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="secondary" className="text-xs">TA</Badge>
                                            <span className="font-medium text-sm">Tamil</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewPodcast.title.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewPodcast.description.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Creator:</span> {viewPodcast.creatorName.ta[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Category:</span> {viewPodcast.podcastCategory.ta[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>

                                    {/* Sinhala */}
                                    <div className="border rounded-lg p-3 bg-green-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">SI</Badge>
                                            <span className="font-medium text-sm">Sinhala</span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-medium text-gray-700">Title:</span> {viewPodcast.title.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Description:</span> {viewPodcast.description.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Creator:</span> {viewPodcast.creatorName.si[0]?.value || 'Not available'}</p>
                                            <p><span className="font-medium text-gray-700">Category:</span> {viewPodcast.podcastCategory.si[0]?.value || 'Not available'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images and Metadata */}
                            <div className="space-y-6">
                                {/* Image Section */}
                                <div className="bg-white rounded-lg border p-4 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Podcast Image
                                    </h3>
                                    <div>
                                        <img 
                                            src={viewPodcast.image || "/placeholder.svg"} 
                                            alt="Podcast cover"
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
                                            <Badge variant={viewPodcast.isActive ? "outline" : "secondary"}>
                                                {viewPodcast.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="font-medium text-gray-700">Created</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewPodcast.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="font-medium text-gray-700">Last Updated</span>
                                            <span className="text-sm text-gray-600">{formatDate(viewPodcast.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ViewDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editPodcast} onOpenChange={(open) => !open && setEditPodcast(null)}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Edit Podcast</DialogTitle>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title-en">Title *</Label>
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
                                            <div className="space-y-2">
                                                <Label htmlFor="creator-en">Creator Name *</Label>
                                                <Input
                                                    id="creator-en"
                                                    value={editForm.creatorName.en}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter creator name"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category-en">Category *</Label>
                                                <Input
                                                    id="category-en"
                                                    value={editForm.podcastCategory.en}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter podcast category"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description-en">Description *</Label>
                                            <Textarea
                                                id="description-en"
                                                value={editForm.description.en}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, en: e.target.value }
                                                }))}
                                                placeholder="Enter English description"
                                                rows={3}
                                            />
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title-ta">Title</Label>
                                                <Input
                                                    id="title-ta"
                                                    value={editForm.title.ta}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        title: { ...prev.title, ta: e.target.value }
                                                    }))}
                                                    placeholder="தமிழ் தலைப்பு"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="creator-ta">Creator Name</Label>
                                                <Input
                                                    id="creator-ta"
                                                    value={editForm.creatorName.ta}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, ta: e.target.value }
                                                    }))}
                                                    placeholder="படைப்பாளர் பெயர்"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category-ta">Category</Label>
                                                <Input
                                                    id="category-ta"
                                                    value={editForm.podcastCategory.ta}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, ta: e.target.value }
                                                    }))}
                                                    placeholder="வகை"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description-ta">Description</Label>
                                            <Textarea
                                                id="description-ta"
                                                value={editForm.description.ta}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, ta: e.target.value }
                                                }))}
                                                placeholder="தமிழ் விவரணம்"
                                                rows={3}
                                            />
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title-si">Title</Label>
                                                <Input
                                                    id="title-si"
                                                    value={editForm.title.si}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        title: { ...prev.title, si: e.target.value }
                                                    }))}
                                                    placeholder="සිංහල සිරැස්තලය"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="creator-si">Creator Name</Label>
                                                <Input
                                                    id="creator-si"
                                                    value={editForm.creatorName.si}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, si: e.target.value }
                                                    }))}
                                                    placeholder="නිර්මාතෘ නම"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category-si">Category</Label>
                                                <Input
                                                    id="category-si"
                                                    value={editForm.podcastCategory.si}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, si: e.target.value }
                                                    }))}
                                                    placeholder="වර්ගය"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description-si">Description</Label>
                                            <Textarea
                                                id="description-si"
                                                value={editForm.description.si}
                                                onChange={(e) => setEditForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, si: e.target.value }
                                                }))}
                                                placeholder="සිංහල විස්තරය"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                {/* Podcast Link and Runtime */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Podcast Details</CardTitle>
                                        <CardDescription>
                                            Add podcast link and runtime information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="podcast-link">Podcast Link *</Label>
                                            <Input
                                                id="podcast-link"
                                                type="url"
                                                value={editForm.podcastLink}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, podcastLink: e.target.value }))}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="podcast-runtime">Runtime *</Label>
                                            <Input
                                                id="podcast-runtime"
                                                value={editForm.podcastRunTime}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, podcastRunTime: e.target.value }))}
                                                placeholder="e.g., 15 minutes"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Podcast Cover Image</CardTitle>
                                        <CardDescription>
                                            Upload a cover image for the podcast (optional)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Current Image Display */}
                                            {editPodcast?.image && !editForm.image && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Image</Label>
                                                    <div className="relative">
                                                        <img
                                                            src={editPodcast.image}
                                                            alt="Current podcast cover"
                                                            className="w-32 h-32 object-cover rounded-lg border"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="grid w-full items-center gap-2">
                                                <Label htmlFor="image-upload" className="text-sm font-medium">
                                                    {editPodcast?.image ? "Replace Image" : "Choose Image"}
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
                                        <CardTitle>Podcast Settings</CardTitle>
                                        <CardDescription>
                                            Configure podcast visibility and status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is-active">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this podcast visible to users
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
                        <Button variant="outline" onClick={() => setEditPodcast(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePodcast} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Podcast'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createPodcast} onOpenChange={(open) => !open && setCreatePodcast(false)}>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create New Podcast</DialogTitle>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-title-en">Title *</Label>
                                                <Input
                                                    id="create-title-en"
                                                    value={createForm.title.en}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        title: { ...prev.title, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter English title"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-creator-en">Creator Name *</Label>
                                                <Input
                                                    id="create-creator-en"
                                                    value={createForm.creatorName.en}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter creator name"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-category-en">Category *</Label>
                                                <Input
                                                    id="create-category-en"
                                                    value={createForm.podcastCategory.en}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, en: e.target.value }
                                                    }))}
                                                    placeholder="Enter podcast category"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-description-en">Description *</Label>
                                            <Textarea
                                                id="create-description-en"
                                                value={createForm.description.en}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, en: e.target.value }
                                                }))}
                                                placeholder="Enter English description"
                                                rows={3}
                                            />
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-title-ta">Title</Label>
                                                <Input
                                                    id="create-title-ta"
                                                    value={createForm.title.ta}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        title: { ...prev.title, ta: e.target.value }
                                                    }))}
                                                    placeholder="தமிழ் தலைப்பு"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-creator-ta">Creator Name</Label>
                                                <Input
                                                    id="create-creator-ta"
                                                    value={createForm.creatorName.ta}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, ta: e.target.value }
                                                    }))}
                                                    placeholder="படைப்பாளர் பெயர்"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-category-ta">Category</Label>
                                                <Input
                                                    id="create-category-ta"
                                                    value={createForm.podcastCategory.ta}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, ta: e.target.value }
                                                    }))}
                                                    placeholder="வகை"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-description-ta">Description</Label>
                                            <Textarea
                                                id="create-description-ta"
                                                value={createForm.description.ta}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, ta: e.target.value }
                                                }))}
                                                placeholder="தமிழ் விவரணம்"
                                                rows={3}
                                            />
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-title-si">Title</Label>
                                                <Input
                                                    id="create-title-si"
                                                    value={createForm.title.si}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        title: { ...prev.title, si: e.target.value }
                                                    }))}
                                                    placeholder="සිංහල සිරැස්තලය"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="create-creator-si">Creator Name</Label>
                                                <Input
                                                    id="create-creator-si"
                                                    value={createForm.creatorName.si}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        creatorName: { ...prev.creatorName, si: e.target.value }
                                                    }))}
                                                    placeholder="නිර්මාතෘ නම"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="create-category-si">Category</Label>
                                                <Input
                                                    id="create-category-si"
                                                    value={createForm.podcastCategory.si}
                                                    onChange={(e) => setCreateForm(prev => ({
                                                        ...prev,
                                                        podcastCategory: { ...prev.podcastCategory, si: e.target.value }
                                                    }))}
                                                    placeholder="වර්ගය"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-description-si">Description</Label>
                                            <Textarea
                                                id="create-description-si"
                                                value={createForm.description.si}
                                                onChange={(e) => setCreateForm(prev => ({
                                                    ...prev,
                                                    description: { ...prev.description, si: e.target.value }
                                                }))}
                                                placeholder="සිංහල විස්තරය"
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="media" className="space-y-6 mt-6">
                                {/* Podcast Link and Runtime */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Podcast Details</CardTitle>
                                        <CardDescription>
                                            Add podcast link and runtime information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="create-podcast-link">Podcast Link *</Label>
                                            <Input
                                                id="create-podcast-link"
                                                type="url"
                                                value={createForm.podcastLink}
                                                onChange={(e) => setCreateForm(prev => ({ ...prev, podcastLink: e.target.value }))}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="create-podcast-runtime">Runtime *</Label>
                                            <Input
                                                id="create-podcast-runtime"
                                                value={createForm.podcastRunTime}
                                                onChange={(e) => setCreateForm(prev => ({ ...prev, podcastRunTime: e.target.value }))}
                                                placeholder="e.g., 15 minutes"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Image Upload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Podcast Cover Image</CardTitle>
                                        <CardDescription>
                                            Upload a cover image for the podcast *
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
                                        <CardTitle>Podcast Settings</CardTitle>
                                        <CardDescription>
                                            Configure podcast visibility and status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="create-is-active">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this podcast visible to users
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
                        <Button variant="outline" onClick={() => setCreatePodcast(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreatePodcast} 
                            disabled={isCreating || !createForm.title.en || !createForm.description.en || !createForm.creatorName.en || !createForm.podcastCategory.en || !createForm.podcastLink || !createForm.image}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Podcast'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!deletePodcast}
                onOpenChange={(open) => !open && setDeletePodcast(null)}
                title="Delete Podcast"
                description={`Are you sure you want to delete "${deletePodcast?.title.en[0]?.value}"? This action cannot be undone.`}
                onConfirm={handleDeletePodcast}
                loading={isDeleting}
            />
        </div>
    )
}