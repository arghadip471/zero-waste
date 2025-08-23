"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Clock, MapPin, LogOut, CheckCircle, Loader2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NotificationSystem } from "@/components/notification-system";
import { FoodSafetyTracker } from "@/components/food-safety-tracker";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

interface FoodItem {
  id: string;
  name: string;
  description: string;
  quantity: string | number;
  expiryTime: string;
  canteen?: string;
  location?: string;
  status: "available" | "claimed";
  foodSafetyScore?: number;
  claimedAt?: string;
  createdAt?: string;
}

interface CompletedEvent {
  _id: string;
  name: string;
  date: string;
  location: string;
  foodDetails?: {
    foodType?: string;
    quantity?: string;
    description?: string;
    safeForHours?: number;
    pickupLocation?: string;
    loggedAt?: string;
    claimed?: boolean;
  };
}

export default function NGODashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [completedEvents, setCompletedEvents] = useState<CompletedEvent[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);

  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);

  const API = "http://localhost:5000";

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (stored) setUsername(stored);

    const userId = localStorage.getItem("user");
    if (userId) {
      fetch(`${API}/api/users/${userId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.name) {
            setUsername(d.name);
            localStorage.setItem("username", d.name);
          }
        })
        .catch(() => {
          /* ignore */
        });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchFoodItems(), fetchCompletedEvents(true), fetchStats()]);
      setLoading(false);
    };
    init();
    const interval = setInterval(() => fetchCompletedEvents(true), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data fetchers
  async function fetchFoodItems(silent = false) {
    if (!silent) setLoading(true);
    setErrorActivity(null);
    try {
      const res = await fetch(`${API}/api/food/food-items`);
      if (!res.ok) throw new Error("Failed to fetch food items");
      const data = (await res.json()) as FoodItem[];
      // sort by claimedAt desc (fallback to createdAt)
      data.sort((a, b) => {
        const ta = new Date(a.claimedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.claimedAt || b.createdAt || 0).getTime();
        return tb - ta;
      });
      setFoodItems(data);
    } catch (e) {
      console.error(e);
      setErrorActivity("Unable to load food items.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function fetchCompletedEvents(silent = false) {
    if (!silent) setLoadingActivity(true);
    try {
      const res = await fetch(`${API}/api/events/completed_with_food`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = (await res.json()) as CompletedEvent[];
      setCompletedEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoadingActivity(false);
    }
  }

  async function fetchStats() {
    try {
      setLoadingStats(true);
      setErrorStats(null);
      const res = await fetch(`${API}/api/admin/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
      setErrorStats("Unable to load statistics.");
    } finally {
      setLoadingStats(false);
    }
  }

  // Actions
  async function handleClaimItem(itemId: string) {
    const prev = [...foodItems];
    setClaimingItemId(itemId);
    setFoodItems((it) => it.map((f) => (f.id === itemId ? { ...f, status: "claimed" } : f)));
    try {
      const res = await fetch(`${API}/api/food/claim-food/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "claimed", userId: localStorage.getItem("user") }),
      });
      if (!res.ok) throw new Error("Failed to claim item");
    } catch (e) {
      console.error(e);
      setFoodItems(prev);
    } finally {
      setClaimingItemId(null);
    }
  }

  async function handleClaimSurplus(eventId: string) {
    setClaimingItemId(eventId);
    try {
      const res = await fetch(`${API}/api/events/claim-surplus/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("user") }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to claim surplus");
      }
      await Promise.all([fetchCompletedEvents(true), fetchFoodItems(true)]);
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingItemId(null);
    }
  }

  function timeAgo(dateString?: string) {
    if (!dateString) return "just now";
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const seconds = Math.floor((now - date) / 1000);
    const intervals = [
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];
    for (const i of intervals) {
      const c = Math.floor(seconds / i.seconds);
      if (c >= 1) return `${c} ${i.label}${c > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }

  const availableItems = foodItems.filter((f) => f.status === "available");
  const myClaimedItems = foodItems.filter((f) => f.status === "claimed");

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-yellow-100 shadow-sm border-b border-yellow-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-900">NGO Dashboard</h1>
          <p className="text-yellow-700 mt-2">Claim surplus food and monitor community impact</p>
        </div>

        {loadingStats ? (
          <div className="flex items-center text-yellow-700 mb-4">
            <Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading stats...
          </div>
        ) : errorStats ? (
          <p className="text-red-500 mb-4">{errorStats}</p>
        ) : (
          stats && <AnalyticsDashboard stats={stats} />
        )}

        <Tabs defaultValue="available" className="space-y-6 mt-6">
          <TabsList className="bg-yellow-200 text-yellow-900">
            <TabsTrigger value="available">Available Food</TabsTrigger>
            <TabsTrigger value="claimed">Claimed Items</TabsTrigger>
            <TabsTrigger value="completed">Completed Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">Available Food Items</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center text-yellow-700">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading food items...
                  </div>
                ) : errorActivity ? (
                  <p className="text-red-500">{errorActivity}</p>
                ) : availableItems.length === 0 ? (
                  <p className="text-yellow-700">No food items available at the moment. Check back later!</p>
                ) : (
                  <div className="space-y-4">
                    {availableItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-yellow-300 rounded-lg bg-yellow-50 hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className="bg-yellow-600 text-white">Listing</Badge>
                          <div>
                            <p className="font-medium text-yellow-900">
                              Food item listed — <span className="text-orange-700">{item.name}</span>
                            </p>
                            <p className="text-sm text-yellow-700">{item.canteen || item.location || "anonymous"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-yellow-700" title={new Date(item.createdAt || Date.now()).toLocaleString()}>
                            {timeAgo(item.createdAt)}
                          </span>
                          <Button
                            onClick={() => handleClaimItem(item.id)}
                            className="bg-yellow-700 hover:bg-yellow-800 text-white"
                            disabled={claimingItemId === item.id}
                          >
                            {claimingItemId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Item"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="claimed">
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">Your Claimed Items</CardTitle>
              </CardHeader>
              <CardContent>
                {myClaimedItems.length === 0 ? (
                  <p className="text-yellow-700">You have not claimed any items yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myClaimedItems.map((item) => (
                      <div key={item.id} className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-yellow-900">{item.name}</p>
                            <p className="text-sm text-yellow-700">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <p className="text-sm text-green-600">Claimed</p>
                          </div>
                        </div>
                        <FoodSafetyTracker score={item.foodSafetyScore || 0} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">Completed Events with Surplus Food</CardTitle>
              </CardHeader>
              <CardContent>
                {completedEvents.length === 0 ? (
                  <p className="text-yellow-700">No completed events with surplus food yet.</p>
                ) : (
                  <div className="space-y-4">
                    {completedEvents.map((ev) => (
                      <div key={ev._id} className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-bold text-yellow-900">{ev.name}</p>
                            <p className="text-sm text-yellow-700">{new Date(ev.date).toLocaleString()} — {ev.location}</p>
                          </div>
                          <Badge className="bg-red-500 text-white">Completed</Badge>
                        </div>

                        {ev.foodDetails ? (
                          <div className="mt-2 text-sm text-yellow-700 space-y-1">
                            <p><strong>Type:</strong> {ev.foodDetails.foodType}</p>
                            <p><strong>Quantity:</strong> {ev.foodDetails.quantity}</p>
                            <p className="text-xs text-yellow-600">Logged at: {ev.foodDetails.loggedAt ? new Date(ev.foodDetails.loggedAt).toLocaleString() : "-"}</p>

                            {!ev.foodDetails.claimed ? (
                              <Button
                                className="mt-2 bg-yellow-700 hover:bg-yellow-800 text-white"
                                onClick={() => handleClaimSurplus(ev._id)}
                                disabled={claimingItemId === ev._id}
                              >
                                {claimingItemId === ev._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Food"}
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
