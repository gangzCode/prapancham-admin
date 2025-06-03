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
import { Switch } from "@/components/ui/switch"

const bgColorFormSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    colorCode: z
        .string()
        .min(4, { message: "Color code must be at least 4 characters." })
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: "Must be a valid hex color code (e.g., #FF0000 or #F00)",
        }),
    isActive: z.boolean().default(true),
})

type BgColorFormValues = z.infer<typeof bgColorFormSchema>

interface BgColorModel {
    _id?: string
    isActive?: boolean
    isDeleted?: boolean
    name?: string
    colorCode?: string
    __v?: number
}

export default function EditBgColorPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [bgColor, setBgColor] = useState<BgColorModel | null>(null)
    const id = params?.id
    

    // Initialize form
    const form = useForm<BgColorFormValues>({
        resolver: zodResolver(bgColorFormSchema), // your Zod schema here
        defaultValues: {
          name: "",
          colorCode: "",
          isActive: true,
        },
      });
      
      useEffect(() => {
        if (bgColor) {
          form.reset({
            name: bgColor.name || "",
            colorCode: bgColor.colorCode || "",
            isActive: bgColor.isActive ?? true,
          });
        }
      }, [bgColor, form]);
      

    useEffect(() => {
        if (!id) return;
      
        const fetchBgColor = async () => {
          try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-color/${id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
      
            if (!response.ok) throw new Error("Failed to fetch background color");
      
            const data = await response.json();
            setBgColor(data);
            setIsLoading(false);
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to load background color. Please try again.",
              variant: "destructive",
            });
            router.push("/obituary/bg-colors");
          }
        };
      
        fetchBgColor();
      }, [id, router, toast]);
      

    // Form submission handler
    const onSubmit = async (values: BgColorFormValues) => {
        setIsSubmitting(true);
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-color/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              ...values,
              _id: bgColor?._id,
            }),
          });
      
          if (!response.ok) throw new Error("Failed to update background color");
      
          toast({
            title: "Updated",
            description: "Background color updated successfully.",
          });
      
          router.push("/obituary/bg-colors");
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update background color. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      

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
            title="Edit Background Color"
            description="Modify an existing background color"
            href="/obituary/bg-colors"
          />
      
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter background color name" {...field} />
                        </FormControl>
                        <FormDescription>The display name of the background color.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
      
                  {/* Color Code */}
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
      
                  {/* isActive */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Status</FormLabel>
                          <FormDescription>Enable or disable this background color.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
      
                  {/* Action Buttons */}
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
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
    );
      
}
