"use client"

import { useState } from "react"
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
import { CalendarIcon } from "lucide-react"
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
})

type EventFormValues = z.infer<typeof eventFormSchema>

// Default values for the form
const defaultValues: Partial<EventFormValues> = {
    name: "",
    description: "",
    isFeatured: false,
    image: "",
    featuredEventImage: "",
    eventLink: "",
    registeredPeopleCount: "0",
}

export default function NewEventPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues,
    })

    // Watch for featured status to conditionally show featured image upload
    const isFeatured = form.watch("isFeatured")

    // Form submission handler
    async function onSubmit(data: EventFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Event created",
                description: `${data.name} has been created successfully.`,
            })

            // Redirect back to events list
            router.push("/events")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the event. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Event"
                description="Create a new community event"
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
                                            <FormLabel>Registered People Count (Optional)</FormLabel>
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
                                    {isSubmitting ? "Creating..." : "Create Event"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
