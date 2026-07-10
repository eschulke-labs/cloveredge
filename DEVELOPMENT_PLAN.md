# CasinoWatch — Development Plan

CasinoWatch is a newsletter-style site delivering customizable information about
online and land-based casinos — news, bonuses, reviews, odds, and regulatory
updates. The homepage works like MSN.com: a public, browsable, editorially
curated dashboard that anyone can see without an account, with personalization
layered on top for both anonymous visitors and signed-in users.

Repo: [eschulke-labs/casinowatch](https://github.com/eschulke-labs/casinowatch) (private)

## Monetization: subscription paywall (decided)

Three access tiers:

1. **Anonymous** — no account. Sees the public MSN-style homepage/rails (Phase 2).
2. **Free account** — signed up, gets newsletter delivery + basic preferences.
3. **Paid subscriber** — everything free gets, plus `AccessTier.PAID`-gated content.

`User.tier` and `ContentItem.tier` (`AccessTier`: `FREE` | `PAID`) are already in
the schema. What's actually gated (deeper real-time data vs. exclusive editorial
vs. both) is a content/product decision made per-item at publish time, not a
schema one — deliberately generic so it doesn't need a migration later. Billing
integration (Stripe, entitlement enforcement) is Phase 7.

## Open decisions (currently deferred by design)

- **Content sourcing** — manual CMS entry vs. automated feeds, both supported
  from day one via `ContentItem.source` (`MANUAL` | `FEED`).
- **Affiliate links** — separate from the subscription paywall above; still
  undecided whether to add affiliate tracking on top. See Phase 7.

Revisit once there's enough real content/usage to know what's worth building.

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

## Current state

- Next.js 15 (App Router, TypeScript, Tailwind, ESLint)
- Prisma 7 ORM, schema at [`prisma/schema.prisma`](prisma/schema.prisma), migrated
  and seeded against a live Postgres database
- **Database**: a free Prisma Postgres dev instance (created via `create-db`).
  **This auto-deletes on 2026-07-11 unless claimed** — claim it at the URL
  printed during setup, or it becomes a real (not free-tier-expiring) database
  once claimed. Swap for a production instance before launch regardless.
- Landing page ([`src/app/page.tsx`](src/app/page.tsx)) — topic list is now
  live from the DB, with a working subscribe form; not yet the full MSN-style
  dashboard described in Phase 2
- `POST /api/subscribe` — creates/updates a `User` with selected `PreferenceTopic`s
- Magic-link auth via Auth.js (`src/lib/auth.ts`), Prisma-backed sessions.
  No real email provider configured yet — magic links log to the server
  console in dev. Swap in `AUTH_RESEND_KEY` (or another provider) for Phase 5.
- Prisma client singleton at [`src/lib/prisma.ts`](src/lib/prisma.ts)

## Data model summary (current + planned additions)

| Model | Purpose | Status |
|---|---|---|
| `User` | Account, jurisdiction, digest frequency, age-verification, `tier` (FREE/PAID) | Built |
| `PreferenceTopic` | Opt-in unit — topic, region, or casino type | Built |
| `Casino` | Online/land-based/hybrid entity | Built — needs rating breakdown fields (Phase 3) |
| `Bonus` | Promo offers tied to a casino | Built |
| `ContentItem` | Editorial content, source-tagged, `tier`-gated (FREE/PAID) | Built |
| `NewsletterIssue` | Sent-issue snapshot | Built |
| `Comment` | User review/comment on a casino experience, optional 1-5 rating, moderation status | Built |
| `Account` / `Session` / `VerificationToken` | Auth.js magic-link sign-in (Prisma adapter) | Built |
| `HomepageModule` | Configurable homepage rail (hero, category rail, widget) with ordering/curation flags | Planned — Phase 2 |
| `GuestSignal` | Anonymous, cookie-keyed lightweight interest signal (no PII) for guest personalization | Planned — Phase 2 |
| `SlotGame` | Slot title, provider, RTP, volatility, source attribution | Planned — Phase 3 |
| `CasinoRatingCriteria` | Scored sub-categories (trust, payout speed, game variety, support) rolling up to `Casino.ratingAvg` | Planned — Phase 3 |
| `OddsSnapshot` | Cached Polymarket market/price snapshot, polled periodically | Planned — Phase 4 |
| `VideoEmbed` | YouTube video reference + channel metadata, tied to `ContentItem` or standalone | Planned — Phase 4 |
| `CreatorProfile` | Content creator/channel submission for promotion (status: pending/approved, featured flag) | Planned — Phase 4 |

## Phase 1 — Foundation (local dev loop) — done

- [x] Provision Postgres — Prisma Postgres free dev instance (**claim it**, see above)
- [x] `npx prisma migrate dev` for the initial schema (+ auth models)
- [x] Seed script with sample topics, a casino, a bonus, and content items
      (`npm run db:seed`), including one `PAID`-tier item to exercise the paywall
- [x] `POST /api/subscribe` route wiring the landing page form to `User` + `PreferenceTopic`
      — verified end-to-end (form submit → row in Postgres)
- [x] Basic auth — Auth.js magic-link email, Prisma-backed sessions, verified
      end-to-end (sign-in → console-logged link → real session). Real email
      delivery still needs a provider key (Phase 5)

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
- [ ] Paywall teaser UI: rails render `PAID`-tier items for everyone (title +
      excerpt visible, per `ContentItem.excerpt`), but the full body is
      replaced with an upgrade CTA for anonymous/free viewers — the incentive
      to subscribe has to be visible, not hidden

## Phase 3 — Ratings, and user reviews/comments

- [ ] `SlotGame` model + integration with a slot data API (slot.report or
      similar) for RTP/volatility/provider — clearly attributed, refreshed on
      a schedule (not live per-request)
- [ ] `CasinoRatingCriteria` — define CasinoWatch's own scoring rubric
      (e.g. trust/licensing, payout speed, game variety, bonus fairness,
      support quality); editorial team scores each `Casino` manually at first
- [ ] Land-based casino profiles seeded from Google Places API (address,
      hours, public rating) + editorial notes layered on top
- [ ] Ratings surfaced as their own homepage rail and on casino detail pages

### User reviews/comments (schema already built)

Signed-in users can leave a comment + optional 1-5 rating on a casino —
their own experience, what they liked or didn't. `Comment` model already
exists (`prisma/schema.prisma`), tied to `User` and an optional `Casino`,
with a `PENDING`/`APPROVED`/`REJECTED` moderation status.

- **Assumption to confirm**: any signed-in user can comment (FREE or PAID
  tier) — comments aren't gated behind payment, since paying to unlock the
  ability to leave feedback would be an unusual paywall design. Flag if that's
  wrong.
- [ ] Comment submission UI on casino detail pages (requires sign-in — reuses
      Phase 1 auth)
- [ ] Moderation queue in admin (approve/reject before a comment goes public)
      — necessary for a regulated-adjacent content site to avoid spam/abuse
- [ ] Display approved comments on casino profile pages; roll up an average
      user rating alongside (not blended with) the editorial `ratingAvg` —
      keep "what our editors think" and "what users say" visibly separate
- [ ] When `SlotGame` lands, add a nullable `slotGameId` to `Comment` the same
      way `casinoId` works now, so users can review specific games too

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

## Phase 7 — Subscription billing (gated on legal review)

- [ ] Stripe integration: checkout, customer portal, webhook handling
      (subscription created/renewed/canceled → update `User.tier`)
- [ ] Server-side entitlement enforcement: any route/query serving
      `ContentItem` where `tier = PAID` must check the requesting user's
      `tier`, not just hide it client-side
- [ ] Pricing/plan decision (single tier vs. multiple paid tiers) — not yet made
- [ ] Optional, separate from the paywall: affiliate links (tracked outbound
      links, disclosure banners, per-partner reporting on `Bonus`/`Casino`) —
      still undecided whether to pursue this at all
- **Do not enable billing or affiliate links without confirming
  gambling-advertising compliance requirements for the target jurisdictions
  first** — see compliance flag above

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

1. **Claim the dev database** (see Current state above) before it expires
2. Phase 2: replace the placeholder landing page with the `HomepageModule`-driven
   hero + rails layout — this is the highest-leverage next step since it's the
   first thing every visitor sees
3. Prototype the Polymarket Gamma API call (unauthenticated, low risk) to
   confirm what market categories are actually worth showing before building
   the full odds widget
4. Confirm the comments-tier assumption above (Phase 3) before building the
   submission UI
