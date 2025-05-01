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
const addonFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    price: z.coerce.number().min(0, {
        message: "Price must be a positive number.",
    }),
})

type AddonFormValues = z.infer<typeof addonFormSchema>

// Default values for the form
const defaultValues: Partial<AddonFormValues> = {
    name: "",
    price: 0,
}

export default function NewAddonPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Initialize form
    const form = useForm<AddonFormValues>({
        resolver: zodResolver(addonFormSchema),
        defaultValues,
    })

    // Form submission handler
    async function onSubmit(data: AddonFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Addon created",
                description: `${data.name} has been created successfully.`,
            })

            // Redirect back to addons list
            router.push("/obituary/addons")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the addon. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Addon"
                description="Create a new addon for obituary packages"
                href="/obituary/addons"
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
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter addon name" {...field} />
                                        </FormControl>
                                        <FormDescription>The name of the addon as it will appear to customers.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription>The price of the addon in your base currency.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/obituary/addons")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Addon"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
