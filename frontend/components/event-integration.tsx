"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Event {
  _id: string;
  name: string;
  date: string;
  location: string;
  durationHours?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  status: string;
  foodLogged?: boolean;
  foodDetails?: {
    foodType: string;
    quantity: string;
    description: string;
    safeForHours: number;
    pickupLocation: string;
    loggedAt: string;
  };
}

const EventCard = ({ event, onFoodLogged }: { event: Event; onFoodLogged: () => void }) => {
  const [showFoodForm, setShowFoodForm] = useState(false);

  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [safeForHours, setSafeForHours] = useState(0);
  const [pickupLocation, setPickupLocation] = useState("");

  // 🎨 Warm status colors
  let statusColor = "#CA8A04"; // amber default
  if (event.status === "Upcoming") statusColor = "#F59E0B"; // amber
  if (event.status === "Ongoing") statusColor = "#EA580C"; // orange
  if (event.status === "Completed") statusColor = "#B91C1C"; // red

  const hrs = event.durationHours || 0;
  const mins = event.durationMinutes || 0;
  const secs = event.durationSeconds || 0;

  // ✅ Log food
  const handleLogFood = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/event_log_food/${event._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodType,
          quantity,
          description,
          safeForHours,
          pickupLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Failed to log food");
        return;
      }

      console.log("Food logged:", data);

      setShowFoodForm(false);
      setFoodType("");
      setQuantity("");
      setDescription("");
      setSafeForHours(0);
      setPickupLocation("");

      onFoodLogged(); // refresh
    } catch (err) {
      console.error("Error logging food:", err);
      alert("Something went wrong while logging food");
    }
  };

  // ✅ Delete event
  const handleDeleteEvent = async () => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/events/${event._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Failed to delete event");
        return;
      }

      console.log("Deleted:", data);
      onFoodLogged(); // refresh events
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Something went wrong while deleting");
    }
  };

  return (
    <div className="event-item">
      <div className="event-header flex justify-between items-center">
        <h4 className="event-title font-semibold text-amber-800">{event.name}</h4>
        <div className="flex items-center gap-2">
          <span
            className="status-badge"
            style={{ backgroundColor: statusColor }}
          >
            {event.status}
          </span>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteEvent}>
            Delete
          </Button>
        </div>
      </div>
      <p className="event-date text-amber-700">
        {new Date(event.date).toLocaleString()} — {hrs}h {mins}m {secs}s
      </p>
      <p className="event-location text-orange-700">{event.location}</p>

      {event.status === "Completed" && !event.foodLogged && (
        <div style={{ marginTop: "0.75rem" }}>
          {!showFoodForm ? (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setShowFoodForm(true)}>
              Log Food
            </Button>
          ) : (
            <div
              style={{
                border: "1px solid #FCD34D",
                padding: "1rem",
                borderRadius: "0.5rem",
                background: "#FFFBEB",
              }}
            >
              <h4 className="mb-2 font-semibold text-amber-800">
                Log Surplus Food from {event.name}
              </h4>

              <div style={{ display: "grid", gap: "0.5rem" }}>
                <Input
                  placeholder="e.g., Lunch boxes, Snacks"
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                />
                <Input
                  placeholder="e.g., 25 portions"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <textarea
                  placeholder="Brief description of the food items"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #FCD34D",
                    borderRadius: "0.25rem",
                    background: "#FEF3C7",
                  }}
                />
                <Input
                  placeholder="Safe for (hours)"
                  type="number"
                  value={safeForHours}
                  onChange={(e) => setSafeForHours(Number(e.target.value))}
                />
                <Input
                  placeholder="Event venue or storage location"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleLogFood}>
                  Log Food Items
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-gray-200 text-amber-800 hover:bg-gray-300"
                  onClick={() => setShowFoodForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {event.foodLogged && event.foodDetails && (
        <div style={{ marginTop: "0.5rem", color: "#16a34a" }}>
          🍽 Food Logged: {event.foodDetails.quantity} of{" "}
          {event.foodDetails.foodType}
          <br />
          📍 {event.foodDetails.pickupLocation} — Safe for{" "}
          {event.foodDetails.safeForHours} hours
        </div>
      )}

      <style jsx>{`
        .event-item {
          background: #FFFBEB;
          border: 1px solid #FCD34D;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(120, 53, 15, 0.1);
        }
        .status-badge {
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export function EventIntegration() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  async function fetchEvents() {
    try {
      const res = await fetch("http://localhost:5000/api/events/event_fetch");
      const data: Event[] = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/events/event_add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEventName,
          date: newEventDate,
          location: newEventLocation,
          durationHours,
          durationMinutes,
          durationSeconds
        }),
      });
      setNewEventName("");
      setNewEventDate("");
      setNewEventLocation("");
      setDurationHours(0);
      setDurationMinutes(0);
      setDurationSeconds(0);
      fetchEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Event List */}
      <div className="space-y-6">
        <Card className="shadow-md rounded-2xl border border-amber-300 bg-yellow-50">
          <CardHeader className="bg-amber-100 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-amber-800">Campus Events</CardTitle>
            <CardDescription className="text-amber-700">Track upcoming and completed events.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} onFoodLogged={fetchEvents} />
                ))}
              </div>
            ) : (
              <p className="text-amber-600 text-sm text-center py-4">No events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Form */}
      <div>
        <Card className="shadow-md rounded-2xl border border-amber-300 bg-yellow-50">
          <CardHeader className="bg-orange-100 rounded-t-2xl">
            <CardTitle className="text-lg font-bold text-orange-800">Add New Event</CardTitle>
            <CardDescription className="text-orange-700">
              Create and track a new event easily.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <Label htmlFor="eventName" className="text-amber-800 font-medium">
                  Event Name
                </Label>
                <Input
                  id="eventName"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g., Tech Conference"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="eventDate" className="text-amber-800 font-medium">
                  Date & Time
                </Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              {/* Duration */}
              <div>
                <Label className="text-amber-800 font-medium">Duration</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex flex-col w-1/3">
                    <Input
                      type="number"
                      min="0"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      placeholder="0"
                      className="text-center"
                    />
                    <span className="text-xs text-amber-700 mt-1 text-center">Hours</span>
                  </div>
                  <div className="flex flex-col w-1/3">
                    <Input
                      type="number"
                      min="0"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      placeholder="0"
                      className="text-center"
                    />
                    <span className="text-xs text-amber-700 mt-1 text-center">Minutes</span>
                  </div>
                  <div className="flex flex-col w-1/3">
                    <Input
                      type="number"
                      min="0"
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      placeholder="0"
                      className="text-center"
                    />
                    <span className="text-xs text-amber-700 mt-1 text-center">Seconds</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation" className="text-amber-800 font-medium">
                  Location
                </Label>
                <Input
                  id="eventLocation"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g., Main Auditorium"
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition"
              >
                Create Event
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
