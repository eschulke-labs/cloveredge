import type { TrendingTopic } from "@/lib/homepage";
import { getTopicStyle } from "@/lib/topicStyle";

export function TrendingWidget({ trending }: { trending: TrendingTopic[] }) {
  if (trending.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        🔥 Trending Now
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {trending.map((topic, i) => {
          const style = getTopicStyle(topic.slug);
          return (
            <span
              key={topic.slug}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${style.badge} ${
                i === 0 ? "ring-2 ring-amber-400/60" : ""
              }`}
            >
              <span aria-hidden>{style.icon}</span>
              {topic.label}
            </span>
          );
        })}
      </div>
    </section>
  );
}
