import { ContentCard } from "./ContentCard";
import type { RailData, ViewerTier } from "@/lib/homepage";
import { isEntitled } from "@/lib/homepage";

export function Rail({ rail, viewerTier }: { rail: RailData; viewerTier: ViewerTier }) {
  if (rail.items.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {rail.title}
      </h2>
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
