import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteCookie } from "cookies-next";
import Swal from "sweetalert2";

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  total_point: number; // Add this property
}

interface IAuthStore {
  user: IUser | null;
  onAuthSuccess: (user: IUser | null) => void;
  clearAuth: () => void;
}

const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,
      onAuthSuccess: (payload) => {
        console.log("Auth success payload:", payload); // Debug log
        set(() => ({ user: payload })); // Save the user data
      },
      clearAuth: () => {
        console.log("Clearing auth"); // Debug log
        set(() => ({ user: null }));
        deleteCookie("access_token"); // Delete token on logout
        Swal.fire({
          icon: "success",
          title: "Logout successful",
          text: "You have been logged out successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      },
    }),
    {
      name: "auth-store", // LocalStorage key
    }
  )
);

export default useAuthStore;
