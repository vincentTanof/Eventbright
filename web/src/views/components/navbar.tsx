"use client";
import useAuthStore from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

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
        onClick={() => router.push("/find-event")}
      >
        Find Event
      </button>
      {user && (
        <button
          className="hover:underline"
          onClick={() => router.push("/create-event")}
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
                clearAuth();
                router.push("/");
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
