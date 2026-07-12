import { prisma } from "./prisma";
import { auth } from "./auth";
import { getGuestId } from "./guest";
import { isEntitled, type ViewerTier } from "./entitlement";

export type { ViewerTier };
export { isEntitled };

export type VideoInfo = {
  youtubeVideoId: string;
  thumbnailUrl: string;
  durationSeconds: number;
  channelTitle: string;
  gameType: string;
  venueType: string;
  sentiment: string;
};

export type RailData = {
  key: string;
  title: string;
  topicSlug: string;
  items: {
    slug: string;
    title: string;
    excerpt: string | null;
    tier: "FREE" | "PAID";
    video: VideoInfo | null;
  }[];
};

export type TrendingTopic = {
  slug: string;
  label: string;
  weight: number;
};

export type HomepageData = {
  viewerTier: ViewerTier;
  featuredStories: RailData["items"];
  trending: TrendingTopic[];
  rails: RailData[];
};

const ITEMS_PER_RAIL = 4;

export async function getHomepageData(): Promise<HomepageData> {
  const [session, guestId, modules] = await Promise.all([
    auth(),
    getGuestId(),
    prisma.homepageModule.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ]);

  const viewerTier: ViewerTier = session?.user
    ? session.user.tier
    : "ANON";

  const [preferenceTopics, guestSignals] = await Promise.all([
    session?.user
      ? prisma.user
          .findUnique({
            where: { id: session.user.id },
            select: { preferences: { select: { slug: true } } },
          })
          .then((u) => new Set(u?.preferences.map((p) => p.slug) ?? []))
      : Promise.resolve(new Set<string>()),
    guestId
      ? prisma.guestSignal.findMany({ where: { guestId } })
      : Promise.resolve([]),
  ]);

  const signalWeight = new Map(guestSignals.map((s) => [s.topicSlug, s.weight]));

  const railModules = modules.filter((m) => m.type === "RAIL" && m.topicSlug);
  const scored = railModules
    .map((m) => {
      const topicSlug = m.topicSlug!;
      const prefBoost = preferenceTopics.has(topicSlug) ? 1000 : 0;
      const guestBoost = (signalWeight.get(topicSlug) ?? 0) * 10;
      return { module: m, score: prefBoost + guestBoost };
    })
    .sort((a, b) => b.score - a.score || a.module.order - b.module.order);

  const rails = await Promise.all(
    scored.map(async ({ module }) => {
      const items = await prisma.contentItem.findMany({
        where: { topics: { some: { slug: module.topicSlug! } }, publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: ITEMS_PER_RAIL,
        select: {
          slug: true,
          title: true,
          excerpt: true,
          tier: true,
          video: {
            select: {
              youtubeVideoId: true,
              thumbnailUrl: true,
              durationSeconds: true,
              channelTitle: true,
              gameType: true,
              venueType: true,
              sentiment: true,
            },
          },
        },
      });
      return { key: module.key, title: module.title, topicSlug: module.topicSlug!, items };
    }),
  );

  // Fixed candidate pool (same curated stories for everyone) — but the
  // ORDER personalizes for signed-in users with topic preferences: matching
  // stories float to the front, same "boost don't hide" pattern as rails.
  // Anonymous/no-preference visitors see the pure editorial order, since
  // preferenceTopics is an empty set for them (every score ties at 0, so
  // the stable sort falls through to the original featuredOrder).
  const featuredCandidates = await prisma.contentItem.findMany({
    where: { featured: true, publishedAt: { not: null } },
    orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      tier: true,
      topics: { select: { slug: true } },
      video: {
        select: {
          youtubeVideoId: true,
          thumbnailUrl: true,
          durationSeconds: true,
          channelTitle: true,
          gameType: true,
          venueType: true,
          sentiment: true,
        },
      },
    },
  });
  const featuredStories = featuredCandidates
    .map((item, originalIndex) => ({
      item,
      originalIndex,
      matches: item.topics.some((t) => preferenceTopics.has(t.slug)),
    }))
    .sort((a, b) => Number(b.matches) - Number(a.matches) || a.originalIndex - b.originalIndex)
    .map(({ item }) => ({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      tier: item.tier,
      video: item.video,
    }));

  // Admin override (/admin/homepage) takes full priority when set — pinned
  // topics show in exactly the configured order, no blending with computed
  // data. Falls back to the real click-aggregate below only when nothing's
  // pinned, so "trending" stays authentic unless someone deliberately
  // overrides it.
  const pinned = await prisma.preferenceTopic.findMany({
    where: { pinnedTrendingOrder: { not: null } },
    orderBy: { pinnedTrendingOrder: "asc" },
    select: { slug: true, label: true },
  });

  let trending: TrendingTopic[];
  if (pinned.length > 0) {
    trending = pinned.map((t) => ({ slug: t.slug, label: t.label, weight: 0 }));
  } else {
    const trendingAgg = await prisma.guestSignal.groupBy({
      by: ["topicSlug"],
      _sum: { weight: true },
      orderBy: { _sum: { weight: "desc" } },
      take: 3,
    });
    const trendingTopics = trendingAgg.filter((t) => (t._sum.weight ?? 0) > 0);
    const topicLabels = trendingTopics.length
      ? await prisma.preferenceTopic.findMany({
          where: { slug: { in: trendingTopics.map((t) => t.topicSlug) } },
          select: { slug: true, label: true },
        })
      : [];
    const labelBySlug = new Map(topicLabels.map((t) => [t.slug, t.label]));
    trending = trendingTopics.map((t) => ({
      slug: t.topicSlug,
      label: labelBySlug.get(t.topicSlug) ?? t.topicSlug,
      weight: t._sum.weight ?? 0,
    }));
  }

  return { viewerTier, featuredStories, trending, rails };
}
