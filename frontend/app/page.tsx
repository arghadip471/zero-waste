import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, Utensils, Heart, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/img.png')" }}
    >
      {/* Main content */}
      <div className="min-h-screen bg-yellow-50/85">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-end">
            {/* Removed BhojanSeva from navbar */}
            <Link href="/auth">
              <Button
                variant="outline"
                className="border-yellow-700 text-yellow-700 hover:bg-yellow-100 bg-transparent"
              >
                Log In
              </Button>
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            {/* BhojanSeva main title */}
            <h1 className="text-7xl font-extrabold text-yellow-900 mb-4">BhojanSeva</h1>

            <h2 className="text-3xl font-bold text-yellow-900 mb-6">
              Reduce Food Waste, Feed Communities
            </h2>
            <p className="text-xl text-yellow-800 mb-8 leading-relaxed">
              Connect canteens with NGOs and students to redistribute surplus food and create a sustainable future.
              Join our mission to eliminate food waste while helping those in need.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg">
                Get Started
              </Button>
            </Link>
          </div>


          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="border-yellow-300 bg-yellow-100/80 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Utensils className="h-12 w-12 text-yellow-700 mx-auto mb-4" />
                <CardTitle className="text-yellow-900">Smart Food Listing</CardTitle>
                <CardDescription className="text-yellow-800">
                  List surplus food with safety tags, freshness status, and automated expiry tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-yellow-300 bg-yellow-100/80 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Heart className="h-12 w-12 text-yellow-700 mx-auto mb-4" />
                <CardTitle className="text-yellow-900">Real-Time Coordination</CardTitle>
                <CardDescription className="text-yellow-800">
                  Instant notifications and pickup coordination with location tracking and time windows
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-yellow-300 bg-yellow-100/80 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-yellow-700 mx-auto mb-4" />
                <CardTitle className="text-yellow-900">Impact Analytics</CardTitle>
                <CardDescription className="text-yellow-800">
                  Track environmental impact, carbon footprint reduction, and community reach
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-yellow-300 bg-yellow-100/80 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-yellow-700 mx-auto mb-4" />
                <CardTitle className="text-yellow-900">Event Integration</CardTitle>
                <CardDescription className="text-yellow-800">
                  Automatic prompts for food logging after campus events and celebrations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Stats */}
          <div className="bg-yellow-100/90 border border-yellow-300 rounded-lg shadow-lg p-8 mt-16">
            <h2 className="text-3xl font-bold text-center text-yellow-900 mb-8">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-yellow-700 mb-2">1,250+</div>
                <div className="text-yellow-800">Meals Redistributed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-700 mb-2">45</div>
                <div className="text-yellow-800">Partner Canteens</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-700 mb-2">120+</div>
                <div className="text-yellow-800">NGOs & Students</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
