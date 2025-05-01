"use client"

import { useState } from "react"
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

// Default values for the form
const defaultValues: Partial<BgColorFormValues> = {
    colorCode: "#FFFFFF",
}

export default function NewBgColorPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<BgColorFormValues>({
        resolver: zodResolver(bgColorFormSchema),
        defaultValues,
    })

    // Form submission handler
    async function onSubmit(data: BgColorFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Background color created",
                description: `Color ${data.colorCode} has been added successfully.`,
            })

            // Redirect back to colors list
            router.push("/obituary/bg-colors")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the background color. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Background Color"
                description="Create a new background color for obituary posts"
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
                                    {isSubmitting ? "Creating..." : "Create Color"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
