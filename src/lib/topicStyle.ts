// Static, literal Tailwind class strings per topic — Tailwind's scanner needs
// full class names present in source, so this can't be built by interpolating
// a color name at runtime.
export const TOPIC_STYLES: Record<
  string,
  { icon: string; badge: string; border: string }
> = {
  "online-casino-news": {
    icon: "🎰",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    border: "border-t-indigo-400 dark:border-t-indigo-600",
  },
  "land-based-openings": {
    icon: "🏛️",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    border: "border-t-emerald-400 dark:border-t-emerald-600",
  },
  "bonus-offers": {
    icon: "🎁",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    border: "border-t-amber-400 dark:border-t-amber-600",
  },
  "sports-betting": {
    icon: "🏈",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    border: "border-t-blue-400 dark:border-t-blue-600",
  },
  "regulatory-news": {
    icon: "⚖️",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    border: "border-t-slate-400 dark:border-t-slate-600",
  },
  "responsible-gambling": {
    icon: "🛡️",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    border: "border-t-teal-400 dark:border-t-teal-600",
  },
  "prediction-markets": {
    icon: "📈",
    badge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    border: "border-t-fuchsia-400 dark:border-t-fuchsia-600",
  },
  "game-videos": {
    icon: "🎬",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    border: "border-t-rose-400 dark:border-t-rose-600",
  },
};

const DEFAULT_STYLE = {
  icon: "🎲",
  badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  border: "border-t-gray-400 dark:border-t-gray-600",
};

export function getTopicStyle(slug: string) {
  return TOPIC_STYLES[slug] ?? DEFAULT_STYLE;
}
