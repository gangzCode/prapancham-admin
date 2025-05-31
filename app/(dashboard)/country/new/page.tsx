"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"
import Image from "next/image"
import { Upload } from "lucide-react"

type LangKey = "en" | "ta" | "si"

const defaultNames = {
    en: [{ name: "Country Name", value: "" }],
    ta: [{ name: "நாடு பெயர்", value: "" }],
    si: [{ name: "රටේ නම", value: "" }],
}

export default function AddCountryPage() {
    const router = useRouter()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [names, setNames] = useState(defaultNames)
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState<LangKey>("en")
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const handleNameChange = (lang: LangKey, value: string) => {
        setNames((prev) => ({
            ...prev,
            [lang]: [{ ...prev[lang][0], value }],
        }))
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onload = () => {
                setPreviewImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", JSON.stringify(names))
            if (imageFile) formData.append("image", imageFile)

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to add country")

            toast({ title: "Country added", description: "Country has been added successfully." })
            router.push("/country")
        } catch (err) {
            toast({ title: "Error", description: "Failed to add country." })
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Add New Country"
                description="Add a new country with its details and image."
                href="/country"
            />
            <Card>
                <CardContent className="pt-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <Tabs value={tab} onValueChange={(v) => setTab(v as LangKey)} className="w-full">
                            <TabsList>
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>
                            {(["en", "ta", "si"] as LangKey[]).map((lang) => (
                                <TabsContent key={lang} value={lang}>
                                    <Label className="block mb-2">{names[lang][0].name}</Label>
                                    <Input
                                        type="text"
                                        value={names[lang][0].value}
                                        onChange={(e) => handleNameChange(lang, e.target.value)}
                                        required={lang === "en"}
                                        placeholder={names[lang][0].name}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                        <div>
                            <Label className="block mb-2">Image</Label>

                            <div className="flex flex-col items-center gap-4">
                                {previewImage ? (
                                    <div className="relative h-40 w-full max-w-md overflow-hidden rounded-md border">
                                        <Image
                                            src={previewImage || "/placeholder.svg"}
                                            alt="Advertisement preview"
                                            fill
                                            className="object-contain"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="absolute bottom-2 right-2"
                                            onClick={() => setPreviewImage(null)}
                                        >
                                            Change Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className="flex h-40 w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-md border border-dashed"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to upload an image</p>
                                        <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/country">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Adding..." : "Add Country"}
                            </Button>
                        </div>
                    </form>

                </CardContent>
            </Card>
        </div>

    )
}