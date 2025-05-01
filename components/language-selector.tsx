"use client"

import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("english")}>
          <span className={language === "english" ? "font-bold" : ""}>{t("english")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("tamil")}>
          <span className={language === "tamil" ? "font-bold" : ""}>{t("tamil")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("sinhala")}>
          <span className={language === "sinhala" ? "font-bold" : ""}>{t("sinhala")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
