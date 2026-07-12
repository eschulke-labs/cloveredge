"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HomepageData } from "@/lib/homepage";
import { isEntitled, type ViewerTier } from "@/lib/entitlement";
import { formatDuration } from "@/lib/format";

const AUTO_ADVANCE_MS = 7000;

export function Carousel({
  stories,
  viewerTier,
}: {
  stories: HomepageData["featuredStories"];
  viewerTier: ViewerTier;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % stories.length);
  }, [stories.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + stories.length) % stories.length);
  }, [stories.length]);

  useEffect(() => {
    if (paused || stories.length <= 1) return;
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, next, stories.length]);

  if (stories.length === 0) return null;

  const item = stories[index];
  const entitled = isEntitled(item.tier, viewerTier);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-800 shadow-lg shadow-violet-900/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/content/${item.slug}`} className="block p-8 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 text-[10rem] leading-none opacity-10"
        >
          {item.video ? "▶" : "🎰"}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300 backdrop-blur">
          {item.video ? "▶ Top Video" : "✨ Top Story"}
        </span>
        {item.video && (
          <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-100 backdrop-blur">
            {formatDuration(item.video.durationSeconds)} · {item.video.channelTitle}
          </span>
        )}
        {item.tier === "PAID" && (
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-amber-950">
            {entitled ? "Subscriber" : "Subscribers only"}
          </span>
        )}
        <h1 className="relative mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {item.title}
        </h1>
        {item.excerpt && (
          <p className="relative mt-3 max-w-xl text-violet-100">{item.excerpt}</p>
        )}
      </Link>

      {stories.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous story"
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next story"
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
          >
            ›
          </button>
          <div className="relative flex items-center justify-center gap-1.5 pb-4">
            {stories.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                aria-label={`Go to story ${i + 1} of ${stories.length}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
