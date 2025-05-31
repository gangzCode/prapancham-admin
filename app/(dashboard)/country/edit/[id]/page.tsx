"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

type LangKey = "en" | "ta" | "si"

const defaultNames = {
    en: [{ name: "Country Name", value: "" }],
    ta: [{ name: "நாடு பெயர்", value: "" }],
    si: [{ name: "රටේ නම", value: "" }],
}

async function fetchCountry(id: string, token: string | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country/${id}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        cache: "no-store",
    })
    if (!res.ok) throw new Error("Failed to fetch country")
    return res.json()
}

export default function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { toast } = useToast()
    const [names, setNames] = useState(defaultNames)
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState<LangKey>("en")

    // Unwrap params using React.use()
    const { id } = use(params)

    useEffect(() => {
        const fetchData = async () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            try {
                const data = await fetchCountry(id, token)
                setNames({
                    en: [{ name: "Country Name", value: data.name?.en?.[0]?.value || "" }],
                    ta: [{ name: "நாடு பெயர்", value: data.name?.ta?.[0]?.value || "" }],
                    si: [{ name: "රටේ නම", value: data.name?.si?.[0]?.value || "" }],
                })
                setPreview(data.image || "")
            } catch {
                toast({ title: "Error", description: "Failed to load country." })
            }
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleNameChange = (lang: LangKey, value: string) => {
        setNames((prev) => ({
            ...prev,
            [lang]: [{ ...prev[lang][0], value }],
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        setImage(file || null)
        if (file) {
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("countryId", id)
            formData.append("name", JSON.stringify(names))
            if (image) formData.append("image", image)

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country/update`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to update country")

            toast({ title: "Country updated", description: "Country has been updated successfully." })
            router.push("/country")
        } catch (err) {
            toast({ title: "Error", description: "Failed to update country." })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Country</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardContent className="pt-6 space-y-6">
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
                            <Input type="file" accept="image/*" onChange={handleImageChange} />
                            {preview && (
                                <div className="flex justify-center mt-4">
                                    <div className="relative border rounded-md overflow-hidden">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-w-full h-auto max-h-48"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Country"}
                    </Button>
                </div>
            </form>
        </div>
    )
}