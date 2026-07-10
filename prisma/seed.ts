import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TOPICS = [
  { slug: "online-casino-news", label: "Online Casino News" },
  { slug: "land-based-openings", label: "Land-Based Openings & Events" },
  { slug: "bonus-offers", label: "Bonus & Promo Offers" },
  { slug: "sports-betting", label: "Sports Betting" },
  { slug: "regulatory-news", label: "Regulatory & Legal News" },
  { slug: "responsible-gambling", label: "Responsible Gambling Resources" },
  { slug: "prediction-markets", label: "Prediction Markets" },
  { slug: "game-videos", label: "Game & Casino Videos" },
];

async function main() {
  await Promise.all(
    TOPICS.map((t) =>
      prisma.preferenceTopic.upsert({
        where: { slug: t.slug },
        update: {},
        create: { ...t, kind: "TOPIC" },
      }),
    ),
  );

  const luckyRiver = await prisma.casino.upsert({
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

  const goldenSpade = await prisma.casino.upsert({
    where: { slug: "golden-spade-resort" },
    update: {},
    create: {
      name: "Golden Spade Resort & Casino",
      slug: "golden-spade-resort",
      type: "LAND_BASED",
      jurisdiction: "NV",
      website: "https://example.com/golden-spade",
      ratingAvg: 4.5,
    },
  });

  await prisma.bonus.upsert({
    where: { id: "seed-bonus-1" },
    update: {},
    create: {
      id: "seed-bonus-1",
      casinoId: luckyRiver.id,
      title: "100% match up to $200 on first deposit",
      terms: "35x wagering requirement, slots only.",
      expiresAt: new Date("2026-12-31"),
    },
  });

  const contentItems = [
    {
      slug: "welcome-to-casinowatch",
      title: "Welcome to CasinoWatch",
      excerpt: "What we cover and how personalization works.",
      body: "CasinoWatch tracks online and land-based casino news, bonuses, and reviews. The homepage adapts to what you read — no account required.",
      contentType: "NEWS" as const,
      tier: "FREE" as const,
      topics: ["online-casino-news"],
    },
    {
      slug: "deep-dive-payout-speed-analysis",
      title: "Deep Dive: Payout Speed Analysis Across 40 Online Casinos",
      excerpt: "Our full data breakdown of withdrawal times by casino and payment method.",
      body: "Full analysis available to subscribers: median withdrawal times, fastest payout methods by casino, and which operators consistently miss their stated SLAs.",
      contentType: "CASINO_REVIEW" as const,
      tier: "PAID" as const,
      casinoId: luckyRiver.id,
      topics: ["online-casino-news"],
    },
    {
      slug: "lucky-river-refreshes-welcome-bonus",
      title: "Lucky River Casino Refreshes Its Welcome Bonus",
      excerpt: "The new offer raises the match cap but adds a wagering tier.",
      body: "Lucky River Casino has updated its welcome bonus to a 100% match up to $200, replacing the previous flat $150 offer. Terms now include a tiered wagering structure.",
      contentType: "BONUS_PROMO" as const,
      tier: "FREE" as const,
      casinoId: luckyRiver.id,
      topics: ["bonus-offers"],
    },
    {
      slug: "golden-spade-resort-opens-new-wing",
      title: "Golden Spade Resort Opens New Gaming Wing",
      excerpt: "A 40,000 sq ft expansion adds 600 new slot machines and a poker room.",
      body: "Golden Spade Resort & Casino celebrated the opening of its new gaming wing this week, adding 600 slot machines, a dedicated poker room, and three new restaurants.",
      contentType: "NEWS" as const,
      tier: "FREE" as const,
      casinoId: goldenSpade.id,
      topics: ["land-based-openings"],
    },
    {
      slug: "state-regulator-updates-licensing-rules",
      title: "State Regulator Updates Online Casino Licensing Rules",
      excerpt: "New requirements take effect next quarter for all licensed operators.",
      body: "The state gaming commission announced updated licensing requirements for online casino operators, including stricter identity verification and faster payout SLAs.",
      contentType: "REGULATORY" as const,
      tier: "FREE" as const,
      topics: ["regulatory-news"],
    },
    {
      slug: "how-to-set-deposit-limits",
      title: "How to Set Deposit Limits at Any Licensed Casino",
      excerpt: "A step-by-step guide to responsible-gambling tools most sites offer.",
      body: "Most licensed online casinos let you set daily, weekly, or monthly deposit limits, cool-off periods, and self-exclusion. Here's how to find and use those tools.",
      contentType: "RESPONSIBLE_GAMBLING" as const,
      tier: "FREE" as const,
      topics: ["responsible-gambling"],
    },
    {
      slug: "weekend-sports-betting-lines-preview",
      title: "Weekend Sports Betting Lines: What's Moving",
      excerpt: "Line movement across major sportsbooks ahead of Saturday's slate.",
      body: "Sportsbooks have adjusted several key lines this week. Here's what shifted and why, across the major operators we track.",
      contentType: "ODDS_UPDATE" as const,
      tier: "FREE" as const,
      topics: ["sports-betting"],
    },
    {
      slug: "prediction-market-odds-next-state-to-legalize",
      title: "Prediction Markets: Odds on the Next State to Legalize Online Casino Play",
      excerpt: "What Polymarket-style prediction markets currently imply about upcoming legalization votes.",
      body: "Placeholder for live prediction-market data (Phase 4 will pull this from the Polymarket Gamma API and cache it as OddsSnapshot rows). Implied probabilities shown here are not betting odds.",
      contentType: "ODDS_UPDATE" as const,
      tier: "FREE" as const,
      topics: ["prediction-markets"],
    },
    {
      slug: "watch-top-slot-bonus-rounds-this-week",
      title: "Watch: Top Slot Bonus Rounds This Week",
      excerpt: "Video roundup of the biggest bonus-round wins streamers hit this week.",
      body: "Placeholder for embedded video content (Phase 4 will pull this from the YouTube Data API and store it as VideoEmbed rows, including creator-submitted channels).",
      contentType: "NEWS" as const,
      tier: "FREE" as const,
      topics: ["game-videos"],
    },
  ];

  for (const item of contentItems) {
    const { topics, ...data } = item;
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        ...data,
        source: "MANUAL",
        publishedAt: new Date(),
        topics: { connect: topics.map((slug) => ({ slug })) },
      },
    });
  }

  const homepageModules = [
    { key: "hero", title: "Top Story", type: "HERO" as const, topicSlug: null, order: 0 },
    { key: "trending", title: "Trending Now", type: "TRENDING" as const, topicSlug: null, order: 1 },
    { key: "rail:online-casino-news", title: "Online Casino News", type: "RAIL" as const, topicSlug: "online-casino-news", order: 2 },
    { key: "rail:bonus-offers", title: "Bonus & Promo Offers", type: "RAIL" as const, topicSlug: "bonus-offers", order: 3 },
    { key: "rail:land-based-openings", title: "Land-Based Openings & Events", type: "RAIL" as const, topicSlug: "land-based-openings", order: 4 },
    { key: "rail:sports-betting", title: "Sports Betting", type: "RAIL" as const, topicSlug: "sports-betting", order: 5 },
    { key: "rail:regulatory-news", title: "Regulatory & Legal News", type: "RAIL" as const, topicSlug: "regulatory-news", order: 6 },
    { key: "rail:responsible-gambling", title: "Responsible Gambling Resources", type: "RAIL" as const, topicSlug: "responsible-gambling", order: 7 },
    { key: "rail:prediction-markets", title: "Prediction Markets", type: "RAIL" as const, topicSlug: "prediction-markets", order: 8 },
    { key: "rail:game-videos", title: "Game & Casino Videos", type: "RAIL" as const, topicSlug: "game-videos", order: 9 },
  ];

  for (const mod of homepageModules) {
    await prisma.homepageModule.upsert({
      where: { key: mod.key },
      update: {},
      create: mod,
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@casinowatch.local" },
    update: { isAdmin: true },
    create: { email: "admin@casinowatch.local", isAdmin: true, tier: "PAID" },
  });

  console.log(
    `Seeded ${TOPICS.length} topics, 2 casinos, 1 bonus, ${contentItems.length} content items, ${homepageModules.length} homepage modules, 1 admin user.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
