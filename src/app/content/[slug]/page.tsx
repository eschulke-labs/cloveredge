import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isEntitled, type ViewerTier } from "@/lib/homepage";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, session] = await Promise.all([
    prisma.contentItem.findUnique({ where: { slug } }),
    auth(),
  ]);

  if (!item) notFound();

  const viewerTier: ViewerTier = session?.user ? session.user.tier : "ANON";
  const entitled = isEntitled(item.tier, viewerTier);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        &larr; Back to CasinoWatch
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
        <div className="mt-6 whitespace-pre-wrap text-base leading-7">{item.body}</div>
      ) : (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm dark:border-amber-900 dark:bg-amber-950">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            This story is for subscribers.
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-300">
            Subscribe to read the full analysis and unlock other subscriber-only
            content, plus the ability to leave your own casino reviews.
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
