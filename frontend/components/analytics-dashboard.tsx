"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Leaf, Droplets, Users, Utensils, Target, Award } from "lucide-react"

interface AnalyticsData {
  foodSaved: {
    total: number
    thisMonth: number
    trend: number
  }
  carbonFootprint: {
    saved: number
    equivalent: string
  }
  waterFootprint: {
    saved: number
    equivalent: string
  }
  peopleServed: {
    total: number
    thisMonth: number
  }
  wasteReduction: {
    percentage: number
    target: number
  }
  topCategories: Array<{
    name: string
    amount: number
    percentage: number
  }>
}

export function AnalyticsDashboard({stats}: {stats: AnalyticsData | null}) {
  const data: AnalyticsData = {
    foodSaved: {
      total: 2847,
      thisMonth: 342,
      trend: 23,
    },
    carbonFootprint: {
      saved: 1250,
      equivalent: "2.5 cars off road for a month",
    },
    waterFootprint: {
      saved: 15600,
      equivalent: "312 bathtubs of water",
    },
    peopleServed: {
      total: 1890,
      thisMonth: 234,
    },
    wasteReduction: {
      percentage: 78,
      target: 85,
    },
    topCategories: [
      { name: "Cooked Meals", amount: 1245, percentage: 44 },
      { name: "Fresh Produce", amount: 892, percentage: 31 },
      { name: "Baked Items", amount: 456, percentage: 16 },
      { name: "Beverages", amount: 254, percentage: 9 },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Food Saved */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Saved</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.foodSaved.total.toLocaleString()} kg</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +{data.foodSaved.trend}%
              </Badge>
              <p className="text-xs text-muted-foreground">vs last month</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.foodSaved.thisMonth} kg this month</p>
          </CardContent>
        </Card>

        {/* Carbon Footprint */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.carbonFootprint.saved} kg</div>
            <p className="text-xs text-muted-foreground mt-1">Equivalent to {data.carbonFootprint.equivalent}</p>
          </CardContent>
        </Card>

        {/* Water Footprint */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.waterFootprint.saved.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground mt-1">{data.waterFootprint.equivalent}</p>
          </CardContent>
        </Card>

        {/* People Served */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Served</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.peopleServed.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.peopleServed.thisMonth} this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Waste Reduction Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Waste Reduction Goal
            </CardTitle>
            <CardDescription>Progress towards monthly target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current: {data.wasteReduction.percentage}%</span>
              <span className="text-sm text-muted-foreground">Target: {data.wasteReduction.target}%</span>
            </div>
            <Progress value={data.wasteReduction.percentage} className="h-3" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                {data.wasteReduction.target - data.wasteReduction.percentage}% to reach target
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Food Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Food Categories
            </CardTitle>
            <CardDescription>Most redistributed food types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.amount} kg ({category.percentage}%)
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Environmental Impact Summary
          </CardTitle>
          <CardDescription>Your contribution to sustainability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">🌱</div>
              <div className="text-lg font-semibold">Carbon Neutral</div>
              <div className="text-sm text-gray-600">Equivalent to planting 45 trees</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">💧</div>
              <div className="text-lg font-semibold">Water Conservation</div>
              <div className="text-sm text-gray-600">Saved enough water for 156 people/day</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">🏆</div>
              <div className="text-lg font-semibold">Community Impact</div>
              <div className="text-sm text-gray-600">Fed 1,890 people this year</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
