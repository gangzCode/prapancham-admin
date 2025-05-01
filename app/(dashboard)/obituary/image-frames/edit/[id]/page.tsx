"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ImageUpload } from "@/components/image-upload"

// Form schema with validation
const imageFrameFormSchema = z.object({
    frameImage: z.string().min(1, {
        message: "Frame image is required.",
    }),
})

type ImageFrameFormValues = z.infer<typeof imageFrameFormSchema>

export default function EditImageFramePage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize form
    const form = useForm<ImageFrameFormValues>({
        resolver: zodResolver(imageFrameFormSchema),
        defaultValues: {
            frameImage: "",
        },
    })

    // Fetch frame data
    useEffect(() => {
        async function fetchFrame() {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Mock data for the example
                const frameData = {
                    id: params.id,
                    frameImage: "/placeholder.svg?height=200&width=200",
                }

                // Set form values
                form.reset({
                    frameImage: frameData.frameImage,
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load frame data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchFrame()
    }, [params.id, form, toast])

    // Form submission handler
    async function onSubmit(data: ImageFrameFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Image frame updated",
                description: "The image frame has been updated successfully.",
            })

            // Redirect back to frames list
            router.push("/obituary/image-frames")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating the image frame. Please try again.",
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
                title="Edit Image Frame"
                description="Modify an existing image frame"
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
