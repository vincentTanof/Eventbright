"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axios";

export default function FinalPricePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [finalPrice, setFinalPrice] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const price = searchParams.get("finalPrice");
    const points = searchParams.get("pointsUsed");

    setFinalPrice(price ? parseInt(price) : 0);
    setPointsUsed(points ? parseInt(points) : 0);
  }, [searchParams]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      Swal.fire({
        icon: "error",
        title: "File Required",
        text: "Please upload payment proof.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("finalPrice", `${finalPrice}`);
      formData.append("pointsUsed", `${pointsUsed}`);

      await axiosInstance.post(`/transaction/submit-payment`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Payment Submitted",
        text: "Your payment proof has been sent. Wait for organizer approval.",
      }).then(() => router.push("/find-event"));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: "Unable to submit payment. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4 max-w-md border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Confirm Purchase</h1>
      <p>
        <strong>Final Price:</strong> ${finalPrice}
      </p>
      <p>
        <strong>Points Used:</strong> {pointsUsed}
      </p>
      <div className="mt-4">
        <label htmlFor="fileUpload" className="block text-sm font-bold mb-2">
          Upload Payment Proof:
        </label>
        <input
          id="fileUpload"
          type="file"
          className="border rounded w-full"
          onChange={handleFileUpload}
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={handleSubmit}
      >
        Submit Payment
      </button>
    </div>
  );
}
