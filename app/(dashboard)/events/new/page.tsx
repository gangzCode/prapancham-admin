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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update schema
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
    image: z.any().refine(val => val instanceof File, { message: "Event image is required." }),
    featuredEventImage: z.any().optional(),
    eventLink: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
    registeredPeopleCount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().nonnegative().optional())


})

type EventFormValues = z.infer<typeof eventFormSchema>

// Default values for the form
const defaultValues: Partial<EventFormValues> = {
    name: {
        en: [{ name: "Title", value: "" }],
        ta: [{ name: "தலைப்பு", value: "" }],
        si: [{ name: "සිරස", value: "" }],
    },
    description: {
        en: [{ name: "Details", value: "" }],
        ta: [{ name: "விவரம்", value: "" }],
        si: [{ name: "විස්තරය", value: "" }],
    },
    isFeatured: false,
}

export default function NewEventPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [langTab, setLangTab] = useState<"en" | "ta" | "si">("en")

    // Initialize form
    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues,
    })

    // Watch for featured status to conditionally show featured image upload
    const isFeatured = form.watch("isFeatured")

    // Form submission handler
    const handleSubmit = async (values: any) => {
        setIsSubmitting(true)
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const form = new FormData()


            form.append("name", JSON.stringify(values.name))
            form.append("description", JSON.stringify(values.description))
            form.append("eventDate", values.eventDate instanceof Date ? values.eventDate.toISOString() : values.eventDate)
            form.append("expiryDate", values.expiryDate instanceof Date ? values.expiryDate.toISOString() : values.expiryDate)
            form.append("isFeatured", String(values.isFeatured))
            form.append("eventLink", values.eventLink || "")
            form.append("registeredPeopleCount", values.registeredPeopleCount || "")

            form.append("image", values.image)
            form.append("featuredEventImage", values.featuredEventImage || "")

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/event`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),

                },
                body: form,
            })

            if (!res.ok) throw new Error("Failed to create event")

            toast({
                title: "Event created",
                description: "The event has been created successfully.",
            })
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
                                                                <FormLabel>{defaultValues.name?.[lang]?.[0].name}</FormLabel>
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
                                                                <FormLabel>{defaultValues.description?.[lang]?.[0].name}</FormLabel>
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
                                            variant="outline"
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? format(new Date(field.value), "PPP p") : <span>Pick a date and time</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Input
                                            type="date"
                                            value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                            onChange={(e) => {
                                            const [year, month, day] = e.target.value.split("-");
                                            const current = field.value ? new Date(field.value) : new Date();
                                            current.setFullYear(+year, +month - 1, +day);
                                            field.onChange(new Date(current));
                                            }}
                                            required
                                        />
                                        <div className="p-3 border-t border-border">
                                            <Input
                                            type="time"
                                            value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(":");
                                                const current = field.value ? new Date(field.value) : new Date();
                                                current.setHours(+hours, +minutes);
                                                field.onChange(new Date(current));
                                            }}
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
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? format(new Date(field.value), "PPP p") : <span>Pick expiry date and time</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Input
                                                type="date"
                                                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                                onChange={(e) => {
                                                const [year, month, day] = e.target.value.split("-");
                                                const date = field.value ? new Date(field.value) : new Date();
                                                date.setFullYear(+year, +month - 1, +day);
                                                field.onChange(new Date(date));
                                                }}
                                                required
                                            />
                                            <div className="p-3 border-t border-border">
                                                <Input
                                                type="time"
                                                value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                                                onChange={(e) => {
                                                    const [hours, minutes] = e.target.value.split(":");
                                                    const date = field.value ? new Date(field.value) : new Date();
                                                    date.setHours(+hours, +minutes);
                                                    field.onChange(new Date(date));
                                                }}
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
                                    name="registeredPeopleCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registered People Count (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
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
                                            <ImageUpload
                                                value={field.value as File | null}
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
                                                <ImageUpload
                                                    value={field.value as File | null}
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
