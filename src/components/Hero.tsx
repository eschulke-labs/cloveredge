import Link from "next/link";
import type { HomepageData } from "@/lib/homepage";
import { isEntitled } from "@/lib/homepage";

export function Hero({
  item,
  viewerTier,
}: {
  item: NonNullable<HomepageData["hero"]>;
  viewerTier: HomepageData["viewerTier"];
}) {
  const entitled = isEntitled(item.tier, viewerTier);

  return (
    <Link
      href={`/content/${item.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-800 p-8 shadow-lg shadow-violet-900/20 transition-transform hover:-translate-y-0.5 sm:p-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 text-[10rem] leading-none opacity-10 transition-opacity group-hover:opacity-20"
      >
        🎰
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300 backdrop-blur">
        ✨ Top Story
      </span>
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
  );
}
