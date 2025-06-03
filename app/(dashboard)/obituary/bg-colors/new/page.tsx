"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

const bgColorFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  colorCode: z
    .string()
    .min(4, { message: "Color code must be at least 4 characters." })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: "Must be a valid hex color code (e.g., #FF0000 or #F00)",
    }),
})

type BgColorFormValues = z.infer<typeof bgColorFormSchema>

// Updated default values
const defaultValues: Partial<BgColorFormValues> = {
  name: "",
  colorCode: "#FFFFFF",
}

export default function NewBgColorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BgColorFormValues>({
    resolver: zodResolver(bgColorFormSchema),
    defaultValues,
  })

  const handleSubmit = async (values: BgColorFormValues) => {
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-color`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(values),
      });
  
      if (!res.ok) throw new Error("Failed to create background-color");
  
      toast({
        title: "Background-Color created",
        description: "The background-color has been created successfully.",
      });
      router.push("/obituary/bg-colors");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating the background-color. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Background Color"
        description="Create a new background color for obituary posts"
        href="/obituary/bg-colors"
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Crimson Red" {...field} />
                    </FormControl>
                    <FormDescription>Provide a descriptive name for this color.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <div
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: field.value }}
                      />
                      <Input
                        type="color"
                        className="w-12 h-10 p-1 cursor-pointer"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormDescription>
                      Enter a valid hex color code (e.g., #FF0000 for red).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  {isSubmitting ? "Creating..." : "Create Color"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}