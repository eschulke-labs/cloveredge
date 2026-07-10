import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getHomepageData } from "@/lib/homepage";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Hero } from "@/components/Hero";
import { TrendingWidget } from "@/components/TrendingWidget";
import { Rail } from "@/components/Rail";

export default async function Home() {
  const [{ hero, trending, rails, viewerTier }, session, topics] = await Promise.all([
    getHomepageData(),
    auth(),
    prisma.preferenceTopic.findMany({
      where: { kind: "TOPIC" },
      orderBy: { label: "asc" },
      select: { slug: true, label: true },
    }),
  ]);

  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 text-base shadow-sm"
            aria-hidden
          >
            🎲
          </span>
          CasinoWatch
        </span>
        {session?.user ? (
          <div className="flex items-center gap-3 text-sm">
            {session.user.isAdmin && (
              <Link href="/admin/homepage" className="hover:underline">
                Admin
              </Link>
            )}
            <span className="text-gray-500">{session.user.email}</span>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium dark:border-gray-700"
          >
            Sign in
          </Link>
        )}
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-8">
        {hero && <Hero item={hero} viewerTier={viewerTier} />}
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-6 pb-16">
        <TrendingWidget trending={trending} />
        {rails.map((rail) => (
          <Rail key={rail.key} rail={rail} viewerTier={viewerTier} />
        ))}
      </div>

      <section className="mx-auto max-w-3xl border-t border-gray-200 px-6 py-16 dark:border-gray-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Get the newsletter
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choose what you get, delivered on your schedule.
        </p>
        <SubscribeForm topics={topics} />
      </section>

      <footer className="mx-auto max-w-3xl px-6 pb-12 text-xs text-gray-500">
        <p>
          Must be of legal gambling age in your jurisdiction. CasinoWatch
          provides news and information only — it does not offer real-money
          gambling. If gambling is causing you harm, resources are available
          at{" "}
          <a
            href="https://www.begambleaware.org"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            begambleaware.org
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
