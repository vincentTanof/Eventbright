"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import useAuthStore from "@/stores/auth-store";
import Swal from "sweetalert2";

interface Event {
  event_id: number;
  event_name: string;
  event_description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_price: number;
  spot: number;
}

interface Voucher {
  id: number;
  voucher_code: string;
  amount: number; // Treated as a percentage (e.g., 10 for 10%)
  start_date: string;
  end_date: string;
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user, onAuthSuccess } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axiosInstance.get(`/event/${eventId}`);
        setEvent(response.data.event);
        setFinalPrice(response.data.event.event_price); // Initialize final price
      } catch (error) {
        console.error("Error fetching event details:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to fetch event details. Please try again later.",
        }).then(() => router.push("/find-event"));
      }
    };

    const fetchVouchers = async () => {
      if (!user) return;
      try {
        const response = await axiosInstance.get(`/voucher/user/${user.id}`);
        setVouchers(response.data.vouchers || []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };

    fetchEventDetails();
    fetchVouchers();
  }, [eventId, router, user]);

  const calculateFinalPrice = (points: number = 0, voucherPercentage: number = 0) => {
    const basePrice = event?.event_price || 0;
    const percentageDiscount = (voucherPercentage / 100) * basePrice; // Calculate percentage discount
    return Math.max(basePrice - points - percentageDiscount, 0); // Ensure no negative prices
  };

  const handleVoucherSelect = (voucherId: number) => {
    const voucher = vouchers.find((v) => v.id === voucherId) || null;
    setSelectedVoucher(voucher);
    const voucherPercentage = voucher ? voucher.amount : 0;
    setFinalPrice(calculateFinalPrice(pointsUsed, voucherPercentage));
  };

  const handleBuyTicket = async (usePoints: boolean, pointsUsed: number = 0) => {
    if (!user) {
      Swal.fire({
        title: "Authentication Required",
        text: "You must log in to buy tickets.",
        icon: "info",
        confirmButtonText: "Login",
      }).then(() => router.push("/login"));
      return;
    }

    const voucherPercentage = selectedVoucher ? selectedVoucher.amount : 0;
    const calculatedFinalPrice = calculateFinalPrice(pointsUsed, voucherPercentage);

    try {
      const response = await axiosInstance.post(`/transaction/create`, {
        eventId: event?.event_id,
        pointsUsed,
        finalPrice: calculatedFinalPrice,
        voucherId: selectedVoucher?.id || null,
      });

      // Update user points locally
      if (usePoints && pointsUsed > 0) {
        onAuthSuccess({ ...user, total_point: user.total_point - pointsUsed });
      }

      Swal.fire({
        icon: "success",
        title: "Purchase Successful",
        text: `You have successfully purchased a ticket. Final Price: ${formatCurrency(calculatedFinalPrice)}`,
      }).then(() => router.push("/find-event"));
    } catch (error) {
      console.error("Error during transaction:", error);
      Swal.fire({
        icon: "error",
        title: "Purchase Failed",
        text: "An error occurred during the transaction. Please try again.",
      });
    }
  };

  const handleBuyWithPoints = () => {
    if (!user || user.total_point === 0) return;

    Swal.fire({
      title: "Use Your Points",
      input: "number",
      inputAttributes: {
        min: "0",
        max: `${user.total_point}`,
        step: "1",
      },
      inputValue: Math.min(user.total_point, event!.event_price),
      text: `You have ${user.total_point} points. Enter the amount of points you want to use.`,
      showCancelButton: true,
      confirmButtonText: "Use Points",
    }).then((result) => {
      if (result.isConfirmed) {
        const pointsToUse = parseInt(result.value || "0", 10);
        if (isNaN(pointsToUse) || pointsToUse < 0 || pointsToUse > user.total_point) {
          Swal.fire({
            icon: "error",
            title: "Invalid Input",
            text: "Please enter a valid number of points.",
          });
          return;
        }

        setPointsUsed(pointsToUse);
        const voucherPercentage = selectedVoucher ? selectedVoucher.amount : 0;
        setFinalPrice(calculateFinalPrice(pointsToUse, voucherPercentage));
        handleBuyTicket(true, pointsToUse);
      }
    });
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">{event.event_name}</h1>
        <p className="text-gray-700 mb-2">{event.event_description}</p>
        <p className="mb-2">
          <strong>Date:</strong> {new Date(event.start_date).toLocaleString()} -{" "}
          {new Date(event.end_date).toLocaleString()}
        </p>
        <p className="mb-2">
          <strong>Location:</strong> {event.location}
        </p>
        <p className="mb-2">
          <strong>Price:</strong> {formatCurrency(event.event_price)}
        </p>
        <p className="mb-4">
          <strong>Available Slots:</strong> {event.spot}
        </p>

        {vouchers.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Select Voucher:
            </label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={selectedVoucher?.id || ""}
              onChange={(e) => handleVoucherSelect(Number(e.target.value))}
            >
              <option value="">None</option>
              {vouchers.map((voucher) => (
                <option key={voucher.id} value={voucher.id}>
                  {voucher.voucher_code} - Discount: {voucher.amount}%
                </option>
              ))}
            </select>
          </div>
        )}

        <p className="mb-4">
          <strong>Final Price:</strong> {formatCurrency(finalPrice)}
        </p>

        {event.spot > 0 ? (
          <div className="flex flex-col gap-4">
            {user && user.total_point > 0 && (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleBuyWithPoints}
              >
                Buy with Points
              </button>
            )}
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleBuyTicket(false)}
            >
              Buy without Points
            </button>
          </div>
        ) : (
          <p className="text-red-500 font-bold mt-4 text-center">Sold Out</p>
        )}
      </div>
    </div>
  );
}
