"use client"

import { useState, useEffect } from "react"
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
  Map,
  Grid,
  Youtube,
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

interface User {
  _id: string
  username: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  accessToken: string
  adminAccessPages: string[]
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const { open, toggleSidebar } = useSidebar()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    obituary: false,
    advertisement: false,
    news: false,
    tribute: false,
  })
  const [user, setUser] = useState<User | null>(null)
  const [adminAccessPages, setAdminAccessPages] = useState<string[]>([])
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  // Fetch user permissions on component mount
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        setIsLoadingPermissions(true)

        await new Promise(resolve => setTimeout(resolve, 2000))

        // Get user from localStorage
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          console.error('No user found in localStorage')
          router.push('/login')
          return
        }

        const userData = JSON.parse(userStr) as User
        setUser(userData)

        // If Super Admin, grant access to all pages
        if (userData.isSuperAdmin) {
          setAdminAccessPages(['Dashboard', 'Obituary', 'Advertistment', 'News', 'Events', 'Tribute', 'ContactUs', 'FAQ', 'Country', 'Newsletter', 'Youtube', 'Podcast', 'Quote'])
          setIsLoadingPermissions(false)
          return
        }

        // If regular admin, set permissions from the user data
        if (userData.isAdmin) {
          setAdminAccessPages(userData.adminAccessPages || [])
        } else {
          // User is neither admin nor super admin
          console.error('User does not have admin permissions')
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error)
        router.push('/login')
      } finally {
        setIsLoadingPermissions(false)
      }
    }

    fetchUserPermissions()
  }, [router])

  // Check if user has access to a specific page
  const hasAccess = (pageKey: string): boolean => {
    if (isLoadingPermissions) return false
    if (!user) return false
    if (user.isSuperAdmin) return true
    return adminAccessPages.includes(pageKey)
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Show loading state while permissions are being fetched
  if (isLoadingPermissions) {
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
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading permissions...</div>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    )
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
          {/* Dashboard */}
          {hasAccess('Dashboard') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard")} tooltip={t("dashboard")}>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  <span>{t("dashboard")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Obituary Menu with Submenu */}
          {hasAccess('Obituary') && (
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
          )}

          {/* Advertisement Menu with Submenu */}
          {hasAccess('Advertistment') && (
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

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/advertisement/adcategory")}>
                      <Link href="/advertisement/adcategory">
                        <Grid className="mr-2 h-4 w-4" />
                        {t("ad categories")}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* News Menu with Submenu */}
          {hasAccess('News') && (
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
          )}

          {/* Event Menu */}
          {hasAccess('Events') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/events")} tooltip={t("events")}>
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>{t("events")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Tribute Menu with Submenu */}
          {hasAccess('Tribute') && (
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
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={isActive("/tribute/memories")}>
                        <Link href="/tribute/memories">
                        <Frame className="mr-2 h-4 w-4" />
                        {t("memories")}
                        </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Contact Us Menu */}
          {hasAccess('ContactUs') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/contact")} tooltip={t("contact")}>
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  <span>{t("contact")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* FAQ Menu */}
          {hasAccess('FAQ') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/faq")} tooltip={t("faq")}>
                <Link href="/faq">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  <span>{t("faq")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Country Menu */}
          {hasAccess('Country') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/country")} tooltip={t("country")}>
                <Link href="/country">
                  <Map className="mr-2 h-5 w-5" />
                  <span>{t("Country")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Newsletter Menu */}
          {hasAccess('Newsletter') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/newsletter")} tooltip={t("newsletter")}>
                <Link href="/newsletter">
                  <FileUser className="mr-2 h-5 w-5" />
                  <span>{t("newsletter")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* YouTube News Menu */}
          {hasAccess('Youtube') && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/youtube-news")} tooltip="YouTube News">
                <Link href="/youtube-news">
                  <Youtube className="mr-2 h-5 w-5" />
                  <span>YouTube News</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Admin Management Menu - Only for Super Admins or admins with explicit access */}
          {(user?.isSuperAdmin || hasAccess('AdminManagement')) && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admins")} tooltip={t("adminManagement")}>
                <Link href="/admins">
                  <Users className="mr-2 h-5 w-5" />
                  <span>{t("adminManagement")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-between p-4">
          <div className={cn("flex items-center gap-3", !open && "hidden")}>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
              <AvatarFallback>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'AD'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.username || 'Admin User'}</p>
              <p className="text-xs text-gray-300">
                {user?.isSuperAdmin ? t("superAdmin") : user?.isAdmin ? t("admin") : t("user")}
              </p>
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
