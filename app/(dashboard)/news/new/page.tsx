"use client"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import useSWR from "swr"

// Sample news categories
const newsCategories = [
    {
        id: "1",
        name: {
            en: [{ name: "name", value: "Community" }],
            ta: [{ name: "name", value: "சமூகம்" }],
            si: [{ name: "name", value: "ප්‍රජාව" }],
        },
    },
    {
        id: "2",
        name: {
            en: [{ name: "name", value: "Health" }],
            ta: [{ name: "name", value: "சுகாதாரம்" }],
            si: [{ name: "name", value: "සෞඛ්‍ය" }],
        },
    },
    {
        id: "3",
        name: {
            en: [{ name: "name", value: "Education" }],
            ta: [{ name: "name", value: "கல்வி" }],
            si: [{ name: "name", value: "අධ්‍යාපනය" }],
        },
    },
]

// Helper function to get localized value
const getLocalizedValue = (
    field: {
        en: { name: string; value: string }[]
        ta: { name: string; value: string }[]
        si: { name: string; value: string }[]
    },
    lang: string,
) => {
    const langField = field[lang as keyof typeof field] || field.en
    return langField.length > 0 ? langField[0].value : ""
}

// Form schema with validation
const newsFormSchema = z.object({
    title: z.object({
        en: z.array(
            z.object({
                name: z.string(),
                value: z.string().min(2, { message: "Title must be at least 2 characters." }),
            }),
        ),
        ta: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
        si: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
    }),
    description: z.object({
        en: z.array(
            z.object({
                name: z.string(),
                value: z.string().min(10, { message: "Description must be at least 10 characters." }),
            }),
        ),
        ta: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
        si: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
    }),
    thumbnailImage: z.string().min(1, { message: "Thumbnail image is required." }),
    mainImage: z.string().min(1, { message: "Main image is required." }),
    otherImages: z.array(z.string()),
    paragraphs: z.array(
        z.object({
            en: z.array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            ),
            ta: z.array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            ),
            si: z.array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                }),
            ),
        }),
    ),
    editorName: z.object({
        en: z.array(
            z.object({
                name: z.string(),
                value: z.string().min(1, { message: "Editor name is required." }),
            }),
        ),
        ta: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
        si: z.array(
            z.object({
                name: z.string(),
                value: z.string(),
            }),
        ),
    }),
    newsCategory: z.string().min(1, { message: "News category is required." }),
    isBreakingNews: z.boolean().default(false),
    isImportantNews: z.boolean().default(false),
})

type NewsFormValues = z.infer<typeof newsFormSchema>

// Default values for the form
const defaultValues: Partial<NewsFormValues> = {
    title: {
        en: [{ name: "title", value: "" }],
        ta: [{ name: "title", value: "" }],
        si: [{ name: "title", value: "" }],
    },
    description: {
        en: [{ name: "description", value: "" }],
        ta: [{ name: "description", value: "" }],
        si: [{ name: "description", value: "" }],
    },
    thumbnailImage: "",
    mainImage: "",
    otherImages: [],
    paragraphs: [
        {
            en: [{ name: "paragraph", value: "" }],
            ta: [{ name: "paragraph", value: "" }],
            si: [{ name: "paragraph", value: "" }],
        },
    ],
    editorName: {
        en: [{ name: "editor", value: "" }],
        ta: [{ name: "editor", value: "" }],
        si: [{ name: "editor", value: "" }],
    },
    newsCategory: "",
    isBreakingNews: false,
    isImportantNews: false,
}

export default function NewNewsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { language = "en", t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [otherImages, setOtherImages] = useState<string[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [categoryPage, setCategoryPage] = useState(1)
    const [categoryTotalPages, setCategoryTotalPages] = useState(1)
    const categoryLimit = 10
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const { data: categoryData, isLoading: categoryLoading } = useSWR(
        `${apiUrl}/news/news-category/active?page=${categoryPage}&limit=${categoryLimit}`,
        async (url) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            if (!res.ok) throw new Error("Failed to fetch categories")
            return res.json()
        },
        { keepPreviousData: true },
    )

    useEffect(() => {
        if (categoryData?.newsCategory) {
            setCategories((prev) => {
                const ids = new Set(prev.map((c) => c._id))
                return [
                    ...prev,
                    ...categoryData.newsCategory.filter((c: any) => !ids.has(c._id)),
                ]
            })
            setCategoryTotalPages(categoryData.pagination?.totalPages || 1)
        }
    }, [categoryData])

    // Initialize form
    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsFormSchema),
        defaultValues,
    })

    // Form submission handler
    async function onSubmit(data: NewsFormValues) {
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            toast({
                title: "News article created",
                description: `"${data.title.en[0].value}" has been created successfully.`,
            })

            // Redirect back to news list
            router.push("/news")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating the news article. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Add a new paragraph
    const addParagraph = () => {
        const currentParagraphs = form.getValues().paragraphs || []
        form.setValue("paragraphs", [
            ...currentParagraphs,
            {
                en: [{ name: "paragraph", value: "" }],
                ta: [{ name: "paragraph", value: "" }],
                si: [{ name: "paragraph", value: "" }],
            },
        ])
    }

    // Remove a paragraph
    const removeParagraph = (index: number) => {
        const currentParagraphs = form.getValues().paragraphs
        form.setValue(
            "paragraphs",
            currentParagraphs.filter((_, i) => i !== index),
        )
    }

    // Add another image
    const addOtherImage = (url: string) => {
        const newOtherImages = [...otherImages, url]
        setOtherImages(newOtherImages)
        form.setValue("otherImages", newOtherImages)
    }

    // Remove an other image
    const removeOtherImage = (index: number) => {
        const newOtherImages = otherImages.filter((_, i) => i !== index)
        setOtherImages(newOtherImages)
        form.setValue("otherImages", newOtherImages)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New News Article"
                description="Create a new news article with multilingual support"
                href="/news"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit((data) => {
                                console.log("Form Data:", data)
                                onSubmit(data)
                            })}
                            className="space-y-8"
                        >
                            <Tabs defaultValue={language} className="w-full">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="en">English</TabsTrigger>
                                    <TabsTrigger value="ta">Tamil</TabsTrigger>
                                    <TabsTrigger value="si">Sinhala</TabsTrigger>
                                </TabsList>

                                {/* English Content */}
                                <TabsContent value="en" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title.en.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title (English)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter news title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description.en.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (English)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter news description" className="min-h-20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Paragraphs (English)</FormLabel>
                                            <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Paragraph
                                            </Button>
                                        </div>

                                        {form.getValues().paragraphs.map((_, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`paragraphs.${index}.en.0.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Textarea placeholder={`Paragraph ${index + 1}`} className="min-h-20" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeParagraph(index)}
                                                    className="mt-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="editorName.en.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Editor Name (English)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter editor name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                {/* Tamil Content */}
                                <TabsContent value="ta" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title.ta.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter news title in Tamil" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description.ta.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter news description in Tamil" className="min-h-20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <FormLabel>Paragraphs (Tamil)</FormLabel>
                                        {form.getValues().paragraphs.map((_, index) => (
                                            <FormField
                                                key={index}
                                                control={form.control}
                                                name={`paragraphs.${index}.ta.0.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder={`Paragraph ${index + 1} in Tamil`}
                                                                className="min-h-20"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="editorName.ta.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Editor Name (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter editor name in Tamil" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                {/* Sinhala Content */}
                                <TabsContent value="si" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title.si.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter news title in Sinhala" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description.si.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Enter news description in Sinhala" className="min-h-20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <FormLabel>Paragraphs (Sinhala)</FormLabel>
                                        {form.getValues().paragraphs.map((_, index) => (
                                            <FormField
                                                key={index}
                                                control={form.control}
                                                name={`paragraphs.${index}.si.0.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder={`Paragraph ${index + 1} in Sinhala`}
                                                                className="min-h-20"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="editorName.si.0.value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Editor Name (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter editor name in Sinhala" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="newsCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>News Category</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent
                                                    onScroll={(e) => {
                                                        const el = e.currentTarget
                                                        if (
                                                            el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
                                                            categoryPage < categoryTotalPages &&
                                                            !categoryLoading
                                                        ) {
                                                            setCategoryPage((p) => p + 1)
                                                        }
                                                    }}
                                                >
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat._id} value={cat._id}>
                                                            {cat.name?.en?.[0]?.name || ""}
                                                        </SelectItem>
                                                    ))}
                                                    {categoryLoading && (
                                                        <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="isBreakingNews"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Breaking News</FormLabel>
                                                    <FormDescription>Mark as breaking news</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isImportantNews"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Important News</FormLabel>
                                                    <FormDescription>Mark as important news</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="thumbnailImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thumbnail Image</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={(file) => field.onChange(file)}
                                                    previewHeight={150}
                                                    previewWidth={200}
                                                />
                                            </FormControl>
                                            <FormDescription>Small image used in news listings (recommended: 300x200px)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mainImage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Main Image</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={(url) => field.onChange(url)}
                                                    previewHeight={150}
                                                    previewWidth={200}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Large image displayed at the top of the article (recommended: 1200x800px)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Additional Images (Optional)</FormLabel>
                                    <div className="flex-1 ml-4">
                                        <ImageUpload
                                            value=""
                                            onChange={(url) => addOtherImage(url)}
                                            previewHeight={100}
                                            previewWidth={150}
                                        />
                                    </div>
                                </div>

                                {otherImages.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                        {otherImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image || "/placeholder.svg"}
                                                    alt={`Additional image ${index + 1}`}
                                                    className="w-full h-auto rounded-md"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => removeOtherImage(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/news")} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create News Article"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
