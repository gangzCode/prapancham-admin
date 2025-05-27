"use client"

import { useState } from "react"
import { ArrowRight, DollarSign, FileText, Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DataTable } from "@/components/data-table"
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
  id: string
  name: string
  email: string
  joinedDate: string
  status: "active" | "inactive"
}

const recentUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    joinedDate: "2023-05-15",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    joinedDate: "2023-05-14",
    status: "active",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    joinedDate: "2023-05-13",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    joinedDate: "2023-05-12",
    status: "active",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    joinedDate: "2023-05-11",
    status: "active",
  },
  {
    id: "6",
    name: "rgs Davis",
    email: "emily@example.com",
    joinedDate: "2023-05-12",
    status: "active",
  },
  {
    id: "7",
    name: "Michfvgael Wilson",
    email: "michael@example.com",
    joinedDate: "2023-05-11",
    status: "active",
  },
]

// Sample data for recent obituaries
type Obituary = {
  id: string
  name: string
  date: string
  package: string
  donations: number
}

const recentObituaries: Obituary[] = [
  {
    id: "1",
    name: "James Wilson",
    date: "2023-05-15",
    package: "Premium",
    donations: 1250,
  },
  {
    id: "2",
    name: "Mary Johnson",
    date: "2023-05-14",
    package: "Standard",
    donations: 850,
  },
  {
    id: "3",
    name: "David Brown",
    date: "2023-05-13",
    package: "Premium",
    donations: 1500,
  },
  {
    id: "4",
    name: "Sarah Miller",
    date: "2023-05-12",
    package: "Basic",
    donations: 450,
  },
  {
    id: "5",
    name: "Thomas Davis",
    date: "2023-05-11",
    package: "Standard",
    donations: 750,
  },
]

// Sample data for recent ads
type Ad = {
  id: string
  title: string
  placement: string
  startDate: string
  endDate: string
  status: "active" | "inactive" | "expired"
}

const recentAds: Ad[] = [
  {
    id: "1",
    title: "Local Business Promotion",
    placement: "Homepage Banner",
    startDate: "2023-05-01",
    endDate: "2023-05-31",
    status: "active",
  },
  {
    id: "2",
    title: "Community Event",
    placement: "Sidebar",
    startDate: "2023-05-10",
    endDate: "2023-05-20",
    status: "active",
  },
  {
    id: "3",
    title: "Restaurant Opening",
    placement: "Article Footer",
    startDate: "2023-04-15",
    endDate: "2023-05-15",
    status: "expired",
  },
  {
    id: "4",
    title: "Charity Fundraiser",
    placement: "Homepage Banner",
    startDate: "2023-05-20",
    endDate: "2023-06-20",
    status: "inactive",
  },
  {
    id: "5",
    title: "Local Festival",
    placement: "Sidebar",
    startDate: "2023-06-01",
    endDate: "2023-06-15",
    status: "inactive",
  },
]

// Sample data for recent events
type Event = {
  id: string
  title: string
  date: string
  location: string
  attendees: number
}

const recentEvents: Event[] = [
  {
    id: "1",
    title: "Community Gathering",
    date: "2023-05-20",
    location: "Community Center",
    attendees: 120,
  },
  {
    id: "2",
    title: "Memorial Service",
    date: "2023-05-18",
    location: "Memorial Park",
    attendees: 85,
  },
  {
    id: "3",
    title: "Charity Fundraiser",
    date: "2023-05-25",
    location: "City Hall",
    attendees: 150,
  },
  {
    id: "4",
    title: "Cultural Festival",
    date: "2023-06-01",
    location: "Downtown Plaza",
    attendees: 300,
  },
  {
    id: "5",
    title: "Remembrance Day",
    date: "2023-05-30",
    location: "Veterans Park",
    attendees: 200,
  },
]

// Column definitions for tables
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "joinedDate",
    header: "Joined Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={`capitalize ${row.original.status === "active" ? "text-green-600" : "text-red-600"}`}>
        {row.original.status}
      </div>
    ),
  },
]

const obituaryColumns: ColumnDef<Obituary>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "package",
    header: "Package",
  },
  {
    accessorKey: "donations",
    header: "Donations",
    cell: ({ row }) => <div>${row.original.donations.toLocaleString()}</div>,
  },
]

const adColumns: ColumnDef<Ad>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "placement",
    header: "Placement",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      let statusClass = ""

      switch (status) {
        case "active":
          statusClass = "text-green-600"
          break
        case "inactive":
          statusClass = "text-yellow-600"
          break
        case "expired":
          statusClass = "text-red-600"
          break
      }

      return <div className={`capitalize ${statusClass}`}>{status}</div>
    },
  },
]

const eventColumns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "attendees",
    header: "Attendees",
  },
]

export default function DashboardPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("day")

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
          value="$24,680"
          icon={<DollarSign />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Donations Given Back"
          value="$18,510"
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
            <CardDescription>Breakdown of donations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Received", value: 24680 },
                    { name: "Given Back", value: 18510 },
                    { name: "Company", value: 6170 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                  <Bar dataKey="value" fill="#0B4157" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
            <DataTable columns={userColumns} data={recentUsers} />
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
            <DataTable columns={obituaryColumns} data={recentObituaries} />
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
            <DataTable columns={adColumns} data={recentAds} />
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
            <DataTable columns={eventColumns} data={recentEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
