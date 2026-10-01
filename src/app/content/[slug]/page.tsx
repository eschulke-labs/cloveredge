import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isEntitled, type ViewerTier } from "@/lib/homepage";
import { getTopicStyle } from "@/lib/topicStyle";

const VENUE_BADGE: Record<string, string> = {
  ONLINE: "Online",
  LAND_BASED: "Land-Based",
  UNKNOWN: "Venue unknown",
};

const SENTIMENT_BADGE: Record<string, string> = {
  WIN: "🟢 Win",
  LOSS: "🔴 Loss",
  MIXED: "🟡 Mixed",
  UNKNOWN: "⚪ Unclassified",
};

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, session] = await Promise.all([
    prisma.contentItem.findUnique({ where: { slug }, include: { video: true } }),
    auth(),
  ]);

  if (!item) notFound();

  const viewerTier: ViewerTier = session?.user ? session.user.tier : "ANON";
  const entitled = isEntitled(item.tier, viewerTier);
  const style = getTopicStyle("game-videos");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        &larr; Back to CloverEdge
      </Link>

      {item.tier === "PAID" && (
        <span className="mt-4 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Subscriber content
        </span>
      )}

      <h1 className="mt-2 text-3xl font-bold tracking-tight">{item.title}</h1>
      {item.excerpt && (
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{item.excerpt}</p>
      )}

      {entitled ? (
        item.video ? (
          <div className="mt-6">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${item.video.youtubeVideoId}`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">{item.video.channelTitle}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                {style.icon} {item.video.gameType}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {VENUE_BADGE[item.video.venueType] ?? item.video.venueType}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {SENTIMENT_BADGE[item.video.sentiment] ?? item.video.sentiment}
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${item.video.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-gray-500 hover:underline"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 whitespace-pre-wrap text-base leading-7">{item.body}</div>
        )
      ) : (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            This {item.video ? "video" : "story"} is for subscribers.
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-300">
            Subscribe to watch/read the full content and unlock other
            subscriber-only content, plus the ability to leave your own
            casino reviews.
          </p>
          <Link
            href="/api/auth/signin"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Sign in to subscribe
          </Link>
        </div>
      )}
    </main>
  );
}
