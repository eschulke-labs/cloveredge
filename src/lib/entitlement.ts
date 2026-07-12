// Client-safe: no server-only imports (cookies/auth). Pulled out of
// homepage.ts because a "use client" component importing anything from a
// module that also touches next/headers breaks the build, even if the
// specific export it needs doesn't use those APIs itself.
export type ViewerTier = "ANON" | "FREE" | "PAID";

export function isEntitled(tier: "FREE" | "PAID", viewerTier: ViewerTier) {
  return tier === "FREE" || viewerTier === "PAID";
}
