"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2, Calendar } from "lucide-react"
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

// Sample data for obituary posts
type ObituaryPost = {
    id: string
    name: string
    title: string
    package: {
        id: string
        name: string
    }
    expiryDate: string
    status: "active" | "expired" | "pending" | "rejected"
    description: string
    image: string
    dateOfBirth: string
    dateOfDeath: string
    createdAt: string
    updatedAt: string
}

const obituaryPosts: ObituaryPost[] = [
    {
        id: "1",
        name: "James Wilson",
        title: "In Loving Memory of James Wilson",
        package: {
            id: "1",
            name: "Premium",
        },
        expiryDate: "2023-12-15",
        status: "active",
        description:
            "James Wilson was a beloved father, husband, and community leader who touched many lives with his kindness and generosity.",
        image: "/placeholder.svg?height=200&width=200",
        dateOfBirth: "1945-03-10",
        dateOfDeath: "2023-05-15",
        createdAt: "2023-05-16",
        updatedAt: "2023-05-16",
    },
    {
        id: "2",
        name: "Mary Johnson",
        title: "Remembering Mary Johnson",
        package: {
            id: "2",
            name: "Standard",
        },
        expiryDate: "2023-11-14",
        status: "active",
        description:
            "Mary Johnson dedicated her life to education and helping others. She will be deeply missed by her students and colleagues.",
        image: "/placeholder.svg?height=200&width=200",
        dateOfBirth: "1950-07-22",
        dateOfDeath: "2023-05-14",
        createdAt: "2023-05-15",
        updatedAt: "2023-05-15",
    },
    {
        id: "3",
        name: "David Brown",
        title: "Celebrating the Life of David Brown",
        package: {
            id: "1",
            name: "Premium",
        },
        expiryDate: "2023-10-13",
        status: "expired",
        description:
            "David Brown was known for his entrepreneurial spirit and commitment to his family. His legacy will continue through his charitable foundation.",
        image: "/placeholder.svg?height=200&width=200",
        dateOfBirth: "1938-11-05",
        dateOfDeath: "2023-05-13",
        createdAt: "2023-05-14",
        updatedAt: "2023-05-14",
    },
    {
        id: "4",
        name: "Sarah Miller",
        title: "In Memory of Sarah Miller",
        package: {
            id: "3",
            name: "Basic",
        },
        expiryDate: "2023-09-12",
        status: "pending",
        description:
            "Sarah Miller brought joy to everyone she met. Her passion for music and art inspired many in the community.",
        image: "/placeholder.svg?height=200&width=200",
        dateOfBirth: "1962-04-18",
        dateOfDeath: "2023-05-12",
        createdAt: "2023-05-13",
        updatedAt: "2023-05-13",
    },
    {
        id: "5",
        name: "Thomas Davis",
        title: "Honoring Thomas Davis",
        package: {
            id: "2",
            name: "Standard",
        },
        expiryDate: "2023-08-11",
        status: "rejected",
        description:
            "Thomas Davis served his country with honor and distinction. He was a loving father and grandfather who valued family above all else.",
        image: "/placeholder.svg?height=200&width=200",
        dateOfBirth: "1940-09-30",
        dateOfDeath: "2023-05-11",
        createdAt: "2023-05-12",
        updatedAt: "2023-05-12",
    },
]

export default function ObituaryPostsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [viewPost, setViewPost] = useState<ObituaryPost | null>(null)
    const [deletePost, setDeletePost] = useState<ObituaryPost | null>(null)
    const [statusPost, setStatusPost] = useState<ObituaryPost | null>(null)
    const [newStatus, setNewStatus] = useState<string>("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const handleAddPost = () => {
        router.push("/obituary/posts/new")
    }

    const handleEditPost = (postId: string) => {
        router.push(`/obituary/posts/edit/${postId}`)
    }

    const handleDeletePost = async () => {
        if (!deletePost) return

        setIsDeleting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
            title: "Obituary post deleted",
            description: `"${deletePost.name}" has been deleted successfully.`,
        })

        setIsDeleting(false)
        setDeletePost(null)
    }

    const handleOpenStatusChange = (post: ObituaryPost) => {
        setStatusPost(post)
        setNewStatus(post.status)
    }

    const handleStatusChange = async () => {
        if (!statusPost || !newStatus) return

        setIsUpdatingStatus(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        toast({
            title: "Status updated",
            description: `Status for "${statusPost.name}" has been updated to ${newStatus}.`,
        })

        setIsUpdatingStatus(false)
        setStatusPost(null)
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "PPP")
        } catch (error) {
            return dateString
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default">Active</Badge>
            case "expired":
                return <Badge variant="secondary">Expired</Badge>
            case "pending":
                return <Badge variant="outline">Pending</Badge>
            case "rejected":
                return <Badge variant="destructive">Rejected</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const columns: ColumnDef<ObituaryPost>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.image || "/placeholder.svg"} alt={row.original.name} />
                        <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{row.original.name}</div>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.title}</div>,
        },
        {
            accessorKey: "package.name",
            header: "Package",
        },
        {
            accessorKey: "expiryDate",
            header: "Expiry Date",
            cell: ({ row }) => <div>{formatDate(row.original.expiryDate)}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="cursor-pointer" onClick={() => handleOpenStatusChange(row.original)}>
                    {getStatusBadge(row.original.status)}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setViewPost(row.original)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditPost(row.original.id)}>
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

            <DataTable columns={columns} data={obituaryPosts} searchKey="name" searchPlaceholder="Search posts..." />

            {/* View Post Dialog */}
            <ViewDialog
                open={!!viewPost}
                onOpenChange={(open) => !open && setViewPost(null)}
                title={viewPost?.title || "Obituary Details"}
            >
                {viewPost && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <div
                                className="bg-gray-100 md:p-10 p-4"
                            >
                                <div
                                    className="bg-white w-full  shadow-md"
                                >
                                    <div className="pt-4 pb-2 text-center max-w-lg mx-auto px-4">
                                        <h1 className="text-xl font-bold text-primary mb-6">
                                            31st day ceremony after death
                                        </h1>

                                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
                                            <div className="text-gray-500  text-center flex md:flex-col">
                                                <p>Birth<span className="md:hidden mr-1 ml-1">:</span></p>
                                                <p>Birth date</p>
                                            </div>

                                            <img
                                                alt="Portrait of Mr. Nadesh Rasathurai"
                                                className="w-40 sm:w-60 shadow-md aspect-square object-cover mx-auto sm:mx-4"
                                                src="https://storage.googleapis.com/a1aa/image/Gq3Jh_7GVg1_qc9JxqqNf8LZ7c-13gEQYfPNoQDiPVc.jpg"
                                            />

                                            <div className="text-gray-500  text-center flex md:flex-col">
                                                <p>Death<span className="md:hidden mr-1 ml-1">:</span></p>
                                                <p>Death date</p>
                                            </div>
                                        </div>

                                        <p className="text-[#880002] font-medium">
                                            Mr. Nadesh Rasathurai
                                        </p>
                                    </div>

                                </div>
                            </div>
                            <p className="text-justify mt-4">
                                Lorem ipsum dolor sit amet consectetur. Vestibulum ut sodales quisque nibh est. Diam natoque scelerisque netus tellus. Est mus potenti dictum augue. Fringilla scelerisque sed ultricies dignissim nisi integer adipiscing. Convallis facilisis adipiscing odio ac. Pharetra vitae ultricies sit vel. Massa purus nibh auctor eros sollicitudin sollicitudin pharetra tristique. Arcu accumsan consectetur lobortis ut vel pellentesque quis libero nullam.
                                Sed in viverra risus eros non nisl elit adipiscing praesent. Amet vel turpis et dis eget. Vel lectus tincidunt et mattis etiam.
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
                                    Contacts
                                </div>
                                <div className="bg-white p-6 shadow-md mb-4 flex  md:flex-row flex-col justify-between md:items-center">
                                    <div>
                                        <p className="text-[#880002]">Mr. Nadesh Rasathurai</p>
                                        <p>no2. masdd,</p>
                                        <p>sddd, sdsdddfd</p>
                                        <p>Son</p>
                                    </div>
                                    <button className="mb-0 gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                        Request to Contact
                                    </button>
                                </div>
                                <div className="bg-white p-6 shadow-md mb-4 flex  md:flex-row flex-col justify-between md:items-center">
                                    <div>
                                        <p className="text-[#880002]">Mr. Nadesh Rasathurai</p>
                                        <p>no2. masdd,</p>
                                        <p>sddd, sdsdddfd</p>
                                        <p>Son</p>
                                    </div>
                                    <button className="mb-0 gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                        Request to Contact
                                    </button>
                                </div>
                                <div className="bg-white p-6 shadow-md mb-4 flex  md:flex-row flex-col justify-between md:items-center">
                                    <div>
                                        <p className="text-[#880002]">Mr. Nadesh Rasathurai</p>
                                        <p>no2. masdd,</p>
                                        <p>sddd, sdsdddfd</p>
                                        <p>Son</p>
                                    </div>
                                    <button className="mb-0 gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                        Request to Contact
                                    </button>
                                </div>
                            </div>
                        </div>



                        {/* Right side advertisement section - 1/3 width on desktop */}
                        <div className="md:col-span-1">
                            <div className="bg-white p-2 shadow-md">
                                <div className="flex-shrink min-w-0 max-w-full mt-2">
                                    Overview
                                </div>
                                <div className="space-y-2 mt-2 p-2">
                                    <p className="text-[#880002]">Mr. Nadesh Rasathurai</p>
                                    <p className="text-gray-500">Birth Date</p>
                                    <p className="text-gray-500">Death Date</p>
                                    <p>Age</p>
                                    <p>no2. masdd,sddd, sdsdddfd</p>
                                    <p>Funeral Date</p>
                                </div>
                                <div className="flex-shrink min-w-0 max-w-full mt-4">
                                    Poster's Information
                                </div>
                                <div className="space-y-2 mt-2 p-2">
                                    <p className="text-[#880002]">Mr. Nadesh Rasathurai</p>
                                    <p>no2. masdd,sddd, sdsdddfd</p>
                                </div>
                                <button className="w-full gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                    Request to Contact
                                </button>
                                <div className="flex-shrink min-w-0 max-w-full mt-8 mb-6">
                                    Pictures
                                </div>
                                <div className="p-2">
                                    <div className="bg-white p-2 shadow-md ">
                                        <div className="grid grid-cols-[3fr_2fr] gap-2 pb-4">
                                            <img
                                                alt="Portrait of Mr. Nadesh Rasathurai"
                                                className="w-full row-span-2 shadow-md h-full object-cover"
                                                src="https://storage.googleapis.com/a1aa/image/Gq3Jh_7GVg1_qc9JxqqNf8LZ7c-13gEQYfPNoQDiPVc.jpg"
                                            />
                                            <img
                                                alt="Portrait of Mr. Nadesh Rasathurai"
                                                className="w-full shadow-md aspect-square object-cover"
                                                src="https://storage.googleapis.com/a1aa/image/Gq3Jh_7GVg1_qc9JxqqNf8LZ7c-13gEQYfPNoQDiPVc.jpg"
                                            />
                                            <img
                                                alt="Portrait of Mr. Nadesh Rasathurai"
                                                className="w-full shadow-md aspect-square object-cover"
                                                src="https://storage.googleapis.com/a1aa/image/Gq3Jh_7GVg1_qc9JxqqNf8LZ7c-13gEQYfPNoQDiPVc.jpg"
                                            />
                                        </div>

                                        <button className="w-full gap-2.5 self-stretch px-4 py-3 my-auto text-white whitespace-nowrap bg-[#0B4157] rounded min-h-6 shadow-[0px_4px_8px_rgba(0,0,0,0.25)]">
                                            Request to Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                )}
            </ViewDialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deletePost}
                onOpenChange={(open) => !open && setDeletePost(null)}
                title="Delete Obituary Post"
                description={`Are you sure you want to delete the obituary post for "${deletePost?.name}"? This action cannot be undone.`}
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
                            <Label htmlFor="status">Status for {statusPost?.name}</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
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
        </div>
    )
}
