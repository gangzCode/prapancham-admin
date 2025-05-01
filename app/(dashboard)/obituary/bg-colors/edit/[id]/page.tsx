"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Form schema with validation
const bgColorFormSchema = z.object({
    colorCode: z
        .string()
        .min(4, { message: "Color code must be at least 4 characters." })
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
            message: "Must be a valid hex color code (e.g., #FF0000 or #F00)",
        }),
})

type BgColorFormValues = z.infer<typeof bgColorFormSchema>

export default function EditBgColorPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize form
    const form = useForm<BgColorFormValues>({
        resolver: zodResolver(bgColorFormSchema),
        defaultValues: {
            colorCode: "#FFFFFF",
        },
    })

    // Fetch color data
    useEffect(() => {
        async function fetchColor() {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Mock data for the example
                const colorData = {
                    id: params.id,
                    colorCode: "#E5F6FF",
                }

                // Set form values
                form.reset({
                    colorCode: colorData.colorCode,
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load color data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchColor()
    }, [params.id, form, toast])

    // Form submission handler
    async function onSubmit(data: BgColorFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Background color updated",
                description: `Color ${data.colorCode} has been updated successfully.`,
            })

            // Redirect back to colors list
            router.push("/obituary/bg-colors")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating the background color. Please try again.",
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
                title="Edit Background Color"
                description="Modify an existing background color"
                href="/obituary/bg-colors"

            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="colorCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color Code</FormLabel>
                                        <div className="flex space-x-4 items-center">
                                            <FormControl>
                                                <Input placeholder="#FFFFFF" {...field} />
                                            </FormControl>
                                            <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: field.value }} />
                                            <Input
                                                type="color"
                                                className="w-12 h-10 p-1 cursor-pointer"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            />
                                        </div>
                                        <FormDescription>Enter a valid hex color code (e.g., #FF0000 for red).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/obituary/bg-colors")}
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
