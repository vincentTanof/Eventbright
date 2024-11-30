"use client";
import { Formik, Form, FormikProps } from "formik";
import Swal from "sweetalert2";
import axiosInstance from "@/lib/axios";
import ILogin from "../types";
import Schema from "./schema";
import ErrorHandler from "@/utils/error-handler";
import { useRouter } from "next/navigation";

// Import setCookie and deleteCookie
import { setCookie } from "cookies-next";
import useAuthStore, { IUser } from "@/stores/auth-store";

export default function LoginForm() {
  const { onAuthSuccess } = useAuthStore();
  const router = useRouter();

  const login = async (params: ILogin) => {
    try {
      const { data } = await axiosInstance.post("http://localhost:8080/auth/login", params);

      // Set token in cookies
      setCookie("access_token", data.token, {
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      // Update user state
      const user: IUser = {
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      onAuthSuccess(user); // Update auth-store state with user

      Swal.fire({
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => router.push("/"));
    } catch (err) {
      console.error("Login error:", err);
      ErrorHandler(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border border-gray-300">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={Schema}
          onSubmit={(values) => {
            login(values);
          }}
        >
          {(props: FormikProps<ILogin>) => {
            const { values, errors, touched, handleChange } = props;
            return (
              <Form>
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email:
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
                <div className="mt-4">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password:
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
                <button
                  className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                  type="submit"
                >
                  Login
                </button>
              </Form>
            );
          }}
        </Formik>
        {/* Divider */}
        <div className="my-4 border-t border-gray-300"></div>
        <p className="text-center text-sm text-gray-600">
          Don’t have an account yet?
        </p>
        <button
          className="mt-3 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={() => router.push("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
