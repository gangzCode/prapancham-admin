"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Header } from "@/components/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user")
      if (user) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const decodedToken = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (decodedToken.exp && decodedToken.exp > currentTime) {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
              router.push("/login");
            }
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setIsAuthenticated(false);
          router.push("/login");
        }
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div>
      <Header />
      <SidebarProvider defaultOpen={true} className="!w-full">
        <div className="flex flex-col min-h-screen !w-full bg-[#F2F3F4]">
          <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 w-[50%]">
              <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </div>
  )
}
