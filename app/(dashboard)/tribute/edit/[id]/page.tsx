"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// Define the form schema based on tribute type
const flowerFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    image: z.string().min(1, "Image is required"),
    isDeleted: z.boolean().default(false),
})

const cardFormSchema = z.object({
    image: z.string().min(1, "Image is required"),
    isDeleted: z.boolean().default(false),
})

const letterFormSchema = z.object({
    image: z.string().min(1, "Image is required"),
    isDeleted: z.boolean().default(false),
})

type TributeType = "flower" | "card" | "letter"

// Sample data for tributes
const tributes = [
    {
        id: "1",
        type: "flower",
        name: "Classic Rose Bouquet",
        price: 75,
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: false,
        createdAt: "2023-05-15T10:30:00Z",
        updatedAt: "2023-05-15T10:30:00Z",
    },
    {
        id: "2",
        type: "flower",
        name: "Peaceful Lily Arrangement",
        price: 85,
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: false,
        createdAt: "2023-05-16T11:20:00Z",
        updatedAt: "2023-05-16T11:20:00Z",
    },
    {
        id: "3",
        type: "flower",
        name: "Seasonal Tribute Bouquet",
        price: 65,
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: true,
        createdAt: "2023-05-17T09:15:00Z",
        updatedAt: "2023-05-17T09:15:00Z",
    },
    {
        id: "4",
        type: "card",
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: false,
        createdAt: "2023-05-18T14:45:00Z",
        updatedAt: "2023-05-18T14:45:00Z",
    },
    {
        id: "5",
        type: "card",
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: false,
        createdAt: "2023-05-19T16:30:00Z",
        updatedAt: "2023-05-19T16:30:00Z",
    },
    {
        id: "6",
        type: "letter",
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: false,
        createdAt: "2023-05-20T13:10:00Z",
        updatedAt: "2023-05-20T13:10:00Z",
    },
    {
        id: "7",
        type: "letter",
        image: "/placeholder.svg?height=200&width=300",
        isDeleted: true,
        createdAt: "2023-05-21T10:05:00Z",
        updatedAt: "2023-05-21T10:05:00Z",
    },
]

export default function EditTributePage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tributeType, setTributeType] = useState<TributeType>("flower")
    const [tribute, setTribute] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const id = params.id as string

    // Get the tribute type from the URL query parameter and fetch tribute data
    useEffect(() => {
        const type = searchParams.get("type") as TributeType
        if (type && ["flower", "card", "letter"].includes(type)) {
            setTributeType(type)
        }

        // Simulate API call to fetch tribute data
        const fetchTribute = async () => {
            setIsLoading(true)
            try {
                // Find tribute in sample data
                const foundTribute = tributes.find((t) => t.id === id)
                if (foundTribute) {
                    setTribute(foundTribute)
                    setTributeType(foundTribute.type as TributeType)
                } else {
                    toast({
                        title: "Error",
                        description: "Tribute not found",
                        variant: "destructive",
                    })
                    router.push("/tribute")
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch tribute data",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchTribute()
    }, [id, searchParams, router, toast])

    // Select the appropriate form schema based on tribute type
    const formSchema =
        tributeType === "flower" ? flowerFormSchema : tributeType === "card" ? cardFormSchema : letterFormSchema

    // Initialize the form with the selected schema
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...(tributeType === "flower" ? { name: "", price: 0 } : {}),
            image: "",
            isDeleted: false,
        },
    })

    // Update form values when tribute data is loaded
    useEffect(() => {
        if (tribute) {
            // Reset form with tribute data
            if (tributeType === "flower") {
                form.reset({
                    name: tribute.name || "",
                    price: tribute.price || 0,
                    image: tribute.image || "",
                    isDeleted: tribute.isDeleted || false,
                })
            } else {
                form.reset({
                    image: tribute.image || "",
                    isDeleted: tribute.isDeleted || false,
                })
            }
        }
    }, [tribute, tributeType, form])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Tribute updated",
                description: `The ${tributeType} has been updated successfully.`,
            })

            router.push("/tribute")
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while updating the tribute.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit ${tributeType.charAt(0).toUpperCase() + tributeType.slice(1)}`}
                description={`Update this ${tributeType} tribute template`}
                action={{
                    label: "Back to Tributes",
                    onClick: () => router.push("/tribute"),
                    icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                }}
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Image upload field - common to all tribute types */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormDescription>Upload an image for this {tributeType} template.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fields specific to flower tributes */}
                            {tributeType === "flower" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter flower name" {...field} />
                                                </FormControl>
                                                <FormDescription>The name of the flower arrangement.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" placeholder="Enter price" value={field.value as string | number} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                                                </FormControl>
                                                <FormDescription>The price of the flower arrangement.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Mark as deleted toggle - common to all tribute types */}
                            <FormField
                                control={form.control}
                                name="isDeleted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Mark as Deleted</FormLabel>
                                            <FormDescription>Toggle to mark this tribute as deleted.</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="button" variant="outline" className="mr-2" onClick={() => router.push("/tribute")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Updating..." : "Update"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
