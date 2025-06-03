"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
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
import { ImageUpload } from "@/components/image-upload"

const bgFrameFormSchema = z.object({
  frameImage: z.instanceof(File, { message: "Image is required" }),
})

type BgFrameFormValues = z.infer<typeof bgFrameFormSchema>

export default function NewImageFramePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BgFrameFormValues>({
    resolver: zodResolver(bgFrameFormSchema),
  })

  const handleSubmit = async (values: BgFrameFormValues) => {
    setIsSubmitting(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const formData = new FormData()

      formData.append("frameImage", values.frameImage)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-frame`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to create background frame")

      toast({
        title: "Success",
        description: "The background frame has been created successfully.",
      })

      router.push("/obituary/image-frames")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error creating the background frame. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Image Frame"
        description="Create a new primary image frame for obituary posts"
        href="/obituary/image-frames"
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="frameImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frame Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={(file) => field.onChange(file)}
                        previewHeight={200}
                        previewWidth={200}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image to be used as a frame. Transparent PNG files work best.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/obituary/image-frames")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Frame"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}