import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Protect dashboard routes
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session, redirect to home
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
