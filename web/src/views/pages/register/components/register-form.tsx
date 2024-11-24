"use client";
import { Formik, Form, FormikProps } from "formik";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axios";
import IRegister from "../types";
import Schema from "./schema";
import ErrorHandler from "@/utils/error-handler";

import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();

  const register = async (params: IRegister) => {
    try {
      console.log("Register function called with params:", params); // Debugging log
      const { data } = await axiosInstance.post("http://localhost:8080/auth/register", params);
      Swal.fire({
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => router.push("/"));
    } catch (err) {
      console.error("Error occurred in register function:", err); // Added detailed logging
      ErrorHandler(err);
    }
  };
  
  return (
    <div>
      <Formik
        initialValues={{
          fullname: "", // Ensure fullname exists here
          email: "",
          password: "",
          phone: "",
        }}
        validationSchema={Schema}
        onSubmit={(values) => {
          register(values);
        }}
      >
        {(props: FormikProps<IRegister>) => {
          const { values, errors, touched, handleChange } = props;
          return (
            <Form>
              <div>
                <label
                  htmlFor="fullname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name :
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="fullname"
                  onChange={handleChange}
                  value={values.fullname}
                />
                {touched.fullname && errors.fullname ? (
                  <div className="text-red-600">{errors.fullname}</div>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email :
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                />
                {touched.email && errors.email ? (
                  <div className="text-red-600">{errors.email}</div>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password :
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={values.password}
                />
                {touched.password && errors.password ? (
                  <div className="text-red-600">{errors.password}</div>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone Number :
                </label>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  type="text"
                  name="phone"
                  onChange={handleChange}
                  value={values.phone}
                />
                {touched.phone && errors.phone ? (
                  <div className="text-red-600">{errors.phone}</div>
                ) : null}
              </div>
              <button
                className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded "
                type="submit"
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
