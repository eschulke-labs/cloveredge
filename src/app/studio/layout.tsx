import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getStudioAccess, getStudioBase } from "@/lib/studio";
import { studioHref } from "@/lib/studio-routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudioNav } from "./_components/StudioNav";
import { signInToStudio, signOutOfStudio } from "./actions";

export const metadata: Metadata = {
  title: { default: "CloverEdge Studio", template: "%s · CloverEdge Studio" },
  robots: { index: false, follow: false },
};

function Wordmark() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <span
        aria-hidden
        className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-600 text-sm"
      >
        🎲
      </span>
      CloverEdge <span className="font-normal text-muted-foreground">Studio</span>
    </span>
  );
}

function GateCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-16">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <Wordmark />
        {children}
      </div>
    </main>
  );
}

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const [session, access, base] = await Promise.all([auth(), getStudioAccess(), getStudioBase()]);

  if (!session?.user) {
    return (
      <GateCard>
        <h1 className="mt-6 text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The Studio is for CloverEdge staff. We&apos;ll email you a sign-in link.
        </p>
        <form action={signInToStudio} className="mt-5 space-y-3">
          <Input type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
          <Button type="submit" className="w-full">
            Email me a sign-in link
          </Button>
        </form>
      </GateCard>
    );
  }

  if (!access) {
    return (
      <GateCard>
        <h1 className="mt-6 text-lg font-semibold">No Studio access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re signed in as <strong>{session.user.email}</strong>, but this account
          isn&apos;t a reviewer or admin. Ask an admin to give you access.
        </p>
        <form action={signOutOfStudio} className="mt-5">
          <Button type="submit" variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </GateCard>
    );
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b bg-muted/40 px-4 py-4 md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0 md:py-6">
        <div className="mb-4 flex items-center justify-between md:mb-8 md:px-2">
          <Link href={studioHref(base)}>
            <Wordmark />
          </Link>
          <form action={signOutOfStudio} className="md:hidden">
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
        <StudioNav base={base} isAdmin={access.isAdmin} />
        <div className="mt-4 hidden border-t pt-4 md:mt-auto md:block md:px-2">
          <p className="truncate text-xs text-muted-foreground" title={access.email ?? undefined}>
            {access.email}
          </p>
          <p className="text-xs text-muted-foreground">{access.isAdmin ? "Admin" : "Reviewer"}</p>
          <form action={signOutOfStudio} className="mt-2">
            <Button type="submit" variant="ghost" size="sm" className="-ml-2.5">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
