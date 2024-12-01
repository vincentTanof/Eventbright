"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth-store";

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_price: number;
  spot: number;
  event_slug: string;
}

export default function FindEventPage() {
  const [events, setEvents] = useState<Event[]>([]); // Specify the type for events
  const { user } = useAuthStore(); // Access the logged-in user
  const router = useRouter();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/event/list");
        setEvents(response.data.events); // Ensure response matches the Event type
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">Find Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.event_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-bold">{event.event_name}</h2>
            <p>{event.event_description}</p>
            <p>
              <strong>Date:</strong> {new Date(event.start_date).toLocaleString()} -{" "}
              {new Date(event.end_date).toLocaleString()}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <p>
              <strong>Price:</strong> {formatCurrency(event.event_price)}
            </p>
            <p>
              <strong>Available Slots:</strong> {event.spot}
            </p>

            {/* Show appropriate buttons */}
            {user && event.spot > 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => router.push(`/event/${event.event_id}`)} // Redirect to event detail page
              >
                Buy Ticket
              </button>
            )}
            {event.spot === 0 && (
              <p className="text-red-500 font-bold">Sold Out</p>
            )}
            {!user && (
              <button
                className="bg-gray-400 text-white font-bold py-2 px-4 rounded"
                onClick={() => router.push("/login")} // Redirect to login page if not logged in
              >
                Login to Buy
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
