"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { Checkbox } from "@/components/ui/checkbox"

export default function EditAdvertisementPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingAd, setIsLoadingAd] = useState(true)
    const [advertisementId, setAdvertisementId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        link: "",
        adType: "",
        adCategory: "",
        adPageName: "",
        expiryDate: "",
        isActive: true,
    })
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [adTypes, setAdTypes] = useState<any[]>([])
    const [adCategories, setAdCategories] = useState<any[]>([])
    const [adTypePage, setAdTypePage] = useState(1)
    const [adCategoryPage, setAdCategoryPage] = useState(1)
    const [adTypeTotalPages, setAdTypeTotalPages] = useState(1)
    const [adCategoryTotalPages, setAdCategoryTotalPages] = useState(1)

    const adTypeLimit = 10
    const adCategoryLimit = 10
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

    const { data: adCategoryData, isLoading: adCategoryLoading } = useSWR(
        `${apiUrl}/advertistment/ad-category/active?page=${adCategoryPage}&limit=${adCategoryLimit}`,
        async (url) => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
            if (!res.ok) throw new Error("Failed to fetch ad categories")
            return res.json()
        },
        { keepPreviousData: true }
    )

    useEffect(() => {
        if (adCategoryData?.adCategory) {
            setAdCategories((prev) => {
                const ids = new Set(prev.map((c) => c._id || c.id))
                return [
                    ...prev,
                    ...adCategoryData.adCategory.filter((c: any) => !ids.has(c._id || c.id)),
                ]
            })
            setAdCategoryTotalPages(adCategoryData.pagination?.totalPages || 1)
        }
    }, [adCategoryData])

    const pageNames = [
        { value: "home", label: "Home Page" },
        { value: "obituary", label: "Obituary Page" },
        { value: "news", label: "News Page" },
        { value: "events", label: "Events Page" },
        { value: "contact", label: "Contact Page" },
        { value: "create-memorial", label: "Create Memorial Page" },
    ]

    useEffect(() => {
        const fetchAdvertistment = async () => {
          setIsLoadingAd(true);
          try {
            // Correctly resolve params here, once, at component mount/param change
            const resolvedParams = params instanceof Promise ? await params : params;
            const adId = resolvedParams.id;
            setAdvertisementId(adId); // Store the resolved ID in state
      
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch(`${apiUrl}/advertistment/${adId}`, {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });
            if (!res.ok) throw new Error("Failed to fetch advertisement");
            const data = await res.json();
      
            const formattedExpiryDate = data.expiryDate
              ? new Date(data.expiryDate).toISOString().split("T")[0]
              : "";
      
            setFormData({
              link: data.link || "",
              adType: data.adType?._id || "",
              adCategory: data.adCategory?._id || "",
              adPageName: data.adPageName || "",
              expiryDate: formattedExpiryDate,
              isActive: data.isActive,
            });
      
            setPreviewImage(data.image || null);
          } catch (error) {
            toast({
              title: "Error",
              description: "Could not load advertisement data.",
              variant: "destructive",
            });
            console.error("Failed to load advertisement data:", error);
          } finally {
            setIsLoadingAd(false);
          }
        };
        fetchAdvertistment();
    }, [params, apiUrl, toast]);
      
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            isActive: checked,
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
        } else {
            setImageFile(null);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.expiryDate) {
            toast({
                title: "Error",
                description: "Please select an expiry date.",
                variant: "destructive",
            })
            return
        }

        if (!formData.link || !formData.adType || !formData.adCategory || !formData.adPageName) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        if (!advertisementId) {
            toast({
                title: "Error",
                description: "Advertisement ID not available. Please try again or refresh the page.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true)

        try {
            const adIdToSubmit = advertisementId;

            const form = new FormData() 
            form.append("link", formData.link)
            form.append("adType", formData.adType)
            form.append("adCategory", formData.adCategory)
            form.append("adPageName", formData.adPageName)
            form.append("expiryDate", formData.expiryDate)
            form.append("isActive", String(formData.isActive))
            form.append("advertistmentId", adIdToSubmit)

            if (imageFile) {
                form.append("image", imageFile)
            }

            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
            const res = await fetch(`${apiUrl}/advertistment/update`, {
                method: "POST",
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: form,
            })

            if (!res.ok) {
                let errorDetails: string = "Failed to update advertisement.";
                const responseText = await res.text();
                try {
                    const errorData = JSON.parse(responseText);
                    errorDetails = errorData.message || errorData.error || responseText;
                } catch (jsonParseError) {
                    errorDetails = responseText;
                    if (!errorDetails.trim()) {
                        errorDetails = "An unknown error occurred during update. Please check server logs or network tab.";
                    }
                }
                throw new Error(errorDetails); // Throw the extracted message
            }

            toast({
                title: "Advertisement updated",
                description: "The advertisement has been updated successfully.",
            })
            router.push("/advertisement")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "There was an error updating the advertisement. Please try again.",
                variant: "destructive",
            })
            console.error("Update error:", error);
        } finally {
            setIsSubmitting(false)
        }
    }

    const overallLoading = isLoadingAd || adTypeLoading || adCategoryLoading;

    if (overallLoading) {
        return (
            <div className="flex flex-col gap-5">
                <PageHeader
                    title="Edit Advertisement"
                    description="Manage advertisements and placements"
                    href="/advertisement"
                />
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center h-40">
                            <p>Loading advertisement data and options...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">
            <PageHeader
                title="Edit Advertisement"
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
                                            src={previewImage}
                                            alt="Advertisement preview"
                                            fill
                                            className="object-contain"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="absolute bottom-2 right-2"
                                            onClick={() => fileInputRef.current?.click()}
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
                                    onValueChange={(value) => handleSelectChange("adType", value)}
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
                                                {type.type} ({type.imageSize})
                                            </SelectItem>
                                        ))}
                                        {adTypeLoading && <div className="p-2 text-center text-xs">Loading...</div>}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adCategory">Advertisement Category</Label>
                                <Select
                                    value={formData.adCategory}
                                    onValueChange={(value) => handleSelectChange("adCategory", value)}
                                >
                                    <SelectTrigger id="adCategory">
                                        <SelectValue placeholder="Select ad category" />
                                    </SelectTrigger>
                                    <SelectContent
                                        onScroll={e => {
                                            const el = e.currentTarget;
                                            if (
                                                el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
                                                adCategoryPage < adCategoryTotalPages &&
                                                !adCategoryLoading
                                            ) {
                                                setAdCategoryPage((p) => p + 1);
                                            }
                                        }}
                                    >
                                        {adCategories.length > 0 ? (
                                            adCategories.map((category) => {
                                                const key = category._id || category.id;
                                                let enName = "Unnamed";
                                                if (typeof category?.name?.en === "string") {
                                                    enName = category.name.en;
                                                } else if (
                                                    Array.isArray(category?.name?.en) &&
                                                    category.name.en.length > 0
                                                ) {
                                                    enName = category.name.en[0]?.value || "Unnamed";
                                                }
                                                return (
                                                    <SelectItem key={key} value={key}>
                                                        {enName}
                                                    </SelectItem>
                                                );
                                            })
                                        ) : !adCategoryLoading ? (
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                No categories available.
                                            </div>
                                        ) : null}
                                        {adCategoryLoading && (
                                            <div className="p-2 text-center text-xs">Loading...</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adPageName">Page Location</Label>
                            <Select
                                value={formData.adPageName}
                                onValueChange={(value) => handleSelectChange("adPageName", value)}
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

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
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

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label htmlFor="isActive">Is Active</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/advertisement">Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update Advertisement"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}