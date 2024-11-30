"use client";
import useAuthStore from "@/stores/auth-store"; // Import the auth store
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore(); // Access user state and clearAuth action
  const router = useRouter();

  console.log("User from auth store:", user); // Debug log

  const handleFindEvent = () => {
    if (!user) {
      // Show a SweetAlert message and redirect to login
      Swal.fire({
        title: "Authentication Required",
        text: "You must log in first to view events.",
        icon: "info",
        confirmButtonText: "Login",
      }).then(() => {
        router.push("/login"); // Redirect to login page
      });
    } else {
      router.push("/find-event"); // Redirect to Find Event page if authenticated
    }
  };

  return (
    <div className="flex flex-row justify-between items-center p-4 bg-gray-300">
      {/* Logo */}
      <div>
        <button
          className="text-xl font-bold"
          onClick={() => router.push("/")}
        >
          Eventbright
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex gap-4">
        <button
          className="hover:underline"
          onClick={handleFindEvent} // Use the handleFindEvent function
        >
          Find Event
        </button>

        {/* Render "Become an Event Organizer" for non-organizer users */}
        {user && user.role === "user" && (
          <button
            className="hover:underline"
            onClick={() => router.push("/become-organizer")}
          >
            Become an Event Organizer
          </button>
        )}

        {/* Render "Approve Requests" for admin users */}
        {user && user.role === "admin" && (
          <button
            className="hover:underline"
            onClick={() => router.push("/approve-requests")}
          >
            Approve Requests
          </button>
        )}

        {/* Render "Create Event" for event-organizers */}
        {user && user.role === "event-organizer" && (
          <button
            className="hover:underline"
            onClick={() => router.push("/event/create")} // Corrected route for creating an event
          >
            Create Event
          </button>
        )}
      </div>

      {/* Authentication Buttons */}
      <div className="flex gap-2">
        {user ? (
          <div className="flex items-center gap-4">
            <p>Welcome, {user.name}</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="button"
              onClick={() => {
                clearAuth(); // Clear user state on logout
                router.push("/"); // Redirect to home
              }}
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
