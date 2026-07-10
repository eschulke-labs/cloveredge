# CasinoWatch — Development Plan

CasinoWatch is a newsletter-style site delivering customizable information about
online and land-based casinos — news, bonuses, reviews, odds, and regulatory
updates. The homepage works like MSN.com: a public, browsable, editorially
curated dashboard that anyone can see without an account, with personalization
layered on top for both anonymous visitors and signed-in users.

Repo: [eschulke-labs/casinowatch](https://github.com/eschulke-labs/casinowatch) (private)

## Open decisions (currently deferred by design)

- **Monetization** — affiliate links, subscriptions, or none. The data model
  supports affiliate tracking or paid tiers being bolted on later.
- **Content sourcing** — manual CMS entry vs. automated feeds, both supported
  from day one via `ContentItem.source` (`MANUAL` | `FEED`).

Revisit both once there's enough real content/usage to know what's worth building.

## Resources & external data sources (researched)

| Need | Source | Notes |
|---|---|---|
| Prediction market odds | [Polymarket Gamma/CLOB/Data API](https://docs.polymarket.com/) | No key needed for catalogue browsing. Prices are implied probabilities (0–1), not bookmaker-style odds. Poll and cache — don't hit live on every request. |
| Casino/YouTube videos | [YouTube Data API v3](https://developers.google.com/youtube/v3) | 10,000 free units/day. `search.list` = 100 units/call (~100/day cap); `videos.list` (known IDs) = 1 unit/call. Curate channel/video IDs manually or via creator submissions, refresh metadata cheaply, avoid repeated keyword search. |
| Slot ratings/RTP | Third-party aggregators (e.g. slot.report free API, SlotCatalog) | No single authoritative free source. Present as "aggregated third-party data," cite the source, don't imply certified/regulator figures. |
| Online casino ratings | **Build in-house** | No viable licensing path found for AskGamblers/Casino.org-style data — it's proprietary editorial content; scraping it is a ToS/legal risk. CasinoWatch needs its own rating methodology (see Phase 3). |
| Land-based casino info | [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview) | Legitimate documented access to name, address, hours, public rating, review snippets. Paid beyond a free monthly credit — budget for it. |
| Sportsbook odds (optional, secondary) | The Odds API / OddsPapi / SportsGameOdds | Only pursue if sportsbook-style odds (not just prediction markets) become a priority — adds licensing cost and a second odds data model. |

**Compliance flag**: displaying casino ratings, bonuses, or promotional content
crosses into gambling-advertising territory in many jurisdictions (UK, several
US states, etc.), which can require its own registration/licensing separate
from running a general news site. This needs a real legal review before any
promotional or affiliate content goes live — it's out of scope for this
document to resolve, but it should gate Phase 5 (Monetization), not just be a
footnote.

## Current state (scaffolded)

- Next.js 15 (App Router, TypeScript, Tailwind, ESLint)
- Prisma 7 ORM, schema at [`prisma/schema.prisma`](prisma/schema.prisma)
- Minimal landing page ([`src/app/page.tsx`](src/app/page.tsx)) — topic list +
  email capture, not yet the full MSN-style dashboard described below
- Prisma client singleton at [`src/lib/prisma.ts`](src/lib/prisma.ts)
- No database provisioned yet

## Data model summary (current + planned additions)

| Model | Purpose | Status |
|---|---|---|
| `User` | Account, jurisdiction, digest frequency, age-verification | Built |
| `PreferenceTopic` | Opt-in unit — topic, region, or casino type | Built |
| `Casino` | Online/land-based/hybrid entity | Built — needs rating breakdown fields (Phase 3) |
| `Bonus` | Promo offers tied to a casino | Built |
| `ContentItem` | Editorial content, source-tagged | Built |
| `NewsletterIssue` | Sent-issue snapshot | Built |
| `HomepageModule` | Configurable homepage rail (hero, category rail, widget) with ordering/curation flags | Planned — Phase 2 |
| `GuestSignal` | Anonymous, cookie-keyed lightweight interest signal (no PII) for guest personalization | Planned — Phase 2 |
| `SlotGame` | Slot title, provider, RTP, volatility, source attribution | Planned — Phase 3 |
| `CasinoRatingCriteria` | Scored sub-categories (trust, payout speed, game variety, support) rolling up to `Casino.ratingAvg` | Planned — Phase 3 |
| `OddsSnapshot` | Cached Polymarket market/price snapshot, polled periodically | Planned — Phase 4 |
| `VideoEmbed` | YouTube video reference + channel metadata, tied to `ContentItem` or standalone | Planned — Phase 4 |
| `CreatorProfile` | Content creator/channel submission for promotion (status: pending/approved, featured flag) | Planned — Phase 4 |

## Phase 1 — Foundation (local dev loop)

- [ ] Provision Postgres (local Docker, or Neon/Supabase/Prisma Postgres free tier)
- [ ] `npx prisma migrate dev` for the initial schema
- [ ] Seed script with sample topics, casinos, and content
- [ ] `POST /api/subscribe` route wiring the landing page form to `User` + `PreferenceTopic`
- [ ] Basic auth — magic-link email fits a newsletter product well (no password)

## Phase 2 — MSN-style public homepage & guest personalization

The homepage must be fully useful with zero login — that's the MSN model:
editorially curated, browsable, and lightly personalized based on behavior
rather than an account.

- [ ] `HomepageModule` model + admin ordering UI: hero/featured carousel,
      then category rails ("Casino News", "Bonus Offers", "Slot Ratings",
      "Prediction Market Odds", "Land-Based Events", "Featured Creators")
- [ ] Server-rendered hero + rails pulling from `ContentItem`, cached/ISR'd —
      this is the page's default, logged-out state
- [ ] Guest personalization: a `GuestSignal` cookie (anonymous ID, no PII)
      recording which rails/topics a visitor engages with, used only to
      **reorder/emphasize** existing rails — never to hide the base content
- [ ] Signed-in personalization builds on top: explicit `PreferenceTopic`
      selection (already modeled) overrides/extends the guest signal
- [ ] "Trending now" module — simple aggregate click counts across all guest
      sessions (anonymized), refreshed periodically, no per-user tracking needed

## Phase 3 — Ratings: slots & casinos

- [ ] `SlotGame` model + integration with a slot data API (slot.report or
      similar) for RTP/volatility/provider — clearly attributed, refreshed on
      a schedule (not live per-request)
- [ ] `CasinoRatingCriteria` — define CasinoWatch's own scoring rubric
      (e.g. trust/licensing, payout speed, game variety, bonus fairness,
      support quality); editorial team scores each `Casino` manually at first
- [ ] Land-based casino profiles seeded from Google Places API (address,
      hours, public rating) + editorial notes layered on top
- [ ] Ratings surfaced as their own homepage rail and on casino detail pages

## Phase 4 — Odds, video, and creator promotion

- [ ] Polymarket integration: scheduled job polling Gamma API for relevant
      markets (sports, gambling-industry, or general interest — TBD which
      categories fit the audience), stored as `OddsSnapshot`, rendered as a
      homepage widget with an "implied probability, not a bet" disclaimer
- [ ] `VideoEmbed` model + YouTube integration: curate channel/video IDs
      (via editorial pick or creator submission below), refresh via cheap
      `videos.list` calls, embed in a "Watch" rail
- [ ] Creator promotion program:
  - [ ] Public "submit your channel" form → `CreatorProfile` (pending status)
  - [ ] Admin approval workflow
  - [ ] Approved creators get a profile page + eligibility for the
        "Featured Creators" rail; simple manual curation of what's featured
        to start, no algorithmic ranking needed yet
- [ ] (Optional) Sportsbook odds via a paid odds API, only if Polymarket-style
      prediction data proves insufficient for what users want

## Phase 5 — Newsletter delivery

- [ ] Email provider (Resend/Postmark/SES)
- [ ] Digest generation: per active user, select `ContentItem`s matching their
      topics since their last issue
- [ ] HTML email rendering (React Email/MJML) + `NewsletterIssue` record
- [ ] Scheduled send honoring `digestFrequency`, with one-click unsubscribe

## Phase 6 — Content sourcing at scale

- [ ] Once manual entry + the Phase 4 integrations prove the model, evaluate
      additional automated feeds (press releases, regulatory bulletins)
- [ ] De-duplication / editorial review queue before `FEED` content publishes

## Phase 7 — Monetization (gated on legal review)

- Affiliate path: tracked outbound links, disclosure banners, per-partner
  reporting on `Bonus`/`Casino`
- Subscription path: Stripe, tier gating on content/topics
- **Do not build either without confirming gambling-advertising compliance
  requirements for the target jurisdictions first** — see compliance flag above

## Non-functional considerations throughout

- **Compliance**: age verification, responsible-gambling resources, and
  jurisdiction disclaimers stay visible at every phase
- **Rate limits & caching**: every external integration (Polymarket, YouTube,
  slot data, Places) must be polled/cached server-side on a schedule, never
  called live per page view — quota and cost both depend on this
- **Testing**: Playwright/Vitest once there's real user-facing logic worth
  protecting (subscribe flow, digest generation, homepage personalization)
- **Deployment**: Vercel remains the path of least resistance

## Immediate next steps

1. Phase 1: provision a database, run the first migration, seed sample content
2. Phase 2: replace the placeholder landing page with the `HomepageModule`-driven
   hero + rails layout — this is the highest-leverage next step since it's the
   first thing every visitor sees
3. Prototype the Polymarket Gamma API call (unauthenticated, low risk) to
   confirm what market categories are actually worth showing before building
   the full odds widget
