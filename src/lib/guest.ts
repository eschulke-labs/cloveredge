import { cookies } from "next/headers";

export const GUEST_COOKIE = "cw_guest_id";

export async function getGuestId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_COOKIE)?.value ?? null;
}
