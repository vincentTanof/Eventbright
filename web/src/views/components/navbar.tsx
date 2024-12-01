"use client";
import useAuthStore from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [hasEvents, setHasEvents] = useState(false);

  console.log("User from auth store:", user); // Debug log

  useEffect(() => {
    const checkUserEvents = async () => {
      if (user && user.role === "event-organizer") {
        try {
          const response = await axiosInstance.get(`/event/organizer/events`);
          if (response.data.events && response.data.events.length > 0) {
            setHasEvents(true);
          }
        } catch (error) {
          console.error("Error checking user events:", error);
        }
      }
    };

    checkUserEvents();
  }, [user]);

  const handleFindEvent = () => {
    if (!user) {
      Swal.fire({
        title: "Authentication Required",
        text: "You must log in first to view events.",
        icon: "info",
        confirmButtonText: "Login",
      }).then(() => {
        router.push("/login");
      });
    } else {
      router.push("/find-event");
    }
  };

  const handleLogout = () => {
    clearAuth();
    Swal.fire({
      icon: "success",
      title: "Logout successful",
      text: "You have been logged out successfully.",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      router.push("/");
    });
  };

  return (
    <div className="flex flex-row justify-between items-center p-4 bg-gray-300">
      <div>
        <button className="text-xl font-bold" onClick={() => router.push("/")}>
          Eventbright
        </button>
      </div>

      <div className="flex gap-4">
        <button className="hover:underline" onClick={handleFindEvent}>
          Find Event
        </button>

        {user && user.role === "user" && (
          <button className="hover:underline" onClick={() => router.push("/become-organizer")}>
            Become an Event Organizer
          </button>
        )}

        {user && user.role === "admin" && (
          <button className="hover:underline" onClick={() => router.push("/approve-requests")}>
            Approve Requests
          </button>
        )}

        {user && user.role === "event-organizer" && (
          <>
            <button className="hover:underline" onClick={() => router.push("/event/create")}>
              Create Event
            </button>

            {hasEvents && (
              <button className="hover:underline" onClick={() => router.push("/dashboard/my-events")}>
                My Event
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-4">
            <p>Welcome, {user.name}</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={() => router.push("/register")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
