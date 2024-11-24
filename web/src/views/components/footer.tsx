"use client";
import useAuthStore from "@/stores/auth-store";
import { useRouter } from "next/navigation";


export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          {/* Copyright Section */}
          <p className="text-sm text-center md:text-left">
            &copy; 2024 Your Website Name. All rights reserved.
          </p>
  
          {/* Navigation Links */}
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/about" className="hover:underline text-sm">
              About
            </a>
            <a href="/privacy" className="hover:underline text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:underline text-sm">
              Terms of Service
            </a>
            <a href="/contact" className="hover:underline text-sm">
              Contact
            </a>
          </div>
        </div>
      </footer>
    );
  }
  