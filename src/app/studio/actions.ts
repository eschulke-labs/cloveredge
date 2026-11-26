"use server";

import { signIn, signOut } from "@/lib/auth";
import { getStudioBase } from "@/lib/studio";
import { studioHref } from "@/lib/studio-routing";

export async function signInToStudio(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  // Sends the magic link; the link brings the user back to the Studio home
  // on whichever host they started from.
  await signIn("resend", { email, redirectTo: studioHref(await getStudioBase()) });
}

export async function signOutOfStudio() {
  await signOut({ redirectTo: studioHref(await getStudioBase()) });
}
