"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/page-header"
import { Loader2, Plus, X, Upload, Eye } from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

// Form schema with validation
const postFormSchema = z.object({
    information: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        preferredName: z.string().optional(),
        address: z.string().min(1, "Address is required"),
        dateofBirth: z.string().min(1, "Birth date is required"),
        dateofDeath: z.string().min(1, "Death date is required"),
        description: z.string().min(1, "Description is required"),
        tributeVideo: z.string().optional(),
        shortDescription: z.string().optional(),
    }),
    isDonationReceivable: z.boolean().default(false),
    accountDetails: z.object({
        bankName: z.string().optional(),
        branchName: z.string().optional(),
        accountNumber: z.coerce.number().optional(),
        accountHolderName: z.string().optional(),
    }).optional(),
    primaryImage: z.string().optional(),
    thumbnailImage: z.string().optional(),
    additionalImages: z.array(z.string()).default([]),
    slideshowImages: z.array(z.string()).default([]),
    contactDetails: z.array(z.object({
        country: z.string().min(1, "Country is required"),
        address: z.string().min(1, "Address is required"),
        phoneNumber: z.string().min(1, "Phone number is required"),
        name: z.string().min(1, "Name is required"),
        relationship: z.string().min(1, "Relationship is required"),
        email: z.string().email("Must be a valid email"),
        _id: z.string().optional(),
    })).default([]),
    selectedBgColor: z.object({
        _id: z.string(),
        name: z.string(),
        colorCode: z.string(),
    }).optional(),
    selectedPrimaryImageBgFrame: z.object({
        _id: z.string(),
        frameImage: z.string(),
    }).optional(),
})

type PostFormValues = z.infer<typeof postFormSchema>

// Helper function to get display name with priority logic
const getDisplayName = (information: { title?: string; firstName?: string; lastName?: string; preferredName?: string }) => {
    // Priority 1: Use title if available (for backward compatibility)
    if (information.title && information.title.trim()) {
        return information.title
    }
    
    // Priority 2: Use firstName + lastName if both are available
    if (information.firstName && information.firstName.trim() && 
        information.lastName && information.lastName.trim()) {
        return `${information.firstName} ${information.lastName}`
    }
    
    // Priority 3: Use preferredName as fallback
    return information.preferredName || 'Unknown'
}

// Type definitions for API response
interface PostData {
    _id: string
    username: string
    information: {
        title?: string // For backward compatibility with old records
        firstName?: string
        lastName?: string
        preferredName?: string
        address: string
        dateofBirth: string
        dateofDeath: string
        description: string
        tributeVideo?: string
        shortDescription?: string
    }
    isDonationReceivable?: boolean
    accountDetails?: {
        bankName?: string
        branchName?: string
        accountNumber?: number
        accountHolderName?: string
    }
    primaryImage: string
    thumbnailImage: string
    additionalImages: string[]
    slideshowImages: string[]
    isSlideShow: boolean
    contactDetails: Array<{
        country: string
        address: string
        phoneNumber: string
        name: string
        relationship: string
        email: string
        _id: string
    }>
    selectedBgColor?: {
        _id: string
        name: string
        colorCode: string
        isDeleted: boolean
        isActive: boolean
        __v: number
    }
    selectedPrimaryImageBgFrame?: {
        _id: string
        frameImage: string
        isDeleted: boolean
        isActive: boolean
        __v: number
    }
    selectedPackage: {
        name: {
            en: Array<{ name: string; value: string; _id: string }>
            ta: Array<{ name: string; value: string; _id: string }>
            si: Array<{ name: string; value: string; _id: string }>
        }
        duration: number
        wordLimit: number
        isObituary: boolean
        isRemembarace: boolean
        isPremium: boolean
        _id: string
    }
    selectedAddons?: string[]
    selectedCountry?: string
    basePackagePrice?: {
        country: string
        price: number
    }
    finalPrice?: {
        country: string
        price: number
    }
    finalPriceInCAD?: {
        price: number
        currencyCode: string
    }
    orderStatus: string
    createdAt: string
    updatedAt: string
}

interface BgColor {
    _id: string
    name: string
    colorCode: string
    isDeleted: boolean
    isActive: boolean
    __v: number
}

interface BgFrame {
    _id: string
    frameImage: string
    isDeleted: boolean
    isActive: boolean
    __v: number
}

interface Country {
    _id: string
    name: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    currencyCode: string
    isDeleted: boolean
    isActive: boolean
    image: string
    createdAt: string
    updatedAt: string
    __v: number
}

interface FullPackageData {
    _id: string
    name: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    basePrice: {
        country: {
            name: {
                en: Array<{ name: string; value: string; _id: string }>
                ta: Array<{ name: string; value: string; _id: string }>
                si: Array<{ name: string; value: string; _id: string }>
            }
            _id: string
            currencyCode: string
        }
        price: number
    }
    description: {
        en: Array<{ name: string; value: string; _id: string }>
        ta: Array<{ name: string; value: string; _id: string }>
        si: Array<{ name: string; value: string; _id: string }>
    }
    addons: Array<{
        _id: string
        name: {
            en: Array<{ name: string; value: string; _id: string }>
            ta: Array<{ name: string; value: string; _id: string }>
            si: Array<{ name: string; value: string; _id: string }>
        }
        isDeleted: boolean
        priceList: Array<{
            country: string
            price: number
            _id: string
        }>
        isActive: boolean
        __v: number
    }>
    isObituary: boolean
    isRemembarace: boolean
    isPriority: boolean
    isFeatured: boolean
    isPremium: boolean
    duration: number
    isDeleted: boolean
    isSocialSharing: boolean
    isSlideShow: boolean
    wordLimit: number
    priceList: Array<{
        country: {
            name: {
                en: Array<{ name: string; value: string; _id: string }>
                ta: Array<{ name: string; value: string; _id: string }>
                si: Array<{ name: string; value: string; _id: string }>
            }
            _id: string
            currencyCode: string
        }
        price: number
        _id: string
    }>
    isTributeVideoUploading: boolean
    isAdditionalImages: boolean
    noofAdditionalImages: number
    noofContectDetails: number
    noofBgColors: number
    bgColors: Array<{
        _id: string
        name: string
        colorCode: string
        isDeleted: boolean
        isActive: boolean
        __v: number
    }>
    noofPrimaryImageBgFrames: number
    primaryImageBgFrames: Array<{
        _id: string
        frameImage: string
        isDeleted: boolean
        isActive: boolean
        __v: number
    }>
    isActive: boolean
    __v: number
}

// Default values for the form
const defaultValues: Partial<PostFormValues> = {
    information: {
        firstName: "",
        lastName: "",
        preferredName: "",
        address: "",
        dateofBirth: "",
        dateofDeath: "",
        description: "",
        tributeVideo: "",
        shortDescription: "",
    },
    isDonationReceivable: false,
    accountDetails: {
        bankName: "",
        branchName: "",
        accountNumber: 0,
        accountHolderName: "",
    },
    primaryImage: "",
    thumbnailImage: "",
    additionalImages: [],
    slideshowImages: [],
    contactDetails: [],
}

export default function EditPostPage() {
    const router = useRouter()
    const params = useParams()
    const postId = params.id as string
    const { toast } = useToast()
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingPost, setIsLoadingPost] = useState(true)
    const [postNotFound, setPostNotFound] = useState(false)
    const [postData, setPostData] = useState<PostData | null>(null)
    const [bgColors, setBgColors] = useState<BgColor[]>([])
    const [bgFrames, setBgFrames] = useState<BgFrame[]>([])
    const [countries, setCountries] = useState<Country[]>([])
    const [fullPackageData, setFullPackageData] = useState<FullPackageData | null>(null)
    const [isLoadingColors, setIsLoadingColors] = useState(true)
    const [isLoadingFrames, setIsLoadingFrames] = useState(true)
    const [isLoadingCountries, setIsLoadingCountries] = useState(true)
    const [isLoadingPackage, setIsLoadingPackage] = useState(false)

    // Store actual File objects for image uploads
    const [imageFiles, setImageFiles] = useState<{
        primaryImage?: File
        thumbnailImage?: File
        additionalImages: (File | null)[]
        slideshowImages: (File | null)[]
    }>({
        additionalImages: [],
        slideshowImages: []
    })

    // Initialize form
    const form = useForm<PostFormValues>({
        resolver: zodResolver(postFormSchema),
        defaultValues,
    })

    // Fetch post data by ID
    useEffect(() => {
        const fetchPostData = async () => {
            if (!postId) return

            try {
                setIsLoadingPost(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const token = localStorage.getItem('token')

                const response = await fetch(`${apiUrl}/order/${postId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Post not found')
                    }
                    throw new Error('Failed to fetch post')
                }

                const data: PostData = await response.json()
                console.log('Fetched post data:', data)
                setPostData(data)

                // Fetch full package details if package ID is available
                if (data.selectedPackage?._id) {
                    fetchFullPackageData(data.selectedPackage._id)
                }

                // Populate form with fetched data
                form.reset({
                    information: {
                        firstName: data.information.firstName || "",
                        lastName: data.information.lastName || "",
                        preferredName: data.information.preferredName || data.information.title || "", // Backward compatibility
                        address: data.information.address || "",
                        dateofBirth: data.information.dateofBirth ? data.information.dateofBirth.split('T')[0] : "",
                        dateofDeath: data.information.dateofDeath ? data.information.dateofDeath.split('T')[0] : "",
                        description: data.information.description || "",
                        tributeVideo: data.information.tributeVideo || "",
                        shortDescription: data.information.shortDescription || "",
                    },
                    isDonationReceivable: data.isDonationReceivable || false,
                    accountDetails: {
                        bankName: data.accountDetails?.bankName || "",
                        branchName: data.accountDetails?.branchName || "",
                        accountNumber: data.accountDetails?.accountNumber || 0,
                        accountHolderName: data.accountDetails?.accountHolderName || "",
                    },
                    primaryImage: data.primaryImage || "",
                    thumbnailImage: data.thumbnailImage || "",
                    additionalImages: data.additionalImages || [],
                    slideshowImages: data.slideshowImages || [],
                    contactDetails: data.contactDetails || [],
                    selectedBgColor: data.selectedBgColor || undefined,
                    selectedPrimaryImageBgFrame: data.selectedPrimaryImageBgFrame || undefined,
                })

                // Initialize imageFiles state with placeholders for existing images
                setImageFiles({
                    additionalImages: new Array(data.additionalImages?.length || 0).fill(null),
                    slideshowImages: new Array(data.slideshowImages?.length || 0).fill(null)
                })

            } catch (error) {
                console.error('Error fetching post:', error)
                if (error instanceof Error && error.message === 'Post not found') {
                    setPostNotFound(true)
                    toast({
                        title: "Post Not Found",
                        description: "The requested post could not be found.",
                        variant: "destructive",
                    })
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load post data. Please try again.",
                        variant: "destructive",
                    })
                }
                router.push("/obituary/posts")
            } finally {
                setIsLoadingPost(false)
            }
        }

        fetchPostData()
    }, [postId, form, toast, router])

    // Fetch full package data by ID
    const fetchFullPackageData = async (packageId: string) => {
        try {
            setIsLoadingPackage(true)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const token = localStorage.getItem('token')

            const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/${packageId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch package details')
            }

            const data: FullPackageData = await response.json()
            console.log('Fetched full package data:', data)
            setFullPackageData(data)

        } catch (error) {
            console.error('Error fetching package details:', error)
            toast({
                title: "Error",
                description: "Failed to load package details. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingPackage(false)
        }
    }

    // Fetch background colors from API
    useEffect(() => {
        const fetchColors = async () => {
            try {
                setIsLoadingColors(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/bg-color/active?page=1&limit=50`)

                if (!response.ok) {
                    throw new Error('Failed to fetch colors')
                }

                const data = await response.json()
                setBgColors(data.bgColor || [])
            } catch (error) {
                console.error('Error fetching colors:', error)
                toast({
                    title: "Error",
                    description: "Failed to load background colors. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingColors(false)
            }
        }

        fetchColors()
    }, [])

    // Fetch background frames from API
    useEffect(() => {
        const fetchFrames = async () => {
            try {
                setIsLoadingFrames(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const response = await fetch(`${apiUrl}/obituaryRemembarance-packages/bg-frame/active?page=1&limit=50`)

                if (!response.ok) {
                    throw new Error('Failed to fetch frames')
                }

                const data = await response.json()
                setBgFrames(data.bgFrame || [])
            } catch (error) {
                console.error('Error fetching frames:', error)
                toast({
                    title: "Error",
                    description: "Failed to load background frames. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingFrames(false)
            }
        }

        fetchFrames()
    }, [])

    // Fetch countries from API
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setIsLoadingCountries(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                const token = localStorage.getItem('token')

                const response = await fetch(`${apiUrl}/country/all?page=1&limit=10`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch countries')
                }

                const data = await response.json()
                setCountries(data.countries || [])
            } catch (error) {
                console.error('Error fetching countries:', error)
                toast({
                    title: "Error",
                    description: "Failed to load countries. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingCountries(false)
            }
        }

        fetchCountries()
    }, [])

    // Watch form values for dynamic updates
    const additionalImages = form.watch("additionalImages")
    const slideshowImages = form.watch("slideshowImages")
    const contactDetails = form.watch("contactDetails")
    const isDonationReceivable = form.watch("isDonationReceivable")

    // Form submission handler
    async function onSubmit(data: PostFormValues) {

        try {
            setIsSubmitting(true)

            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken')

            if (!token) {
                toast({
                    title: "Authentication Error",
                    description: "Please login again to continue.",
                    variant: "destructive",
                })
                return
            }

            // Create FormData object
            const formData = new FormData()

            // Add order ID
            formData.append('orderId', postId)

            // Add information as JSON with backward compatibility
            const informationData = {
                ...data.information,
                // For backward compatibility, if preferredName is empty, create it from firstName + lastName
                preferredName: data.information.preferredName || 
                    (data.information.firstName && data.information.lastName 
                        ? `${data.information.firstName} ${data.information.lastName}` 
                        : data.information.firstName || data.information.lastName || "")
            }
            formData.append('information', JSON.stringify(informationData))

            // Add donation receivable flag
            formData.append('isDonationReceivable', data.isDonationReceivable.toString())

            // Add account details as JSON
            formData.append('accountDetails', JSON.stringify(data.accountDetails))

            // Add contact details as JSON array
            formData.append('contactDetails', JSON.stringify(data.contactDetails))

            // Add images - use File objects when available, otherwise use URLs
            if (imageFiles.primaryImage) {
                formData.append('primaryImage', imageFiles.primaryImage)
            } else if (data.primaryImage && !data.primaryImage.startsWith('data:')) {
                // Only append URL if it's not a base64 string and not empty
                // formData.append('primaryImage', data.primaryImage)
            }

            if (imageFiles.thumbnailImage) {
                formData.append('thumbnailImage', imageFiles.thumbnailImage)
            } else if (data.thumbnailImage && !data.thumbnailImage.startsWith('data:')) {
                // Only append URL if it's not a base64 string and not empty
                // formData.append('thumbnailImage', data.thumbnailImage)
            }

            // Add additional images array - use File objects when available
            data.additionalImages?.forEach((imageUrl, index) => {
                if (imageFiles.additionalImages[index]) {
                    // Use File object if available
                    formData.append(`additionalImages`, imageFiles.additionalImages[index] as File)
                } else if (imageUrl && !imageUrl.startsWith('data:')) {
                    // Use URL if it's not a base64 string
                    // formData.append(`additionalImages`, imageUrl)
                }
            })

            // Add slideshow images array - use File objects when available
            data.slideshowImages?.forEach((imageUrl, index) => {
                if (imageFiles.slideshowImages[index]) {
                    // Use File object if available
                    formData.append(`slideshowImages`, imageFiles.slideshowImages[index] as File)
                } else if (imageUrl && !imageUrl.startsWith('data:')) {
                    // Use URL if it's not a base64 string
                    // formData.append(`slideshowImages`, imageUrl)
                }
            })

            // Add selected background color ID
            if (data.selectedBgColor?._id) {
                formData.append('selectedBgColor', data.selectedBgColor._id)
            }

            // Add selected primary image background frame ID
            if (data.selectedPrimaryImageBgFrame?._id) {
                formData.append('selectedPrimaryImageBgFrame', data.selectedPrimaryImageBgFrame._id)
            }

            // Add selected country
            if (postData && postData.selectedCountry) {
                formData.append('selectedCountry', postData.selectedCountry)
            }

            // Add selected package ID
            if (postData && postData.selectedPackage?._id) {
                formData.append('selectedPackage', postData.selectedPackage._id)
            }

            // Add selected addons
            if (postData && postData.selectedAddons && postData.selectedAddons.length > 0) {
                formData.append('selectedAddons', JSON.stringify(postData.selectedAddons))
            }

            // Add order status
            formData.append('orderStatus', postData?.orderStatus || 'draft')

            // Add username
            if (postData && postData.username) {
                formData.append('username', postData.username)
            }

            const response = await fetch(`${apiUrl}/order/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type header when using FormData
                },
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to update post')
            }

            const result = await response.json()
            console.log('Update response:', result)

            toast({
                title: "Success",
                description: "Post updated successfully!",
                variant: "default",
            })

            router.push("/obituary/posts")

        } catch (error) {
            console.error('Error updating post:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update post. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle cancel action
    const handleCancel = () => {
        router.push("/obituary/posts")
    }

    // Add new additional image
    const addAdditionalImage = () => {
        const currentImages = form.getValues().additionalImages
        form.setValue("additionalImages", [...currentImages, ""])

        // Add placeholder for new File
        setImageFiles(prev => ({
            ...prev,
            additionalImages: [...prev.additionalImages, null]
        }))
    }

    // Handle image file selection
    const handleImageSelect = (index: number, type: 'additional' | 'slideshow') => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string

                    if (type === 'additional') {
                        const currentImages = form.getValues().additionalImages
                        const newImages = [...currentImages]
                        newImages[index] = imageUrl
                        form.setValue("additionalImages", newImages)

                        // Store the File object
                        setImageFiles(prev => {
                            const newFiles = [...prev.additionalImages]
                            newFiles[index] = file
                            return { ...prev, additionalImages: newFiles }
                        })
                    } else {
                        const currentImages = form.getValues().slideshowImages
                        const newImages = [...currentImages]
                        newImages[index] = imageUrl
                        form.setValue("slideshowImages", newImages)

                        // Store the File object
                        setImageFiles(prev => {
                            const newFiles = [...prev.slideshowImages]
                            newFiles[index] = file
                            return { ...prev, slideshowImages: newFiles }
                        })
                    }
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }

    // Handle primary/thumbnail image selection
    const handlePrimaryImageSelect = (type: 'primary' | 'thumbnail') => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string
                    if (type === 'primary') {
                        form.setValue("primaryImage", imageUrl)
                        // Store the File object
                        setImageFiles(prev => ({ ...prev, primaryImage: file }))
                    } else {
                        form.setValue("thumbnailImage", imageUrl)
                        // Store the File object
                        setImageFiles(prev => ({ ...prev, thumbnailImage: file }))
                    }
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }

    // Remove additional image
    const removeAdditionalImage = (index: number) => {
        const currentImages = form.getValues().additionalImages
        form.setValue("additionalImages", currentImages.filter((_, i) => i !== index))

        // Remove the corresponding File object
        setImageFiles(prev => ({
            ...prev,
            additionalImages: prev.additionalImages.filter((_, i) => i !== index)
        }))
    }

    // Add new slideshow image
    const addSlideshowImage = () => {
        const currentImages = form.getValues().slideshowImages
        form.setValue("slideshowImages", [...currentImages, ""])

        // Add placeholder for new File
        setImageFiles(prev => ({
            ...prev,
            slideshowImages: [...prev.slideshowImages, null]
        }))
    }

    // Remove slideshow image
    const removeSlideshowImage = (index: number) => {
        const currentImages = form.getValues().slideshowImages
        form.setValue("slideshowImages", currentImages.filter((_, i) => i !== index))

        // Remove the corresponding File object
        setImageFiles(prev => ({
            ...prev,
            slideshowImages: prev.slideshowImages.filter((_, i) => i !== index)
        }))
    }

    // Add new contact detail
    const addContactDetail = () => {
        const currentContacts = form.getValues().contactDetails
        form.setValue("contactDetails", [...currentContacts, {
            country: "",
            address: "",
            phoneNumber: "",
            name: "",
            relationship: "",
            email: "",
        }])
    }

    // Remove contact detail
    const removeContactDetail = (index: number) => {
        const currentContacts = form.getValues().contactDetails
        form.setValue("contactDetails", currentContacts.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Post"
                description="Edit obituary post details"
                href="/obituary/posts"
            />

            {(isLoadingPost || postNotFound) ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            {postNotFound ? (
                                <div>
                                    <div className="text-lg text-destructive">Post not found</div>
                                    <p className="text-muted-foreground mt-2">The requested post could not be found.</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <div className="text-lg">Loading post data...</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Package Details Section - Non-editable */}
                    {postData?.selectedPackage && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Package Name</p>
                                        <p>{postData.selectedPackage.name.en[0]?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                        <p>{postData.selectedPackage.duration} days</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                                        <p>{postData.selectedPackage.isObituary ? 'Obituary' : 'Remembrance'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <p>{postData.orderStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                        <p>{format(new Date(postData.createdAt), "PPP")}</p>
                                    </div>
                                </div>

                                {/* Pricing Breakdown Section */}
                                {/* {(postData.basePackagePrice || postData.finalPrice || postData.finalPriceInCAD) && (
                                    <div className="mt-6 pt-6 border-t">
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-medium text-foreground">💰 Pricing Breakdown</h4>
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 space-y-3">
                                                {postData.basePackagePrice && (
                                                    <div className="flex justify-between items-center pb-2">
                                                        <span className="text-sm font-medium text-muted-foreground">Base Package Price:</span>
                                                        <span className="font-semibold text-green-700 dark:text-green-400">
                                                            {(() => {
                                                                const country = countries.find(c => c._id === postData.basePackagePrice?.country) ||
                                                                               fullPackageData?.priceList.find(p => p.country._id === postData.basePackagePrice?.country)?.country
                                                                const currencyCode = country?.currencyCode || 'CAD'
                                                                return `${currencyCode} ${postData.basePackagePrice.price}`
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}

                                                {postData.selectedAddons && postData.selectedAddons.length > 0 && fullPackageData && (
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-medium text-muted-foreground">Selected Addons:</div>
                                                        {postData.selectedAddons.map((addonId) => {
                                                            const addon = fullPackageData?.addons.find(a => a._id === addonId)
                                                            if (!addon) return null
                                                            
                                                            const priceInfo = addon.priceList.find(p => p.country === postData.selectedCountry)
                                                            const countryInfo = fullPackageData.priceList.find(p => p.country._id === postData.selectedCountry)
                                                            const currencyCode = countryInfo?.country.currencyCode || 'CAD'
                                                            
                                                            return (
                                                                <div key={addonId} className="flex justify-between items-center text-sm pl-4">
                                                                    <span className="text-muted-foreground">+ {addon.name.en[0]?.value || 'Unknown Addon'}</span>
                                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                                        {priceInfo ? `${currencyCode} ${priceInfo.price}` : 'Price not available'}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}

                                                {(postData.basePackagePrice || (postData.selectedAddons && postData.selectedAddons.length > 0)) && postData.finalPrice && (
                                                    <div className="border-t border-green-200 dark:border-green-700 my-2"></div>
                                                )}

                                                {postData.finalPrice && (
                                                    <div className="flex justify-between items-center font-bold text-lg">
                                                        <span className="text-foreground">Total Price:</span>
                                                        <span className="text-green-700 dark:text-green-400">
                                                            {(() => {
                                                                const country = countries.find(c => c._id === postData.finalPrice?.country) ||
                                                                               fullPackageData?.priceList.find(p => p.country._id === postData.finalPrice?.country)?.country
                                                                const currencyCode = country?.currencyCode || 'CAD'
                                                                return `${currencyCode} ${postData.finalPrice.price}`
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}

                                                {postData.finalPriceInCAD && (
                                                    <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-700">
                                                        <span className="text-sm text-muted-foreground">Equivalent in CAD:</span>
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            {postData.finalPriceInCAD.currencyCode} {postData.finalPriceInCAD.price.toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )} */}
                            </CardContent>
                        </Card>
                    )}

                    {/* Editable Form */}
                    <Card>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                                    {/* Information Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                📝 Information
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Basic details about the person and memorial information
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="information.firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter first name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter last name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.preferredName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Preferred Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter preferred name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter address" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.dateofBirth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date of Birth</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.dateofDeath"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date of Death</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.shortDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Short Description</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter short description" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="information.tributeVideo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tribute Video URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter video URL" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="information.description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter description"
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Donation Settings Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                💝 Donation Settings
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Configure whether this memorial can receive donations
                                            </p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="isDonationReceivable"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            Enable Donations
                                                        </FormLabel>
                                                        <div className="text-sm text-muted-foreground">
                                                            Allow people to make donations through this memorial
                                                        </div>
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
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Account Details Section */}
                                    <div className={`space-y-6 ${!isDonationReceivable ? 'opacity-50' : ''}`}>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                🏦 Account Details <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
                                                {isDonationReceivable && <span className="text-sm text-green-600 font-normal ml-2">- Donations Enabled</span>}
                                                {!isDonationReceivable && <span className="text-sm text-orange-600 font-normal ml-2">- Donations Disabled</span>}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Banking information for financial transactions (only required if donations are enabled)
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="accountDetails.bankName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bank Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="Enter bank name" 
                                                                disabled={!isDonationReceivable}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="accountDetails.branchName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Branch Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="Enter branch name" 
                                                                disabled={!isDonationReceivable}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="accountDetails.accountNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Account Number</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="number" 
                                                                placeholder="Enter account number" 
                                                                disabled={!isDonationReceivable}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="accountDetails.accountHolderName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Account Holder Name</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="Enter account holder name" 
                                                                disabled={!isDonationReceivable}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Images Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                🖼️ Images
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Upload and manage primary, thumbnail, and gallery images
                                            </p>
                                        </div>

                                        {/* Primary Image */}
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="primaryImage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Primary Image</FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="Enter primary image URL or select file"
                                                                        {...field}
                                                                        className="flex-1"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handlePrimaryImageSelect('primary')}
                                                                        title="Select image file"
                                                                    >
                                                                        <Upload className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                {field.value && (
                                                                    <div className="relative w-32 h-32 border rounded overflow-hidden">
                                                                        <img
                                                                            src={field.value}
                                                                            alt="Primary"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Thumbnail Image */}
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="thumbnailImage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Thumbnail Image</FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        placeholder="Enter thumbnail image URL or select file"
                                                                        {...field}
                                                                        className="flex-1"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() => handlePrimaryImageSelect('thumbnail')}
                                                                        title="Select image file"
                                                                    >
                                                                        <Upload className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                {field.value && (
                                                                    <div className="relative w-32 h-32 border rounded overflow-hidden">
                                                                        <img
                                                                            src={field.value}
                                                                            alt="Thumbnail"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Additional Images - Only show if isSlideShow is false */}
                                        {!postData?.isSlideShow && (
                                            <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-medium text-foreground">📷 Additional Images</h4>
                                                    <Button type="button" variant="outline" size="sm" onClick={addAdditionalImage}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Image
                                                    </Button>
                                                </div>
                                                {additionalImages?.map((imageUrl, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <FormField
                                                                control={form.control}
                                                                name={`additionalImages.${index}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Enter image URL or select file"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleImageSelect(index, 'additional')}
                                                                title="Select image file"
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => removeAdditionalImage(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {imageUrl && (
                                                            <div className="relative w-32 h-32 border rounded overflow-hidden">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`Additional ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Slideshow Images - Only show if isSlideShow is true */}
                                        {postData?.isSlideShow && (
                                            <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-medium text-foreground">🎠 Slideshow Images</h4>
                                                    <Button type="button" variant="outline" size="sm" onClick={addSlideshowImage}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Image
                                                    </Button>
                                                </div>
                                                {slideshowImages?.map((imageUrl, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <FormField
                                                                control={form.control}
                                                                name={`slideshowImages.${index}`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormControl>
                                                                            <Input
                                                                                placeholder="Enter image URL or select file"
                                                                                {...field}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleImageSelect(index, 'slideshow')}
                                                                title="Select image file"
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => removeSlideshowImage(index)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        {imageUrl && (
                                                            <div className="relative w-32 h-32 border rounded overflow-hidden">
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={`Slideshow ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Contact Details Section */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                        📞 Contact Details
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        Contact information for family members and relatives
                                                    </p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" onClick={addContactDetail}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Contact
                                                </Button>
                                            </div>
                                        </div>
                                        {contactDetails?.map((_, index) => (
                                            <Card key={index} className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-medium text-foreground">👤 Contact {index + 1}</h4>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeContactDetail(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter name" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.relationship`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Relationship</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter relationship" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.email`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Email</FormLabel>
                                                                <FormControl>
                                                                    <Input type="email" placeholder="Enter email" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.phoneNumber`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Phone Number</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter phone number" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.country`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Country</FormLabel>
                                                                <FormControl>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        disabled={isLoadingCountries}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select country"} />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {countries.map((country) => (
                                                                                <SelectItem key={country._id} value={country._id}>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {country.image && (
                                                                                            <img
                                                                                                src={country.image}
                                                                                                alt={country.name.en[0]?.value || 'Country'}
                                                                                                className="w-4 h-4 rounded-sm object-cover"
                                                                                            />
                                                                                        )}
                                                                                        <span>{country.name.en[0]?.value || 'Unknown'}</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`contactDetails.${index}.address`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Address</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter address" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Background Color Selection */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                🎨 Background Color
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Choose a background color theme for the memorial
                                            </p>
                                        </div>
                                        {isLoadingColors ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Loading colors...</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                                                {bgColors.map((color) => (
                                                    <button
                                                        key={color._id}
                                                        type="button"
                                                        className={`w-12 h-12 rounded border-2 ${form.watch("selectedBgColor")?._id === color._id
                                                                ? "border-primary border-4"
                                                                : "border-gray-300"
                                                            }`}
                                                        style={{ backgroundColor: color.colorCode }}
                                                        onClick={() => form.setValue("selectedBgColor", color)}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Background Frame Selection */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground border-b-2 border-primary pb-2">
                                                🖼️ Background Frame
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Select a decorative frame for the primary image
                                            </p>
                                        </div>
                                        {isLoadingFrames ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">Loading frames...</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {bgFrames.map((frame) => (
                                                    <button
                                                        key={frame._id}
                                                        type="button"
                                                        className={`relative aspect-square rounded border-2 overflow-hidden ${form.watch("selectedPrimaryImageBgFrame")?._id === frame._id
                                                                ? "border-primary border-4"
                                                                : "border-gray-300"
                                                            }`}
                                                        onClick={() => form.setValue("selectedPrimaryImageBgFrame", frame)}
                                                    >
                                                        <img
                                                            src={frame.frameImage}
                                                            alt="Frame"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Separator className="my-8" />

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-4 pt-6 border-t border-border bg-muted/30 -mx-6 px-6 pb-0">
                                        <Button type="button" variant="outline" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                "Update Post"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
