"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Pencil, Trash2, Star, AlertTriangle } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { title } from "process"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import useSWR from "swr"
import { useRef } from "react"

// type NewsCategory = {
//   id: string
//   name: {
//     en: { name: string; value: string }[]
//     ta: { name: string; value: string }[]
//     si: { name: string; value: string }[]
//   }
//   isDeleted: boolean
// }

type News = {
  id: string
  title: {
    en: { name: string; value: string }[]
    ta: { name: string; value: string }[]
    si: { name: string; value: string }[]
  }
  description: {
    en: { name: string; value: string }[]
    ta: { name: string; value: string }[]
    si: { name: string; value: string }[]
  }
  thumbnailImage: string
  mainImage: string
  otherImages: string[]
  paragraphs: {
    en: { name: string; value: string }[]
    ta: { name: string; value: string }[]
    si: { name: string; value: string }[]
  }[]
  editorName: {
    en: { name: string; value: string }[]
    ta: { name: string; value: string }[]
    si: { name: string; value: string }[]
  }
  newsCategory: string
  isBreakingNews: boolean
  isImportantNews: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// const newsCategories: NewsCategory[] = [
//   {
//     id: "1",
//     name: {
//       en: [{ name: "name", value: "Community" }],
//       ta: [{ name: "name", value: "சமூகம்" }],
//       si: [{ name: "name", value: "ප්‍රජාව" }],
//     },
//     isDeleted: false,
//   },
//   {
//     id: "2",
//     name: {
//       en: [{ name: "name", value: "Health" }],
//       ta: [{ name: "name", value: "சுகாதாரம்" }],
//       si: [{ name: "name", value: "සෞඛ්‍ය" }],
//     },
//     isDeleted: false,
//   },
//   {
//     id: "3",
//     name: {
//       en: [{ name: "name", value: "Education" }],
//       ta: [{ name: "name", value: "கல்வி" }],
//       si: [{ name: "name", value: "අධ්‍යාපනය" }],
//     },
//     isDeleted: false,
//   },
// ]

const fetcher = async (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json().then((json) => ({
    ...json,
    news: json.news.map((article: any) => ({
      ...article,
      id: article._id,
      title: {
        en: article.title.en,
        ta: article.title.ta,
        si: article.title.si,
      },
      description: {
        en: article.description.en,
        ta: article.description.ta,
        si: article.description.si,
      },
      editorName: {
        en: article.editorName.en,
        ta: article.editorName.ta,
        si: article.editorName.si,
      },
      newsCategory: article.newsCategory,
      paragraphs: article.paragraphs,
      thumbnailImage: article.thumbnailImage,
      mainImage: article.mainImage,
      otherImages: article.otherImages,
      isBreakingNews: article.isBreakingNews,
      isImportantNews: article.isImportantNews,
      isDeleted: article.isDeleted,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    })),
  }))
}

export default function NewsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language, t } = useLanguage()
  const [viewArticle, setViewArticle] = useState<News | null>(null)
  const [deleteArticle, setDeleteArticle] = useState<News | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [categoryMap, setCategoryMap] = useState<Record<string, any>>({})

  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/news/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  // Fetch categories for all news items
  useEffect(() => {
    if (!data?.news) return
    const uniqueCategoryIds: string[] = Array.from(new Set(data.news.map((n: News) => n.newsCategory).filter(Boolean)))
    const fetchCategories = async () => {
      const map: Record<string, any> = {}
      await Promise.all(
        uniqueCategoryIds.map(async (catId: string) => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/news-category/${catId}`)
            if (res.ok) {
              const cat = await res.json()
              map[catId] = cat
            }
          } catch { }
        })
      )
      setCategoryMap(map)
    }
    fetchCategories()
  }, [data?.news])

  const handleAddArticle = () => {
    router.push("/news/new")
  }

  const handleEditArticle = (articleId: string) => {
    router.push(`/news/edit/${articleId}`)
  }

  const handleDeleteArticle = async () => {
    if (!deleteArticle) return

    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news/${deleteArticle.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      toast({
        title: "Article deleted",
        description: `"${getLocalizedValue(deleteArticle.title, language)}" has been deleted successfully.`,
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting the article.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteArticle(null)
    }
  }

  const getLocalizedValue = (
    field:
      | {
        en: { name: string; value: string }[]
        ta: { name: string; value: string }[]
        si: { name: string; value: string }[]
      }
      | undefined,
    lang: string,
  ) => {
    if (!field) return ""
    const langField = field[lang as keyof typeof field] || field.en
    if (!langField || langField.length === 0) return ""
    return langField[0].value || ""
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return dateString
    }
  }

  const columns: ColumnDef<News>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" type="text" />,
      cell: ({ row }) => (
        <div className="font-medium max-w-[500px] truncate">
          {row.original.title.en[0].value}
        </div>
      ),
      filterFn: (row, id, value) => {
        const title = row.original.title
        const search = value.toLowerCase()
        return (
          title.en.some((t: any) => t.value.toLowerCase().includes(search)) ||
          title.ta.some((t: any) => t.value.toLowerCase().includes(search)) ||
          title.si.some((t: any) => t.value.toLowerCase().includes(search))
        )
      },
    },
    {
      accessorKey: "newsCategory",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" type="text" />,
      cell: ({ row }) => {
        const cat = categoryMap[row.original.newsCategory]
        return (
          <span>
            {cat ? cat.name.en[0].value : row.original.newsCategory}
          </span>
        )
      },
    },
    {
      accessorKey: "editorName",
      // accessorFn: (row) => getLocalizedValue(row.editorName, language),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Editor" type="text" />,
      cell: ({ row }) => <div className="font-medium max-w-[500px] truncate">{row.original.editorName.en[0].value}</div>,

    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" type="date" />,
      cell: ({ row }) => <div>{formatDate(row.original.createdAt)}</div>,
    },
    {
      accessorKey: "isDeleted",
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <DataTableFacetedFilter
            column={column}
            title="Status"
            options={[
              { label: "Active", value: "false" },
              { label: "Inactive", value: "true" },
            ]}
          />
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
          {row.original.isDeleted ? "Deleted" : "Active"}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)));
      },
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
        title={t("news")}
        description="Create and manage news articles"
        action={{
          label: "Add Article",
          onClick: handleAddArticle,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable
        columns={columns}
        data={data?.news || []}
        searchKey="title"
        searchPlaceholder="Search articles..."
        currentPage={page}
        totalPages={data?.pagination?.totalPages || 1}
        totalItems={data?.pagination?.totalItems || 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* View Article Dialog */}
      <ViewDialog
        open={!!viewArticle}
        onOpenChange={(open) => !open && setViewArticle(null)}
        title={viewArticle ? getLocalizedValue(viewArticle.title, language) : ""}
      >
        {viewArticle && (
          <div className="space-y-6">
            <Tabs defaultValue={language} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>

              {["en", "ta", "si"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={viewArticle.mainImage || "/placeholder.svg"}
                      alt={getLocalizedValue(viewArticle.title, lang)}
                      className="max-w-full h-auto rounded-md"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">{getLocalizedValue(viewArticle.title, lang)}</h2>
                    <p className="text-muted-foreground">
                      {
                        categoryMap[viewArticle.newsCategory]
                          ? getLocalizedValue(categoryMap[viewArticle.newsCategory].name, lang)
                          : viewArticle.newsCategory
                      }
                      {" | "}
                      {formatDate(viewArticle.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">{getLocalizedValue(viewArticle.description, lang)}</p>
                  </div>

                  {viewArticle.paragraphs.map((paragraph, index) => (
                    <div key={index}>
                      <p>{getLocalizedValue(paragraph, lang)}</p>
                    </div>
                  ))}

                  <div className="text-right text-sm text-muted-foreground">
                    Editor: {getLocalizedValue(viewArticle.editorName, lang)}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {viewArticle.otherImages.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Additional Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewArticle.otherImages.map((image, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Additional image ${index + 1}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {viewArticle.isBreakingNews && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Breaking News
                </Badge>
              )}
              {viewArticle.isImportantNews && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  Important News
                </Badge>
              )}
              <Badge variant={viewArticle.isDeleted ? "destructive" : "default"}>
                {viewArticle.isDeleted ? "Deleted" : "Active"}
              </Badge>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteArticle}
        onOpenChange={(open) => !open && setDeleteArticle(null)}
        title="Delete Article"
        description={`Are you sure you want to delete "${deleteArticle ? getLocalizedValue(deleteArticle.title, language) : ""
          }"? This action cannot be undone.`}
        onConfirm={handleDeleteArticle}
        loading={isDeleting}
      />
    </div>
  )
}
