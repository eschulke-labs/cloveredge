import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { studioUrlFrom } from "@/lib/studio-routing";

// Moved to the Studio (2026-11-26). Kept so old bookmarks still land there.
export default async function OldAdminHomepage() {
  redirect(studioUrlFrom((await headers()).get("host"), "/homepage"));
}
