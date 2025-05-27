"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Newspaper,
  Calendar,
  Heart,
  MessageSquare,
  HelpCircle,
  Users,
  LogOut,
  ChevronDown,
  ImageIcon,
  DollarSign,
  Package,
  PlusCircle,
  UserCircle,
  Gift,
  Home,
  ChevronLeft,
  BookOpen,
  LayoutDashboard,
  Paintbrush,
  Frame,
  FrameIcon,
  FileText,
  FileUser,
  Flower,
  IdCard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const { open, toggleSidebar } = useSidebar()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    obituary: true,
    advertisement: true,
    news: true,
    tribute: true, // Add tribute menu state
  })

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const handleLogout = () => {
    // In a real app, this would clear auth tokens/cookies
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarHeader className="border-b py-4 mt-16">
        <div className="flex items-center px-4">
          <h1 className={cn("text-xl font-bold text-[#0B4157]", !open && "hidden")}>Admin Panel</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto text-[#0B4157] hover:bg-sidebar-accent"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !open && "rotate-180")} />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip={t("dashboard")}>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                <span>{t("dashboard")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Obituary Menu with Submenu */}
          <Collapsible open={openMenus.obituary} onOpenChange={() => toggleMenu("obituary")} className="w-full">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t("obituary")}>
                  <Link href="/obituary/packages">
                    <BookOpen className="mr-2 h-5 w-5" />
                  </Link>
                  <span>{t("obituary")}</span>
                  <ChevronDown
                    className={cn("ml-auto h-4 w-4 transition-transform", openMenus.obituary ? "rotate-180" : "")}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/packages")}>
                    <Link href="/obituary/packages">
                      <Package className="mr-2 h-4 w-4" />
                      {t("packages")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/addons")}>
                    <Link href="/obituary/addons">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {t("addons")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/users")}>
                    <Link href="/obituary/users">
                      <UserCircle className="mr-2 h-4 w-4" />
                      {t("users")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/donations")}>
                    <Link href="/obituary/donations">
                      <Gift className="mr-2 h-4 w-4" />
                      {t("donations")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/bg-colors")}>
                    <Link href="/obituary/bg-colors">
                      <Paintbrush className="mr-2 h-4 w-4" />
                      {t("bg-colors")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/image-frames")}>
                    <Link href="/obituary/image-frames">
                      <FrameIcon className="mr-2 h-4 w-4" />
                      {t("image-frames")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/obituary/posts")}>
                    <Link href="/obituary/posts">
                      <FileText className="mr-2 h-4 w-4" />
                      Posts
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          {/* Advertisement Menu with Submenu */}
          <Collapsible open={openMenus.advertisement} onOpenChange={() => toggleMenu("advertisement")} className="w-full">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t("advertisement")}>
                  <Link href="/advertisement">
                    <ImageIcon className="mr-2 h-5 w-5" />
                  </Link>
                  <span>{t("advertisement")}</span>
                  <ChevronDown
                    className={cn("ml-auto h-4 w-4 transition-transform", openMenus.advertisement ? "rotate-180" : "")}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/advertisement")}>
                    <Link href="/advertisement">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {t("advertisement")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/advertisement/adtype")}>
                    <Link href="/advertisement/adtype">
                      <Package className="mr-2 h-4 w-4" />
                      {t("ad types")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          {/* News Menu with Submenu */}
          <Collapsible open={openMenus.news} onOpenChange={() => toggleMenu("news")} className="w-full">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t("news")}>
                  <Link href="/news">
                    <Newspaper className="mr-2 h-5 w-5" />
                  </Link>
                  <span>{t("news")}</span>
                  <ChevronDown
                    className={cn("ml-auto h-4 w-4 transition-transform", openMenus.news ? "rotate-180" : "")}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/news")}>
                    <Link href="/news">
                      <Newspaper className="mr-2 h-4 w-4" />
                      {t("news")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/news/category")}>
                    <Link href="/news/category">
                      <Package className="mr-2 h-4 w-4" />
                      {t("news category")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          {/* Event Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/events")} tooltip={t("events")}>
              <Link href="/events">
                <Calendar className="mr-2 h-5 w-5" />
                <span>{t("events")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Tribute Menu with Submenu */}
          <Collapsible open={openMenus.tribute} onOpenChange={() => toggleMenu("tribute")} className="w-full">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t("tribute")}>
                  <Link href="/tribute/flowers">
                    <Heart className="mr-2 h-5 w-5" />
                  </Link>
                  <span>{t("tribute")}</span>
                  <ChevronDown
                    className={cn("ml-auto h-4 w-4 transition-transform", openMenus.tribute ? "rotate-180" : "")}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/tribute/flowers")}>
                    <Link href="/tribute/flowers">
                      <Flower className="mr-2 h-4 w-4" />
                      {t("flowers")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/tribute/cards")}>
                    <Link href="/tribute/cards">
                      <IdCard className="mr-2 h-4 w-4" />
                      {t("cards")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={isActive("/tribute/letters")}>
                    <Link href="/tribute/letters">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("letters")}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          {/* Contact Us Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/contact")} tooltip={t("contact")}>
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                <span>{t("contact")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* FAQ Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/faq")} tooltip={t("faq")}>
              <Link href="/faq">
                <HelpCircle className="mr-2 h-5 w-5" />
                <span>{t("faq")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Newsletter Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/newsletter")} tooltip={t("newsletter")}>
              <Link href="/newsletter">
                <FileUser className="mr-2 h-5 w-5" />
                <span>{t("newsletter")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Admin Management Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admins")} tooltip={t("adminManagement")}>
              <Link href="/admins">
                <Users className="mr-2 h-5 w-5" />
                <span>{t("adminManagement")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between p-4">
          <div className={cn("flex items-center gap-3", !open && "hidden")}>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-300">{t("superAdmin")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className=" hover:bg-sidebar-accent">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
