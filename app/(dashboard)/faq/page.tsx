"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ViewDialog } from "@/components/view-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for FAQs
type FAQ = {
  id: string
  question: { en: string; ta: string; si: string }
  answer: { en: string; ta: string; si: string }
  category: string
  order: number
  status: "published" | "draft"
}


const faqs: FAQ[] = [
  {
    id: "1",
    question: {
      en: "How do I create an obituary on your website?",
      ta: "உங்கள் இணையதளத்தில் மரண அறிவிப்பை எவ்வாறு உருவாக்குவது?",
      si: "ඔබගේ වෙබ් අඩවියේ අවමංගල්‍ය දැන්වීමක් කෙරෙන්නේ කෙසේද?"
    },
    answer: {
      en: "To create an obituary, you need to register an account first. After logging in, navigate to the 'Create Obituary' section and follow the step-by-step guide.",
      ta: "மரண அறிவிப்பை உருவாக்க, முதலில் ஒரு கணக்கை பதிவு செய்ய வேண்டும். உள்நுழைந்த பிறகு, 'மரண அறிவிப்பு உருவாக்கு' பிரிவுக்கு சென்று வழிகாட்டியை பின்பற்றவும்.",
      si: "අවමංගල්‍ය දැන්වීමක් සෑදීමට, පළමුව ගිණුමක් ලියාපදිංචි කළ යුතුය. පසුව 'අවමංගල්‍ය දැන්වීමක් සාදන්න' කොටසට ගොස් පියවරෙන් පියවර මාර්ගෝපදේශය අනුගමනය කරන්න."
    },
    category: "Obituaries",
    order: 1,
    status: "published",
  },
  {
    id: "2",
    question: {
      en: "What payment methods do you accept?",
      ta: "எந்த வகையான பணப் பரிவர்த்தனை முறைகளை ஏற்கிறீர்கள்?",
      si: "ඔබ පිළිගන්නා ගෙවීම් ක්‍රම මොනවාද?"
    },
    answer: {
      en: "We accept credit cards, PayPal, and bank transfers.",
      ta: "நாங்கள் கிரெடிட் கார்டு, PayPal மற்றும் வங்கிப் பரிமாற்றங்களை ஏற்கிறோம்.",
      si: "අපි ණය පත්‍ර, PayPal සහ බැංකු මාරු පිළිගන්නෙමු."
    },
    category: "Payments",
    order: 1,
    status: "published",
  },
  {
    id: "3",
    question: {
      en: "How long will the obituary remain on your website?",
      ta: "மரண அறிவிப்பு உங்கள் இணையதளத்தில் எவ்வளவு நேரம் இருக்கும்?",
      si: "අවමංගල්‍ය දැන්වීම ඔබේ වෙබ් අඩවියේ කල් තැබේද?"
    },
    answer: {
      en: "It depends on the package. Basic stays for 30 days, premium can be longer.",
      ta: "இது உங்கள் தேர்வு செய்த திட்டத்தைப் பொறுத்தது. அடிப்படை திட்டம் 30 நாட்கள் இருக்கும், மேம்பட்டது மேலும் நீடிக்கலாம்.",
      si: "එය ඔබ තෝරාගත් පැකේජය මත निर्भर වේ. මූලික පැකේජය දින 30ක් ඇත, ප්‍රිමියම් එක දිගු වේ."
    },
    category: "Obituaries",
    order: 2,
    status: "published",
  },
  {
    id: "4",
    question: {
      en: "Can I make donations in memory of someone?",
      ta: "ஒருவரின் நினைவாக நன்கொடை செய்ய முடியுமா?",
      si: "කිසිවෙකුගේ ස්මරණය සඳහා පරිත්‍යාග කළ හැකිද?"
    },
    answer: {
      en: "Yes, a donate button is available on each obituary page.",
      ta: "ஆம், ஒவ்வொரு மரண அறிவிப்புப் பக்கத்திலும் நன்கொடை பொத்தான் உள்ளது.",
      si: "ඔව්, සෑම අවමංගල්‍ය දැන්වීමක් පිටුවකම පරිත්‍යාග බොත්තමක් ඇත."
    },
    category: "Donations",
    order: 1,
    status: "published",
  },
  {
    id: "5",
    question: {
      en: "How are donations distributed to the family?",
      ta: "நன்கொடைகள் குடும்பத்தினருக்கு எப்படி வழங்கப்படும்?",
      si: "පරිත්‍යාගය පවුලට කෙසේ බෙදා හැරේද?"
    },
    answer: {
      en: "We process the payment and transfer it to the family's account within 5–7 days.",
      ta: "நாங்கள் பணத்தை செயல்படுத்தி, 5-7 நாட்களுக்குள் குடும்பத்தின் கணக்கில் அனுப்புகிறோம்.",
      si: "අපි ගෙවීම් සකසා දින 5-7ක් ඇතුළත පවුලේ ගිණුමට මාරු කරමු."
    },
    category: "Donations",
    order: 2,
    status: "published",
  },
  {
    id: "6",
    question: {
      en: "Can I edit an obituary after it's published?",
      ta: "மரண அறிவிப்பு வெளியிடப்பட்ட பிறகு அதைத் திருத்த முடியுமா?",
      si: "අවමංගල්‍ය දැන්වීම ප්‍රකාශයට පත්කළ පසු එය සංස්කරණය කළ හැකිද?"
    },
    answer: {
      en: "Yes, you can edit anytime via 'My Obituaries' after login.",
      ta: "ஆம், உள்நுழைந்த பிறகு 'எனது மரண அறிவிப்புகள்' மூலம் எப்போது வேண்டுமானாலும் திருத்தலாம்.",
      si: "ඔව්, ඔබට 'මගේ අවමංගල්‍ය' ක්‍රමයෙන් සෙවීමට පසු කිසිදු වේලාවක සංස්කරණය කළ හැක."
    },
    category: "Obituaries",
    order: 3,
    status: "draft",
  },
]


export default function FAQPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewFAQ, setViewFAQ] = useState<FAQ | null>(null)
  const [deleteFAQ, setDeleteFAQ] = useState<FAQ | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleAddFAQ = () => {
    router.push("/faq/new")
  }

  const handleEditFAQ = (faqId: string) => {
    router.push(`/faq/edit/${faqId}`)
  }

  const handleDeleteFAQ = async () => {
    if (!deleteFAQ) return

    setIsDeleting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "FAQ deleted",
      description: "The FAQ has been deleted successfully.",
    })

    setIsDeleting(false)
    setDeleteFAQ(null)
  }

  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => <div className="font-medium max-w-[500px] truncate">{row.original.question.en}</div>,
    },
    {
      accessorKey: "answer",
      header: "Answer",
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.answer.en}</div>,
    },
    // {
    //   accessorKey: "category",
    //   header: "Category",
    // },
    // {
    //   accessorKey: "order",
    //   header: "Order",
    // },
    // {
    //   accessorKey: "status",
    //   header: "Status",
    //   cell: ({ row }) => (
    //     <Badge variant={row.original.status === "published" ? "default" : "secondary"}>{row.original.status}</Badge>
    //   ),
    // },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewFAQ(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEditFAQ(row.original.id)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteFAQ(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("faq")}
        description="Manage frequently asked questions"
        action={{
          label: "Add FAQ",
          onClick: handleAddFAQ,
          icon: <Plus className="mr-2 h-4 w-4" />,
        }}
      />

      <DataTable columns={columns} data={faqs} searchKey="question" searchPlaceholder="Search FAQs..." />

      {/* View FAQ Dialog */}
      <ViewDialog open={!!viewFAQ} onOpenChange={(open) => !open && setViewFAQ(null)} title="FAQ Details">
        {viewFAQ && (
          <div className="space-y-8">
            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ta">Tamil</TabsTrigger>
                <TabsTrigger value="si">Sinhala</TabsTrigger>
              </TabsList>

              {["en", "ta", "si"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="space-y-2 py-4">
                    <h3 className="font-medium text-sm text-muted-foreground">Question</h3>
                    <p className="font-medium">{viewFAQ.question[lang as keyof typeof viewFAQ.question]}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Answer</h3>
                    <p className="whitespace-pre-wrap">{viewFAQ.answer[lang as keyof typeof viewFAQ.answer]}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                <p>{viewFAQ.category}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Order</h3>
                <p>{viewFAQ.order}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                <Badge variant={viewFAQ.status === "published" ? "default" : "secondary"}>{viewFAQ.status}</Badge>
              </div>
            </div> */}
          </div>
        )}
      </ViewDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteFAQ}
        onOpenChange={(open) => !open && setDeleteFAQ(null)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        onConfirm={handleDeleteFAQ}
        loading={isDeleting}
      />
    </div>
  )
}
