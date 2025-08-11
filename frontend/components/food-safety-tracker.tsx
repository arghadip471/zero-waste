"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"

interface FoodSafetyProps {
  safetyHours?: number
  createdAt?: Date
  score?: number
  onExpiry?: () => void
}

export function FoodSafetyTracker({ safetyHours, createdAt, score, onExpiry }: FoodSafetyProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [status, setStatus] = useState<"safe" | "warning" | "expired">("safe")

  useEffect(() => {
    if (!safetyHours || !createdAt) {
      return
    }

    const updateTimer = () => {
      const now = new Date()
      const expiryTime = new Date(createdAt.getTime() + safetyHours * 60 * 60 * 1000)
      const remaining = expiryTime.getTime() - now.getTime()

      if (remaining <= 0) {
        setTimeRemaining(0)
        setStatus("expired")
        onExpiry?.()
      } else {
        setTimeRemaining(remaining)
        const hoursLeft = remaining / (1000 * 60 * 60)

        if (hoursLeft <= 1) {
          setStatus("expired")
        } else if (hoursLeft <= safetyHours * 0.3) {
          setStatus("warning")
        } else {
          setStatus("safe")
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [safetyHours, createdAt, onExpiry])

  // If we have a score prop, show score-based safety indicator
  if (score !== undefined && (!safetyHours || !createdAt)) {
    const getScoreStatus = (score: number) => {
      if (score >= 80) return "safe"
      if (score >= 60) return "warning"
      return "expired"
    }

    const scoreStatus = getScoreStatus(score)

    return (
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {scoreStatus === "safe" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {scoreStatus === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
            {scoreStatus === "expired" && <XCircle className="h-4 w-4 text-red-600" />}
            <Badge
              className={
                scoreStatus === "safe"
                  ? "bg-green-100 text-green-800"
                  : scoreStatus === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              Safety Score: {score}%
            </Badge>
          </div>
        </div>
        <div className="space-y-1">
          <Progress value={score} className="h-2" />
          <div className="text-xs text-gray-500">Food safety and quality rating</div>
        </div>
      </div>
    )
  }

  // If we don't have the required props for time-based tracking, don't render anything
  if (!safetyHours || !createdAt) {
    return null
  }

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getProgressValue = () => {
    const totalMs = safetyHours * 60 * 60 * 1000
    return Math.max(0, (timeRemaining / totalMs) * 100)
  }

  const getStatusIcon = () => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
    }
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge className={getStatusColor()}>
            {status === "safe" && "Safe to Eat"}
            {status === "warning" && "Consume Soon"}
            {status === "expired" && "Expired"}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="h-3 w-3" />
          {timeRemaining > 0 ? formatTimeRemaining(timeRemaining) : "Expired"}
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={getProgressValue()} className="h-2" />
        <div className="text-xs text-gray-500">Safe for {safetyHours} hours from listing</div>
      </div>
    </div>
  )
}
