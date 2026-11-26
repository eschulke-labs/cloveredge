"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Clapperboard,
  Dices,
  Factory,
  LayoutDashboard,
  LayoutTemplate,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

type NavItem = { label: string; path: string; icon: LucideIcon; soon?: boolean };
type NavSection = { title?: string; items: NavItem[]; adminOnly?: boolean };

// Items marked `soon` are on the roadmap (DEVELOPMENT_PLAN.md, Milestone 2)
// and shown greyed out so the shape of the Studio is visible from day one.
const SECTIONS: NavSection[] = [
  { items: [{ label: "Overview", path: "/", icon: LayoutDashboard }] },
  {
    title: "Knowledge graph",
    items: [
      { label: "Videos", path: "/videos", icon: Clapperboard, soon: true },
      { label: "Casinos", path: "/casinos", icon: Building2, soon: true },
      { label: "Games", path: "/games", icon: Dices, soon: true },
      { label: "Game makers", path: "/makers", icon: Factory, soon: true },
      { label: "Creators", path: "/creators", icon: Users, soon: true },
    ],
  },
  {
    title: "Site admin",
    adminOnly: true,
    items: [{ label: "Homepage", path: "/homepage", icon: LayoutTemplate }],
  },
];

export function StudioNav({ base, isAdmin }: { base: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const href = (path: string) => (path === "/" ? base || "/" : `${base}${path}`);

  return (
    <nav aria-label="Studio" className="flex gap-6 overflow-x-auto md:flex-col md:gap-5">
      {SECTIONS.filter((s) => !s.adminOnly || isAdmin).map((section, i) => (
        <div key={section.title ?? i} className="flex shrink-0 gap-1 md:flex-col">
          {section.title && (
            <p className="hidden px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase md:block">
              {section.title}
            </p>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            if (item.soon) {
              return (
                <span
                  key={item.path}
                  aria-disabled
                  title="Coming soon"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap text-muted-foreground/60"
                >
                  <Icon className="size-4" />
                  {item.label}
                  <span className="ml-auto hidden text-[10px] tracking-wide uppercase md:inline">
                    Soon
                  </span>
                </span>
              );
            }
            const target = href(item.path);
            const active = pathname === target;
            return (
              <Link
                key={item.path}
                href={target}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-muted",
                  active && "bg-muted font-medium text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
