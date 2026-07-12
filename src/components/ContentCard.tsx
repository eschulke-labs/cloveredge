"use client";

import Link from "next/link";
import { getTopicStyle } from "@/lib/topicStyle";
import { formatDuration } from "@/lib/format";
import type { VideoInfo } from "@/lib/homepage";

type Props = {
  slug: string;
  title: string;
  excerpt: string | null;
  tier: "FREE" | "PAID";
  isEntitled: boolean;
  topicSlug?: string;
  video?: VideoInfo | null;
};

const SENTIMENT_BADGE: Record<string, string> = {
  WIN: "🟢 Win",
  LOSS: "🔴 Loss",
  MIXED: "🟡 Mixed",
  UNKNOWN: "⚪ Unclassified",
};

const VENUE_BADGE: Record<string, string> = {
  ONLINE: "Online",
  LAND_BASED: "Land-Based",
  UNKNOWN: "Venue unknown",
};

export function ContentCard({
  slug,
  title,
  excerpt,
  tier,
  isEntitled,
  topicSlug,
  video,
}: Props) {
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

  const cardClass = `block overflow-hidden rounded-lg border border-t-4 border-gray-200 bg-white text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40 ${
    style?.border ?? "border-t-gray-400 dark:border-t-gray-600"
  }`;

  if (video) {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
        target="_blank"
        rel="noreferrer"
        onClick={trackClick}
        className={cardClass}
      >
        <div className="relative aspect-video w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-xl text-white">
              ▶
            </span>
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-medium">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{video.channelTitle}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-medium ${style?.badge ?? ""}`}>
              {style?.icon} {video.gameType}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {VENUE_BADGE[video.venueType] ?? video.venueType}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {SENTIMENT_BADGE[video.sentiment] ?? video.sentiment}
            </span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <Link href={`/content/${slug}`} onClick={trackClick} className={`${cardClass} p-4`}>
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
