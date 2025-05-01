"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

// Mock categories
const categories = [
    { value: "obituary", label: { en: "Obituary", ta: "இறப்பு அறிவிப்பு", si: "මරණ දැන්වීම" } },
    { value: "advertisement", label: { en: "Advertisement", ta: "விளம்பரம்", si: "දැන්වීම" } },
    { value: "news", label: { en: "News", ta: "செய்திகள்", si: "පුවත්" } },
    { value: "events", label: { en: "Events", ta: "நிகழ்வுகள்", si: "උත්සව" } },
    { value: "donations", label: { en: "Donations", ta: "நன்கொடைகள்", si: "පරිත්‍යාග" } },
]

export default function AddFAQPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("en")

    const [formData, setFormData] = useState({
        question: { en: "", ta: "", si: "" },
        answer: { en: "", ta: "", si: "" },
        category: "obituary",
        status: "active",
    })

    const handleInputChange = (field: string, language: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: {
                // ...prev[field as keyof typeof prev],
                [language]: value,
            },
        }))
    }

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, this would make an API call to save the FAQ
        console.log("Submitting FAQ:", formData)

        // Navigate back to the FAQ list page
        router.push("/faq")
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Add New FAQ"
                description="Create a new FAQ entry."
                href="/faq"
            />
            {/* <div className="flex items-center gap-2">
                <Link href="/faq">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Add New FAQ</h1>
            </div> */}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>FAQ Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="en" value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="en">English</TabsTrigger>
                                <TabsTrigger value="ta">Tamil</TabsTrigger>
                                <TabsTrigger value="si">Sinhala</TabsTrigger>
                            </TabsList>

                            {/* English Content */}
                            <TabsContent value="en" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-en">Question (English)</Label>
                                    <Input
                                        id="question-en"
                                        value={formData.question.en}
                                        onChange={(e) => handleInputChange("question", "en", e.target.value)}
                                        required={activeTab === "en"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-en">Answer (English)</Label>
                                    <Textarea
                                        id="answer-en"
                                        rows={5}
                                        value={formData.answer.en}
                                        onChange={(e) => handleInputChange("answer", "en", e.target.value)}
                                        required={activeTab === "en"}
                                    />
                                </div>
                            </TabsContent>

                            {/* Tamil Content */}
                            <TabsContent value="ta" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-ta">Question (Tamil)</Label>
                                    <Input
                                        id="question-ta"
                                        value={formData.question.ta}
                                        onChange={(e) => handleInputChange("question", "ta", e.target.value)}
                                        required={activeTab === "ta"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-ta">Answer (Tamil)</Label>
                                    <Textarea
                                        id="answer-ta"
                                        rows={5}
                                        value={formData.answer.ta}
                                        onChange={(e) => handleInputChange("answer", "ta", e.target.value)}
                                        required={activeTab === "ta"}
                                    />
                                </div>
                            </TabsContent>

                            {/* Sinhala Content */}
                            <TabsContent value="si" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-si">Question (Sinhala)</Label>
                                    <Input
                                        id="question-si"
                                        value={formData.question.si}
                                        onChange={(e) => handleInputChange("question", "si", e.target.value)}
                                        required={activeTab === "si"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-si">Answer (Sinhala)</Label>
                                    <Textarea
                                        id="answer-si"
                                        rows={5}
                                        value={formData.answer.si}
                                        onChange={(e) => handleInputChange("answer", "si", e.target.value)}
                                        required={activeTab === "si"}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label[activeTab as keyof typeof category.label]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-2">
                            <Link href="/faq">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit">Save FAQ</Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}