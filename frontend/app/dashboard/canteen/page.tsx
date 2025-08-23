"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Leaf, Plus, Clock, Users, LogOut, MapPin, CheckCircle, Loader2, User } from "lucide-react"
import Link from "next/link"
import { NotificationSystem } from "@/components/notification-system"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FoodItem {
  id: string
  name: string
  description: string
  quantity: string
  expiryTime: string
  safetyHours: number
  createdAt: string
  status: "available" | "claimed" | "expired"
  claimedBy?: string
  pickupLocation: string
  freshnessStatus: "fresh" | "good" | "consume_soon"
  category: string
}

export default function CanteenDashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [errorStats, setErrorStats] = useState<string | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)

  const API_BASE_URL = "http://localhost:5000"

  useEffect(() => {
    async function fetchFoodItems() {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/api/food/food-items?userId=${localStorage.getItem("user") || null}`)
        if (!res.ok) throw new Error(`Error: ${res.statusText}`)
        const data = await res.json()
        setFoodItems(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch food items")
      } finally {
        setLoading(false)
      }
    }
    fetchFoodItems()
    fetchStats()
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

  // Fetch upcoming events
  useEffect(() => {
    async function fetchUpcomingEvents() {
      try {
        setLoadingEvents(true)
        const res = await fetch(`${API_BASE_URL}/api/events/event_fetch`)
        if (!res.ok) throw new Error(`Error: ${res.statusText}`)
        const data = await res.json()
        const upcoming = data.filter((event: any) => event.status === "Upcoming")
        setUpcomingEvents(upcoming)
      } catch (err: any) {
        setEventsError(err.message || "Failed to fetch events")
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchUpcomingEvents()
  }, [])

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const newItem = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      quantity: formData.get("quantity") as string,
      expiryTime: formData.get("expiryTime") as string,
      safetyHours: Number.parseInt(formData.get("safetyHours") as string),
      pickupLocation: formData.get("pickupLocation") as string,
      freshnessStatus: "fresh",
      category: formData.get("category") as string,
      status: "available",
      createdAt: new Date().toISOString(),
      userId: localStorage.getItem("user") || "anonymous",
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/food/add-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      })
      if (!res.ok) throw new Error(`Failed to add item: ${res.statusText}`)
      const savedItem = await res.json()
      setFoodItems((prev) => [savedItem.foodItem, ...prev])
      setShowAddForm(false)
      e.currentTarget.reset()
    } catch (err: any) {
      console.log(err.message || "Error adding food item")
    }
  }

  const [claimingItemId, setClaimingItemId] = useState<string | null>(null)

  const handleClaimItem = async (itemId: string) => {
    try {
      setClaimingItemId(itemId)
      const res = await fetch(`${API_BASE_URL}/api/food/claim/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("user") || null }),
      })
      if (!res.ok) {
        // If server fails, throw to trigger optimistic fallback below
        throw new Error(`Failed to claim item: ${res.statusText}`)
      }
      const data = await res.json()
      setFoodItems(prev =>
        prev.map(it =>
          it.id === itemId ? { ...it, status: "claimed", claimedBy: data.claimedBy || localStorage.getItem("user") || undefined } : it
        )
      )
    } catch (err) {
      console.error("Error claiming item:", err)
      // optimistic fallback update so UI reflects claim even if server failed
      setFoodItems(prev =>
        prev.map(it =>
          it.id === itemId ? { ...it, status: "claimed", claimedBy: localStorage.getItem("user") || undefined } : it
        )
      )
    } finally {
      setClaimingItemId(null)
    }
  }

  const handleClaimSurplus = async (eventId: string) => {
    try {
      setClaimingItemId(eventId)
      const res = await fetch(`${API_BASE_URL}/api/events/claim-surplus/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("user") || null }),
      })
      if (!res.ok) {
        throw new Error(`Failed to claim surplus: ${res.statusText}`)
      }
      const data = await res.json()
      setUpcomingEvents(prev =>
        prev.map(ev =>
          ev._id === eventId ? { ...ev, foodDetails: { ...(ev.foodDetails || {}), claimed: true } } : ev
        )
      )
    } catch (err) {
      console.error("Error claiming surplus:", err)
      // optimistic fallback so UI shows claimed state
      setUpcomingEvents(prev =>
        prev.map(ev =>
          ev._id === eventId ? { ...ev, foodDetails: { ...(ev.foodDetails || {}), claimed: true } } : ev
        )
      )
    } finally {
      setClaimingItemId(null)
    }
  }

  function ChatBot() {
    const [open, setOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([])
    const [typing, setTyping] = useState(false)

    const sendMessage = () => {
      const text = input.trim()
      if (!text) return
      setMessages((m) => [...m, { from: "user", text }])
      setInput("")
      setTyping(true)
      // simulated AI reply
      setTimeout(() => {
        setMessages((m) => [...m, { from: "bot", text: `AI: Echo — "${text}". Ask about safety or claiming.` }])
        setTyping(false)
      }, 800)
    }

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") sendMessage()
    }

    return (
      <>
        {/* Floating Chat Button */}
        <div className="fixed right-6 bottom-6 z-50">
          {open && (
            <div className="w-80 md:w-96 mb-3 rounded-lg shadow-lg border border-yellow-300 bg-white overflow-hidden">
              <div className="flex items-center justify-between bg-yellow-600 text-white px-3 py-2">
                <div className="font-medium">Bhojan AI</div>
                <button onClick={() => setOpen(false)} className="text-white text-sm">Close</button>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto space-y-2">
                {messages.length === 0 && <div className="text-sm text-gray-500">Ask about listing, claiming, or food safety.</div>}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`${m.from === "user" ? "bg-yellow-700 text-white" : "bg-gray-100 text-gray-800"} px-3 py-2 rounded-lg max-w-[80%] text-sm`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && <div className="text-sm text-gray-500">AI is typing...</div>}
              </div>
              <div className="p-2 border-t border-gray-200 flex gap-2">
                <input
                  className="flex-1 px-2 py-1 border rounded-md text-sm"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button onClick={sendMessage} className="bg-yellow-700 hover:bg-yellow-800 text-white px-3 py-1 rounded-md text-sm">
                  Send
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-600 text-white shadow-lg hover:bg-yellow-700"
          >
            <span className="font-medium">Chat AI</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-yellow-100 shadow-sm border-b border-yellow-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 text-yellow-800 hover:text-yellow-700">
                <Leaf className="h-8 w-8 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">BhojanSeva</span>
              </Link>
              <Badge className="ml-2 bg-yellow-600 text-white">Canteen Staff</Badge>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSystem />
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 border rounded-md px-2 py-1 border-yellow-700 text-yellow-800 hover:bg-yellow-200">
                    <User className="h-5 w-5" />
                    <span>{username || "User"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-yellow-50 border border-yellow-300">
                  <div className="px-3 py-2 text-sm text-yellow-700 border-b">
                    Signed in as <span className="font-medium text-yellow-900">{username || "User"}</span>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/auth" className="flex items-center gap-2 text-red-600">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-900">Canteen Dashboard</h1>
            <p className="text-yellow-700 mt-2">Manage your food listings and reduce waste</p>
          </div>
          {/* Add Item button */}
          <Button onClick={() => setShowAddForm(true)} className="bg-yellow-700 hover:bg-yellow-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Food Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items Listed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{foodItems.length}</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Items</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {foodItems.filter((item) => item.status === "available").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Claimed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {foodItems.filter((item) => item.status === "claimed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">Food Listings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {/* Add Item Form */}
            {showAddForm && (
              <Card className="border-yellow-300 bg-yellow-50 mb-8">
                <CardHeader>
                  <CardTitle>Add New Food Item</CardTitle>
                  <CardDescription>List surplus food for NGOs and students to claim</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Food Item Name</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryTime">Available Until</Label>
                      <Input id="expiryTime" name="expiryTime" required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="safetyHours">Safe for (hours)</Label>
                        <Select name="safetyHours" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select safety duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hours</SelectItem>
                            <SelectItem value="2">2 hours</SelectItem>
                            <SelectItem value="4">4 hours</SelectItem>
                            <SelectItem value="6">6 hours</SelectItem>
                            <SelectItem value="8">8 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Food Category</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cooked_meals">Cooked Meals</SelectItem>
                            <SelectItem value="fresh_produce">Fresh Produce</SelectItem>
                            <SelectItem value="baked_items">Baked Items</SelectItem>
                            <SelectItem value="beverages">Beverages</SelectItem>
                            <SelectItem value="packaged_food">Packaged Food</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Input id="pickupLocation" name="pickupLocation" required />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-yellow-700 hover:bg-yellow-800 text-white">Add Item</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Food Items List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Your Food Listings</h2>

              {loading ? (
                <p className="text-yellow-700">Loading food items...</p>
              ) : error ? (
                <p className="text-red-600">Error: {error}</p>
              ) : foodItems.length === 0 ? (
                <Card className="border-yellow-300 bg-yellow-50">
                  <CardContent className="text-center py-8">
                    <p className="text-yellow-700">No food items listed yet. Add your first item to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {foodItems.map((item) => {
                    const createdAt = new Date(item.createdAt)
                    const now = new Date()
                    const elapsedMs = now.getTime() - createdAt.getTime()
                    const elapsedHours = elapsedMs / (1000 * 60 * 60)
                    const progressPercent = Math.min((elapsedHours / item.safetyHours) * 100, 100)
                    const remainingHours = Math.max(item.safetyHours - elapsedHours, 0)

                    const formatHours = (h: number) => {
                      if (h <= 0) return "Expired"
                      if (h < 1) return `${Math.round(h * 60)} mins`
                      return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
                    }

                    const isExpired = elapsedHours >= item.safetyHours
                    const displayExpired = item.status !== "claimed" && (item.status === "expired" || isExpired)

                    return (
                      <div key={item.id} className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-yellow-900">{item.name}</h3>
                          {item.status === "available" && !isExpired && (
                            <Badge className="bg-green-100 text-green-800">Available</Badge>
                          )}
                          {item.status === "claimed" && (
                            <Badge className="bg-blue-100 text-blue-800">Claimed</Badge>
                          )}
                          {displayExpired && (
                            <Badge className="bg-red-100 text-red-800">Expired</Badge>
                          )}
                        </div>
                        <p className="text-yellow-700 mb-3">{item.description}</p>
                        
                        <div className="flex gap-6 text-sm text-yellow-700 mb-4">
                          <span><strong>Quantity:</strong> {item.quantity}</span>
                          <span><strong>Available for:</strong> {item.expiryTime}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <strong>Pickup:</strong> {item.pickupLocation}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle
                            className={`h-5 w-5 ${
                              displayExpired ? "text-red-600" : "text-green-600"
                            }`}
                          />
                          <Badge
                            className={
                              displayExpired
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {displayExpired ? "Expired" : "Safe to Eat"}
                          </Badge>
                        </div>

                        <div className="relative h-2 rounded-full bg-gray-300">
                          <div
                            className={`absolute top-0 left-0 h-2 rounded-full ${
                              displayExpired ? "bg-red-600" : "bg-black"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-yellow-700 mt-1">
                          <span>
                            {displayExpired
                              ? "❌ Safety time exceeded"
                              : `Safe for ${formatHours(remainingHours)} from listing`}
                          </span>
                          <span>⏱ {formatHours(elapsedHours)}</span>
                        </div>

                        
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard stats={stats} />
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            {loadingEvents ? (
              <p className="text-yellow-700">Loading upcoming events...</p>
            ) : eventsError ? (
              <p className="text-red-600">Error: {eventsError}</p>
            ) : upcomingEvents.length === 0 ? (
              <Card className="border-yellow-300 bg-yellow-50"><CardContent className="text-center py-8">No upcoming events from admin.</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event._id} className="border-yellow-300 bg-yellow-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>{event.name}</CardTitle>
                        <CardDescription>{new Date(event.date).toLocaleString()} — {event.location}</CardDescription>
                      </div>
                      <Badge className="bg-yellow-500 text-white">Upcoming</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Duration: {event.durationHours}h {event.durationMinutes}m {event.durationSeconds}s
                      </p>

                      {/* Claim surplus in completed events */}
                      {event.foodDetails ? (
                        !event.foodDetails.claimed ? (
                          <Button
                            className="mt-2 bg-yellow-700 hover:bg-yellow-800 text-white"
                            onClick={() => handleClaimSurplus(event._id)}
                            disabled={claimingItemId === event._id}
                          >
                            {claimingItemId === event._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Food"}
                          </Button>
                        ) : (
                          <p className="mt-2 text-green-600 font-medium">✔ Already Claimed</p>
                        )
                      ) : (
                        <p className="text-yellow-700 text-sm mt-2">No detailed food log available.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
             )}
           </TabsContent>
        </Tabs>

        <ChatBot />
      </div>
    </div>
  )
}
