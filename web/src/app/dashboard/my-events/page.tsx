"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";

interface Event {
  event_id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  location: string;
  spot: number;
}

interface Transaction {
  id: number;
  total_amount: number;
  point_used: number;
  status: string;
  payment_method: string | { id: number; name: string };
  voucher?: {
    voucher_code: string;
    amount: number;
    type: string;
    status: boolean;
  };
  user: {
    fullname: string;
    email: string;
  };
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Record<number, string[]>>({});
  const [transactions, setTransactions] = useState<Record<number, Transaction[]>>({});
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axiosInstance.get("/event/organizer/events");
        setEvents(data.events);

        for (const event of data.events) {
          const attendeesResponse = await axiosInstance.get(
            `/event/${event.event_id}/attendees`
          );
          setAttendees((prev) => ({
            ...prev,
            [event.event_id]: attendeesResponse.data.attendees || [],
          }));

          const transactionsResponse = await axiosInstance.get(
            `/event/${event.event_id}/transactions`
          );
          setTransactions((prev) => ({
            ...prev,
            [event.event_id]: transactionsResponse.data.transactions || [],
          }));
        }
      } catch (error) {
        Swal.fire("Error", "Failed to load events", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">My Events</h1>
      {events.map((event) => (
        <div key={event.event_id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="text-xl font-bold">{event.event_name}</h2>
          <p>
            <strong>Date:</strong> {event.start_date} - {event.end_date}
          </p>
          <p>
            <strong>Location:</strong> {event.location}
          </p>
          <p>
            <strong>Available Slots:</strong> {event.spot}
          </p>

          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700 mr-2"
            onClick={() => openModal(event)}
          >
            Organizer Details
          </button>

          <button
            className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-700"
            onClick={() => (window.location.href = `/event/${event.event_id}/edit`)}
          >
            Edit Event
          </button>
        </div>
      ))}

      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">
              Organizer Details for {selectedEvent.event_name}
            </h2>

            <h3 className="mt-4 font-bold">Attendees:</h3>
            {attendees[selectedEvent.event_id]?.length > 0 ? (
              <ul className="list-disc pl-5">
                {attendees[selectedEvent.event_id].map((attendee, index) => (
                  <li key={index}>{attendee}</li>
                ))}
              </ul>
            ) : (
              <p>No attendees yet.</p>
            )}

            <h3 className="mt-4 font-bold">Transactions:</h3>
            {transactions[selectedEvent.event_id]?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions[selectedEvent.event_id].map((transaction, index) => {
                  let paymentMethodName =
                    typeof transaction.payment_method === "object"
                      ? transaction.payment_method.name
                      : transaction.payment_method;

                  let cashAmount = transaction.total_amount;
                  let paymentDetails = `Cash [ IDR ${cashAmount} ]`;
                  if (transaction.point_used > 0) {
                    paymentDetails += ` + Points [ ${transaction.point_used} ]`;
                  }
                  if (transaction.voucher && !transaction.voucher.status) {
                    let discountAmount = 0;
                    if (transaction.voucher.type === "percentage") {
                      discountAmount = (transaction.voucher.amount / 100) * cashAmount;
                    } else if (transaction.voucher.type === "fixed") {
                      discountAmount = transaction.voucher.amount;
                    }
                    paymentDetails += ` + Voucher (${transaction.voucher.voucher_code || "N/A"}) [ IDR ${Math.round(
                      discountAmount
                    )} Discount ]`;
                  }

                  return (
                    <div
                      key={transaction.id}
                      className="border border-gray-300 rounded p-4 shadow-sm bg-white"
                    >
                      <h4 className="text-lg font-bold mb-2">Transaction #{index + 1}</h4>
                      <p>
                        <strong>User Full Name:</strong> {transaction.user?.fullname || "N/A"}
                      </p>
                      <p>
                        <strong>User Email:</strong> {transaction.user?.email || "N/A"}
                      </p>
                      <p>
                        <strong>Payment Method:</strong> {paymentMethodName || "N/A"}
                      </p>
                      <p>
                        <strong>Amount Used:</strong> {paymentDetails}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No transactions yet.</p>
            )}

            <button
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-700"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

 