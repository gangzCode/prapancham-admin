"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const multilingualField = z.object({
    name: z.string(),
    value: z.string().min(2, { message: "Required" }),
})
const eventFormSchema = z.object({
    name: z.object({
        en: z.array(multilingualField),
        ta: z.array(multilingualField),
        si: z.array(multilingualField),
    }),
    description: z.object({
        en: z.array(multilingualField),
        ta: z.array(multilingualField),
        si: z.array(multilingualField),
    }),
    eventDate: z.date({
        required_error: "Event date is required.",
    }),
    expiryDate: z.date({
        required_error: "Expiry date is required.",
    }),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    image: z.any().refine(val => val instanceof File || typeof val === "string", { message: "Event image is required." }),
    featuredEventImage: z.any().optional(),
    eventLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    registeredPeopleCount: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [langTab, setLangTab] = useState<"en" | "ta" | "si">("en")
    const [loading, setLoading] = useState(true)

    // Initialize form
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: undefined, // will set after fetch
    })

    // Fetch event data
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true)
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/${params.id}`, {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                })
                if (!res.ok) throw new Error("Failed to fetch event")
                const data = await res.json()

                // Map API data to form values
                form.reset({
                    name: data.name,
                    description: data.description,
                    eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                    isFeatured: !!data.isFeatured,
                    isActive: !!data.isActive,
                    image: data.image || undefined,
                    featuredEventImage: data.featuredEventImage || undefined,
                    eventLink: data.eventLink || "",
                    registeredPeopleCount: data.registeredPeopleCount ? String(data.registeredPeopleCount) : "",
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Could not load event data.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchEvent()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    // Watch for featured status to conditionally show featured image upload
    const isFeatured = form.watch("isFeatured")

    // Form submission handler (update)
    const handleSubmit = async (values: any) => {
        setIsSubmitting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()

            formData.append("eventId", `${params.id}`);
            formData.append("name", JSON.stringify(values.name))
            formData.append("description", JSON.stringify(values.description))
            formData.append("eventDate", values.eventDate instanceof Date ? values.eventDate.toISOString() : values.eventDate)
            formData.append("expiryDate", values.expiryDate instanceof Date ? values.expiryDate.toISOString() : values.expiryDate)
            formData.append("isFeatured", String(values.isFeatured))
            formData.append("isActive", String(values.isActive))
            formData.append("eventLink", values.eventLink || "")
            formData.append("registeredPeopleCount", values.registeredPeopleCount || "")
            formData.append("eventId", `${params.id}`)

            if (values.image instanceof File) {
                formData.append("image", values.image)
            }
            if (values.featuredEventImage instanceof File) {
                formData.append("featuredEventImage", values.featuredEventImage)
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event/update`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to update event")

            toast({
                title: "Event updated",
                description: "The event has been updated successfully.",
            })
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

    if (loading) {
        return <div className="p-8 text-center">Loading event data...</div>
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Event"
                description="Update community event details"
                href="/events"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={() => (
                                    <FormItem>
                                        {/* <FormLabel>Event Name</FormLabel> */}
                                        <Tabs value={langTab} onValueChange={v => setLangTab(v as "en" | "ta" | "si")} className="mb-2">
                                            <TabsList>
                                                <TabsTrigger value="en">English</TabsTrigger>
                                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                                            </TabsList>
                                            {(["en", "ta", "si"] as const).map((lang) => (
                                                <TabsContent key={lang} value={lang}>
                                                    <FormField
                                                        control={form.control}
                                                        name={`name.${lang}.0.value`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{form.getValues().name?.[lang]?.[0].name}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={`Enter event name (${lang})`} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={() => (
                                    <FormItem>
                                        {/* <FormLabel>Description</FormLabel> */}
                                        <Tabs value={langTab} onValueChange={v => setLangTab(v as "en" | "ta" | "si")} className="mb-2">
                                            {/* <TabsList>
                                                <TabsTrigger value="en">English</TabsTrigger>
                                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                                            </TabsList> */}
                                            {(["en", "ta", "si"] as const).map((lang) => (
                                                <TabsContent key={lang} value={lang}>
                                                    <FormField
                                                        control={form.control}
                                                        name={`description.${lang}.0.value`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{form.getValues().description?.[lang]?.[0].name}</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder={`Enter description (${lang})`} className="min-h-32" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TabsContent>
                                            ))}
                                        </Tabs>
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
                                    name="expiryDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Expiry Date</FormLabel>
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
                                                            {field.value ? format(field.value, "PPP p") : <span>Pick expiry date and time</span>}
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
                                            <FormDescription>The date and time when the event will expire.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active Status</FormLabel>
                                                <FormDescription>
                                                    Toggle whether this event is currently active or not.
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


                            </div>
                            <FormField
                                control={form.control}
                                name="eventLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Link</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/event"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional link to an external page for the currently active event.
                                        </FormDescription>
                                        <FormMessage />
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
                                            {typeof field.value === "string" && (
                                                    <img src={field.value} alt="Current image" className="mb-2 max-w-full h-auto" />
                                                )}
                                                <ImageUpload
                                                    value={field.value instanceof File ? field.value : null}
                                                    onChange={file => field.onChange(file)}
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
                                            {typeof field.value === "string" && (
                                                    <img src={field.value} alt="Current image" className="mb-2 max-w-full h-auto" />
                                                )}
                                                <ImageUpload
                                                    value={field.value instanceof File ? field.value : null}
                                                    onChange={file => field.onChange(file)}
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
                                    {isSubmitting ? "Updating..." : "Update Event"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
