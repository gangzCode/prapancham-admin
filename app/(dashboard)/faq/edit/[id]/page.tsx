"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const formSchema = z.object({
    
    enQuestionCategory: z.string().min(1, "Category is required"),
    enQuestionValue: z.string().min(3, "Question must be at least 3 characters"),
    enAnswerName: z.string().min(3, "Answer must be at least 3 characters"),
    enAnswerValue: z.string().min(3, "Answer must be at least 3 characters"),

    taQuestionCategory: z.string().min(1, "Category is required"),
    taQuestionValue: z.string().min(3, "Question must be at least 3 characters"),
    taAnswerName: z.string().min(3, "Answer must be at least 3 characters"),
    taAnswerValue: z.string().min(3, "Answer must be at least 3 characters"),

    siQuestionCategory: z.string().min(1, "Category is required"),
    siQuestionValue: z.string().min(3, "Question must be at least 3 characters"),
    siAnswerName: z.string().min(3, "Answer must be at least 3 characters"),
    siAnswerValue: z.string().min(3, "Answer must be at least 3 characters"),

    listingNumber: z.coerce.number().int().positive("Order must be a positive number"),
    isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface FAQModel {
    question: {
        en: Array<{ name: string; value: string; _id?: string }>
        ta: Array<{ name: string; value: string; _id?: string }>
        si: Array<{ name: string; value: string; _id?: string }>
    }
    answer: {
        en: Array<{ name: string; value: string; _id?: string }>
        ta: Array<{ name: string; value: string; _id?: string }>
        si: Array<{ name: string; value: string; _id?: string }>
    }
    _id?: string
    listingNumber: number
    isActive?: boolean
    isDeleted?: boolean
    createdAt?: string
    updatedAt?: string
    __v?: number
}

// Helper function to get content from multilingual structure
const getContent = (content: any, language: string, field = "value", defaultValue = ""): string => {
    if (!content || !content[language] || !content[language][0]) return defaultValue
    return content[language][0][field] || defaultValue
}

export default function EditFAQPage() {
    const router = useRouter()
    const { toast } = useToast()
    const params = useParams()
    const id = params?.id
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [faq, setFaq] = useState<FAQModel | null>(null)

    // Fetch FAQ data
    useEffect(() => {
        if (!id) return;

        const fetchFAQ = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch FAQ");
                }

                const data = await response.json();
                setFaq(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching FAQ:", error);
                toast({
                    title: "Error",
                    description: "Failed to load FAQ data. Please try again.",
                    variant: "destructive",
                });
                router.push("/faq");
            }
        };

        fetchFAQ();
    }, [id, router, toast]);

    // Initialize form with FAQ data
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            enQuestionCategory: "",
            enQuestionValue: "",
            enAnswerName: "",
            enAnswerValue: "",

            taQuestionCategory: "",
            taQuestionValue: "",
            taAnswerName: "",
            taAnswerValue: "",

            siQuestionCategory: "",
            siQuestionValue: "",
            siAnswerName: "",
            siAnswerValue: "",

            listingNumber: 1,
            isActive: true,
        },
    })

    // Update form values when FAQ data is loaded
    useEffect(() => {
        if (faq) {
            form.reset({
                enQuestionCategory: getContent(faq.question, "en", "name", "General"),
                enQuestionValue: getContent(faq.question, "en", "value", ""),
                enAnswerName: getContent(faq.answer, "en", "name", ""),
                enAnswerValue: getContent(faq.answer, "en", "value", ""),

                taQuestionCategory: getContent(faq.question, "ta", "name", "பொது"),
                taQuestionValue: getContent(faq.question, "ta", "value", ""),
                taAnswerName: getContent(faq.answer, "en", "name", ""),
                taAnswerValue: getContent(faq.answer, "ta", "value", ""),

                siQuestionCategory: getContent(faq.question, "si", "name", "සාමාන්‍යය"),
                siQuestionValue: getContent(faq.question, "si", "value", ""),
                siAnswerName: getContent(faq.answer, "en", "name", ""),
                siAnswerValue: getContent(faq.answer, "si", "value", ""),

                listingNumber: faq.listingNumber,
                isActive: faq.isActive ?? true,
            })
        }
    }, [faq, form])

    // Handle form submission
    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const updatedFaqData: FAQModel = {
                question: {
                    en: [
                        {
                            name: values.enQuestionCategory,
                            value: values.enQuestionValue,
                            _id: faq?.question.en[0]?._id,
                        },
                    ],
                    ta: [
                        {
                            name: values.taQuestionCategory,
                            value: values.taQuestionValue,
                            _id: faq?.question.ta[0]?._id,
                        },
                    ],
                    si: [
                        {
                            name: values.siQuestionCategory,
                            value: values.siQuestionValue,
                            _id: faq?.question.si[0]?._id,
                        },
                    ],
                },
                answer: {
                    en: [
                        {
                            name: values.enAnswerName,
                            value: values.enAnswerValue,
                            _id: faq?.answer.en[0]?._id,
                        },
                    ],
                    ta: [
                        {
                            name: values.taAnswerName,
                            value: values.taAnswerValue,
                            _id: faq?.answer.ta[0]?._id,
                        },
                    ],
                    si: [
                        {
                            name: values.siAnswerName,
                            value: values.siAnswerValue,
                            _id: faq?.answer.si[0]?._id,
                        },
                    ],
                },
                _id: faq?._id,
                listingNumber: values.listingNumber,
                isActive: values.isActive,
                isDeleted: faq?.isDeleted,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(updatedFaqData),
            });

            if (!response.ok) {
                throw new Error("Failed to update FAQ");
            }

            toast({
                title: "FAQ updated",
                description: "The FAQ has been updated successfully.",
            });

            router.push("/faq");
        } catch (error) {
            console.error("Error updating FAQ:", error);
            toast({
                title: "Error",
                description: "Failed to update FAQ. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit FAQ"
                description="Update an existing frequently asked question"
                href="/faq"
            />

            {faq && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                                <p>{faq.createdAt ? format(new Date(faq.createdAt), "PPpp") : "N/A"}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Updated At</h3>
                                <p>{faq.updatedAt ? format(new Date(faq.updatedAt), "PPpp") : "N/A"}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                <Badge variant={faq.isActive ? "default" : "secondary"}>{faq.isActive ? "Active" : "Inactive"}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground">Deleted</h3>
                                <Badge variant={faq.isDeleted ? "destructive" : "outline"}>{faq.isDeleted ? "Yes" : "No"}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <Tabs defaultValue="en" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6">
                                    <TabsTrigger value="en">English</TabsTrigger>
                                    <TabsTrigger value="ta">Tamil</TabsTrigger>
                                    <TabsTrigger value="si">Sinhala</TabsTrigger>
                                </TabsList>

                                {/* English Content */}
                                <TabsContent value="en" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="enQuestionCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., General, Payments, Obituaries" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="enQuestionValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., What is your return policy?" {...field} />
                                                </FormControl>
                                                <FormDescription>The question in English</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="enAnswerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Answer" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="enAnswerValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide a detailed answer to the question"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>The answer in English</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                {/* Tamil Content */}
                                <TabsContent value="ta" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="taQuestionCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question Name (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., பொது, கொடுப்பனவுகள்" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to in Tamil</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="taQuestionValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., உங்கள் திரும்பும் கொள்கை என்ன?" {...field} />
                                                </FormControl>
                                                <FormDescription>The question in Tamil</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="taAnswerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer Name (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., பதில்" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to in Tamil</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="taAnswerValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer (Tamil)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide a detailed answer to the question in Tamil"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>The answer in Tamil</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                {/* Sinhala Content */}
                                <TabsContent value="si" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="siQuestionCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., සාමාන්‍යය, ගෙවීම්" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to in Sinhala</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="siQuestionValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Question (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., ඔබගේ ආපසු ගැනීම් ප්‍රතිපත්තිය කුමක්ද?" {...field} />
                                                </FormControl>
                                                <FormDescription>The question in Sinhala</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="siAnswerName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer Name (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., පිළිතුර" {...field} />
                                                </FormControl>
                                                <FormDescription>The category this FAQ belongs to in Sinhala</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="siAnswerValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Answer (Sinhala)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Provide a detailed answer to the question in Sinhala"
                                                        className="min-h-[120px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>The answer in Sinhala</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <h3 className="text-lg font-medium">FAQ Settings</h3>

                            <FormField
                                control={form.control}
                                name="listingNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The order in which this FAQ will be displayed (lower numbers appear first)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Active Status</FormLabel>
                                            <FormDescription>Whether this FAQ is active and visible to users</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(checked ? true : false)}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/faq")} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" type="submit"/>
                                    Update FAQ
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
