"use client"

import { useState, useEffect } from "react"
import { ArrowRight, DollarSign, FileText, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"

// Sample data for charts
const chartData = [
  { name: "Jan", value: 12 },
  { name: "Feb", value: 19 },
  { name: "Mar", value: 15 },
  { name: "Apr", value: 27 },
  { name: "May", value: 25 },
  { name: "Jun", value: 32 },
  { name: "Jul", value: 30 },
  { name: "Aug", value: 29 },
  { name: "Sep", value: 35 },
  { name: "Oct", value: 40 },
  { name: "Nov", value: 38 },
  { name: "Dec", value: 41 },
]

// Sample data for recent users
type User = {
  _id: string
  username: string
  email: string
  password: string
  isDeleted: boolean
  image: string
  isActive: boolean
  orders: string[]
  createdAt: string
  updatedAt: string
  __v: number
  address?: string
  country?: string
  phone?: string
}



// API data types for obituaries
type Obituary = {
  _id: string
  information: {
    firstName: string
    lastName: string
    preferredName?: string
    address: string
    dateofBirth: string
    dateofDeath: string
    description: string
    tributeVideo?: string
    shortDescription: string
  }
  basePackagePrice: {
    country: string
    price: number
  }
  finalPrice: {
    country: {
      _id: string
      currencyCode: string
    }
    price: number
  }
  finalPriceInCAD: {
    price: number
    currencyCode: string
  }
  createdAt: string
  expiryDate: string
  isDeleted: boolean
  isDonationReceivable: boolean
  orderStatus: string
  primaryImage?: string
  selectedPackage: {
    name: {
      en: Array<{ name: string; value: string }>
    }
  }
  username: string
  updatedAt: string
}



// API data types for advertisements
type Ad = {
  _id: string
  image: string
  isDeleted: boolean
  adPageName: string
  isActive: boolean
  expiryDate: string
  uploadedDate: string
  __v: number
  adCategory: {
    name: {
      en: Array<{
        name: string
        value: string
        _id: string
      }>
      ta: Array<{
        name: string
        value: string
        _id: string
      }>
      si: Array<{
        name: string
        value: string
        _id: string
      }>
    }
    _id: string
    isDeleted: boolean
    isActive: boolean
    __v: number
  }
  adType: {
    _id: string
    imageSize: string
    isDeleted: boolean
    type: string
    isActive: boolean
    __v: number
  }
  link: string
}



// API data types for events
type Event = {
  _id: string
  name: {
    en: Array<{
      name: string
      value: string
      _id: string
    }>
    ta: Array<{
      name: string
      value: string
      _id: string
    }>
    si: Array<{
      name: string
      value: string
      _id: string
    }>
  }
  description: {
    en: Array<{
      name: string
      value: string
      _id: string
    }>
    ta: Array<{
      name: string
      value: string
      _id: string
    }>
    si: Array<{
      name: string
      value: string
      _id: string
    }>
  }
  eventDate: string
  isFeatured: boolean
  image: string
  featuredEventImage: string
  isDeleted: boolean
  expiryDate: string
  isActive: boolean
  uploadedDate: string
  createdAt: string
  updatedAt: string
  __v: number
  eventLink?: string
  registeredPeopleCount?: string
}



// Column definitions for tables
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className={`capitalize ${row.original.isActive ? "text-green-600" : "text-red-600"}`}>
        {row.original.isActive ? "active" : "inactive"}
      </div>
    ),
  },
]

const obituaryColumns: ColumnDef<Obituary>[] = [
  {
    accessorKey: "information.firstName",
    header: "Name",
    cell: ({ row }) => (
      <div>
        {row.original.information.firstName} {row.original.information.lastName}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "selectedPackage.name.en",
    header: "Package",
    cell: ({ row }) => (
      <div>
        {row.original.selectedPackage?.name?.en?.[0]?.value || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "finalPriceInCAD.price",
    header: "Price",
    cell: ({ row }) => (
      <div>
        {row.original.finalPriceInCAD.currencyCode} ${row.original.finalPriceInCAD.price.toFixed(2)}
      </div>
    ),
  },
]

const adColumns: ColumnDef<Ad>[] = [
  {
    accessorKey: "adCategory.name.en",
    header: "Category",
    cell: ({ row }) => (
      <div>
        {row.original.adCategory?.name?.en?.[0]?.value || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "adType.type",
    header: "Type",
    cell: ({ row }) => (
      <div>
        {row.original.adType?.type || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "adPageName",
    header: "Page",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.adPageName}
      </div>
    ),
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const date = new Date(row.original.expiryDate)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className={`capitalize ${row.original.isActive ? "text-green-600" : "text-red-600"}`}>
        {row.original.isActive ? "active" : "inactive"}
      </div>
    ),
  },
]

const eventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: "name.en",
    header: "Title",
    cell: ({ row }) => (
      <div>
        {row.original.name?.en?.[0]?.value || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "eventDate",
    header: "Event Date",
    cell: ({ row }) => {
      const date = new Date(row.original.eventDate)
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "registeredPeopleCount",
    header: "Registered",
    cell: ({ row }) => (
      <div>
        {row.original.registeredPeopleCount || "0"}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className={`capitalize ${row.original.isActive ? "text-green-600" : "text-red-600"}`}>
        {row.original.isActive ? "active" : "inactive"}
      </div>
    ),
  },
]

export default function DashboardPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("day")

  // State for users data
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // State for obituaries data
  const [recentObituaries, setRecentObituaries] = useState<Obituary[]>([])
  const [obituariesPagination, setObituariesPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [isLoadingObituaries, setIsLoadingObituaries] = useState(false)

  // State for advertisements data
  const [recentAds, setRecentAds] = useState<Ad[]>([])
  const [adsPagination, setAdsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [isLoadingAds, setIsLoadingAds] = useState(false)

  // State for events data
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [eventsPagination, setEventsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  // State for donations data
  const [donationsData, setDonationsData] = useState({
    totalDonationReceived: 0,
    totalDonationGivenBack: 0,
    netDonation: 0
  })
  const [isLoadingDonations, setIsLoadingDonations] = useState(false)

  // Fetch recent users from API
  const fetchRecentUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No authentication token found')
        setRecentUsers([])
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/active?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()

      if (data.user && Array.isArray(data.user)) {
        // Show only the first 5 users for the dashboard
        setRecentUsers(data.user.slice(0, 5))
        setUsersPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set empty array on error
      setRecentUsers([])
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Fetch recent obituaries from API
  const fetchRecentObituaries = async () => {
    setIsLoadingObituaries(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No authentication token found')
        setRecentObituaries([])
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/all?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch obituaries')
      }

      const data = await response.json()

      if (data.orders && Array.isArray(data.orders)) {
        // Show only the first 5 obituaries for the dashboard
        setRecentObituaries(data.orders.slice(0, 5))
        setObituariesPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching obituaries:', error)
      // Set empty array on error
      setRecentObituaries([])
    } finally {
      setIsLoadingObituaries(false)
    }
  }

  // Fetch recent advertisements from API
  const fetchRecentAds = async () => {
    setIsLoadingAds(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No authentication token found')
        setRecentAds([])
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/advertistment/active?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch advertisements')
      }

      const data = await response.json()

      if (data.advertisements && Array.isArray(data.advertisements)) {
        // Show only the first 5 advertisements for the dashboard
        setRecentAds(data.advertisements.slice(0, 5))
        setAdsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      // Set empty array on error
      setRecentAds([])
    } finally {
      setIsLoadingAds(false)
    }
  }

  // Fetch recent events from API
  const fetchRecentEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No authentication token found')
        setRecentEvents([])
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/event/all?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()

      if (data.events && Array.isArray(data.events)) {
        // Show only the first 5 events for the dashboard
        setRecentEvents(data.events.slice(0, 5))
        setEventsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      // Set empty array on error
      setRecentEvents([])
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Fetch donations summary from API
  const fetchDonationsSummary = async () => {
    setIsLoadingDonations(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('No authentication token found')
        setDonationsData({
          totalDonationReceived: 0,
          totalDonationGivenBack: 0,
          netDonation: 0
        })
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/order/donation/donations-summary`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch donations summary')
      }

      const data = await response.json()

      if (data) {
        setDonationsData({
          totalDonationReceived: data.totalDonationReceived || 0,
          totalDonationGivenBack: data.totalDonationGivenBack || 0,
          netDonation: data.netDonation || 0
        })
      }
    } catch (error) {
      console.error('Error fetching donations summary:', error)
      // Set default values on error
      setDonationsData({
        totalDonationReceived: 0,
        totalDonationGivenBack: 0,
        netDonation: 0
      })
    } finally {
      setIsLoadingDonations(false)
    }
  }

  // Fetch users, obituaries, advertisements, events, and donations on component mount
  useEffect(() => {
    fetchRecentUsers()
    fetchRecentObituaries()
    fetchRecentAds()
    fetchRecentEvents()
    fetchDonationsSummary()
  }, [])

  const navigateToRecent = () => {
    router.push("/obituary/users")
  }

  const navigateToPosts = () => {
    router.push("/obituary/posts")
  }

  const navigateToAdvertisements = () => {
    router.push("/advertisement")
  }

  const navigateToEvents = () => {
    router.push("/events")
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your website's performance and recent activities." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Obituary Post Income"
          value="$12,450"
          icon={<FileText />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Remembrance Post Income"
          value="$8,230"
          icon={<DollarSign />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Donations Received"
          value={isLoadingDonations ? "Loading..." : `CAD $${donationsData.totalDonationReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Donations Given Back"
          value={isLoadingDonations ? "Loading..." : `CAD $${donationsData.totalDonationGivenBack.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign />}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Obituary Posts</CardTitle>
            <CardDescription>Number of obituary posts over time</CardDescription>
            <Tabs defaultValue="day" className="mt-2" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B4157" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0B4157" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#0B4157" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donations Overview</CardTitle>
            <CardDescription>Breakdown of donations (CAD)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDonations ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="space-y-4 w-full">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-16 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Received", value: donationsData.totalDonationReceived },
                      { name: "Given Back", value: donationsData.totalDonationGivenBack },
                      { name: "Revenue", value: donationsData.netDonation },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`CAD $${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Amount"]} />
                    <Bar dataKey="value" fill="#0B4157" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>The latest 5 users who joined the platform</CardDescription>
              </div>
              <button onClick={navigateToRecent} className="flex items-center text-sm  hover:text-primary">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="space-y-4">
                {/* Table header skeleton */}
                <div className="flex justify-between items-center py-2 border-b">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                {/* Pagination skeleton */}
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={userColumns}
                data={recentUsers}
                currentPage={1}
                totalPages={1}
                totalItems={recentUsers.length}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Recent Obituary Posts</CardTitle>
                <CardDescription>The latest 5 obituary posts</CardDescription>
              </div>
              <button onClick={navigateToPosts} className="flex items-center text-sm  hover:text-primary">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingObituaries ? (
              <div className="space-y-4">
                {/* Table header skeleton */}
                <div className="flex justify-between items-center py-2 border-b">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
                {/* Pagination skeleton */}
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={obituaryColumns}
                data={recentObituaries}
                currentPage={1}
                totalPages={1}
                totalItems={recentObituaries.length}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Recent Advertisements</CardTitle>
                <CardDescription>The latest 5 advertisements</CardDescription>
              </div>
              <button onClick={navigateToAdvertisements} className="flex items-center text-sm  hover:text-primary">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

          </CardHeader>
          <CardContent>
            {isLoadingAds ? (
              <div className="space-y-4">
                {/* Table header skeleton */}
                <div className="flex justify-between items-center py-2 border-b">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                {/* Pagination skeleton */}
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={adColumns}
                data={recentAds}
                currentPage={1}
                totalPages={1}
                totalItems={recentAds.length}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>The latest 5 events</CardDescription>
              </div>
              <button onClick={navigateToEvents} className="flex items-center text-sm  hover:text-primary">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="space-y-4">
                {/* Table header skeleton */}
                <div className="flex justify-between items-center py-2 border-b">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {/* Table rows skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                {/* Pagination skeleton */}
                <div className="flex justify-between items-center pt-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={eventColumns}
                data={recentEvents}
                currentPage={1}
                totalPages={1}
                totalItems={recentEvents.length}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
