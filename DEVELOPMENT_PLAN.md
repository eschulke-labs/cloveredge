# CasinoWatch — Development Plan

CasinoWatch is a newsletter-style site delivering customizable information about
online and land-based casinos — news, bonuses, reviews, odds, and regulatory
updates — where each user picks the topics, regions, and cadence they want.

Repo: [eschulke-labs/casinowatch](https://github.com/eschulke-labs/casinowatch) (private)

## Open decisions (currently deferred by design)

Two things were deliberately left undecided so the project could stay exploratory:

- **Monetization** — affiliate links, subscriptions, or none. The data model
  (`Bonus`, `Casino`, `User.subscriptionStatus`) supports affiliate tracking or
  paid tiers being bolted on later without a schema rewrite.
- **Content sourcing** — manual CMS entry vs. automated feeds. `ContentItem.source`
  (`MANUAL` | `FEED`) and `sourceUrl` exist so both paths can coexist from day one.

Revisit both once there's enough real content/usage to know what's worth building.

## Current state (scaffolded)

- Next.js 15 (App Router, TypeScript, Tailwind, ESLint) — `create-next-app`
- Prisma 7 ORM with a `postgresql` datasource, driver adapter pattern
  (`@prisma/adapter-pg`), schema at [`prisma/schema.prisma`](prisma/schema.prisma)
- Minimal landing page ([`src/app/page.tsx`](src/app/page.tsx)) showing the topic
  list and an email capture form (not yet wired to a backend)
- Prisma client singleton at [`src/lib/prisma.ts`](src/lib/prisma.ts)
- No database is provisioned yet — `DATABASE_URL` in `.env` is a placeholder

## Data model summary

| Model | Purpose |
|---|---|
| `User` | Account, jurisdiction, digest frequency, age-verification timestamp |
| `PreferenceTopic` | Opt-in unit — topic (e.g. "Bonus Offers"), region, or casino type |
| `Casino` | Online/land-based/hybrid casino entity, linked to content and bonuses |
| `Bonus` | Promo offers tied to a casino |
| `ContentItem` | All editorial content (news, reviews, odds, regulatory), source-tagged |
| `NewsletterIssue` | Snapshot of what was sent to a user, for history/analytics |

Age verification and jurisdiction fields exist on `User` from the start —
gambling-adjacent content commonly requires an age gate and jurisdiction-aware
disclaimers regardless of the eventual business model.

## Phase 1 — Foundation (local dev loop)

- [ ] Provision a Postgres instance (local via Docker, or a hosted free tier —
      Neon, Supabase, or Prisma Postgres) and set `DATABASE_URL`
- [ ] `npx prisma migrate dev` to create the initial schema
- [ ] Seed script (`prisma/seed.ts`) with a handful of topics, casinos, and
      sample content so the UI has real data to render
- [ ] Wire the landing page's email form to a `POST /api/subscribe` route that
      creates a `User` + selected `PreferenceTopic` links
- [ ] Basic auth (magic-link email is a natural fit for a newsletter product —
      no password to manage) — evaluate NextAuth/Auth.js

## Phase 2 — Content & personalization core

- [ ] Admin route (`/admin`, auth-gated) for manual `ContentItem` CRUD —
      this is the initial content pipeline regardless of future feed work
- [ ] Public content listing pages filtered by topic/region
- [ ] User preferences page (`/preferences`) — edit topics, region,
      digest frequency, pause/unsubscribe
- [ ] Content-to-topic tagging UI in the admin panel
- [ ] Age-gate + jurisdiction capture on signup, with region-specific
      responsible-gambling messaging (e.g. begambleaware.org, ncpgambling.org
      depending on locale)

## Phase 3 — Newsletter delivery

- [ ] Pick an email provider (Resend, Postmark, or SES) and add the SDK
- [ ] Digest generation job: for each active user, select `ContentItem`s
      matching their `PreferenceTopic`s published since their last issue
- [ ] Render digest as HTML email (React Email or MJML) + record a
      `NewsletterIssue`
- [ ] Scheduled send (cron — Vercel Cron, or a queue if volume grows) honoring
      `digestFrequency` (`DAILY` / `WEEKLY` / `INSTANT`)
- [ ] Unsubscribe/one-click-pause link in every email (CAN-SPAM/GDPR requirement)

## Phase 4 — Content sourcing at scale (only once manual entry proves the model)

- [ ] Identify 2-3 real feed sources (casino press-release APIs, odds
      providers, regulatory bulletin RSS) worth integrating
- [ ] Ingestion job writing into `ContentItem` with `source = FEED` and
      `sourceUrl` set, auto-tagged to `PreferenceTopic`s where possible
- [ ] De-duplication / editorial review queue before FEED content publishes
      alongside MANUAL content

## Phase 5 — Monetization (only once a direction is chosen)

- Affiliate path: extend `Bonus`/`Casino` with tracked outbound links,
  disclosure banners, per-partner reporting
- Subscription path: Stripe integration, tier gating on content/topics,
  billing portal
- Either path needs jurisdiction-aware compliance review before launch —
  gambling advertising rules vary significantly by country/state

## Non-functional considerations throughout

- **Compliance**: age verification, responsible-gambling resources, and
  jurisdiction disclaimers are already baked into the schema — keep them
  visible in the UI at every phase, not bolted on before launch
- **Testing**: add Playwright/Vitest once there's real user-facing logic
  (subscribe flow, digest generation) worth protecting from regressions
- **Deployment**: Vercel is the path of least resistance for Next.js + Prisma;
  revisit only if a specific need (e.g. long-running ingestion jobs) requires it

## Immediate next steps

1. Provision a database and run the first migration (Phase 1)
2. Seed sample content and confirm the topic list on the landing page can
   come from the DB instead of the hardcoded array in `page.tsx`
3. Build the subscribe API route and preferences page
