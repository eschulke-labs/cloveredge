import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateModuleOrder, updateTrendingPins } from "./actions";

export default async function AdminHomepagePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const [modules, topics] = await Promise.all([
    prisma.homepageModule.findMany({ orderBy: { order: "asc" } }),
    prisma.preferenceTopic.findMany({
      where: { kind: "TOPIC" },
      orderBy: [{ pinnedTrendingOrder: "asc" }, { label: "asc" }],
    }),
  ]);
  const anyPinned = topics.some((t) => t.pinnedTrendingOrder !== null);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Homepage modules</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Lower order shows first. Personalization (guest signals, signed-in
        preferences) can still reorder rails around this editorial baseline —
        the hero and trending widget stay fixed at the top.
      </p>

      <form action={updateModuleOrder} className="mt-8 space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800"
          >
            <input
              type="number"
              name={`order:${mod.id}`}
              defaultValue={mod.order}
              className="w-16 rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-transparent"
            />
            <span className="flex-1">
              {mod.title}{" "}
              <span className="text-gray-500">
                ({mod.type}
                {mod.topicSlug ? ` · ${mod.topicSlug}` : ""})
              </span>
            </span>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name={`active:${mod.id}`} defaultChecked={mod.active} />
              Active
            </label>
          </div>
        ))}

        <button
          type="submit"
          className="mt-4 rounded-md bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Save order
        </button>
      </form>

      <h2 className="mt-16 text-2xl font-bold tracking-tight">Trending Now pins</h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Leave all pin numbers blank to let Trending Now compute itself from
        real visitor clicks (the default). Set a pin number on one or more
        topics to fully override it — Trending Now will show{" "}
        <strong>only</strong> the pinned topics, in pin order, ignoring click
        data entirely, until every pin is cleared again.
        {anyPinned && (
          <span className="mt-1 block font-medium text-amber-700 dark:text-amber-400">
            Currently overridden — {topics.filter((t) => t.pinnedTrendingOrder !== null).length} topic(s) pinned.
          </span>
        )}
      </p>

      <form action={updateTrendingPins} className="mt-6 space-y-3">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800"
          >
            <input
              type="number"
              name={`pin:${topic.id}`}
              placeholder="—"
              defaultValue={topic.pinnedTrendingOrder ?? ""}
              className="w-16 rounded border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-transparent"
            />
            <span className="flex-1">
              {topic.label} <span className="text-gray-500">({topic.slug})</span>
            </span>
          </div>
        ))}

        <button
          type="submit"
          className="mt-4 rounded-md bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Save pins
        </button>
      </form>
    </main>
  );
}
