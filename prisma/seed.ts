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
      featured: true,
      featuredOrder: 0,
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
      featured: true,
      featuredOrder: 12,
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
      featured: true,
      featuredOrder: 2,
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
      featured: true,
      featuredOrder: 4,
    },
    {
      slug: "state-regulator-updates-licensing-rules",
      title: "State Regulator Updates Online Casino Licensing Rules",
      excerpt: "New requirements take effect next quarter for all licensed operators.",
      body: "The state gaming commission announced updated licensing requirements for online casino operators, including stricter identity verification and faster payout SLAs.",
      contentType: "REGULATORY" as const,
      tier: "FREE" as const,
      topics: ["regulatory-news"],
      featured: true,
      featuredOrder: 6,
    },
    {
      slug: "how-to-set-deposit-limits",
      title: "How to Set Deposit Limits at Any Licensed Casino",
      excerpt: "A step-by-step guide to responsible-gambling tools most sites offer.",
      body: "Most licensed online casinos let you set daily, weekly, or monthly deposit limits, cool-off periods, and self-exclusion. Here's how to find and use those tools.",
      contentType: "RESPONSIBLE_GAMBLING" as const,
      tier: "FREE" as const,
      topics: ["responsible-gambling"],
      featured: true,
      featuredOrder: 8,
    },
    {
      slug: "weekend-sports-betting-lines-preview",
      title: "Weekend Sports Betting Lines: What's Moving",
      excerpt: "Line movement across major sportsbooks ahead of Saturday's slate.",
      body: "Sportsbooks have adjusted several key lines this week. Here's what shifted and why, across the major operators we track.",
      contentType: "ODDS_UPDATE" as const,
      tier: "FREE" as const,
      topics: ["sports-betting"],
      featured: true,
      featuredOrder: 10,
    },
    {
      slug: "prediction-market-odds-next-state-to-legalize",
      title: "Prediction Markets: Odds on the Next State to Legalize Online Casino Play",
      excerpt: "What Polymarket-style prediction markets currently imply about upcoming legalization votes.",
      body: "Placeholder for live prediction-market data (Phase 4 will pull this from the Polymarket Gamma API and cache it as OddsSnapshot rows). Implied probabilities shown here are not betting odds.",
      contentType: "ODDS_UPDATE" as const,
      tier: "FREE" as const,
      topics: ["prediction-markets"],
      featured: true,
      featuredOrder: 11,
    },
  ];

  // Real YouTube slot-play videos pulled via the Data API, classified using
  // the taxonomy from DEVELOPMENT_PLAN.md Phase 4 (game type / venue /
  // sentiment aren't official API fields — see that doc for the reasoning
  // behind each call, including which ones are still "UNKNOWN" on purpose).
  const slotVideos = [
    {
      youtubeVideoId: "dJhJLyV7aoM",
      title: "HLS Slots is live!",
      channelTitle: "HLS Slots",
      thumbnailUrl: "https://i.ytimg.com/vi/dJhJLyV7aoM/hqdefault.jpg",
      durationSeconds: 3429,
      viewCount: 6096,
      youtubePublishedAt: new Date("2026-07-12T16:58:06Z"),
      venueType: "LAND_BASED" as const,
      sentiment: "MIXED" as const,
      featuredOrder: 1,
    },
    {
      youtubeVideoId: "wmp61xfzZCE",
      title: "MAXED OUT UNICOW BONUS ON $15 BET! MONSTER JACKPOT HANDPAY!!!!",
      channelTitle: "NE SLOTS (aka NewEnglander82)",
      thumbnailUrl: "https://i.ytimg.com/vi/wmp61xfzZCE/hqdefault.jpg",
      durationSeconds: 3256,
      viewCount: 1614,
      youtubePublishedAt: new Date("2026-07-12T16:30:05Z"),
      venueType: "LAND_BASED" as const,
      sentiment: "WIN" as const,
      featuredOrder: 3,
    },
    {
      youtubeVideoId: "B7ltdMq7vA0",
      title: "Yo Yeti Bonus",
      channelTitle: "Adventures In Vegas",
      thumbnailUrl: "https://i.ytimg.com/vi/B7ltdMq7vA0/hqdefault.jpg",
      durationSeconds: 113,
      viewCount: 350,
      youtubePublishedAt: new Date("2026-07-12T16:00:04Z"),
      venueType: "LAND_BASED" as const,
      sentiment: "WIN" as const,
      featuredOrder: 5,
    },
    {
      youtubeVideoId: "iRWv5jBV8L8",
      title: "SUNDAY CASINO LIVE SLOT PLAY PART 2!",
      channelTitle: "LuckySnoop888 Jackpot Hound",
      thumbnailUrl: "https://i.ytimg.com/vi/iRWv5jBV8L8/hqdefault.jpg",
      durationSeconds: 6770,
      viewCount: 15548,
      youtubePublishedAt: new Date("2026-07-12T15:33:34Z"),
      venueType: "LAND_BASED" as const,
      sentiment: "UNKNOWN" as const,
      featuredOrder: 7,
    },
    {
      youtubeVideoId: "fAABXRz629M",
      title: "Buffalo Gold Revolution Live Play",
      channelTitle: "Wrauberto Slots",
      thumbnailUrl: "https://i.ytimg.com/vi/fAABXRz629M/hqdefault.jpg",
      durationSeconds: 1250,
      viewCount: 887,
      youtubePublishedAt: new Date("2026-07-12T13:15:35Z"),
      venueType: "LAND_BASED" as const,
      sentiment: "UNKNOWN" as const,
      featuredOrder: 9,
    },
  ];

  for (const { featuredOrder, ...v } of slotVideos) {
    const video = await prisma.videoEmbed.upsert({
      where: { youtubeVideoId: v.youtubeVideoId },
      update: {},
      create: { ...v, gameType: "SLOTS" },
    });
    await prisma.contentItem.upsert({
      where: { slug: `video-${v.youtubeVideoId}` },
      update: { featured: true, featuredOrder },
      create: {
        title: v.title,
        slug: `video-${v.youtubeVideoId}`,
        excerpt: `${v.channelTitle} · ${Math.round(v.durationSeconds / 60)} min`,
        body: `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
        contentType: "GAMEPLAY_VIDEO",
        source: "FEED",
        sourceUrl: `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
        tier: "FREE",
        publishedAt: v.youtubePublishedAt,
        videoId: video.id,
        topics: { connect: [{ slug: "game-videos" }] },
        featured: true,
        featuredOrder,
      },
    });
  }

  for (const item of contentItems) {
    const { topics, ...data } = item;
    await prisma.contentItem.upsert({
      where: { slug: item.slug },
      update: { featured: data.featured, featuredOrder: data.featuredOrder },
      create: {
        ...data,
        source: "MANUAL",
        publishedAt: new Date(),
        topics: { connect: topics.map((slug) => ({ slug })) },
      },
    });
  }

  // Editorial default order — the initial lineup per direction: videos,
  // then bonuses, then regulatory news, ahead of everything else. This will
  // change as the content mix evolves; reorder here (source of truth) or
  // via /admin/homepage for one-off adjustments.
  const homepageModules = [
    { key: "hero", title: "Top Story", type: "HERO" as const, topicSlug: null, order: 0 },
    { key: "trending", title: "Trending Now", type: "TRENDING" as const, topicSlug: null, order: 1 },
    { key: "rail:game-videos", title: "Game & Casino Videos", type: "RAIL" as const, topicSlug: "game-videos", order: 2 },
    { key: "rail:bonus-offers", title: "Bonus & Promo Offers", type: "RAIL" as const, topicSlug: "bonus-offers", order: 3 },
    { key: "rail:regulatory-news", title: "Regulatory & Legal News", type: "RAIL" as const, topicSlug: "regulatory-news", order: 4 },
    { key: "rail:online-casino-news", title: "Online Casino News", type: "RAIL" as const, topicSlug: "online-casino-news", order: 5 },
    { key: "rail:land-based-openings", title: "Land-Based Openings & Events", type: "RAIL" as const, topicSlug: "land-based-openings", order: 6 },
    { key: "rail:sports-betting", title: "Sports Betting", type: "RAIL" as const, topicSlug: "sports-betting", order: 7 },
    { key: "rail:responsible-gambling", title: "Responsible Gambling Resources", type: "RAIL" as const, topicSlug: "responsible-gambling", order: 8 },
    { key: "rail:prediction-markets", title: "Prediction Markets", type: "RAIL" as const, topicSlug: "prediction-markets", order: 9 },
  ];

  for (const mod of homepageModules) {
    await prisma.homepageModule.upsert({
      where: { key: mod.key },
      update: mod, // reseeding re-applies this order — was previously a no-op bug (`update: {}`)
      create: mod,
    });
  }

  const adminUsers = ["admin@casinowatch.local", "eschulke@hotmail.com"];
  for (const email of adminUsers) {
    await prisma.user.upsert({
      where: { email },
      update: { isAdmin: true },
      create: { email, isAdmin: true, tier: "PAID" },
    });
  }

  console.log(
    `Seeded ${TOPICS.length} topics, 2 casinos, 1 bonus, ${contentItems.length} content items, ${slotVideos.length} slot videos, ${homepageModules.length} homepage modules, ${adminUsers.length} admin users.`,
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
