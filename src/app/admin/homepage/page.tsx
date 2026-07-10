import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateModuleOrder } from "./actions";

export default async function AdminHomepagePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  const modules = await prisma.homepageModule.findMany({ orderBy: { order: "asc" } });

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
    </main>
  );
}
