// Host rules for the two front doors (public site + Studio). Pure functions
// with no server-only imports, so both `src/proxy.ts` and server components
// can use them.
//
// - studio.cloveredge.net (or any `studio.*` host, e.g. studio.localhost):
//   the Studio, at clean URLs (`/homepage`), which the proxy rewrites to the
//   `src/app/studio/*` routes.
// - Public production hosts: `/studio/*` is blocked (404).
// - Everywhere else (localhost, Codespaces, Vercel previews): the Studio is
//   reachable at `/studio/*`, since those hosts can't have a subdomain.
//   It's still behind the sign-in gate there.

export const STUDIO_ORIGIN = "https://studio.cloveredge.net";
export const STUDIO_PATH_PREFIX = "/studio";

const PUBLIC_PRODUCTION_HOSTS = new Set([
  "cloveredge.net",
  "www.cloveredge.net",
  "cloveredge.vercel.app",
]);

function hostname(host: string | null | undefined): string {
  return (host ?? "").split(":")[0].toLowerCase();
}

export function isStudioHost(host: string | null | undefined): boolean {
  return hostname(host).startsWith("studio.");
}

export function isPublicProductionHost(host: string | null | undefined): boolean {
  return PUBLIC_PRODUCTION_HOSTS.has(hostname(host));
}

export function isStudioPath(pathname: string): boolean {
  return pathname === STUDIO_PATH_PREFIX || pathname.startsWith(`${STUDIO_PATH_PREFIX}/`);
}

/** "" on the Studio host, "/studio" everywhere else. */
export function studioBasePath(host: string | null | undefined): string {
  return isStudioHost(host) ? "" : STUDIO_PATH_PREFIX;
}

/** Joins a Studio base path and a Studio-relative path ("/", "/homepage"). */
export function studioHref(base: string, path: string = "/"): string {
  if (path === "/") return base || "/";
  return `${base}${path}`;
}

/** A link into the Studio from a page served on `host` (e.g. the public site). */
export function studioUrlFrom(host: string | null | undefined, path: string = "/"): string {
  if (isPublicProductionHost(host)) return `${STUDIO_ORIGIN}${path === "/" ? "" : path}`;
  return studioHref(studioBasePath(host), path);
}
