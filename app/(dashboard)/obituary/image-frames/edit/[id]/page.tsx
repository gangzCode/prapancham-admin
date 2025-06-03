"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { ImageUpload } from "@/components/image-upload"
import { Switch } from "@/components/ui/switch" // or Checkbox if you prefer

const bgFrameFormSchema = z.object({
  isActive: z.boolean().default(true),
  frameImage: z.any().refine(val => val instanceof File || typeof val === "string", {
    message: "Background image is required.",
  }),
})

type BgFrameFormValues = z.infer<typeof bgFrameFormSchema>

export default function EditImageFramePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<BgFrameFormValues>({
    resolver: zodResolver(bgFrameFormSchema),
    defaultValues: {
      isActive: true,
      frameImage: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-frame/${params.id}`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        )

        if (!res.ok) throw new Error("Failed to fetch background image")

        const data = await res.json()

        form.reset({
          isActive: !!data.isActive,
          frameImage: data.frameImage || "",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load background image data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const onSubmit = async (values: BgFrameFormValues) => {
    setIsSubmitting(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const formData = new FormData()

      formData.append("bgFrameId", params.id)
      formData.append("isActive", String(values.isActive))

      if (values.frameImage instanceof File) {
        formData.append("frameImage", values.frameImage)
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/obituaryRemembarance-packages/bg-frame/update`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to update background image")

      toast({
        title: "Updated",
        description: "The background image has been updated successfully.",
      })
      router.push("/obituary/image-frames")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the background image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
        title="Edit Image Frame"
        description="Modify an existing image frame"
        href="/obituary/image-frames"
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="frameImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={(file) => field.onChange(file)}
                      />
                    </FormControl>
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
                      <FormLabel>Active Status</FormLabel>
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