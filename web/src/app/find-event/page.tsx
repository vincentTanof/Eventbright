"use client";

import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_price: number;
  event_slug: string;
  isOwner: boolean; // Indicates if the logged-in user created this event
}

export default function FindEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data } = await axiosInstance.get("/event/find");
        setEvents(data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }
    fetchEvents();
  }, []);

  const handleEdit = (eventId: number) => {
    router.push(`/event/edit/${eventId}`);
  };

  const handleRemove = async (eventId: number) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirm.isConfirmed) {
        await axiosInstance.delete(`/event/${eventId}`);
        Swal.fire("Deleted!", "Your event has been deleted.", "success");
        setEvents(events.filter((event) => event.event_id !== eventId));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Swal.fire("Error", "Failed to delete the event.", "error");
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Find Events</h1>
      {events.map((event) => (
        <div key={event.event_id} className="border p-4 rounded mb-4">
          <h2 className="text-xl font-bold">{event.event_name}</h2>
          <p>{event.event_description}</p>
          <p>
            {new Date(event.start_date).toLocaleString()} -{" "}
            {new Date(event.end_date).toLocaleString()}
          </p>
          <p>Location: {event.location}</p>
          <p>Price: ${event.event_price}</p>
          {event.isOwner && (
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => handleEdit(event.event_id)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleRemove(event.event_id)}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
