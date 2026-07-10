"use client";

import Link from "next/link";
import { getTopicStyle } from "@/lib/topicStyle";

type Props = {
  slug: string;
  title: string;
  excerpt: string | null;
  tier: "FREE" | "PAID";
  isEntitled: boolean;
  topicSlug?: string;
};

export function ContentCard({ slug, title, excerpt, tier, isEntitled, topicSlug }: Props) {
  const style = topicSlug ? getTopicStyle(topicSlug) : null;

  function trackClick() {
    if (!topicSlug) return;
    fetch("/api/signal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicSlug }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <Link
      href={`/content/${slug}`}
      onClick={trackClick}
      className={`block rounded-lg border border-t-4 border-gray-200 bg-white p-4 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40 ${style?.border ?? "border-t-gray-400 dark:border-t-gray-600"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        {tier === "PAID" && (
          <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {isEntitled ? "Subscriber" : "Subscribers only"}
          </span>
        )}
      </div>
      {excerpt && <p className="mt-1 text-gray-600 dark:text-gray-400">{excerpt}</p>}
    </Link>
  );
}
