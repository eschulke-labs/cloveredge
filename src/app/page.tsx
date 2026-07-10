import { prisma } from "@/lib/prisma";
import { SubscribeForm } from "@/components/SubscribeForm";

export default async function Home() {
  const topics = await prisma.preferenceTopic.findMany({
    where: { kind: "TOPIC" },
    orderBy: { label: "asc" },
    select: { slug: true, label: true },
  });

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          CasinoWatch
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          One newsletter, tuned to what you actually want to know about
          online and land-based casinos — news, bonuses, reviews, and
          regulatory updates, delivered on your schedule.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Choose what you get
        </h2>
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
