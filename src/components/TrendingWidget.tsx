import type { TrendingTopic } from "@/lib/homepage";

export function TrendingWidget({ trending }: { trending: TrendingTopic[] }) {
  if (trending.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Trending Now
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {trending.map((topic) => (
          <span
            key={topic.slug}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium dark:border-gray-800"
          >
            🔥 {topic.label}
          </span>
        ))}
      </div>
    </section>
  );
}
