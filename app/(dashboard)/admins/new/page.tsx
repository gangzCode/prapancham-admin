"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

// Available pages for admin access
const availablePages = [
    "Dashboard",
    "Obituary",
    "Advertistment",
    "News",
    "Events",
    "Tribute",
    "ContactUs",
    "FAQ",
    "Country",
    "Newsletter",
    "Youtube",
    "Podcast",
    "Quote"
]

// Form validation schema
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
            .regex(/[0-9]/, { message: "Password must contain at least one number" }),
        confirmPassword: z.string(),
        isAdmin: z.boolean().default(false),
        isSuperAdmin: z.boolean().default(false),
        phone: z.string().optional(),
        adminAccessPages: z.array(z.string()).default([]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.isAdmin || data.isSuperAdmin, {
        message: "Please select either Admin or Super Admin",
        path: ["isAdmin"],
    })
    .refine((data) => !(data.isAdmin && data.isSuperAdmin), {
        message: "Cannot select both Admin and Super Admin",
        path: ["isSuperAdmin"],
    })

type FormValues = z.infer<typeof formSchema>

export default function NewAdminPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            isAdmin: false,
            isSuperAdmin: false,
            phone: "",
            adminAccessPages: [],
        },
    })

    // Watch the isAdmin and isSuperAdmin values to handle mutual exclusivity
    const isAdmin = form.watch("isAdmin")
    const isSuperAdmin = form.watch("isSuperAdmin")

    // Handle Admin checkbox change
    const handleAdminChange = (checked: boolean) => {
        if (checked) {
            // Ensure mutual exclusivity: only Admin is true
            form.setValue("isAdmin", true)
            form.setValue("isSuperAdmin", false)
        } else {
            form.setValue("isAdmin", false)
            form.setValue("adminAccessPages", [])
        }
    }

    // Handle Super Admin checkbox change
    const handleSuperAdminChange = (checked: boolean) => {
        if (checked) {
            // Ensure mutual exclusivity: only Super Admin is true
            form.setValue("isSuperAdmin", true)
            form.setValue("isAdmin", false)
            form.setValue("adminAccessPages", [])
        } else {
            form.setValue("isSuperAdmin", false)
        }
    }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token')

            // Prepare the request body
            const requestBody = {
                username: values.username,
                email: values.email,
                password: values.password,
                phone: values.phone || "",
                isAdmin: values.isAdmin,
                isSuperAdmin: values.isSuperAdmin,
                adminAccessPages: values.isSuperAdmin ? [] : values.adminAccessPages
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                throw new Error('Failed to create admin')
            }

            // Show success toast
            toast({
                title: "Admin created successfully",
                description: `${values.username} has been added as ${values.isSuperAdmin ? 'a super admin' : 'an admin'}.`,
            })

            // Redirect to admins page
            router.push("/admins")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create admin. Please try again.",
                variant: "destructive",
            })
            console.error("Error creating admin:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Admin"
                description="Create a new admin user account"
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                    <span className="sr-only">
                                                        {showPassword ? "Hide password" : "Show password"}
                                                    </span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Must be at least 8 characters with uppercase, lowercase, and number.
                                        </FormDescription>
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
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                    <span className="sr-only">
                                                        {showConfirmPassword ? "Hide password" : "Show password"}
                                                    </span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Re-enter the password to confirm.</FormDescription>
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

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="isAdmin"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={handleAdminChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Admin</FormLabel>
                                                <FormDescription>Grant admin privileges with specific page access.</FormDescription>
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
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={handleSuperAdminChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Super Admin</FormLabel>
                                                <FormDescription>Grant super admin privileges with full access to all pages.</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Admin Access Pages Selection - Only show when Admin is selected */}
                            {isAdmin && !isSuperAdmin && (
                                <FormField
                                    control={form.control}
                                    name="adminAccessPages"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Admin Access Pages</FormLabel>
                                            <FormDescription>
                                                Select the pages this admin can access. Super admins have access to all pages by default.
                                            </FormDescription>
                                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                                {availablePages.map((page) => (
                                                    <FormItem key={page} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value.includes(page)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        field.onChange([...field.value, page])
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value.filter((value) => value !== page)
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                            {page}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/admins")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Admin
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
