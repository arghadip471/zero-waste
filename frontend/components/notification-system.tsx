"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, MapPin, X, Check } from "lucide-react"

interface Notification {
  id: string
  type: "new_food" | "pickup_reminder" | "expiry_warning" | "event_reminder"
  title: string
  message: string
  foodItem?: {
    name: string
    quantity: string
    location: string
    pickupWindow: string
    safetyTag: string
  }
  timestamp: Date
  read: boolean
  urgent: boolean
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "new_food",
      title: "New Food Available",
      message: "Fresh vegetable curry available for pickup",
      foodItem: {
        name: "Vegetable Curry",
        quantity: "15 portions",
        location: "Main Campus Canteen",
        pickupWindow: "Next 2 hours",
        safetyTag: "Safe for 4 hours",
      },
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      urgent: false,
    },
    {
      id: "2",
      type: "pickup_reminder",
      title: "Pickup Reminder",
      message: "Don't forget to collect your claimed sandwich platters",
      foodItem: {
        name: "Sandwich Platters",
        quantity: "10 pieces",
        location: "Student Center Cafe",
        pickupWindow: "30 minutes remaining",
        safetyTag: "Safe for 2 hours",
      },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      urgent: true,
    },
    {
      id: "3",
      type: "event_reminder",
      title: "Event Food Logging",
      message: "Tech Conference ended. Any surplus food to list?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      urgent: false,
    },
  ])

  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_food":
        return "🍽️"
      case "pickup_reminder":
        return "⏰"
      case "expiry_warning":
        return "⚠️"
      case "event_reminder":
        return "📅"
      default:
        return "📢"
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  } ${notification.urgent ? "border-l-4 border-l-red-500" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {notification.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                      {notification.foodItem && (
                        <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                          <div className="font-medium">{notification.foodItem.name}</div>
                          <div className="flex items-center gap-4 text-gray-500">
                            <span>Qty: {notification.foodItem.quantity}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {notification.foodItem.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.foodItem.pickupWindow}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.foodItem.safetyTag}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{formatTimeAgo(notification.timestamp)}</span>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
