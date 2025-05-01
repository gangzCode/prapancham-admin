"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Form schema with validation
const eventFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    eventDate: z.date({
        required_error: "Event date is required.",
    }),
    isFeatured: z.boolean().default(false),
    image: z.string().min(1, {
        message: "Event image is required.",
    }),
    featuredEventImage: z.string().optional(),
    eventLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    registeredPeopleCount: z.string().optional(),
    isDeleted: z.boolean().default(false),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EditEventPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize form
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: "",
            description: "",
            isFeatured: false,
            image: "",
            featuredEventImage: "",
            eventLink: "",
            registeredPeopleCount: "0",
            isDeleted: false,
        },
    })

    // Watch for featured status to conditionally show featured image upload
    const isFeatured = form.watch("isFeatured")

    // Fetch event data
    useEffect(() => {
        async function fetchEvent() {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Mock data for the example
                const eventData = {
                    id: params.id,
                    name: "Community Gathering",
                    description: "Annual community gathering to celebrate local achievements and plan future initiatives.",
                    eventDate: "2023-06-15T10:00:00",
                    isFeatured: true,
                    image: "/placeholder.svg?height=200&width=400",
                    featuredEventImage: "/placeholder.svg?height=400&width=800",
                    eventLink: "https://example.com/events/community-gathering",
                    registeredPeopleCount: "150",
                    isDeleted: false,
                }

                // Set form values
                form.reset({
                    name: eventData.name,
                    description: eventData.description,
                    eventDate: new Date(eventData.eventDate),
                    isFeatured: eventData.isFeatured,
                    image: eventData.image,
                    featuredEventImage: eventData.featuredEventImage,
                    eventLink: eventData.eventLink,
                    registeredPeopleCount: eventData.registeredPeopleCount,
                    isDeleted: eventData.isDeleted,
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load event data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchEvent()
    }, [params.id, form, toast])

    // Form submission handler
    async function onSubmit(data: EventFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Event updated",
                description: `${data.name} has been updated successfully.`,
            })

            // Redirect back to events list
            router.push("/events")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating the event. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Event"
                description="Modify an existing event"
                href="/events"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter event name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter event description" className="min-h-32" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="eventDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Event Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                    <div className="p-3 border-t border-border">
                                                        <Input
                                                            type="time"
                                                            onChange={(e) => {
                                                                const date = new Date(field.value || new Date())
                                                                const [hours, minutes] = e.target.value.split(":")
                                                                date.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))
                                                                field.onChange(date)
                                                            }}
                                                            defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                                        />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>The date and time when the event will take place.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="eventLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Event Link (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com/event" {...field} />
                                            </FormControl>
                                            <FormDescription>A link to the event page or registration form.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="registeredPeopleCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registered People Count</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormDescription>The number of people registered for this event.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Featured Event</FormLabel>
                                                <FormDescription>Display this event as featured on the website.</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isDeleted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-destructive/20 bg-destructive/5">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Mark as Deleted</FormLabel>
                                            <FormDescription>
                                                This will hide the event from the website but keep it in the database.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={(url) => field.onChange(url)}
                                                previewHeight={200}
                                                previewWidth={400}
                                            />
                                        </FormControl>
                                        <FormDescription>The main image for the event.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isFeatured && (
                                <FormField
                                    control={form.control}
                                    name="featuredEventImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Featured Event Image (Optional)</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || ""}
                                                    onChange={(url) => field.onChange(url)}
                                                    previewHeight={200}
                                                    previewWidth={400}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A special image to be displayed when the event is featured. If not provided, the main image will
                                                be used.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/events")} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
