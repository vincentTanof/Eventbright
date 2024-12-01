"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Event {
  event_id: number;
  event_name: string;
  start_date: string;
  end_date: string;
  location: string;
  spot: number;
}

interface Attendee {
  id: number;
  fullname: string;
  email: string;
}

interface Transaction {
  id: number;
  total_amount: number;
  point_used: number;
  status: string;
  payment_method: string;
  voucher_code?: string;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Record<number, Attendee[]>>({});
  const [transactions, setTransactions] = useState<Record<number, Transaction[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/event/organizer/events");
        setEvents(data.events);

        // Fetch attendees and transactions for each event
        for (const event of data.events) {
          const attendeesResponse = await axios.get(`/event/${event.event_id}/attendees`);
          const transactionsResponse = await axios.get(`/event/${event.event_id}/transactions`);

          setAttendees((prev) => ({
            ...prev,
            [event.event_id]: attendeesResponse.data.attendees,
          }));

          setTransactions((prev) => ({
            ...prev,
            [event.event_id]: transactionsResponse.data.transactions,
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
          <h3 className="mt-4 font-bold">Attendees:</h3>
          {attendees[event.event_id]?.length > 0 ? (
            <ul className="list-disc ml-6">
              {attendees[event.event_id].map((attendee) => (
                <li key={attendee.id}>
                  {attendee.fullname} ({attendee.email})
                </li>
              ))}
            </ul>
          ) : (
            <p>No attendees yet.</p>
          )}
          <h3 className="mt-4 font-bold">Transactions:</h3>
          {transactions[event.event_id]?.length > 0 ? (
            <ul className="list-disc ml-6">
              {transactions[event.event_id].map((transaction) => (
                <li key={transaction.id}>
                  Amount: {transaction.total_amount}, Points Used: {transaction.point_used}, Status:{" "}
                  {transaction.status}, Payment Method: {transaction.payment_method}, Voucher:{" "}
                  {transaction.voucher_code || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions yet.</p>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
            onClick={() => window.location.href = `/dashboard/my-event/${event.event_id}/edit`}
          >
            Edit Event
          </button>
        </div>
      ))}
    </div>
  );
}
