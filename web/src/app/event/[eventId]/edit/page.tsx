"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";

export default function EditEventPage() {
  const router = useRouter();
  const { eventId } = useParams() as { eventId: string }; // Access dynamic route parameter
  const [event, setEvent] = useState({
    event_name: "",
    start_date: "",
    end_date: "",
    location: "",
    spot: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch event details on mount
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data } = await axiosInstance.get(`/event/${eventId}`);
        setEvent({
          event_name: data.event.event_name,
          start_date: data.event.start_date ? data.event.start_date.substring(0, 16) : "",
          end_date: data.event.end_date ? data.event.end_date.substring(0, 16) : "",
          location: data.event.location || "",
          spot: data.event.spot || 0,
        });
      } catch (error) {
        Swal.fire("Error", "Failed to load event details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filteredEvent = {
        event_name: event.event_name || undefined,
        start_date: event.start_date || undefined,
        end_date: event.end_date || undefined,
        location: event.location || undefined,
        spot: event.spot || undefined,
      };
      await axiosInstance.put(`/event/${eventId}`, filteredEvent);
      Swal.fire("Success", "Event updated successfully", "success");
      router.push("/dashboard/my-events"); // Redirect back to events list
    } catch (error) {
      Swal.fire("Error", "Failed to update event", "error");
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: name === "spot" ? parseInt(value, 10) : value, // Parse spot as an integer
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-bold mb-2">Event Name</label>
          <input
            type="text"
            name="event_name"
            value={event.event_name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Start Date</label>
          <input
            type="datetime-local"
            name="start_date"
            value={event.start_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">End Date</label>
          <input
            type="datetime-local"
            name="end_date"
            value={event.end_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Available Slots</label>
          <input
            type="number"
            name="spot"
            value={event.spot}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
