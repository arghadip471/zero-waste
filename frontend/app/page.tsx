import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, Utensils, Heart, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">BhojanSeva</span>
          </div>
          <Link href="/auth">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
              Log In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-green-800 mb-6">Reduce Food Waste, Feed Communities</h1>
          <p className="text-xl text-green-700 mb-8 leading-relaxed">
            Connect canteens with NGOs and students to redistribute surplus food and create a sustainable future. Join
            our mission to eliminate food waste while helping those in need.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Utensils className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-800">Smart Food Listing</CardTitle>
              <CardDescription>
                List surplus food with safety tags, freshness status, and automated expiry tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-800">Real-Time Coordination</CardTitle>
              <CardDescription>
                Instant notifications and pickup coordination with location tracking and time windows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-800">Impact Analytics</CardTitle>
              <CardDescription>
                Track environmental impact, carbon footprint reduction, and community reach
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-800">Event Integration</CardTitle>
              <CardDescription>Automatic prompts for food logging after campus events and celebrations</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-16">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1,250+</div>
              <div className="text-green-700">Meals Redistributed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">45</div>
              <div className="text-green-700">Partner Canteens</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">120+</div>
              <div className="text-green-700">NGOs & Students</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
