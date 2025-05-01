"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
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

// Sample data for news articles
type NewsArticle = {
  id: string
  title: string
  category: string
  author: {
    name: string
    avatar?: string
  }
  publishDate: string
  status: "published" | "draft" | "archived"
  views: number
}

const newsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Local Community Celebrates Annual Festival",
    category: "Community",
    author: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-15",
    status: "published",
    views: 1250,
  },
  {
    id: "2",
    title: "New Healthcare Facility Opens in Downtown",
    category: "Health",
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-14",
    status: "published",
    views: 980,
  },
  {
    id: "3",
    title: "Local School Wins National Academic Competition",
    category: "Education",
    author: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-13",
    status: "published",
    views: 1540,
  },
  {
    id: "4",
    title: "Upcoming Changes to Public Transportation Routes",
    category: "Transportation",
    author: {
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-20",
    status: "draft",
    views: 0,
  },
  {
    id: "5",
    title: "City Council Approves New Park Development",
    category: "Government",
    author: {
      name: "Robert Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-10",
    status: "published",
    views: 2150,
  },
  {
    id: "6",
    title: "Local Business Owner Receives Entrepreneurship Award",
    category: "Business",
    author: {
      name: "Jennifer Lee",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-08",
    status: "published",
    views: 1320,
  },
  {
    id: "7",
    title: "Historical Society Unveils New Exhibit",
    category: "Culture",
    author: {
      name: "David Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    publishDate: "2023-05-05",
    status: "archived",
    views: 890,
  },
]

export default function NewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [viewArticle, setViewArticle] = useState<NewsArticle | null>(null)
  const [deleteArticle, setDeleteArticle] = useState<NewsArticle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddArticle = () => {
    router.push("/news/new")
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/news/edit/${articleId}`)
  }

  const handleDeleteArticle = async () => {
    if (!deleteArticle) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Article deleted",
      description: `"${deleteArticle.title}" has been deleted successfully.`,
    })

    setIsDeleting(false)
    setDeleteArticle(null)
  }

  const columns: ColumnDef<NewsArticle>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="max-w-[300px] truncate font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.author.avatar || "/placeholder.svg"} alt={row.original.author.name} />
            <AvatarFallback>{row.original.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{row.original.author.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "publishDate",
      header: "Publish Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        let variant: "default" | "secondary" | "destructive" = "default"

        switch (status) {
          case "published":
            variant = "default"
            break
          case "draft":
            variant = "secondary"
            break
          case "archived":
            variant = "destructive"
            break
        }

        return <Badge variant={variant}>{status}</Badge>
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => <div>{row.original.views.toLocaleString()}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewArticle(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditArticle(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteArticle(row.original)}>
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
        title="News Management"
        description="Create and manage news articles"
        action={{
          label: "Add Article",
          onClick: handleAddArticle,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />
      <DataTable columns={columns} data={newsArticles} searchKey="title" searchPlaceholder="Search articles..." />

      {/* View Article Dialog */}
      <ViewDialog
        open={!!viewArticle}
        onOpenChange={(open) => !open && setViewArticle(null)}
        title={viewArticle?.title || "Article Details"}
      >
        {viewArticle && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                <p>{viewArticle.category}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge
                  variant={
                    viewArticle.status === "published"
                      ? "default"
                      : viewArticle.status === "draft"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {viewArticle.status}
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Author</h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={viewArticle.author.avatar || "/placeholder.svg"} alt={viewArticle.author.name} />
                  <AvatarFallback>{viewArticle.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{viewArticle.author.name}</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Publish Date</h3>
              <p>{viewArticle.publishDate}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Views</h3>
              <p>{viewArticle.views.toLocaleString()}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Content Preview</h3>
              <p className="mt-1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteArticle}
        onOpenChange={(open) => !open && setDeleteArticle(null)}
        title="Delete Article"
        description={`Are you sure you want to delete "${deleteArticle?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteArticle}
        loading={isDeleting}
      />
    </div>
  )
}
