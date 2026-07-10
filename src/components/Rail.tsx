import { ContentCard } from "./ContentCard";
import type { RailData, ViewerTier } from "@/lib/homepage";
import { isEntitled } from "@/lib/homepage";
import { getTopicStyle } from "@/lib/topicStyle";

export function Rail({ rail, viewerTier }: { rail: RailData; viewerTier: ViewerTier }) {
  if (rail.items.length === 0) return null;
  const style = getTopicStyle(rail.topicSlug);

  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${style.badge}`}
          aria-hidden
        >
          {style.icon}
        </span>
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
