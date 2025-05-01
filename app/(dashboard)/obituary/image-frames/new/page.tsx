"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { ImageUpload } from "@/components/image-upload"

// Form schema with validation
const imageFrameFormSchema = z.object({
    frameImage: z.string().min(1, {
        message: "Frame image is required.",
    }),
})

type ImageFrameFormValues = z.infer<typeof imageFrameFormSchema>

// Default values for the form
const defaultValues: Partial<ImageFrameFormValues> = {
    frameImage: "",
}

export default function NewImageFramePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<ImageFrameFormValues>({
        resolver: zodResolver(imageFrameFormSchema),
        defaultValues,
    })

    // Form submission handler
    async function onSubmit(data: ImageFrameFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Image frame created",
                description: "The image frame has been added successfully.",
            })

            // Redirect back to frames list
            router.push("/obituary/image-frames")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the image frame. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Image Frame"
                description="Create a new primary image frame for obituary posts"
                href="/obituary/image-frames"

            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="frameImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frame Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={(url) => field.onChange(url)}
                                                previewHeight={200}
                                                previewWidth={200}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload an image to be used as a frame. Transparent PNG files work best.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/obituary/image-frames")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Frame"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
