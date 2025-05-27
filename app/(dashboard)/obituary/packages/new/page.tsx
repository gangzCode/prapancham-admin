"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

// Form schema with validation
const packageFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    price: z.coerce.number().min(0, {
        message: "Price must be a positive number.",
    }),
    duration: z.string().min(1, {
        message: "Duration is required.",
    }),
    wordLimit: z.coerce.number().min(0, {
        message: "Word limit must be a positive number.",
    }),
    isObituary: z.boolean().default(false),
    isRemembarace: z.boolean().default(false),
    isPremium: z.boolean().default(false),
    isTributeVideoUploading: z.boolean().default(false),
    isAdditionalImages: z.boolean().default(false),
    noofAdditionalImages: z.coerce.number().min(0).optional(),
    noofContectDetails: z.coerce.number().min(0).optional(),
    noofBgColors: z.coerce.number().min(0).optional(),
    noofPrimaryImageBgFrames: z.coerce.number().min(0).optional(),
    addons: z.array(z.string()).default([]),
    bgColors: z.array(z.string()).default([]),
    primaryImageBgFrames: z.array(z.string()).default([]),
    description: z.object({
        en: z
            .array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            )
            .default([]),
        ta: z
            .array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            )
            .default([]),
        si: z
            .array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            )
            .default([]),
    }),
    priceList: z
        .array(
            z.object({
                country: z.string().min(1, { message: "Country is required" }),
                countrySpecificPrice: z.coerce.number().min(0, { message: "Price must be a positive number" }),
            }),
        )
        .default([]),
})

type PackageFormValues = z.infer<typeof packageFormSchema>

// Default values for the form
const defaultValues: Partial<PackageFormValues> = {
    name: "",
    price: 0,
    duration: "",
    wordLimit: 0,
    isObituary: false,
    isRemembarace: false,
    isPremium: false,
    isTributeVideoUploading: false,
    isAdditionalImages: false,
    noofAdditionalImages: 0,
    noofContectDetails: 0,
    noofBgColors: 0,
    noofPrimaryImageBgFrames: 0,
    addons: [],
    description: {
        en: [{ name: "", value: "" }],
        ta: [{ name: "", value: "" }],
        si: [{ name: "", value: "" }],
    },
    priceList: [{ country: "", countrySpecificPrice: 0 }],
}

// Mock data for addons, colors, and frames
const mockAddons = [
    { id: "1", name: "Extended Photo Gallery", price: 49 },
    { id: "2", name: "Video Tribute", price: 99 },
    { id: "3", name: "Memorial Website", price: 149 },
    { id: "4", name: "Printed Memorial Cards", price: 79 },
    { id: "5", name: "Donation Collection", price: 59 },
]

const mockColors = [
    { id: "1", colorCode: "#E5F6FF" },
    { id: "2", colorCode: "#FFF5E5" },
    { id: "3", colorCode: "#F5FFE5" },
]

const mockFrames = [
    { id: "1", frameImage: "/placeholder.svg?height=100&width=100" },
    { id: "2", frameImage: "/placeholder.svg?height=100&width=100" },
]

export default function NewPackagePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [addons, setAddons] = useState(mockAddons)
    const [colors, setColors] = useState(mockColors)
    const [frames, setFrames] = useState(mockFrames)

    // Initialize form
    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageFormSchema),
        defaultValues,
    })

    // Watch form values to conditionally show fields
    const isAdditionalImages = form.watch("isAdditionalImages")

    // Form submission handler
    async function onSubmit(data: PackageFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "Package created",
                description: `${data.name} has been created successfully.`,
            })

            // Redirect back to packages list
            router.push("/obituary/packages")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the package. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Add a new description field
    const addDescriptionField = (language: "en" | "ta" | "si") => {
        const currentDescriptions = form.getValues().description[language]
        form.setValue(`description.${language}`, [...currentDescriptions, { name: "", value: "" }])
    }

    // Remove a description field
    const removeDescriptionField = (language: "en" | "ta" | "si", index: number) => {
        const currentDescriptions = form.getValues().description[language]
        form.setValue(
            `description.${language}`,
            currentDescriptions.filter((_, i) => i !== index),
        )
    }

    // Add a new price list item
    const addPriceListItem = () => {
        const currentPriceList = form.getValues().priceList
        form.setValue("priceList", [...currentPriceList, { country: "", countrySpecificPrice: 0 }])
    }

    // Remove a price list item
    const removePriceListItem = (index: number) => {
        const currentPriceList = form.getValues().priceList
        form.setValue(
            "priceList",
            currentPriceList.filter((_, i) => i !== index),
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Package"
                description="Create a new obituary or remembrance package"
                href="/obituary/packages"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Package Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter package name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Price</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., 30 days, 1 year, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="wordLimit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Word Limit</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="isObituary"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Obituary</FormLabel>
                                                <FormDescription>Is this an obituary package?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isRemembarace"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Remembrance</FormLabel>
                                                <FormDescription>Is this a remembrance package?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isPremium"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Premium</FormLabel>
                                                <FormDescription>Is this a premium package?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="isTributeVideoUploading"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Tribute Video Uploading</FormLabel>
                                                <FormDescription>Allow tribute video uploading?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isAdditionalImages"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Additional Images</FormLabel>
                                                <FormDescription>Allow additional images?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {isAdditionalImages && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="noofAdditionalImages"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Additional Images</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="noofContectDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Contact Details</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="noofBgColors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Background Colors</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="noofPrimaryImageBgFrames"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Primary Image Background Frames</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" placeholder="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="bgColors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Background Colors</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select background colors" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {colors.map((color) => (
                                                        <SelectItem key={color.id} value={color.id}>
                                                            <div className="flex items-center">
                                                                <div
                                                                    className="h-4 w-4 rounded-full mr-2"
                                                                    style={{ backgroundColor: color.colorCode }}
                                                                />
                                                                {color.colorCode}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                {/* <FormField
                                    control={form.control}
                                    name="primaryImageBgFrames"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Image Background Frames</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select image frames" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {frames.map((frame) => (
                                                        <SelectItem key={frame.id} value={frame.id}>
                                                            Frame {frame.id}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel className="text-base">Background Colors</FormLabel>
                                    <FormDescription className="mb-4">Select background colors for this package</FormDescription>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {colors.map((color) => (
                                            <FormField
                                                key={color.id}
                                                control={form.control}
                                                name="bgColors"
                                                render={({ field }) => {
                                                    const selectedColors = field.value || [];
                                                    return (
                                                        <FormItem
                                                            key={color.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={selectedColors.includes(color.colorCode)}
                                                                    onCheckedChange={(checked) => {
                                                                        field.onChange(
                                                                            checked
                                                                                ? [...selectedColors, color.colorCode]
                                                                                : selectedColors.filter((value) => value !== color.colorCode)
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className="h-4 w-4 rounded-full mr-2"
                                                                        style={{ backgroundColor: color.colorCode }}
                                                                    />
                                                                    {color.colorCode}
                                                                </div>
                                                            </div>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <FormLabel className="text-base">Primary Image Background Frames</FormLabel>
                                    <FormDescription className="mb-4">Select primary image background frames for this package</FormDescription>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {frames.map((frame) => (
                                            <FormField
                                                key={frame.id}
                                                control={form.control}
                                                name="primaryImageBgFrames"
                                                render={({ field }) => {
                                                    const selectedFrames = field.value || [];
                                                    return (
                                                        <FormItem
                                                            key={frame.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={selectedFrames.includes(frame.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        field.onChange(
                                                                            checked
                                                                                ? [...selectedFrames, frame.id]
                                                                                : selectedFrames.filter((value) => value !== frame.id)
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <img
                                                                    src={frame.frameImage}
                                                                    alt={`Frame ${frame.id}`}
                                                                    className="h-10 w-10 object-cover rounded-md"
                                                                />
                                                                <span>Frame {frame.id}</span>
                                                            </div>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <FormLabel className="text-base">Addons</FormLabel>
                                <FormDescription className="mb-4">Select addons to include in this package</FormDescription>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addons.map((addon) => (
                                        <FormField
                                            key={addon.id}
                                            control={form.control}
                                            name="addons"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={addon.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(addon.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, addon.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== addon.id))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                {addon.name} - ${addon.price}
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <FormLabel className="text-base">Country-Specific Pricing</FormLabel>
                                <FormDescription className="mb-4">Set different prices for different countries</FormDescription>

                                {form.getValues().priceList.map((_, index) => (
                                    <div key={index} className="flex items-end gap-4 mb-4">
                                        <FormField
                                            control={form.control}
                                            name={`priceList.${index}.country`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Country</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Country name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`priceList.${index}.countrySpecificPrice`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removePriceListItem(index)}
                                            className="mb-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" size="sm" onClick={addPriceListItem} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Country
                                </Button>
                            </div>

                            <div>
                                <FormLabel className="text-base">Package Description</FormLabel>
                                <FormDescription className="mb-4">Add descriptions in different languages</FormDescription>

                                <Tabs defaultValue="en" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="en">English</TabsTrigger>
                                        <TabsTrigger value="ta">Tamil</TabsTrigger>
                                        <TabsTrigger value="si">Sinhala</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="en">
                                        {form.getValues().description.en.map((_, index) => (
                                            <div key={index} className="flex items-end gap-4 mb-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`description.en.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Feature Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Feature name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`description.en.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea placeholder="Feature description" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeDescriptionField("en", index)}
                                                    className="mb-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDescriptionField("en")}
                                            className="mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Feature
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="ta">
                                        {form.getValues().description.ta.map((_, index) => (
                                            <div key={index} className="flex items-end gap-4 mb-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`description.ta.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Feature Name (Tamil)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Feature name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`description.ta.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Description (Tamil)</FormLabel>
                                                            <FormControl>
                                                                <Textarea placeholder="Feature description" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeDescriptionField("ta", index)}
                                                    className="mb-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDescriptionField("ta")}
                                            className="mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Feature
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="si">
                                        {form.getValues().description.si.map((_, index) => (
                                            <div key={index} className="flex items-end gap-4 mb-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`description.si.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Feature Name (Sinhala)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Feature name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`description.si.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormLabel>Description (Sinhala)</FormLabel>
                                                            <FormControl>
                                                                <Textarea placeholder="Feature description" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeDescriptionField("si", index)}
                                                    className="mb-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addDescriptionField("si")}
                                            className="mt-2"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Feature
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/obituary/packages")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => console.log(form.getValues())}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : "Create Package"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
