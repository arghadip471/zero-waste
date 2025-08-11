"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Plus, AlertCircle } from "lucide-react"

interface Event {
  id: string
  name: string
  type: string
  date: Date
  location: string
  expectedAttendees: number
  status: "upcoming" | "ongoing" | "completed"
  foodLogged: boolean
  estimatedSurplus?: string
}

export function EventIntegration() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Tech Conference 2024",
      type: "Conference",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      location: "Main Auditorium",
      expectedAttendees: 200,
      status: "completed",
      foodLogged: false,
      estimatedSurplus: "30-40 portions",
    },
    {
      id: "2",
      name: "Cultural Fest",
      type: "Festival",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      location: "Campus Grounds",
      expectedAttendees: 500,
      status: "upcoming",
      foodLogged: false,
    },
    {
      id: "3",
      name: "Workshop on AI",
      type: "Workshop",
      date: new Date(), // Now
      location: "Computer Lab",
      expectedAttendees: 50,
      status: "ongoing",
      foodLogged: false,
    },
  ])

  const [showFoodForm, setShowFoodForm] = useState<string | null>(null)

  const handleLogFood = (eventId: string, foodData: any) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, foodLogged: true } : event)))
    setShowFoodForm(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campus Events Integration
          </CardTitle>
          <CardDescription>Track events and get reminders to log surplus food</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className={`${!event.foodLogged && event.status === "completed" ? "border-orange-200 bg-orange-50" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                    {!event.foodLogged && event.status === "completed" && (
                      <Badge variant="outline" className="border-orange-500 text-orange-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Food Logging Pending
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.expectedAttendees} expected attendees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span>{event.type}</span>
                    </div>
                  </div>

                  {event.estimatedSurplus && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Estimated Surplus: {event.estimatedSurplus}</span>
                      </div>
                    </div>
                  )}

                  {event.foodLogged && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <span className="font-medium">✅ Food surplus logged successfully</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {!event.foodLogged && event.status === "completed" && (
                    <Button onClick={() => setShowFoodForm(event.id)} className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Log Food
                    </Button>
                  )}
                </div>
              </div>

              {/* Food Logging Form */}
              {showFoodForm === event.id && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-4">Log Surplus Food from {event.name}</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleLogFood(event.id, {}) // In real app, would pass form data
                    }}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="foodType">Food Type</Label>
                        <Input id="foodType" placeholder="e.g., Lunch boxes, Snacks" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" placeholder="e.g., 25 portions" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Brief description of the food items" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="safetyHours">Safe for (hours)</Label>
                        <Input id="safetyHours" type="number" placeholder="4" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupLocation">Pickup Location</Label>
                        <Input id="pickupLocation" placeholder="Event venue or storage location" required />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Log Food Items
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowFoodForm(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
