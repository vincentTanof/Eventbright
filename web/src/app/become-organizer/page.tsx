"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function BecomeOrganizer() {
    const router = useRouter();
    const [formState, setFormState] = useState({ name: "", reason: "" });
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        // Check if the user already has a pending request
        const checkPendingRequest = async () => {
            try {
                const response = await axiosInstance.get("/api/admin/organizer/requests");
                const pendingRequest = response.data.requests.find(
                    (request: any) => request.status === "pending"
                );

                if (pendingRequest) {
                    router.push("/become-organizer/request-pending");
                }
            } catch (error: any) {
                console.error("Error checking pending requests:", error.response?.data || error.message);
            }
        };

        checkPendingRequest();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("/api/admin/organizer/request", formState);
            console.log("API Response:", response.data);
            if (response.status === 201) {
                setIsSubmitted(true);
                router.push("/become-organizer/request-pending");
            } else {
                console.error("API Error:", response.data);
            }
        } catch (error: any) {
            console.error("Error submitting the request:", error.response?.data || error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border border-gray-300">
                {!isSubmitted ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4 text-center">Become an Event Organizer</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Reason</label>
                                <textarea
                                    name="reason"
                                    value={formState.reason}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Submit
                            </button>
                        </form>
                    </>
                ) : (
                    <p>Your request has been submitted.</p>
                )}
            </div>
        </div>
    );
}
