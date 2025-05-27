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


export default function AddFAQPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("en")

    const [formData, setFormData] = useState({
        question: {
            en: { name: "", value: "" },
            ta: { name: "", value: "" },
            si: { name: "", value: "" },
        },
        answer: {
            en: { name: "", value: "" },
            ta: { name: "", value: "" },
            si: { name: "", value: "" },
        },
        listingNumber: "",
        status: "active",
    })

    const handleInputChange = (
        field: "question" | "answer",
        language: keyof typeof formData["question"],
        value: string,
        type: "value" | "name" = "value"
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: {
                ...prev[field],
                [language]: {
                    ...prev[field][language],
                    [type]: value,
                },
            },
        }))
    }


    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create FAQ");
            }

            console.log("FAQ created successfully");
            router.push("/faq");
        } catch (error) {
            console.error("Error creating FAQ:", error);
        }
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="Add New FAQ"
                description="Create a new FAQ entry."
                href="/faq"
            />

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
                                    <Label htmlFor="question-name-en">Question Name (English)</Label>
                                    <Input
                                        id="question-name-en"
                                        value={formData.question.en.name}
                                        onChange={(e) => handleInputChange("question", "en", e.target.value, "name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="question-en">Question (English)</Label>
                                    <Input
                                        id="question-en"
                                        value={formData.question.en.value}
                                        onChange={(e) => handleInputChange("question", "en", e.target.value)}
                                        required={activeTab === "en"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-name-en">Answer Name (English)</Label>
                                    <Input
                                        id="answer-name-en"
                                        value={formData.answer.en.name}
                                        onChange={(e) => handleInputChange("answer", "en", e.target.value, "name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-en">Answer (English)</Label>
                                    <Textarea
                                        id="answer-en"
                                        rows={5}
                                        value={formData.answer.en.value}
                                        onChange={(e) => handleInputChange("answer", "en", e.target.value)}
                                        required={activeTab === "en"}
                                    />
                                </div>
                            </TabsContent>

                            {/* Tamil Content */}
                            <TabsContent value="ta" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-name-ta">Question Name(Tamil)</Label>
                                    <Input
                                        id="question-name-ta"
                                        value={formData.question.ta.name}
                                        onChange={(e) => handleInputChange("question", "ta", e.target.value, "name")}
                                        required={activeTab === "ta"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="question-ta">Question (Tamil)</Label>
                                    <Input
                                        id="question-ta"
                                        value={formData.question.ta.value}
                                        onChange={(e) => handleInputChange("question", "ta", e.target.value)}
                                        required={activeTab === "ta"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-name-ta">Answer Name (Tamil)</Label>
                                    <Input
                                        id="answer-name-ta"
                                        value={formData.answer.ta.name}
                                        onChange={(e) => handleInputChange("answer", "ta", e.target.value, "name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-ta">Answer (Tamil)</Label>
                                    <Textarea
                                        id="answer-ta"
                                        rows={5}
                                        value={formData.answer.ta.value}
                                        onChange={(e) => handleInputChange("answer", "ta", e.target.value)}
                                        required={activeTab === "ta"}
                                    />
                                </div>
                            </TabsContent>

                            {/* Sinhala Content */}
                            <TabsContent value="si" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question-name-si">Question Name (Sinhala)</Label>
                                    <Input
                                        id="question-name-si"
                                        value={formData.question.si.name}
                                        onChange={(e) => handleInputChange("question", "si", e.target.value, "name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="question-si">Question (Sinhala)</Label>
                                    <Input
                                        id="question-si"
                                        value={formData.question.si.value}
                                        onChange={(e) => handleInputChange("question", "si", e.target.value)}
                                        required={activeTab === "si"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-name-si">Answer Name (Sinhala)</Label>
                                    <Input
                                        id="answer-name-si"
                                        value={formData.answer.si.name}
                                        onChange={(e) => handleInputChange("answer", "si", e.target.value, "name")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="answer-si">Answer (Sinhala)</Label>
                                    <Textarea
                                        id="answer-si"
                                        rows={5}
                                        value={formData.answer.si.value}
                                        onChange={(e) => handleInputChange("answer", "si", e.target.value)}
                                        required={activeTab === "si"}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="listingNumber">listingNumber</Label>
                                <Input
                                    id="listingNumber"
                                    type="number"
                                    value={formData.listingNumber}
                                    onChange={(e) => handleSelectChange("listingNumber", e.target.value)}
                                    required
                                />
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
                            <Button
                                type="submit"
                            >
                                Save FAQ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}