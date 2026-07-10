import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GUEST_COOKIE } from "@/lib/guest";

// Fire-and-forget engagement signal: "this browser clicked into this topic."
// No account/session required — this is what powers guest personalization.
export async function POST(request: NextRequest) {
  const guestId = request.cookies.get(GUEST_COOKIE)?.value;
  const body = await request.json().catch(() => null);
  const topicSlug = typeof body?.topicSlug === "string" ? body.topicSlug : null;

  if (!guestId || !topicSlug) {
    return NextResponse.json({ error: "Missing guestId or topicSlug." }, { status: 400 });
  }

  await prisma.guestSignal.upsert({
    where: { guestId_topicSlug: { guestId, topicSlug } },
    update: { weight: { increment: 1 } },
    create: { guestId, topicSlug, weight: 1 },
  });

  return NextResponse.json({ ok: true });
}
