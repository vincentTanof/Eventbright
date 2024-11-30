"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2"; // Import SweetAlert2

type OrganizerRequest = {
  id: number;
  name: string;
  reason: string;
};

export default function ApproveRequests() {
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/organizer/requests");
      setRequests(response.data.requests);
    } catch (error: any) {
      console.error("Error fetching organizer requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId: number) => {
    try {
      await axiosInstance.put("/api/admin/organizer/request/approve", { requestId });
      setRequests(requests.filter((req) => req.id !== requestId));
      Swal.fire("Success", "Request approved successfully", "success");
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.error || "Something went wrong", "error");
    }
  };

  const handleDecline = async (requestId: number) => {
    try {
      await axiosInstance.put("/api/admin/organizer/request/decline", { requestId });
      setRequests(requests.filter((req) => req.id !== requestId));
      Swal.fire("Success", "Request declined successfully", "success");
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.error || "Something went wrong", "error");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold">Organizer Requests</h1>
      <table className="min-w-full table-auto border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Reason</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="px-4 py-2 border">{req.name}</td>
              <td className="px-4 py-2 border">{req.reason}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleApprove(req.id)}
                  className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
