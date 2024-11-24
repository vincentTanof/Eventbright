"use client"; // Add this at the top to make the component a Client Component

import axiosInstance from "@/lib/axios";
import ErrorHandler from "@/utils/error-handler";
import Swal from "sweetalert2";

export default function Page({ params }: { params: { token: string } }) {
  const verifyUser = async () => {
    try {
      const { token } = params; // Extract token from params
      console.log(token);
      const { data } = await axiosInstance.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`, // Use token in the header
        },
      });

      Swal.fire({
        icon: "success",
        title: data.message,
        showConfirmationButton: false,
        timer: 2000,
      });
    } catch (err) {
      ErrorHandler(err);
    }
  };

  return (
    <div>
      <button onClick={verifyUser}>Verify</button>
    </div>
  );
}
