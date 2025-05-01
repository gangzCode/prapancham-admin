"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2, Calendar, Link2, Star } from "lucide-react"
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

// Sample data for events based on the provided schema
type Event = {
  id: string
  name: string
  description: string
  eventDate: string
  isFeatured: boolean
  image: string
  featuredEventImage: string
  eventLink?: string
  registeredPeopleCount?: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

const events: Event[] = [
  {
    id: "1",
    name: "Community Gathering",
    description: "Annual community gathering to celebrate local achievements and plan future initiatives.",
    eventDate: "2023-06-15T10:00:00",
    isFeatured: true,
    image: "/placeholder.svg?height=200&width=400",
    featuredEventImage: "/placeholder.svg?height=400&width=800",
    eventLink: "#",
    registeredPeopleCount: "150",
    isDeleted: false,
    createdAt: "2023-05-01T09:00:00",
    updatedAt: "2023-05-01T09:00:00",
  },
  {
    id: "2",
    name: "Memorial Service",
    description: "A memorial service to honor those who have passed away in the last year.",
    eventDate: "2023-05-30T14:00:00",
    isFeatured: false,
    image: "/placeholder.svg?height=200&width=400",
    featuredEventImage: "",
    eventLink: "#",
    registeredPeopleCount: "200",
    isDeleted: false,
    createdAt: "2023-04-15T11:30:00",
    updatedAt: "2023-04-15T11:30:00",
  },
  {
    id: "3",
    name: "Charity Fundraiser",
    description: "Fundraising event to support local families in need.",
    eventDate: "2023-07-10T18:00:00",
    isFeatured: true,
    image: "/placeholder.svg?height=200&width=400",
    featuredEventImage: "/placeholder.svg?height=400&width=800",
    eventLink: "#",
    registeredPeopleCount: "300",
    isDeleted: false,
    createdAt: "2023-05-05T14:45:00",
    updatedAt: "2023-05-05T14:45:00",
  },
  {
    id: "4",
    name: "Cultural Festival",
    description: "Celebration of diverse cultures with food, music, and performances.",
    eventDate: "2023-05-05T11:00:00",
    isFeatured: false,
    image: "/placeholder.svg?height=200&width=400",
    featuredEventImage: "",
    eventLink: "#",
    registeredPeopleCount: "1500",
    isDeleted: true,
    createdAt: "2023-03-20T10:15:00",
    updatedAt: "2023-03-20T10:15:00",
  },
  {
    id: "5",
    name: "Health and Wellness Fair",
    description: "Event focused on promoting health and wellness in the community.",
    eventDate: "2023-08-20T09:00:00",
    isFeatured: false,
    image: "/placeholder.svg?height=200&width=400",
    featuredEventImage: "",
    eventLink: "#",
    registeredPeopleCount: "400",
    isDeleted: false,
    createdAt: "2023-06-01T08:30:00",
    updatedAt: "2023-06-01T08:30:00",
  },
]

export default function EventsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddEvent = () => {
    router.push("/events/new")
  }

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/edit/${eventId}`)
  }

  const handleDeleteEvent = async () => {
    if (!deleteEvent) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Event deleted",
      description: `"${deleteEvent.name}" has been deleted successfully.`,
    })

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

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name}
          {row.original.isFeatured && (
            <Badge variant="outline" className="ml-2 bg-yellow-100">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              Featured
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "eventDate",
      header: "Event Date",
      cell: ({ row }) => <div>{formatDate(row.original.eventDate)}</div>,
    },
    {
      accessorKey: "registeredPeopleCount",
      header: "Registered",
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
    // {
    //   accessorKey: "isDeleted",
    //   header: "Status",
    //   cell: ({ row }) => (
    //     <Badge variant={row.original.isDeleted ? "destructive" : "default"}>
    //       {row.original.isDeleted ? "Deleted" : "Active"}
    //     </Badge>
    //   ),
    // },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewEvent(row.original)}>
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

      <DataTable columns={columns} data={events} searchKey="name" searchPlaceholder="Search events..." />

      {/* View Event Dialog */}
      <ViewDialog
        open={!!viewEvent}
        onOpenChange={(open) => !open && setViewEvent(null)}
        title={viewEvent?.name || "Event Details"}
      >
        {viewEvent && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={viewEvent.image || "/placeholder.svg?height=200&width=400"}
                  alt={viewEvent.name}
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
                      alt={`${viewEvent.name} (Featured)`}
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
              <p>{viewEvent.description}</p>
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
        description={`Are you sure you want to delete "${deleteEvent?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteEvent}
        loading={isDeleting}
      />
    </div>
  )
}
