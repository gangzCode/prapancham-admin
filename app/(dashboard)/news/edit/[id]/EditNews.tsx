"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
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
import { Plus, Trash2, Loader2 } from "lucide-react"


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
    isDeleted: z.boolean().default(false),
})

type NewsFormValues = z.infer<typeof newsFormSchema>

export default function EditNewsPage({ id }: { id: string }) {
    const router = useRouter()
    const { toast } = useToast()
    const { language, t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [otherImages, setOtherImages] = useState<string[]>([])
    const [newsCategories, setNewsCategories] = useState<{
        id: string
        name: {
            en: { name: string; value: string }[]
            ta: { name: string; value: string }[]
            si: { name: string; value: string }[]
        }
    }[]>([]);

    // Initialize form
    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsFormSchema),
        defaultValues: {
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
            isDeleted: false,
        },
    })

    // Watch paragraphs field for reactivity
    const paragraphs = useWatch({
        control: form.control,
        name: "paragraphs",
    })

    useEffect(() => {
        async function fetchCategories() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

                const res = await fetch(`https://prapancham-backend.vercel.app/api/v1/news/news-category/all`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                })

                const json = await res.json()

                if (Array.isArray(json.newsCategory)) {
                    const formatted = json.newsCategory.map((item: any) => ({
                        id: item._id,
                        name: item.name,
                    }))
                    setNewsCategories(formatted)
                }
            } catch (err) {
                console.error("Failed to fetch categories", err)
            }
        }

        fetchCategories()
    }, []);

    // Fetch news data
    useEffect(() => {
        async function fetchNews() {
            try {

                const response = await fetch(`https://prapancham-backend.vercel.app/api/v1/news/${id}`);
                const newsData = await response.json();

                // Set form values
                form.reset({
                    title: newsData.news.title,
                    description: newsData.news.description,
                    thumbnailImage: newsData.news.thumbnailImage,
                    mainImage: newsData.news.mainImage,
                    otherImages: newsData.news.otherImages,
                    paragraphs: newsData.news.paragraphs,
                    editorName: newsData.news.editorName,
                    newsCategory: newsData.news.newsCategory._id,
                    isBreakingNews: newsData.news.isBreakingNews,
                    isImportantNews: newsData.news.isImportantNews,
                    isDeleted: newsData.news.isDeleted,
                })

                setOtherImages(newsData.news.otherImages)
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load news data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchNews()
    }, [id, form, toast])

    // Form submission handler
    async function onSubmit(data: NewsFormValues) {
        setIsSubmitting(true)

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const formData = new FormData()

            formData.append("title", JSON.stringify(data.title))
            formData.append("description", JSON.stringify(data.description))
            formData.append("editorName", JSON.stringify(data.editorName))
            formData.append("paragraphs", JSON.stringify(data.paragraphs))
            formData.append("newsCategory", data.newsCategory)
            formData.append("isBreakingNews", String(data.isBreakingNews))
            formData.append("isImportantNews", String(data.isImportantNews))
            formData.append("thumbnailImage", data.thumbnailImage)
            formData.append("mainImage", data.mainImage)
            data.otherImages.forEach((file: any) => {
                formData.append("otherImages", file)
            })
            formData.append("newsId", id)


            const response = await fetch(`https://prapancham-backend.vercel.app/api/v1/news/update`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            toast({
                title: "News article updated",
                description: `"${data.title.en[0].value}" has been updated successfully.`,
            })

            // Redirect back to news list
            router.push("/news")
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error updating the news article. Please try again.",
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
    const addOtherImage = (url: string | File | null) => {
        if (!url) return
        const urlString = typeof url === 'string' ? url : ''
        if (!urlString) return
        const newOtherImages = [...otherImages, urlString]
        setOtherImages(newOtherImages)
        form.setValue("otherImages", newOtherImages)
    }

    // Remove an other image
    const removeOtherImage = (index: number) => {
        const newOtherImages = otherImages.filter((_, i) => i !== index)
        setOtherImages(newOtherImages)
        form.setValue("otherImages", newOtherImages)
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
                title="Edit News Article"
                description="Modify an existing news article with multilingual support"
                href="/news"
            />

            <Card>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Tabs defaultValue="en" className="w-full">
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

                                        {paragraphs?.map((_, index) => (
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Paragraphs (Tamil)</FormLabel>
                                            <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Paragraph
                                            </Button>
                                        </div>

                                        {paragraphs?.map((_, index) => (
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Paragraphs (Sinhala)</FormLabel>
                                            <Button type="button" variant="outline" size="sm" onClick={addParagraph}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Paragraph
                                            </Button>
                                        </div>

                                        {paragraphs?.map((_, index) => (
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select news category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {newsCategories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {getLocalizedValue(category.name, language)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isDeleted"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 border-destructive/20 bg-destructive/5">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Mark as Deleted</FormLabel>
                                                <FormDescription>
                                                    This will hide the news article from the website but keep it in the database.
                                                </FormDescription>
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
                                                    onChange={(url) => field.onChange(url)}
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

                                {Array.isArray(otherImages) && otherImages.length > 0 && (
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
