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

  let statusColor = "#6b7280";
  if (event.status === "Upcoming") statusColor = "#3b82f6";
  if (event.status === "Ongoing") statusColor = "#22c55e";
  if (event.status === "Completed") statusColor = "#ef4444";

  const hrs = event.durationHours || 0;
  const mins = event.durationMinutes || 0;
  const secs = event.durationSeconds || 0;

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
        pickupLocation
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.msg || "Failed to log food");  // show backend error
      return;
    }

    console.log("Food logged:", data);

    // reset form only on success
    setShowFoodForm(false);
    setFoodType("");
    setQuantity("");
    setDescription("");
    setSafeForHours(0);
    setPickupLocation("");

    onFoodLogged(); // refresh events
  } catch (err) {
    console.error("Error logging food:", err);
    alert("Something went wrong while logging food");
  }
};


  return (
    <div className="event-item">
      <div className="event-header">
        <h4 className="event-title">{event.name}</h4>
        <span className="status-badge" style={{ backgroundColor: statusColor }}>
          {event.status}
        </span>
      </div>
      <p className="event-date">
        {new Date(event.date).toLocaleString()} — {hrs}h {mins}m {secs}s
      </p>
      <p className="event-location">{event.location}</p>

      {event.status === "Completed" && !event.foodLogged && (
        <div style={{ marginTop: "0.75rem" }}>
          {!showFoodForm ? (
            <Button size="sm" onClick={() => setShowFoodForm(true)}>
              Log Food
            </Button>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: "0.5rem" }}>
              <h4 className="mb-2 font-semibold">Log Surplus Food from {event.name}</h4>

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
                  style={{ padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.25rem" }}
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

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <Button size="sm" onClick={handleLogFood}>
                  Log Food Items
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowFoodForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {event.foodLogged && event.foodDetails && (
        <div style={{ marginTop: "0.5rem", color: "#16a34a" }}>
          🍽 Food Logged: {event.foodDetails.quantity} of {event.foodDetails.foodType}  
          <br />
          📍 {event.foodDetails.pickupLocation} — Safe for {event.foodDetails.safeForHours} hours
        </div>
      )}

      <style jsx>{`
        .event-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .event-header {
          display: flex;
          justify-content: space-between;
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
    <div className="event-grid">
      <div className="event-list">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Campus Events</CardTitle>
            <CardDescription>A list of upcoming events on campus.</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              events.map((event) => (
                <EventCard key={event._id} event={event} onFoodLogged={fetchEvents} />
              ))
            ) : (
              <p className="empty-text">No upcoming events.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="event-form">
        <Card>
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
            <CardDescription>Create a new event to track.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g., Tech Conference"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eventDate">Date & Time</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Duration</Label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Input
                    type="number"
                    min="0"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    placeholder="Hours"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    placeholder="Minutes"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    placeholder="Seconds"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eventLocation">Location</Label>
                <Input
                  id="eventLocation"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g., Main Auditorium"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Event
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
