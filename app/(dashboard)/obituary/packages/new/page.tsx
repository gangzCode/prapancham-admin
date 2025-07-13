"use client"

import { useState, useEffect } from "react"
import * as React from "react"
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
    isPriority: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
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

// Type definitions for API responses
interface AddonName {
    en: Array<{ name: string; value: string; _id: string }>
    ta: Array<{ name: string; value: string; _id: string }>
    si: Array<{ name: string; value: string; _id: string }>
}

interface AddonPriceList {
    country: string
    price: number
    _id: string
}

interface Addon {
    _id: string
    name: AddonName
    priceList: AddonPriceList[]
    isActive: boolean
    isDeleted: boolean
    __v: number
}

interface AddonsResponse {
    addons: Addon[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

interface BgColor {
    _id: string
    name: string
    colorCode: string
    isDeleted: boolean
    isActive: boolean
    __v: number
}

interface BgColorsResponse {
    bgColor: BgColor[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

interface BgFrame {
    _id: string
    frameImage: string
    isDeleted: boolean
    isActive: boolean
    __v: number
}

interface BgFramesResponse {
    bgFrame: BgFrame[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

interface CountryName {
    en: Array<{ name: string; value: string; _id: string }>
    ta: Array<{ name: string; value: string; _id: string }>
    si: Array<{ name: string; value: string; _id: string }>
}

interface Country {
    _id: string
    name: CountryName
    currencyCode: string
    isDeleted: boolean
    isActive: boolean
    image: string
    createdAt: string
    updatedAt: string
    __v: number
}

interface CountriesResponse {
    countries: Country[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
    }
}

// Default values for the form
const defaultValues: Partial<PackageFormValues> = {
    name: "",
    price: 0,
    duration: "",
    wordLimit: 0,
    isObituary: false,
    isRemembarace: false,
    isPremium: false,
    isPriority: false,
    isFeatured: false,
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

export default function NewPackagePage() {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [addons, setAddons] = useState<Addon[]>([])
    const [colors, setColors] = useState<BgColor[]>([])
    const [frames, setFrames] = useState<BgFrame[]>([])
    const [countries, setCountries] = useState<Country[]>([])
    const [isLoadingAddons, setIsLoadingAddons] = useState(true)
    const [isLoadingColors, setIsLoadingColors] = useState(true)
    const [isLoadingFrames, setIsLoadingFrames] = useState(true)
    const [isLoadingCountries, setIsLoadingCountries] = useState(true)

    // Initialize form
    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageFormSchema),
        defaultValues,
    })

    // Fetch addons from API
    useEffect(() => {
        const fetchAddons = async () => {
            try {
                setIsLoadingAddons(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/addons/active?page=1&limit=10`)

                if (!response.ok) {
                    throw new Error('Failed to fetch addons')
                }

                const data: AddonsResponse = await response.json()
                setAddons(data.addons)
            } catch (error) {
                console.error('Error fetching addons:', error)
                toast({
                    title: "Error",
                    description: "Failed to load addons. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingAddons(false)
            }
        }

        fetchAddons()
    }, [])

    // Fetch colors from API
    useEffect(() => {
        const fetchColors = async () => {
            try {
                setIsLoadingColors(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/bg-color/active?page=1&limit=10`)

                if (!response.ok) {
                    throw new Error('Failed to fetch colors')
                }

                const data: BgColorsResponse = await response.json()
                setColors(data.bgColor)
            } catch (error) {
                console.error('Error fetching colors:', error)
                toast({
                    title: "Error",
                    description: "Failed to load background colors. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingColors(false)
            }
        }

        fetchColors()
    }, [])

    // Fetch frames from API
    useEffect(() => {
        const fetchFrames = async () => {
            try {
                setIsLoadingFrames(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/bg-frame/active?page=1&limit=10`)

                if (!response.ok) {
                    throw new Error('Failed to fetch frames')
                }

                const data: BgFramesResponse = await response.json()
                setFrames(data.bgFrame)
            } catch (error) {
                console.error('Error fetching frames:', error)
                toast({
                    title: "Error",
                    description: "Failed to load background frames. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingFrames(false)
            }
        }

        fetchFrames()
    }, [])

    // Fetch countries from API
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setIsLoadingCountries(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/country/active?page=1&limit=10`)

                if (!response.ok) {
                    throw new Error('Failed to fetch countries')
                }

                const data: CountriesResponse = await response.json()
                setCountries(data.countries)
            } catch (error) {
                console.error('Error fetching countries:', error)
                toast({
                    title: "Error",
                    description: "Failed to load countries. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingCountries(false)
            }
        }

        fetchCountries()
    }, [])

    // Watch form values to conditionally show fields
    const isAdditionalImages = form.watch("isAdditionalImages")
    const priceList = form.watch("priceList")
    const description = form.watch("description")
    const noofBgColors = form.watch("noofBgColors")
    const selectedBgColors = form.watch("bgColors")
    const noofPrimaryImageBgFrames = form.watch("noofPrimaryImageBgFrames")
    const selectedPrimaryImageBgFrames = form.watch("primaryImageBgFrames")

    // Helper function to check if current price list items are valid
    const isValidPriceListItem = (item: { country: string; countrySpecificPrice: number }) => {
        return item.country && item.country.trim() !== "" && item.countrySpecificPrice > 0
    }

    // Get list of already selected countries
    const selectedCountries = priceList
        .filter(item => item.country && item.country.trim() !== "")
        .map(item => item.country)

    // Check if we should disable the Add Country button
    const shouldDisableAddButton = priceList.length === 0 || 
        !priceList.some(isValidPriceListItem) || 
        selectedCountries.length >= countries.length

    // Handle background colors limit changes
    React.useEffect(() => {
        const currentColors = selectedBgColors || [];
        const maxColors = noofBgColors || 0;
        
        // If current selection exceeds new limit, trim it
        if (maxColors > 0 && currentColors.length > maxColors) {
            form.setValue("bgColors", currentColors.slice(0, maxColors));
        }
    }, [noofBgColors, selectedBgColors, form]);

    // Handle primary image background frames limit changes
    React.useEffect(() => {
        const currentFrames = selectedPrimaryImageBgFrames || [];
        const maxFrames = noofPrimaryImageBgFrames || 0;
        
        // If current selection exceeds new limit, trim it
        if (maxFrames > 0 && currentFrames.length > maxFrames) {
            form.setValue("primaryImageBgFrames", currentFrames.slice(0, maxFrames));
        }
    }, [noofPrimaryImageBgFrames, selectedPrimaryImageBgFrames, form]);

    // Form submission handler
    async function onSubmit(data: PackageFormValues) {
        // Validate that all language tabs have the same number of features
        const enFeaturesCount = data.description.en.length;
        const taFeaturesCount = data.description.ta.length;
        const siFeaturesCount = data.description.si.length;

        if (enFeaturesCount !== taFeaturesCount || enFeaturesCount !== siFeaturesCount || taFeaturesCount !== siFeaturesCount) {
            toast({
                title: "Validation Error",
                description: `Please ensure all language tabs have the same number of features. Currently: English (${enFeaturesCount}), Tamil (${taFeaturesCount}), Sinhala (${siFeaturesCount}).`,
                variant: "destructive",
            });
            return; // Stop form submission
        }

        // Convert colorCode values to _id values for selected colors
        const selectedColorIds = (data.bgColors || []).map(colorCode => {
            const color = colors.find(c => c.colorCode === colorCode);
            return color ? color._id : colorCode;
        });

        // Prepare the data in the required format
        const requestData = {
            "name": {
                "en": [{ "name": data.name, "value": data.name }],
                "ta": [{ "name": data.name, "value": data.name }],
                "si": [{ "name": data.name, "value": data.name }]
            },
            "addons": data.addons || [],
            "isObituary": data.isObituary,
            "isRemembarace": data.isRemembarace,
            "isPremium": data.isPremium,
            "basePrice": {
                "country": data.priceList?.[0]?.country || "",
                "price": data.price || 0
            },
            "duration": data.duration,
            "description": data.description,
            "wordLimit": data.wordLimit,
            "priceList": data.priceList?.map(item => ({
                "country": item.country,
                "price": item.countrySpecificPrice
            })) || [],
            "isTributeVideoUploading": data.isTributeVideoUploading,
            "isAdditionalImages": data.isAdditionalImages,
            "isSlideShow": false, // Not available in current form
            "isPriority": data.isPriority,
            "isFeatured": data.isFeatured,
            "isSocialSharing": false, // Not available in current form
            "noofAdditionalImages": data.noofAdditionalImages,
            "noofContectDetails": data.noofContectDetails,
            "noofBgColors": data.noofBgColors,
            "bgColors": selectedColorIds,
            "noofPrimaryImageBgFrames": data.noofPrimaryImageBgFrames,
            "primaryImageBgFrames": data.primaryImageBgFrames || []
        };

        // Log the data being sent
        console.log('Sending package data:', requestData);

        setIsSubmitting(true)

        try {
            // Send POST request to create package
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const token = localStorage.getItem('token')
            
            const response = await fetch(`${apiUrl}/obituaryRemembarance-packages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
            }

            const responseData = await response.json()
            console.log('Package created successfully:', responseData)

            toast({
                title: "Package created",
                description: `${data.name} has been created successfully.`,
            })

            // Redirect back to packages list
            router.push("/obituary/packages")
        } catch (error) {
            console.error('Error creating package:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "There was an error creating the package. Please try again.",
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
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked)
                                                        // If obituary is selected, unselect remembrance
                                                        if (checked) {
                                                            form.setValue("isRemembarace", false)
                                                        }
                                                    }}
                                                />
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
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked)
                                                        // If remembrance is selected, unselect obituary
                                                        if (checked) {
                                                            form.setValue("isObituary", false)
                                                        }
                                                    }}
                                                />
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
                                    name="isPriority"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Priority</FormLabel>
                                                <FormDescription>Mark this package as priority?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked)
                                                        // If priority is selected, unselect featured
                                                        if (checked) {
                                                            form.setValue("isFeatured", false)
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isFeatured"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Featured</FormLabel>
                                                <FormDescription>Mark this package as featured?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked)
                                                        // If featured is selected, unselect priority
                                                        if (checked) {
                                                            form.setValue("isPriority", false)
                                                        }
                                                    }}
                                                />
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FormLabel className="text-base">Background Colors</FormLabel>
                                    <FormDescription className="mb-4">
                                        Select background colors for this package
                                        {(noofBgColors || 0) > 0 && (
                                            <span className={`block text-xs mt-1 ${
                                                (selectedBgColors?.length || 0) >= (noofBgColors || 0) 
                                                    ? 'text-orange-600 font-medium' 
                                                    : 'text-muted-foreground'
                                            }`}>
                                                ({selectedBgColors?.length || 0} of {noofBgColors || 0} selected)
                                                {(selectedBgColors?.length || 0) >= (noofBgColors || 0) && 
                                                    " - Maximum reached"
                                                }
                                            </span>
                                        )}
                                    </FormDescription>
                                    {isLoadingColors ? (
                                        <div className="text-center py-4">Loading colors...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {colors.map((color) => (
                                                <FormField
                                                    key={color._id}
                                                    control={form.control}
                                                    name="bgColors"
                                                    render={({ field }) => {
                                                        const selectedColors = field.value || [];
                                                        return (
                                                            <FormItem
                                                                key={color._id}
                                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={selectedColors.includes(color.colorCode)}
                                                                        disabled={
                                                                            !selectedColors.includes(color.colorCode) && 
                                                                            selectedColors.length >= (noofBgColors || 0)
                                                                        }
                                                                        onCheckedChange={(checked) => {
                                                                            const maxColors = noofBgColors || 0;
                                                                            if (checked) {
                                                                                // Only add if under the limit
                                                                                if (selectedColors.length < maxColors) {
                                                                                    field.onChange([...selectedColors, color.colorCode]);
                                                                                }
                                                                            } else {
                                                                                // Always allow removal
                                                                                field.onChange(selectedColors.filter((value) => value !== color.colorCode));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <div className="flex items-center">
                                                                        <div
                                                                            className="h-4 w-4 rounded-full mr-2"
                                                                            style={{ backgroundColor: color.colorCode }}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium">{color.name}</span>
                                                                            <span className="text-xs text-muted-foreground">{color.colorCode}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        );
                                                    }} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <FormLabel className="text-base">Primary Image Background Frames</FormLabel>
                                    <FormDescription className="mb-4">
                                        Select primary image background frames for this package
                                        {(noofPrimaryImageBgFrames || 0) > 0 && (
                                            <span className={`block text-xs mt-1 ${
                                                (selectedPrimaryImageBgFrames?.length || 0) >= (noofPrimaryImageBgFrames || 0) 
                                                    ? 'text-orange-600 font-medium' 
                                                    : 'text-muted-foreground'
                                            }`}>
                                                ({selectedPrimaryImageBgFrames?.length || 0} of {noofPrimaryImageBgFrames || 0} selected)
                                                {(selectedPrimaryImageBgFrames?.length || 0) >= (noofPrimaryImageBgFrames || 0) && 
                                                    " - Maximum reached"
                                                }
                                            </span>
                                        )}
                                    </FormDescription>
                                    {isLoadingFrames ? (
                                        <div className="text-center py-4">Loading frames...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {frames.map((frame) => (
                                                <FormField
                                                    key={frame._id}
                                                    control={form.control}
                                                    name="primaryImageBgFrames"
                                                    render={({ field }) => {
                                                        const selectedFrames = field.value || [];
                                                        return (
                                                            <FormItem
                                                                key={frame._id}
                                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={selectedFrames.includes(frame._id)}
                                                                        disabled={
                                                                            !selectedFrames.includes(frame._id) && 
                                                                            selectedFrames.length >= (noofPrimaryImageBgFrames || 0)
                                                                        }
                                                                        onCheckedChange={(checked) => {
                                                                            const maxFrames = noofPrimaryImageBgFrames || 0;
                                                                            if (checked) {
                                                                                // Only add if under the limit
                                                                                if (selectedFrames.length < maxFrames) {
                                                                                    field.onChange([...selectedFrames, frame._id]);
                                                                                }
                                                                            } else {
                                                                                // Always allow removal
                                                                                field.onChange(selectedFrames.filter((value) => value !== frame._id));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <img
                                                                        src={frame.frameImage}
                                                                        alt={`Frame ${frame._id}`}
                                                                        className="h-10 w-10 object-cover rounded-md"
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">Frame {frame._id.slice(-4)}</span>
                                                                </div>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <FormLabel className="text-base">Addons</FormLabel>
                                <FormDescription className="mb-4">Select addons to include in this package</FormDescription>
                                {isLoadingAddons ? (
                                    <div className="text-center py-4">Loading addons...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addons.map((addon) => {
                                            // Get English name for display (fallback to first available language)
                                            const displayName = addon.name.en?.[0]?.name ||
                                                addon.name.ta?.[0]?.name ||
                                                addon.name.si?.[0]?.name ||
                                                'Unnamed Addon'

                                            const displayValue = addon.name.en?.[0]?.value ||
                                                addon.name.ta?.[0]?.value ||
                                                addon.name.si?.[0]?.value ||
                                                ''

                                            // Get price (using first price in the list)
                                            const price = addon.priceList?.[0]?.price || 0

                                            return (
                                                <FormField
                                                    key={addon._id}
                                                    control={form.control}
                                                    name="addons"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={addon._id}
                                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(addon._id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, addon._id])
                                                                                : field.onChange(field.value?.filter((value) => value !== addon._id))
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel className="text-sm font-medium">
                                                                        {displayName}
                                                                    </FormLabel>
                                                                    {displayValue && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {displayValue}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs font-medium text-green-600">
                                                                        ${price}
                                                                    </p>
                                                                </div>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <FormLabel className="text-base">Country-Specific Pricing</FormLabel>
                                <FormDescription className="mb-4">Set different prices for different countries</FormDescription>

                                {priceList.map((_, index) => (
                                    <div key={index} className="flex items-end gap-4 mb-4">
                                        <FormField
                                            control={form.control}
                                            name={`priceList.${index}.country`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>Country</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {isLoadingCountries ? (
                                                                <SelectItem value="loading" disabled>
                                                                    Loading countries...
                                                                </SelectItem>
                                                            ) : countries.filter((country) => !selectedCountries.includes(country._id) || country._id === field.value).length === 0 ? (
                                                                <SelectItem value="no-countries" disabled>
                                                                    All countries have been selected
                                                                </SelectItem>
                                                            ) : (
                                                                countries
                                                                    .filter((country) => !selectedCountries.includes(country._id) || country._id === field.value)
                                                                    .map((country) => {
                                                                        // Get English name for display (fallback to first available language)
                                                                        const displayName = country.name.en?.[0]?.value ||
                                                                            country.name.ta?.[0]?.value ||
                                                                            country.name.si?.[0]?.value ||
                                                                            'Unknown Country'

                                                                        return (
                                                                            <SelectItem key={country._id} value={country._id}>
                                                                                {displayName} ({country.currencyCode})
                                                                            </SelectItem>
                                                                        )
                                                                    })
                                                            )}
                                                        </SelectContent>
                                                    </Select>
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

                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addPriceListItem} 
                                    className="mt-2"
                                    disabled={shouldDisableAddButton}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Country
                                </Button>
                                {shouldDisableAddButton && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {selectedCountries.length >= countries.length 
                                            ? "All available countries have been added"
                                            : "Please select a country and enter a price for the current entry before adding a new one"
                                        }
                                    </p>
                                )}
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
                                        {description.en.map((_, index) => (
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
                                        {description.ta.map((_, index) => (
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
                                        {description.si.map((_, index) => (
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
                                    type="submit"
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
