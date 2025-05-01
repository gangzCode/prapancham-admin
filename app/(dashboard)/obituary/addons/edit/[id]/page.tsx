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
const addonFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    price: z.coerce.number().min(0, {
        message: "Price must be a positive number.",
    }),
})

type AddonFormValues = z.infer<typeof addonFormSchema>

export default function EditAddonPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize form
    const form = useForm<AddonFormValues>({
        resolver: zodResolver(addonFormSchema),
        defaultValues: {
            name: "",
            price: 0,
        },
    })

    // Fetch addon data
    useEffect(() => {
        async function fetchAddon() {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Mock data for the example
                const addonData = {
                    id: params.id,
                    name: "Extended Photo Gallery",
                    price: 49,
                    isDeleted: false,
                }

                // Set form values
                form.reset({
                    name: addonData.name,
                    price: addonData.price,
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load addon data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchAddon()
    }, [params.id, form, toast])

    // Form submission handler
    async function onSubmit(data: AddonFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Addon updated",
                description: `${data.name} has been updated successfully.`,
            })

            // Redirect back to addons list
            router.push("/obituary/addons")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating the addon. Please try again.",
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
                title="Edit Addon"
                description="Modify an existing addon"
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
