import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  // Define restricted routes
  const protectedRoutes = ["/create-event", "/dashboard", "/admin"];

  // Check if the requested route is protected
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token is found
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: ["/create-event", "/dashboard", "/admin"], // Add all protected paths here
};
