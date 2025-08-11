"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, LogOut } from "lucide-react"
import Link from "next/link"

import { NotificationSystem } from "@/components/notification-system"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { EventIntegration } from "@/components/event-integration"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    foodSaved: { total: 0, thisMonth: 0, trend: 0 },
    carbonFootprint: { saved: 0, equivalent: "" },
    waterFootprint: { saved: 0, equivalent: "" },
    peopleServed: { total: 0, thisMonth: 0, trend: 0 },
    donations: { total: 0, thisMonth: 0, trend: 0 },
    events: { total: 0, thisMonth: 0, trend: 0 },
    wasteReduction: { percentage: 0, target: 0 }, // Adjusted to match AnalyticsData type
    topCategories: [], // Kept as array, adjust if needed by AnalyticsData type
  })
  interface Activity {
    id: string
    action: string
    user: string
    time: string
    type: string
  }
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch food items from backend
        const res = await fetch("http://localhost:5000/api/food/food-items") // Adjust API base URL if needed
        const data = await res.json()

        // Map the food items into "recent activity" format
        interface FoodItem {
          id: string
          status: string
          createdBy: { name: string }
          claimedBy?: string
          pickupLocation: string
          createdAt: string
        }

        interface Activity {
          id: string
          action: string
          user: string
          time: string
          type: string
        }

                console.log("Fetched food items:", data)


        const formatted: Activity[] = (data as FoodItem[]).map((item: FoodItem): Activity => ({
  id: item.id,
  action: item.status === "claimed" ? "Food item claimed" : "Food item listed",
  user:
    item.status === "claimed"
      ? item.claimedBy || "anonymous"
      : item.createdBy.name || "anonymous",
  time: timeAgo(item.createdAt),
  type: item.status === "claimed" ? "claim" : "listing",
}));


        setRecentActivity(formatted)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      }
    }

    fetchData()
  }, [])

  // Helper: convert timestamp to "x hours ago"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">ZeroWaste</span>
              <Badge variant="secondary" className="ml-2">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSystem />
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor platform activity and manage the ZeroWaste community</p>
        </div>

        <AnalyticsDashboard stats={stats} />

        <Tabs defaultValue="activity" className="space-y-6">
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
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity found.</p>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "canteen"
                                ? "bg-blue-500"
                                : activity.type === "claim"
                                  ? "bg-green-500"
                                  : activity.type === "student"
                                    ? "bg-purple-500"
                                    : activity.type === "listing"
                                      ? "bg-orange-500"
                                      : "bg-gray-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))
                  )}
                </div>
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
