import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteCookie } from "cookies-next";

export interface IUser {
  name: string;
  email: string;
  role: string; // Ensure role is correctly set
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
      },
    }),
    {
      name: "auth-store", // LocalStorage key
    }
  )
);

export default useAuthStore;
