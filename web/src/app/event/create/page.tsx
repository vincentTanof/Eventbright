"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "@/lib/axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const EventValidationSchema = Yup.object().shape({
  event_name: Yup.string().required("Event name is required"),
  event_description: Yup.string().required("Event description is required"),
  start_date: Yup.date().required("Start date is required"),
  end_date: Yup.date()
    .required("End date is required")
    .test("is-greater", "End date must not be before start date", function (value) {
      const { start_date } = this.parent;
      return !start_date || !value || new Date(value) > new Date(start_date);
    }),
  location: Yup.string().required("Location is required"),
  ticketPrice: Yup.number()
    .typeError("Ticket price must be a number")
    .required("Ticket price is required"),
  spot: Yup.number()
    .typeError("Available slots must be a number")
    .min(1, "Available slots must be at least 1")
    .required("Available slots are required"),
  event_slug: Yup.string(), // Optional, no validation rule
});

export default function CreateEvent() {
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        event_name: values.event_name,
        description: values.event_description, // Match backend field
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
        location: values.location,
        ticketPrice: parseFloat(values.ticketPrice), // Ensure number type
        spot: parseInt(values.spot, 10), // Ensure integer type
        event_slug: values.event_slug || undefined, // Optional field
      };

      console.log("Formatted Payload:", formattedValues); // Debugging

      const response = await axiosInstance.post("/event/create", formattedValues, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Ensure the token is sent
        },
      });

      Swal.fire({
        icon: "success",
        title: response.data.message,
        showConfirmButton: false,
        timer: 2000,
      });

      router.push("/find-event"); // Redirect to event list page
    } catch (error: any) {
      console.error("Error creating event:", error.response?.data || error);
      Swal.fire({
        icon: "error",
        title: "Event creation failed",
        text: error.response?.data?.error || "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Create an Event</h1>
      <Formik
        initialValues={{
          event_name: "",
          event_description: "",
          start_date: "",
          end_date: "",
          location: "",
          ticketPrice: "",
          spot: "", // Added spot
          event_slug: "",
        }}
        validationSchema={EventValidationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <div className="mb-4">
              <label className="block text-sm font-medium">Event Name</label>
              <Field
                name="event_name"
                type="text"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="event_name" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Event Description</label>
              <Field
                name="event_description"
                as="textarea"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage
                name="event_description"
                component="div"
                className="text-red-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Start Date</label>
              <Field
                name="start_date"
                type="datetime-local"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="start_date" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">End Date</label>
              <Field
                name="end_date"
                type="datetime-local"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="end_date" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Location</label>
              <Field
                name="location"
                type="text"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="location" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Ticket Price</label>
              <Field
                name="ticketPrice"
                type="number"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="ticketPrice" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Available Slots (Spot)</label>
              <Field
                name="spot"
                type="number"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="spot" component="div" className="text-red-500" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Event Slug</label>
              <Field
                name="event_slug"
                type="text"
                className="border rounded px-4 py-2 w-full"
              />
              <ErrorMessage name="event_slug" component="div" className="text-red-500" />
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Event
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
