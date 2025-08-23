"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Clock, MapPin, LogOut, CheckCircle, Loader2, User } from "lucide-react";
import Link from "next/link";
import { NotificationSystem } from "@/components/notification-system";
import { FoodSafetyTracker } from "@/components/food-safety-tracker";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface FoodItem {
  id: string;
  name: string;
  description: string;
  quantity: string | number;
  expiryTime: string;
  canteen: string;
  location: string;
  status: "available" | "claimed";
  foodSafetyScore: number;
  claimedAt?: string;
}

interface CompletedEvent {
  _id: string;
  name: string;
  date: string;
  location: string;
  estimatedSurplus?: string;
  foodDetails?: {
    foodType: string;
    quantity: string;
    description: string;
    safeForHours: number;
    pickupLocation: string;
    loggedAt: string;
    claimed?: boolean;
  };
}

export default function NGODashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [completedEvents, setCompletedEvents] = useState<CompletedEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);
  }, []);

  useEffect(() => {
  const storedName = localStorage.getItem("username");
  if (storedName) setUsername(storedName);

  const userId = localStorage.getItem("user"); // ✅ match login key
  if (userId) {
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.name) {
          setUsername(data.name);
          localStorage.setItem("username", data.name);
        }
      })
      .catch(err => console.error("Error fetching username:", err));
  }
}, []);



  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  // Fetch food items
  const fetchFoodItems = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/food/food-items");
      if (!res.ok) throw new Error("Failed to fetch food items");
      const data: FoodItem[] = await res.json();
      setFoodItems(
        data.sort(
          (a, b) =>
            new Date(b.claimedAt || 0).getTime() - new Date(a.claimedAt || 0).getTime()
        )
      );
    } catch (err) {
      console.error("Error fetching food items:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch completed events
  const fetchCompletedEvents = async (silent = true) => {
    try {
      const res = await fetch("http://localhost:5000/api/events/completed_with_food");
      if (!res.ok) throw new Error("Failed to fetch completed events");
      const data: CompletedEvent[] = await res.json();
      setCompletedEvents(data);
    } catch (err) {
      console.error("Error fetching completed events:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  

  // Fetch analytics stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const res = await fetch("http://localhost:5000/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setErrorStats("Unable to load statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchFoodItems(), fetchCompletedEvents(true), fetchStats()]);
      setLoading(false);
    };
    init();

    const interval = setInterval(() => fetchCompletedEvents(true), 60000);
    return () => clearInterval(interval);
  }, []);

  // Claim available food
  const handleClaimItem = async (itemId: string) => {
    const previousItems = [...foodItems];
    setClaimingItemId(itemId);
    setFoodItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, status: "claimed" } : item))
    );

    try {
      const res = await fetch(`http://localhost:5000/api/food/claim-food/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed", userId: localStorage.getItem("user") }),
      });
      if (!res.ok) throw new Error("Failed to claim item");
    } catch (err) {
      console.error("Error claiming available item:", err);
      setFoodItems(previousItems);
    } finally {
      setClaimingItemId(null);
    }
  };

  // Claim surplus food
  const handleClaimSurplus = async (eventId: string) => {
    setClaimingItemId(eventId);
    try {
      const res = await fetch(`http://localhost:5000/api/events/claim-surplus/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({ userId: localStorage.getItem("user") }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to claim surplus: ${text}`);
      }
      await Promise.all([fetchCompletedEvents(true), fetchFoodItems(true)]);
    } catch (err) {
      console.error("Error claiming surplus food:", err);
    } finally {
      setClaimingItemId(null);
    }
  };

  const availableItems = foodItems.filter((i) => i.status === "available");
  const myClaimedItems = foodItems.filter((i) => i.status === "claimed");

  if (loading) {
    return <div className="p-6 text-center text-yellow-700">Loading food items...</div>;
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
<header className="bg-yellow-100 shadow-sm border-b border-yellow-300">
  <div className="container mx-auto px-4 py-4 flex justify-between">
    <div className="flex items-center gap-2">
      <Link href="/" className="flex items-center gap-2 text-yellow-800 hover:text-yellow-700">
      <Leaf className="h-8 w-8 text-yellow-600" />
      <span className="text-2xl font-bold text-yellow-900">BhojanSeva</span>
      </Link>
      <Badge className="ml-2 bg-yellow-600 text-white">NGO/Student</Badge>
    </div>
    <div className="flex items-center gap-4">
      <NotificationSystem />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 border-yellow-700 text-yellow-800 hover:bg-yellow-200">
            <User className="h-4 w-4" />
            {username || "User"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-yellow-50 border border-yellow-300">
          <DropdownMenuLabel className="text-yellow-800">Signed in as {username || "User"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available">Available Food</TabsTrigger>
            <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
            <TabsTrigger value="completed">Completed Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Available Items */}
          <TabsContent value="available" className="space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-yellow-900">Available Food Items</h1>
              <p className="text-yellow-700 mt-2">Claim surplus food from canteens and help reduce waste</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-yellow-300 bg-yellow-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Items</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{availableItems.length}</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-300 bg-yellow-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items Claimed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{myClaimedItems.length}</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-300 bg-yellow-50">
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

            {/* List */}
            <div className="space-y-6">
              {availableItems.length === 0 ? (
                <Card className="border-yellow-300 bg-yellow-50"><CardContent className="text-center py-8"><p className="text-yellow-700">No food items available at the moment. Check back later!</p></CardContent></Card>
              ) : (
                <div className="grid gap-4">
                  {availableItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow border-yellow-300 bg-yellow-50">
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
                                <span className="font-medium">Quantity:</span><span>{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" /><span>Available for: {item.expiryTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /><span>{item.canteen} - {item.location}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleClaimItem(item.id)}
                            className="bg-green-600 hover:bg-green-700 ml-4"
                            disabled={claimingItemId === item.id}
                          >
                            {claimingItemId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Item"}
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

          {/* Claimed Items */}
          <TabsContent value="claimed" className="space-y-4">
            {myClaimedItems.length > 0 ? (
              <div className="grid gap-4">
                {myClaimedItems.map((item) => (
                  <Card key={item.id} className="border-yellow-300 bg-yellow-50">
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
                              <span className="font-medium">Quantity:</span><span>{item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" /><span>{item.canteen} - {item.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                          <p className="text-sm text-green-600 font-medium">Claimed Successfully</p>
                        </div>
                      </div>
                      <FoodSafetyTracker score={item.foodSafetyScore} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-yellow-300 bg-yellow-50"><CardContent className="text-center py-8"><p className="text-yellow-700">No items claimed yet.</p></CardContent></Card>
            )}
          </TabsContent>

          {/* Completed Events */}
          <TabsContent value="completed" className="space-y-4">
            <Card className="border-yellow-300 bg-yellow-50">
               <CardHeader><CardTitle>Completed Events with Surplus Food</CardTitle></CardHeader>
               <CardContent>
                 {completedEvents.length === 0 ? (
                  <p className="text-yellow-700 text-sm">No completed events with surplus food yet.</p>
                 ) : (
                   <div className="space-y-4">
                     {completedEvents.map((event) => (
                       <div key={event._id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-center mb-2">
                           <h3 className="font-bold text-lg">{event.name}</h3>
                           <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Completed</span>
                         </div>
                         <p className="text-sm text-gray-600 mb-2">{new Date(event.date).toLocaleString()} — {event.location}</p>

                         {event.foodDetails ? (
                           <div className="mt-3 space-y-1 text-sm text-gray-700">
                             <p><strong>🍽 Food Type:</strong> {event.foodDetails.foodType}</p>
                             <p><strong>📦 Quantity:</strong> {event.foodDetails.quantity}</p>
                             <p><strong>📝 Description:</strong> {event.foodDetails.description}</p>
                             <p><strong>⏳ Safe for:</strong> {event.foodDetails.safeForHours} hours</p>
                             <p><strong>📍 Pickup Location:</strong> {event.foodDetails.pickupLocation}</p>
                             <p className="text-xs text-gray-500">Logged at: {new Date(event.foodDetails.loggedAt).toLocaleString()}</p>

                             {!event.foodDetails.claimed ? (
                               <Button
                                 className="mt-2 bg-green-600 hover:bg-green-700"
                                 onClick={() => handleClaimSurplus(event._id)}
                                 disabled={claimingItemId === event._id}
                               >
                                 {claimingItemId === event._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Food"}
                               </Button>
                             ) : (
                               <p className="mt-2 text-green-600 font-medium">✔ Already Claimed</p>
                             )}
                           </div>
                         ) : (
                           <p className="text-yellow-700 text-sm">No detailed food log available.</p>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            {loadingStats ? (
              <div className="flex items-center text-yellow-700">
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading stats...
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
  );
}
