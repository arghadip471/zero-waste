"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Clock, MapPin, LogOut, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { NotificationSystem } from "@/components/notification-system"
import { FoodSafetyTracker } from "@/components/food-safety-tracker"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FoodItem {
  id: string
  name: string
  description: string
  quantity: number
  expiryTime: string
  canteen: string
  location: string
  status: "available" | "claimed"
  foodSafetyScore: number
  claimedAt?: string
}

export default function NGODashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null)

  // Analytics states
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [errorStats, setErrorStats] = useState<string | null>(null)

  useEffect(() => {
    fetchFoodItems()
    fetchStats()
  }, [])

  async function fetchFoodItems() {
    try {
      const res = await fetch("http://localhost:5000/api/food/food-items")
      if (!res.ok) throw new Error("Failed to fetch food items")
      const data: FoodItem[] = await res.json()
      setFoodItems(
        data.sort(
          (a, b) =>
            new Date(b.claimedAt || "").getTime() -
            new Date(a.claimedAt || "").getTime()
        )
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleClaimItem = async (itemId: string) => {
    const previousItems = [...foodItems]
    setClaimingItemId(itemId)
    const userName = localStorage.getItem("user") || "Anonymous"

    // Optimistic UI update
    setFoodItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, status: "claimed", claimedBy: userName }
          : item
      )
    )

    try {
      const res = await fetch(
        `http://localhost:5000/api/food/claim-food/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "claimed",
            claimedBy: userName,
          }),
        }
      )

      if (!res.ok) throw new Error("Failed to claim item")

      const updatedItem = await res.json()
      setFoodItems((items) =>
        items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      )
    } catch (error) {
      console.error(error)
      setFoodItems(previousItems)
    } finally {
      setClaimingItemId(null)
    }
  }

  const availableItems = foodItems.filter((item) => item.status === "available")
  const myClaimedItems = foodItems.filter((item) => item.status === "claimed")

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading food items...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">
                ZeroWaste
              </span>
              <Badge variant="secondary" className="ml-2">
                NGO/Student
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
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available Food</TabsTrigger>
            <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Available Items Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Available Food Items</h1>
              <p className="text-gray-600 mt-2">
                Claim surplus food from canteens and help reduce waste
              </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Items</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{availableItems.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items Claimed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{myClaimedItems.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{myClaimedItems.length * 10}</div>
                  <p className="text-xs text-muted-foreground">Points earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Available Items List */}
            <div className="space-y-6">
              {availableItems.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">
                      No food items available at the moment. Check back later!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              <Badge className="bg-green-100 text-green-800">Available</Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{item.description}</p>
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Quantity:</span>
                                <span>{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Available for: {item.expiryTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {item.canteen} - {item.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleClaimItem(item.id)}
                            className="bg-green-600 hover:bg-green-700 ml-4"
                            disabled={claimingItemId === item.id}
                          >
                            {claimingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Claim Item"
                            )}
                          </Button>
                        </div>
                        <FoodSafetyTracker score={item.foodSafetyScore} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Claimed Items Tab */}
          <TabsContent value="claimed" className="space-y-4">
            {myClaimedItems.length > 0 ? (
              <div className="grid gap-4">
                {myClaimedItems.map((item) => (
                  <Card key={item.id} className="border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <Badge className="bg-blue-100 text-blue-800">Claimed</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          <div className="space-y-1 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Quantity:</span>
                              <span>{item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {item.canteen} - {item.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                          <p className="text-sm text-green-600 font-medium">
                            Claimed Successfully
                          </p>
                        </div>
                      </div>
                      <FoodSafetyTracker score={item.foodSafetyScore} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No items claimed yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
