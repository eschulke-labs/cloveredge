import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GUEST_COOKIE = "cw_guest_id";

// Assigns an anonymous, non-identifying guest ID so the homepage can
// lightly personalize rail order for visitors without an account. No PII —
// just a random ID scoped to this browser.
export function proxy(request: NextRequest) {
  if (request.cookies.has(GUEST_COOKIE)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set(GUEST_COOKIE, crypto.randomUUID(), {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
