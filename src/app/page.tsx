const TOPICS = [
  { slug: "online-casino-news", label: "Online Casino News" },
  { slug: "land-based-openings", label: "Land-Based Openings & Events" },
  { slug: "bonus-offers", label: "Bonus & Promo Offers" },
  { slug: "sports-betting", label: "Sports Betting" },
  { slug: "regulatory-news", label: "Regulatory & Legal News" },
  { slug: "responsible-gambling", label: "Responsible Gambling Resources" },
];

export default function Home() {
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
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <li
              key={topic.slug}
              className="rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800"
            >
              {topic.label}
            </li>
          ))}
        </ul>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Get started
          </button>
        </form>
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
