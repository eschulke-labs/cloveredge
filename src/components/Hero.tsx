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
      className="block rounded-xl border border-gray-200 p-8 hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
    >
      {item.tier === "PAID" && (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {entitled ? "Subscriber" : "Subscribers only"}
        </span>
      )}
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h1>
      {item.excerpt && (
        <p className="mt-2 text-gray-600 dark:text-gray-400">{item.excerpt}</p>
      )}
    </Link>
  );
}
