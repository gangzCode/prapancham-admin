"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

// Sample admin data for demonstration
const getAdminById = async (id: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
        id,
        username: "johnsmith",
        email: "john@prapancham.com",
        isAdmin: true,
        isSuperAdmin: id === "1", // Make the first admin a super admin for demo
        isDeleted: false,
        phone: "+1 (555) 123-4567",
        createdAt: "2023-05-15T09:30:45Z",
        updatedAt: "2023-05-15T09:30:45Z",
    }
}

// Form validation schema for edit (password is optional)
const formSchema = z
    .object({
        username: z
            .string()
            .min(3, { message: "Username must be at least 3 characters" })
            .max(50, { message: "Username must be less than 50 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
            .regex(/[0-9]/, { message: "Password must contain at least one number" })
            .optional()
            .or(z.literal("")),
        confirmPassword: z.string().optional().or(z.literal("")),
        isAdmin: z.boolean().default(true),
        isSuperAdmin: z.boolean().default(false),
        isDeleted: z.boolean().default(false),
        phone: z.string().optional(),
    })
    .refine((data) => !data.password || data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type FormValues = z.infer<typeof formSchema>

export default function EditAdminPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize form with empty values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            isAdmin: true,
            isSuperAdmin: false,
            isDeleted: false,
            phone: "",
        },
    })

    // Fetch admin data and populate form
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const admin = await getAdminById(params.id)

                form.reset({
                    username: admin.username,
                    email: admin.email,
                    password: "",
                    confirmPassword: "",
                    isAdmin: admin.isAdmin,
                    isSuperAdmin: admin.isSuperAdmin,
                    isDeleted: admin.isDeleted,
                    phone: admin.phone || "",
                })
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load admin data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchAdmin()
    }, [params.id, form, toast])

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            // Show success toast
            toast({
                title: "Admin updated",
                description: `${values.username}'s information has been updated.`,
            })

            // Redirect to admins page
            router.push("/admins")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update admin. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Admin"
                description="Update admin user information"
                action={{
                    label: "Back to Admins",
                    onClick: () => router.push("/admins"),
                    icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                }}
            />

            <div className="mx-auto max-w-2xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter username" {...field} />
                                    </FormControl>
                                    <FormDescription>This will be used for login and identification.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Enter email address" {...field} />
                                    </FormControl>
                                    <FormDescription>Email will be used for notifications and password recovery.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter new password" {...field} />
                                        </FormControl>
                                        <FormDescription>Leave blank to keep current password.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm new password" {...field} />
                                        </FormControl>
                                        <FormDescription>Re-enter the new password to confirm.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter phone number" {...field} />
                                    </FormControl>
                                    <FormDescription>Contact number for the admin user.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="isAdmin"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Admin</FormLabel>
                                            <FormDescription>Grant admin privileges.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isSuperAdmin"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Super Admin</FormLabel>
                                            <FormDescription>Grant super admin privileges.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isDeleted"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-destructive/20">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Mark as Deleted</FormLabel>
                                            <FormDescription>Soft delete this admin account.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/admins")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Admin
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
