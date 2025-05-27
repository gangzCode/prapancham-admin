"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

// Define the form schema based on tribute type
const flowerFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be a positive number"),
    image: z.string().min(1, "Image is required"),
})

const cardFormSchema = z.object({
    image: z.string().min(1, "Image is required"),
})

const letterFormSchema = z.object({
    image: z.string().min(1, "Image is required"),
})

type TributeType = "flower" | "card" | "letter"

export default function NewTributePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tributeType, setTributeType] = useState<TributeType>("flower")

    // Get the tribute type from the URL query parameter
    useEffect(() => {
        const type = searchParams.get("type") as TributeType
        if (type && ["flower", "card", "letter"].includes(type)) {
            setTributeType(type)
        }
    }, [searchParams])

    // Select the appropriate form schema based on tribute type
    const formSchema =
        tributeType === "flower" ? flowerFormSchema : tributeType === "card" ? cardFormSchema : letterFormSchema

    // Initialize the form with the selected schema
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...(tributeType === "flower" ? { name: "", price: 0 } : {}),
            image: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Tribute created",
                description: `The ${tributeType} has been created successfully.`,
            })

            router.push("/tribute")
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating the tribute.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Add New ${tributeType.charAt(0).toUpperCase() + tributeType.slice(1)}`}
                description={`Create a new ${tributeType} tribute template`}
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
                                                    <Input type="number" min="0" step="0.01" placeholder="Enter price" {...field} />
                                                </FormControl>
                                                <FormDescription>The price of the flower arrangement.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <div className="flex justify-end">
                                <Button type="button" variant="outline" className="mr-2" onClick={() => router.push("/tribute")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
