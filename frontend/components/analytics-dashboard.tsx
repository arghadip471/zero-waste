"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Leaf, Droplets, Users, Utensils, Target, Award, Loader2 } from "lucide-react"

interface AnalyticsData {
  foodSaved: {
    total: number
    thisMonth: number
    trend: number
  }
  carbonSaved: {
    totalKg: number
    carsOffStreetTotal: number
  }
  waterSaved: {
    totalLiters: number
    totalBuckets: string
  }
  peopleServed: {
    total: number
  }
  wasteReduction: {
    percentage: number
    target: number
  }
  categories: Array<{
    category: string
    percentage: number
    totalKg: number
  }>
}

export function AnalyticsDashboard({ stats }: { stats: AnalyticsData | null }) {
  if (!stats) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Loading Analytics...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-yellow-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Food Saved */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Food Saved</CardTitle>
            <Utensils className="h-4 w-4 text-yellow-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.foodSaved.total.toLocaleString()} kg</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-900">
                +{stats.foodSaved.trend}%
              </Badge>
              <p className="text-xs text-yellow-700">vs last month</p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">{stats.foodSaved.thisMonth} kg this month</p>
          </CardContent>
        </Card>

        {/* Carbon Footprint */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">CO₂ Saved</CardTitle>
            <Leaf className="h-4 w-4 text-yellow-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.carbonSaved.totalKg} kg</div>
            <p className="text-xs text-yellow-700 mt-1">
              Equivalent to {stats.carbonSaved.carsOffStreetTotal} cars off the street
            </p>
          </CardContent>
        </Card>

        {/* Water Footprint */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Water Saved</CardTitle>
            <Droplets className="h-4 w-4 text-yellow-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.waterSaved.totalLiters.toLocaleString()} L</div>
            <p className="text-xs text-yellow-700 mt-1">{stats.waterSaved.totalBuckets} buckets of water</p>
          </CardContent>
        </Card>

        {/* People Served */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">People Served</CardTitle>
            <Users className="h-4 w-4 text-yellow-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.peopleServed.total.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Waste Reduction Goal */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Target className="h-5 w-5 text-yellow-700" />
              Waste Reduction Goal
            </CardTitle>
            <CardDescription className="text-yellow-700">Progress towards monthly target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-900">Current: {stats.wasteReduction.percentage}%</span>
              <span className="text-sm text-yellow-700">Target: {stats.wasteReduction.target}%</span>
            </div>
            <Progress value={stats.wasteReduction.percentage} className="h-3 bg-yellow-100 [&>div]:bg-yellow-500" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-700" />
              <span className="text-sm text-yellow-700">
                {stats.wasteReduction.target - stats.wasteReduction.percentage}% to reach target
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Food Categories */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Award className="h-5 w-5 text-yellow-700" />
              Top Food Categories
            </CardTitle>
            <CardDescription className="text-yellow-700">Most redistributed food types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-900">{category.category}</span>
                  <span className="text-sm text-yellow-700">
                    {category.totalKg} kg ({category.percentage}%)
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2 bg-yellow-100 [&>div]:bg-yellow-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Leaf className="h-5 w-5 text-yellow-700" />
            Environmental Impact Summary
          </CardTitle>
          <CardDescription className="text-yellow-700">Your contribution to sustainability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 mb-2">🌱</div>
              <div className="text-lg font-semibold text-yellow-900">Carbon Neutral</div>
              <div className="text-sm text-yellow-800">Equivalent to planting 45 trees</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 mb-2">💧</div>
              <div className="text-lg font-semibold text-yellow-900">Water Conservation</div>
              <div className="text-sm text-yellow-800">Saved enough water for 156 people/day</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 mb-2">🏆</div>
              <div className="text-lg font-semibold text-yellow-900">Community Impact</div>
              <div className="text-sm text-yellow-800">Fed 1,890 people this year</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
