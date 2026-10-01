# CloverEdge

A newsletter-style site delivering customizable information about online and
land-based casinos — news, bonuses, reviews, and regulatory updates — where
each user picks the topics, regions, and cadence they want.

**Why the name**: Clover is luck; Edge is the advantage the site's
AI-built knowledge graph gives a player — deliberately doubling as the
literal graph *edges* connecting videos, games, creators, and providers.
See DEVELOPMENT_PLAN.md's "Current priority" section for what that
knowledge graph actually is.

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for the full roadmap, current
state, and — just as important — *why* things are built the way they are,
not only what's done. Read it before making architectural changes; it's the
project's single source of truth for the reasoning behind decisions, not
just a task list.

## Getting started

```bash
npm install
# set DATABASE_URL in .env to a real Postgres instance, then:
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 (App Router, TypeScript, Tailwind)
- Prisma 7 (Postgres, driver adapter pattern)
