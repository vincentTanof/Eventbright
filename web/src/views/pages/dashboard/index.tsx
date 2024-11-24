"use client";
import { useState, useEffect } from "react";
import ErrorHandler from "@/utils/error-handler";
import axiosInstance from "@/lib/axios";

import useAuthStore from "@/stores/auth-store";
// import { IUser } from "./types";

export default function DashboardView() {
  const { user } = useAuthStore();
  // const [user, setUser] = useState<IUser | null>(null);

  // const getUser = async () => {
  //   try {
  //     const { data } = await axiosInstance.get("/auth/me");
  //     setUser(data.data);
  //   } catch (err) {
  //     ErrorHandler(err);
  //   }
  // };
  // useEffect(() => {
  //   getUser();
  // }, []);
  return (
    <div className="mx-auto max-w-lg mt-20 flex flex-col text-center justify-center">
      <p>Admin Page</p>
      <div>
        <table className="border border-black w-full">
          <thead>
            <tr className="border border-black">
              <th className="p-2">Email</th>
              <th className="p-2">Name</th>
              <th className="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{user?.email}</td>
              <td className="p-2">{user?.name}</td>
              <td className="p-2">{user?.role}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
