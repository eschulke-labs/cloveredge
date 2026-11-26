import { prisma } from "@/lib/prisma";
import { requireStudio } from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { updateModuleOrder, updateTrendingPins } from "./actions";

export const metadata = { title: "Homepage" };

export default async function StudioHomepagePage() {
  await requireStudio("admin");

  const [modules, topics] = await Promise.all([
    prisma.homepageModule.findMany({ orderBy: { order: "asc" } }),
    prisma.preferenceTopic.findMany({
      where: { kind: "TOPIC" },
      orderBy: [{ pinnedTrendingOrder: "asc" }, { label: "asc" }],
    }),
  ]);
  const anyPinned = topics.some((t) => t.pinnedTrendingOrder !== null);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Homepage modules</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Lower order shows first. Personalization (guest signals, signed-in
        preferences) can still reorder rails around this editorial baseline —
        the hero and trending widget stay fixed at the top.
      </p>

      <form action={updateModuleOrder} className="mt-8 space-y-3">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="flex items-center gap-4 rounded-lg border px-4 py-3 text-sm"
          >
            <input
              type="number"
              name={`order:${mod.id}`}
              defaultValue={mod.order}
              className="w-16 h-8 rounded-md border border-input bg-transparent px-2"
            />
            <span className="flex-1">
              {mod.title}{" "}
              <span className="text-muted-foreground">
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

        <Button type="submit" className="mt-4">
          Save order
        </Button>
      </form>

      <h2 className="mt-16 text-xl font-semibold tracking-tight">Trending Now pins</h2>
      <p className="mt-2 text-sm text-muted-foreground">
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
            className="flex items-center gap-4 rounded-lg border px-4 py-3 text-sm"
          >
            <input
              type="number"
              name={`pin:${topic.id}`}
              placeholder="—"
              defaultValue={topic.pinnedTrendingOrder ?? ""}
              className="w-16 h-8 rounded-md border border-input bg-transparent px-2"
            />
            <span className="flex-1">
              {topic.label} <span className="text-muted-foreground">({topic.slug})</span>
            </span>
          </div>
        ))}

        <Button type="submit" className="mt-4">
          Save pins
        </Button>
      </form>
    </div>
  );
}
