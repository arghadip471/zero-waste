"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"


import { NotificationSystem } from "@/components/notification-system"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { EventIntegration } from "@/components/event-integration"

export default function AdminDashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [errorActivity, setErrorActivity] = useState<string | null>(null)
  const [errorStats, setErrorStats] = useState<string | null>(null)

  interface Activity {
    id: string
    name: string
    action: string
    user: string
    time: string
    type: "canteen" | "claim" | "student" | "listing" | "other"
  }

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [])

  useEffect(() => {
      const storedName = localStorage.getItem("username")
      if (storedName) setUsername(storedName)
  
      const userId = localStorage.getItem("user")
      if (userId) {
        fetch(`http://localhost:5000/api/users/${userId}`)
          .then(res => res.json())
          .then(data => {
            if (data?.name) {
              setUsername(data.name)
              localStorage.setItem("username", data.name)
            }
          })
          .catch(err => console.error("Error fetching username:", err))
      }
    }, [])

  async function fetchStats() {
    try {
      setLoadingStats(true)
      setErrorStats(null)
      const res = await fetch("http://localhost:5000/api/admin/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setErrorStats("Unable to load statistics.")
    } finally {
      setLoadingStats(false)
    }
  }

  async function fetchActivity() {
    try {
      setLoadingActivity(true)
      setErrorActivity(null)
      const res = await fetch("http://localhost:5000/api/food/food-items")
      if (!res.ok) throw new Error("Failed to fetch food items")
      const data = await res.json()

      const formatted: Activity[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        action: item.status === "claimed" ? "Food item claimed" : "Food item listed",
        user:
          item.status === "claimed"
            ? item.claimedBy || "anonymous"
            : item.createdBy?.name || "anonymous",
        time: timeAgo(item.createdAt),
        type:
          item.type === "canteen"
            ? "canteen"
            : item.status === "claimed"
            ? "claim"
            : item.type === "student"
            ? "student"
            : "listing",
      }))

      setRecentActivity(formatted)
    } catch (err) {
      console.error("Error fetching recent activity:", err)
      setErrorActivity("Unable to load recent activity.")
    } finally {
      setLoadingActivity(false)
    }
  }

  function timeAgo(dateString: string) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const intervals = [
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ]

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds)
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
      }
    }
    return "just now"
  }

  function getTypeBadge(type: Activity["type"]) {
    switch (type) {
      case "canteen":
        return <Badge className="bg-blue-500">Canteen</Badge>
      case "claim":
        return <Badge className="bg-green-500">Claimed</Badge>
      case "student":
        return <Badge className="bg-purple-500">Student</Badge>
      case "listing":
        return <Badge className="bg-orange-500">Listed</Badge>
      default:
        return <Badge className="bg-gray-500">Other</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 text-green-800 hover:text-green-600">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">BhojanSeva</span>
              </Link>
              <Badge variant="secondary" className="ml-2">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSystem />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {username || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Signed in as {username || "User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/auth">
                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor platform activity and manage the ZeroWaste community
          </p>
        </div>

        {loadingStats ? (
          <div className="flex items-center text-gray-500">
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Loading stats...
          </div>
        ) : errorStats ? (
          <p className="text-red-500">{errorStats}</p>
        ) : (
          stats && <AnalyticsDashboard stats={stats} />
        )}

        <Tabs defaultValue="activity" className="space-y-6 mt-6">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="events">Event Management</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest food item actions from the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="flex items-center text-gray-500">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Loading recent activity...
                  </div>
                ) : errorActivity ? (
                  <p className="text-red-500">{errorActivity}</p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          {getTypeBadge(activity.type)}
                          <div>
                            <p className="font-medium">
                              {activity.action} —{" "}
                              <span className="text-green-700">{activity.name}</span>
                            </p>
                            <p className="text-sm text-gray-500">{activity.user}</p>
                          </div>
                        </div>
                        <span
                          className="text-sm text-gray-500"
                          title={new Date().toLocaleString()}
                        >
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <EventIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
