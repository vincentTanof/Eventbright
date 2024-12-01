"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [eventDetails, setEventDetails] = useState({
    event_name: "",
    start_date: "",
    end_date: "",
    spot: 0,
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axiosInstance.get(`/event/${eventId}`);
        setEventDetails(response.data.event || {});
      } catch (error) {
        console.error("Error fetching event details:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to fetch event details.",
        });
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/event/${eventId}`, eventDetails);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Event updated successfully.",
      }).then(() => router.push("/dashboard/my-events"));
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to update event.",
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Event Name</label>
          <input
            type="text"
            value={eventDetails.event_name}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, event_name: e.target.value })
            }
            className="block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={eventDetails.start_date}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, start_date: e.target.value })
            }
            className="block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={eventDetails.end_date}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, end_date: e.target.value })
            }
            className="block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Available Spots</label>
          <input
            type="number"
            value={eventDetails.spot}
            onChange={(e) =>
              setEventDetails({ ...eventDetails, spot: Number(e.target.value) })
            }
            className="block w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
