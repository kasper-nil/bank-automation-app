import { NextRequest, NextResponse } from "next/server";
import { getSparebankToken } from "@/lib/api/sparebank/proxy";

export function proxy(request: NextRequest) {
  const token = getSparebankToken(request);

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
