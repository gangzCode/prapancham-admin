"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2, Calendar, Link2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
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
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type MultilingualField = {
  name: string
  value: string
  _id?: string
}

type Event = {
  id: string
  name: {
    en: string
    ta: string
    si: string
  }
  description: {
    en: string
    ta: string
    si: string
  }
  eventDate: string
  isFeatured: boolean
  image: string
  featuredEventImage: string
  eventLink?: string
  registeredPeopleCount?: string
  isDeleted: boolean
  isActive?: boolean
  expiryDate?: string
  uploadedDate?: string
  createdAt: string
  updatedAt: string
}

type LangKey = "en" | "ta" | "si"

const fetcher = async (url: string): Promise<{ events: Event[]; pagination?: any }> => {
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
    events: (json.events || json.data || []).map((ev: any) => ({
      id: ev._id || ev.id,
      name: {
        en: ev.name?.en?.[0]?.value || "",
        ta: ev.name?.ta?.[0]?.value || "",
        si: ev.name?.si?.[0]?.value || "",
      },
      description: {
        en: ev.description?.en?.[0]?.value || "",
        ta: ev.description?.ta?.[0]?.value || "",
        si: ev.description?.si?.[0]?.value || "",
      },
      eventDate: ev.eventDate,
      isFeatured: ev.isFeatured,
      image: ev.image,
      featuredEventImage: ev.featuredEventImage,
      eventLink: ev.eventLink,
      registeredPeopleCount: ev.registeredPeopleCount,
      isDeleted: ev.isDeleted,
      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt,
    })),
  }))
}

export default function EventsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, lang: dashboardLang = "en" } = useLanguage() as any
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [previewLang, setPreviewLang] = useState<LangKey>(dashboardLang as LangKey)
  const { data, error, isLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/event/all?page=${page}&limit=${pageSize}`,
    fetcher
  )

  const handleAddEvent = () => {
    router.push("/events/new")
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/edit/${eventId}`)
  }

  const handleDeleteEvent = async () => {
    if (!deleteEvent) return

    setIsDeleting(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${deleteEvent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      toast({
        title: "Event deleted",
        description: `"${deleteEvent.name.en}" has been deleted successfully.`,
      })

      mutate()
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete event." })
    }

    setIsDeleting(false)
    setDeleteEvent(null)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP p")
    } catch (error) {
      return dateString
    }
  }

  const handleOpenViewEvent = (event: Event | null) => {
    setViewEvent(event)
    if (event) setPreviewLang(dashboardLang as LangKey)
  }

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" type="text" />,
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name?.[dashboardLang as LangKey] || row.original.name?.en || ""}
          {row.original.isFeatured && (
            <Badge variant="outline" className="ml-2 bg-yellow-100">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              Featured
            </Badge>
          )}
        </div>
      ),
      filterFn: (row, id, value) => {
        const question = row.original.name.en.toLowerCase();
        return question.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "eventDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Event Date" type="date" />,
      cell: ({ row }) => <div>{formatDate(row.original.eventDate)}</div>,
    },
    {
      accessorKey: "registeredPeopleCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registered" type="number" />,
      cell: ({ row }) => <div>{row.original.registeredPeopleCount || "0"}</div>,
    },
    {
      accessorKey: "eventLink",
      header: "Event Link",
      cell: ({ row }) => (
        <div>
          {row.original.eventLink ? (
            <a
              href={row.original.eventLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:underline"
            >
              <Link2 className="h-3 w-3 mr-1" />
              Link
            </a>
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenViewEvent(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditEvent(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteEvent(row.original)}>
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
        title={t("events")}
        description="Manage community events and gatherings"
        action={{
          label: "Add Event",
          onClick: handleAddEvent,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load events.</div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.events || []}
          searchKey={`name`}
          searchPlaceholder="Search events..."
          currentPage={page}
          totalPages={data?.pagination?.totalPages || 1}
          totalItems={data?.pagination?.totalItems || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* View Event Dialog */}
      <ViewDialog
        open={!!viewEvent}
        onOpenChange={(open) => {
          if (!open) setViewEvent(null)
        }}
        title={viewEvent?.name?.[previewLang] || viewEvent?.name?.en || "Event Details"}
      >
        {viewEvent && (
          <div className="space-y-6">
            <Tabs
              value={previewLang}
              defaultValue={dashboardLang}
              className="w-full"
              onValueChange={(val) => setPreviewLang(val as LangKey)}
            >
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>
              {(["en", "ta", "si"] as LangKey[]).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="space-y-2 py-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                    <p className="font-medium">{viewEvent.name[lang]}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                    <p className="whitespace-pre-wrap">{viewEvent.description[lang]}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-center">
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={viewEvent.image || "/placeholder.svg?height=200&width=400"}
                  alt={viewEvent.name?.[previewLang] || viewEvent.name?.en || ""}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {viewEvent.isFeatured && viewEvent.featuredEventImage && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Featured Event Image</h3>
                <div className="flex justify-center">
                  <div className="relative border rounded-md overflow-hidden">
                    <img
                      src={viewEvent.featuredEventImage || "/placeholder.svg?height=400&width=800"}
                      alt={`${viewEvent.name?.[previewLang] || viewEvent.name?.en || ""} (Featured)`}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p>{viewEvent.description?.[previewLang] || viewEvent.description?.en || ""}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Event Date</h3>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{formatDate(viewEvent.eventDate)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Featured</h3>
                <Badge variant={viewEvent.isFeatured ? "default" : "secondary"}>
                  {viewEvent.isFeatured ? "Yes" : "No"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Registered People</h3>
                <p>{viewEvent.registeredPeopleCount || "0"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewEvent.isDeleted ? "destructive" : "default"}>
                  {viewEvent.isDeleted ? "Deleted" : "Active"}
                </Badge>
              </div>
            </div>

            {viewEvent.eventLink && (
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Event Link</h3>
                <a
                  href={viewEvent.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  {viewEvent.eventLink}
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Created At</h3>
                <p>{formatDate(viewEvent.createdAt)}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Updated At</h3>
                <p>{formatDate(viewEvent.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteEvent}
        onOpenChange={(open) => !open && setDeleteEvent(null)}
        title="Delete Event"
        description={`Are you sure you want to delete "${deleteEvent?.name?.[previewLang] || deleteEvent?.name?.en || ""}"? This action cannot be undone.`}
        onConfirm={handleDeleteEvent}
        loading={isDeleting}
      />
    </div>
  )
}
