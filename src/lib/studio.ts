import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { studioBasePath, studioHref } from "@/lib/studio-routing";

export type StudioArea = "graph" | "admin";

export type StudioAccess = {
  userId: string;
  email: string | null | undefined;
  isAdmin: boolean;
  /** Knowledge-graph work: content reviewers and admins. */
  canReview: boolean;
};

/** "" on studio.cloveredge.net, "/studio" on localhost/previews. */
export async function getStudioBase(): Promise<string> {
  return studioBasePath((await headers()).get("host"));
}

/** null when signed out or when the user has no Studio role. */
export async function getStudioAccess(): Promise<StudioAccess | null> {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;
  const canReview = user.isAdmin || user.isContentReviewer;
  if (!canReview) return null;
  return { userId: user.id, email: user.email, isAdmin: user.isAdmin, canReview };
}

/**
 * Call at the top of every Studio page and Server Action. The layout's gate
 * only controls what's drawn around a page; it doesn't stop a page or action
 * from running, so each one checks for itself.
 */
export async function requireStudio(area: StudioArea): Promise<StudioAccess> {
  const access = await getStudioAccess();
  const allowed = access && (area === "admin" ? access.isAdmin : access.canReview);
  if (!allowed) redirect(studioHref(await getStudioBase()));
  return access;
}
