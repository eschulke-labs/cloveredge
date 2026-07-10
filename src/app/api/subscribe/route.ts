import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const topicSlugs: string[] = Array.isArray(body?.topics) ? body.topics : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      preferences: topicSlugs.length
        ? { connect: topicSlugs.map((slug) => ({ slug })) }
        : undefined,
    },
    create: {
      email,
      preferences: topicSlugs.length
        ? { connect: topicSlugs.map((slug) => ({ slug })) }
        : undefined,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
