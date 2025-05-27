"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, Plus, Upload } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"

export default function AddAdvertisementPage() {
    const router = useRouter()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        link: "",
        adType: "",
        adPageName: "",
        expiryDate: "",
    })
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [adTypes, setAdTypes] = useState<any[]>([])
    const [adTypePage, setAdTypePage] = useState(1)
    const [adTypeTotalPages, setAdTypeTotalPages] = useState(1)
    const adTypeLimit = 10
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
    const { data: adTypeData, isLoading: adTypeLoading } = useSWR(
        `${apiUrl}/advertistment/ad-type/active?page=${adTypePage}&limit=${adTypeLimit}`,
        async (url) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            if (!res.ok) throw new Error("Failed to fetch ad types")
            return res.json()
        },
        { keepPreviousData: true }
    )

    useEffect(() => {
        if (adTypeData?.adTypes) {
            setAdTypes((prev) => {
                const ids = new Set(prev.map((t) => t._id || t.id))
                return [
                    ...prev,
                    ...adTypeData.adTypes.filter((t: any) => !ids.has(t._id || t.id)),
                ]
            })
            setAdTypeTotalPages(adTypeData.pagination?.totalPages || 1)
        }
    }, [adTypeData])

    const pageNames = [
        { value: "home", label: "Home Page" },
        { value: "obituary", label: "Obituary Page" },
        { value: "news", label: "News Page" },
        { value: "events", label: "Events Page" },
        { value: "contact", label: "Contact Page" },
        { value: "create-memorial", label: "Create Memorial Page" },
    ]

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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

        if (!imageFile) {
            toast({
                title: "Error",
                description: "Please upload an image for the advertisement.",
                variant: "destructive",
            })
            return
        }
        if (!formData.expiryDate) {
            toast({
                title: "Error",
                description: "Please select an expiry date.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            const form = new FormData()
            form.append("link", String(formData.link))
            form.append("adType", String(formData.adType))
            form.append("adPageName", String(formData.adPageName))
            form.append("expiryDate", String(formData.expiryDate))
            if (imageFile) form.append("image", imageFile)

            // Debug: log FormData entries
            for (const pair of form.entries()) {
                console.log(pair[0] + ': ' + pair[1])
            }

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${apiUrl}/advertistment`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: form,
            })

            if (!res.ok) throw new Error("Failed to create advertisement")

            toast({
                title: "Advertisement created",
                description: "The advertisement has been created successfully.",
            })

            router.push("/advertisement")
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while creating the advertisement.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Add New Advertisement"
                description="Manage advertisements and placements"
                href="/advertisement"
            />

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="image">Advertisement Image</Label>
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="adType">Advertisement Type</Label>
                                <Select
                                    value={formData.adType}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, adType: value }))}
                                >
                                    <SelectTrigger id="adType">
                                        <SelectValue placeholder="Select ad type" />
                                    </SelectTrigger>
                                    <SelectContent
                                        onScroll={e => {
                                            const el = e.currentTarget
                                            if (
                                                el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
                                                adTypePage < adTypeTotalPages &&
                                                !adTypeLoading
                                            ) {
                                                setAdTypePage((p) => p + 1)
                                            }
                                        }}
                                    >
                                        {adTypes.map((type) => (
                                            <SelectItem key={type._id || type.id} value={type._id || type.id}>
                                                {type.type ? `${type.type}` : ""}
                                            </SelectItem>
                                        ))}
                                        {adTypeLoading && <div className="p-2 text-center text-xs text-muted-foreground">Loading...</div>}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adPageName">Page Location</Label>
                                <Select
                                    value={formData.adPageName}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, adPageName: value }))}
                                >
                                    <SelectTrigger id="adPageName">
                                        <SelectValue placeholder="Select page location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageNames.map((page) => (
                                            <SelectItem key={page.value} value={page.value}>
                                                {page.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="link">Advertisement Link</Label>
                            <Input
                                id="link"
                                name="link"
                                type="url"
                                value={formData.link}
                                onChange={handleInputChange}
                                placeholder="https://example.com"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/advertisement">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Advertisement"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
