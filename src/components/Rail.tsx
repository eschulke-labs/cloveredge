import Link from "next/link";
import { ContentCard } from "./ContentCard";
import type { RailData, ViewerTier } from "@/lib/homepage";
import { isEntitled } from "@/lib/homepage";
import { getTopicStyle } from "@/lib/topicStyle";

// Topics with their own dedicated filtering/browsing page get a "See all"
// link on their homepage rail preview. Extend as more topics grow one.
const VIEW_ALL_HREF: Record<string, string> = {
  "game-videos": "/videos",
};

export function Rail({ rail, viewerTier }: { rail: RailData; viewerTier: ViewerTier }) {
  if (rail.items.length === 0) return null;
  const style = getTopicStyle(rail.topicSlug);
  const viewAllHref = VIEW_ALL_HREF[rail.topicSlug];

  return (
    <section id={`rail-${rail.topicSlug}`} className="scroll-mt-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${style.badge}`}
            aria-hidden
          >
            {style.icon}
          </span>
          {rail.title}
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-gray-500 hover:underline">
            Filter & see all &rarr;
          </Link>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rail.items.map((item) => (
          <ContentCard
            key={item.slug}
            {...item}
            isEntitled={isEntitled(item.tier, viewerTier)}
            topicSlug={rail.topicSlug}
          />
        ))}
      </div>
    </section>
  );
}
