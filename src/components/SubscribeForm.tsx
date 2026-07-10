"use client";

import { useState } from "react";

type Topic = { slug: string; label: string };

export function SubscribeForm({ topics }: { topics: Topic[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function toggleTopic(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics: Array.from(selected) }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-8 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
        You&apos;re subscribed. Check your inbox to confirm.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-gray-800">
              <input
                type="checkbox"
                checked={selected.has(topic.slug)}
                onChange={() => toggleTopic(topic.slug)}
              />
              {topic.label}
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-transparent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {status === "loading" ? "Subscribing..." : "Get started"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
