"use client";
import { Formik, Form, Field, FormikProps } from "formik";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axios";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import IRegister from "../types";

const Schema = Yup.object().shape({
  fullname: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  phone: Yup.string().required("Phone number is required"),
  referral_code: Yup.string().optional(),
});

export default function RegisterForm() {
  const router = useRouter();

  const register = async (params: IRegister) => {
    try {
      console.log("Register function called with params:", params);
      const { data } = await axiosInstance.post("http://localhost:8080/auth/register", params);
      Swal.fire({
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => router.push("/"));
    } catch (err) {
      console.error("Error occurred in register function:", err);
    }
  };

  return (
    <div>
      <Formik
        initialValues={{
          fullname: "",
          email: "",
          password: "",
          phone: "",
          referral_code: "",
        }}
        validationSchema={Schema}
        onSubmit={(values) => {
          console.log("Form submitted with values:", values);
          register(values);
        }}
      >
        {(props: FormikProps<any>) => {
          const { errors, touched } = props;

          console.log("Validation errors:", errors); // Debug validation errors
          console.log("Touched fields:", touched);   // Debug touched fields

          return (
            <Form>
              {/* Full Name */}
              <div>
                <label htmlFor="fullname" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full Name:</label>
                <Field
                  type="text"
                  name="fullname"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {typeof errors.fullname === "string" && (
                  <div className="text-red-600">{errors.fullname}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email:
                </label>
                <Field
                  type="email"
                  name="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {touched.email && typeof errors.email === "string" && (
                  <div className="text-red-600">{errors.email}</div>
                )}
            </div>


              {/* Password */}
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password:
                </label>
                <Field
                  type="password"
                  name="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {touched.password && typeof errors.password === "string" && (
                  <div className="text-red-600">{errors.password}</div>
                )}
            </div>


              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Phone Number:
                </label>
                <Field
                  type="text"
                  name="phone"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                {touched.phone && typeof errors.phone === "string" && (
                  <div className="text-red-600">{errors.phone}</div>
                )}
            </div>


              {/* Referral Code */}
              <div>
                <label htmlFor="referral_code">Referral Code (Optional):</label>
                <Field
                  type="text"
                  name="referral_code"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Register
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
