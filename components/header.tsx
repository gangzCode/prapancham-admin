"use client"
import Image from "next/image";
import { useState } from "react"
import { Bell, Globe, Menu, Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"

export function Header() {
  const { language, setLanguage, t } = useLanguage()
  // const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-primary text-white px-4 md:px-6">
      {/* <div className="flex items-center gap-2 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div> */}

      <div className="flex flex-1 items-center gap-4 md:gap-6 lg:gap-10">
        {/* <div className="relative hidden md:flex md:w-60 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
        type="search"
        placeholder={t("search")}
        className="w-full bg-background pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
        <Image
          src="/images/Prapancham-logo.png"
          alt="Prapancham Logo"
          width={56}
          height={56}
          priority
          className="max-w-[56px] sm:max-w-none items-center justify-center rounded-md"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
              <span className="sr-only">{t("language")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
        </DropdownMenu> */}

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t("notifications")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("notifications")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">Admin User</p>
          <p className="text-xs leading-none text-muted-foreground">{t("superAdmin")}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">{t("superAdmin")}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
            <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
