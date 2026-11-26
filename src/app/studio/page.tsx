import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStudioAccess, getStudioBase } from "@/lib/studio";
import { studioHref } from "@/lib/studio-routing";

export const metadata = { title: "Overview" };

export default async function StudioOverviewPage() {
  // The layout shows the sign-in screen when this is null. Not redirecting
  // here: this page *is* where requireStudio() sends people.
  const access = await getStudioAccess();
  if (!access) return null;

  const base = await getStudioBase();
  const [videos, unreviewed, casinos, games, makers, creators] = await Promise.all([
    prisma.videoEmbed.count(),
    prisma.videoEmbed.count({ where: { reviewState: "UNREVIEWED" } }),
    prisma.casino.count(),
    prisma.game.count(),
    prisma.gameProvider.count(),
    prisma.creator.count(),
  ]);

  const stats = [
    { label: "Videos", value: videos, note: `${unreviewed} not yet reviewed` },
    { label: "Casinos", value: casinos },
    { label: "Games", value: games },
    { label: "Game makers", value: makers },
    { label: "Creators", value: creators },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        What&apos;s in the knowledge graph right now.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</dd>
            {s.note && <dd className="mt-1 text-xs text-muted-foreground">{s.note}</dd>}
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <h2 className="text-sm font-medium">Coming next</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Manage casinos, games, game makers and creators: add, edit, aliases, merge.</li>
          <li>Add a video by pasting a YouTube link.</li>
          <li>A watchlist of creator channels that collects new videos automatically.</li>
        </ul>
        {access.isAdmin && (
          <p className="mt-6 text-sm">
            Homepage layout and Trending pins are under{" "}
            <Link href={studioHref(base, "/homepage")} className="font-medium underline underline-offset-4">
              Site admin → Homepage
            </Link>
            .
          </p>
        )}
      </section>
    </div>
  );
}
