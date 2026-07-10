import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const topics = await Promise.all(
    [
      { slug: "online-casino-news", label: "Online Casino News", kind: "TOPIC" as const },
      { slug: "land-based-openings", label: "Land-Based Openings & Events", kind: "TOPIC" as const },
      { slug: "bonus-offers", label: "Bonus & Promo Offers", kind: "TOPIC" as const },
      { slug: "sports-betting", label: "Sports Betting", kind: "TOPIC" as const },
      { slug: "regulatory-news", label: "Regulatory & Legal News", kind: "TOPIC" as const },
      { slug: "responsible-gambling", label: "Responsible Gambling Resources", kind: "TOPIC" as const },
    ].map((t) => prisma.preferenceTopic.upsert({ where: { slug: t.slug }, update: {}, create: t } )),
  );

  const casino = await prisma.casino.upsert({
    where: { slug: "lucky-river-casino" },
    update: {},
    create: {
      name: "Lucky River Casino",
      slug: "lucky-river-casino",
      type: "ONLINE",
      jurisdiction: "MT",
      website: "https://example.com/lucky-river",
      ratingAvg: 4.2,
    },
  });

  await prisma.bonus.upsert({
    where: { id: "seed-bonus-1" },
    update: {},
    create: {
      id: "seed-bonus-1",
      casinoId: casino.id,
      title: "100% match up to $200 on first deposit",
      terms: "35x wagering requirement, slots only.",
      expiresAt: new Date("2026-12-31"),
    },
  });

  await prisma.contentItem.upsert({
    where: { slug: "welcome-to-casinowatch" },
    update: {},
    create: {
      title: "Welcome to CasinoWatch",
      slug: "welcome-to-casinowatch",
      excerpt: "What we cover and how personalization works.",
      body: "CasinoWatch tracks online and land-based casino news, bonuses, and reviews...",
      contentType: "NEWS",
      source: "MANUAL",
      tier: "FREE",
      publishedAt: new Date(),
      topics: { connect: [{ slug: "online-casino-news" }] },
    },
  });

  await prisma.contentItem.upsert({
    where: { slug: "deep-dive-payout-speed-analysis" },
    update: {},
    create: {
      title: "Deep Dive: Payout Speed Analysis Across 40 Online Casinos",
      slug: "deep-dive-payout-speed-analysis",
      excerpt: "Our full data breakdown of withdrawal times by casino and payment method.",
      body: "Full analysis available to subscribers...",
      contentType: "CASINO_REVIEW",
      source: "MANUAL",
      tier: "PAID",
      casinoId: casino.id,
      publishedAt: new Date(),
      topics: { connect: [{ slug: "online-casino-news" }] },
    },
  });

  console.log(`Seeded ${topics.length} topics, 1 casino, 1 bonus, 2 content items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
