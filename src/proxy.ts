import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  STUDIO_PATH_PREFIX,
  isPublicProductionHost,
  isStudioHost,
  isStudioPath,
} from "@/lib/studio-routing";

const GUEST_COOKIE = "cw_guest_id";

// Paths that are shared by both front doors and never rewritten: auth and
// other API routes, and files in `public/` (anything with an extension).
function isSharedPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(pathname);
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname, search } = request.nextUrl;

  // ── Studio front door: studio.cloveredge.net ──────────────────────────
  if (isStudioHost(host)) {
    if (isSharedPath(pathname)) return NextResponse.next();

    // Keep Studio URLs clean: /studio/homepage → /homepage.
    if (isStudioPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(STUDIO_PATH_PREFIX.length) || "/";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? STUDIO_PATH_PREFIX : `${STUDIO_PATH_PREFIX}${pathname}`;
    url.search = search;
    return NextResponse.rewrite(url);
  }

  // ── Public front door ─────────────────────────────────────────────────
  // Studio pages don't exist on the public domains.
  if (isStudioPath(pathname) && isPublicProductionHost(host)) {
    const url = request.nextUrl.clone();
    url.pathname = "/_studio-not-found";
    return NextResponse.rewrite(url, { status: 404 });
  }

  // Assigns an anonymous, non-identifying guest ID so the homepage can
  // lightly personalize rail order for visitors without an account. No PII —
  // just a random ID scoped to this browser.
  if (request.cookies.has(GUEST_COOKIE) || isStudioPath(pathname)) {
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
