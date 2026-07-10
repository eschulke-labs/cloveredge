import { prisma } from "./prisma";
import { auth } from "./auth";
import { getGuestId } from "./guest";

export type ViewerTier = "ANON" | "FREE" | "PAID";

export type RailData = {
  key: string;
  title: string;
  topicSlug: string;
  items: {
    slug: string;
    title: string;
    excerpt: string | null;
    tier: "FREE" | "PAID";
  }[];
};

export type TrendingTopic = {
  slug: string;
  label: string;
  weight: number;
};

export type HomepageData = {
  viewerTier: ViewerTier;
  hero: RailData["items"][number] | null;
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
        select: { slug: true, title: true, excerpt: true, tier: true },
      });
      return { key: module.key, title: module.title, topicSlug: module.topicSlug!, items };
    }),
  );

  const heroItem = await prisma.contentItem.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, tier: true },
  });

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
  const trending: TrendingTopic[] = trendingTopics.map((t) => ({
    slug: t.topicSlug,
    label: labelBySlug.get(t.topicSlug) ?? t.topicSlug,
    weight: t._sum.weight ?? 0,
  }));

  return { viewerTier, hero: heroItem, trending, rails };
}

export function isEntitled(tier: "FREE" | "PAID", viewerTier: ViewerTier) {
  return tier === "FREE" || viewerTier === "PAID";
}
