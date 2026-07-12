import Link from "next/link";
import { getVideos, VIDEO_GAME_TYPES, VIDEO_VENUE_TYPES, type VideoSort } from "@/lib/videos";
import { isEntitled } from "@/lib/homepage";
import { ContentCard } from "@/components/ContentCard";

const GAME_TYPE_LABELS: Record<string, string> = {
  SLOTS: "Slots",
  BLACKJACK: "Blackjack",
  ROULETTE: "Roulette",
  POKER: "Poker",
  SPORTS_BETTING: "Sports Betting",
  OTHER: "Other",
};

const VENUE_TYPE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  LAND_BASED: "Land-Based",
  UNKNOWN: "Venue Unknown",
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ gameType?: string; venueType?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort: VideoSort = params.sort === "popular" ? "popular" : "newest";
  const { viewerTier, items } = await getVideos({
    gameType: params.gameType,
    venueType: params.venueType,
    sort,
  });

  function buildHref(overrides: { gameType?: string; venueType?: string; sort?: string }) {
    const next = new URLSearchParams();
    const gameType = overrides.gameType !== undefined ? overrides.gameType : params.gameType;
    const venueType = overrides.venueType !== undefined ? overrides.venueType : params.venueType;
    const nextSort = overrides.sort !== undefined ? overrides.sort : sort;
    if (gameType) next.set("gameType", gameType);
    if (venueType) next.set("venueType", venueType);
    if (nextSort && nextSort !== "newest") next.set("sort", nextSort);
    const qs = next.toString();
    return qs ? `/videos?${qs}` : "/videos";
  }

  function chipClass(active: boolean) {
    return `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
        : "border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
    }`;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        &larr; Back to CasinoWatch
      </Link>

      <h1 className="mt-2 text-3xl font-bold tracking-tight">Game & Casino Videos</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Filter by what you want to watch. Only slot-play videos are populated
        right now — other game types are coming.
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Game
          </span>
          <Link href={buildHref({ gameType: "" })} className={chipClass(!params.gameType)}>
            All
          </Link>
          {VIDEO_GAME_TYPES.map((gt) => (
            <Link key={gt} href={buildHref({ gameType: gt })} className={chipClass(params.gameType === gt)}>
              {GAME_TYPE_LABELS[gt] ?? gt}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Venue
          </span>
          <Link href={buildHref({ venueType: "" })} className={chipClass(!params.venueType)}>
            All
          </Link>
          {VIDEO_VENUE_TYPES.map((vt) => (
            <Link key={vt} href={buildHref({ venueType: vt })} className={chipClass(params.venueType === vt)}>
              {VENUE_TYPE_LABELS[vt] ?? vt}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sort
          </span>
          <Link href={buildHref({ sort: "newest" })} className={chipClass(sort === "newest")}>
            Newest
          </Link>
          <Link href={buildHref({ sort: "popular" })} className={chipClass(sort === "popular")}>
            Most Viewed
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
          <p className="font-medium">No videos match these filters yet.</p>
          <p className="mt-1">
            Only slot-play videos are populated right now — try{" "}
            <Link href="/videos" className="underline">
              clearing filters
            </Link>{" "}
            or check back as more game types get added.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard
              key={item.slug}
              {...item}
              isEntitled={isEntitled(item.tier, viewerTier)}
              topicSlug="game-videos"
            />
          ))}
        </div>
      )}
    </main>
  );
}
