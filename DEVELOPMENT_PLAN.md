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

**Confirmed PAID-tier perk**: the ability to post comments/reviews (see
Phase 3) is gated to paid subscribers, not just any signed-in free account —
this is a deliberate incentive to upgrade, not merely content gating.

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

- **Live at [casinowatch.vercel.app](https://casinowatch.vercel.app)** —
  deployed via Vercel CLI (project `eschulke-labs/casinowatch`), manual
  deploys only (GitHub auto-deploy-on-push isn't connected — Vercel's GitHub
  App wasn't authorized for this account; `vercel deploy --prod` from the
  repo root redeploys after any change)
- Next.js 15 (App Router, TypeScript, Tailwind, ESLint)
- Prisma 7 ORM, schema at [`prisma/schema.prisma`](prisma/schema.prisma), migrated
  and seeded against a live Postgres database
- **Database**: a free Prisma Postgres dev instance (claimed, no longer
  expiring). **Production and local dev currently share this same database**
  — anything typed into the live site (subscribes, guest clicks) shows up
  locally too, and vice versa. Fine for a demo/share link; split into
  separate dev/prod databases before any real public launch.
- **Magic-link sign-in doesn't work for visitors on the live site yet** —
  no email provider is configured (Phase 5), so the login link only ever
  logs to the server console, which visitors can't see. Browsing, rails,
  personalization, and the paywall teaser all work for anonymous visitors;
  actually signing in only works for whoever has server log access
  (`vercel logs`) right now.
- **Homepage** ([`src/app/page.tsx`](src/app/page.tsx)) is the MSN-style
  dashboard described in Phase 2: hero, Trending Now, and topic rails driven
  by `HomepageModule`, all visible with zero login
- `POST /api/subscribe` — creates/updates a `User` with selected `PreferenceTopic`s
- Magic-link auth via Auth.js (`src/lib/auth.ts`), Prisma-backed sessions.
  No real email provider configured yet — magic links log to the server
  console in dev. Swap in `AUTH_RESEND_KEY` (or another provider) for Phase 5.
- `src/proxy.ts` assigns an anonymous `cw_guest_id` cookie to every visitor
  (Next.js renamed `middleware.ts` → `proxy.ts` in this version — verified
  against the bundled docs, not assumed from training data)
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
| `HomepageModule` | Configurable homepage rail (hero, category rail, trending widget) with ordering/active flags | Built |
| `GuestSignal` | Anonymous, cookie-keyed lightweight interest signal (no PII) for guest personalization | Built |
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

## Phase 2 — MSN-style public homepage & guest personalization — done

The homepage is fully useful with zero login — that's the MSN model:
editorially curated, browsable, and lightly personalized based on behavior
rather than an account. All items below verified end-to-end in the browser,
not just written.

- [x] `HomepageModule` model + admin ordering UI (`/admin/homepage`, gated on
      `User.isAdmin`): hero, Trending Now widget, and topic rails, each with
      an editable order + active toggle, persisted via a Server Action —
      verified: reordering "Land-Based Openings" to 0 actually changed its
      DB row and the rendered position
- [x] Server-rendered hero + rails pulling from `ContentItem`, this is the
      page's default, logged-out state (`getHomepageData` in `src/lib/homepage.ts`)
- [x] Guest personalization: an anonymous `cw_guest_id` cookie (set in
      `src/proxy.ts`, no PII) plus `GuestSignal` rows recording which topics a
      visitor clicks into, boosting (not hiding) matching rails — verified:
      5 clicks on "Regulatory & Legal News" moved that rail to the top
- [x] Signed-in personalization: explicit `PreferenceTopic` selections score
      higher than guest clicks, so an account's stated preferences win
- [x] Trending Now module: top 3 topics by aggregate `GuestSignal` weight
      across all guests — verified rendering after generating signals
- [x] Paywall teaser UI: rail/hero cards always show title + excerpt
      (`ContentCard`, `Hero`) with a "Subscribers only" badge; the full body
      is only gated at `/content/[slug]`, where non-entitled viewers see an
      upgrade CTA instead of `item.body` — verified for both a `PAID` item
      (gated) and a `FREE` item (shown in full) while signed in as a FREE user

Not built in this phase (left for later, not blocking): cached/ISR'd rails
(currently fetched fresh per request — fine at current scale, revisit if
traffic grows), and per-content-item (vs. per-topic) guest signal granularity.

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

### User reviews/comments — PAID-tier feature (schema already built)

Paid subscribers can leave a comment + optional 1-5 rating on a casino —
their own experience, what they liked or didn't. `Comment` model already
exists (`prisma/schema.prisma`), tied to `User` and an optional `Casino`,
with a `PENDING`/`APPROVED`/`REJECTED` moderation status.

- **Decided**: commenting requires `User.tier == PAID`. Free accounts and
  anonymous visitors can read approved comments but not post them — this is
  a deliberate subscribe incentive, not just a spam-prevention measure.
- [ ] Comment submission UI on casino detail pages, visible only to signed-in
      `PAID` users; signed-in `FREE` users see an upgrade prompt instead of
      the form (same pattern as the Phase 2 paywall teaser)
- [ ] Server-side enforcement: the comment-creation route must check
      `session.user.tier === "PAID"` itself, not just hide the UI — same
      principle as the Phase 7 entitlement-enforcement note
- [ ] Moderation queue in admin (approve/reject before a comment goes public)
      — necessary for a regulated-adjacent content site to avoid spam/abuse
- [ ] Display approved comments on casino profile pages (visible to everyone,
      posting still PAID-only); roll up an average user rating alongside
      (not blended with) the editorial `ratingAvg` — keep "what our editors
      think" and "what users say" visibly separate
- [ ] When `SlotGame` lands, add a nullable `slotGameId` to `Comment` the same
      way `casinoId` works now, so paid users can review specific games too

## Phase 4 — Odds, video, and creator promotion

**"Prediction Markets" and "Game & Casino Videos" already exist as selectable
preference topics and homepage rails** (subscribe form + `/`), each seeded
with one placeholder `ContentItem` so the rail isn't empty. What's still
missing is the actual automated sourcing — right now those two rails only
show hand-written placeholder items, not live Polymarket/YouTube data.

- [ ] Polymarket integration: scheduled job polling Gamma API for relevant
      markets (sports, gambling-industry, or general interest — TBD which
      categories fit the audience), stored as `OddsSnapshot`, rendered in the
      existing "Prediction Markets" rail (replacing the placeholder item)
      with an "implied probability, not a bet" disclaimer
- [ ] `VideoEmbed` model + YouTube integration: curate channel/video IDs
      (via editorial pick or creator submission below), refresh via cheap
      `videos.list` calls, embed in the existing "Game & Casino Videos" rail
      (replacing the placeholder item)
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

1. Phase 3: casino/slot ratings + the paid-tier comment/review submission UI
   (schema and access-tier rules already decided, just needs building)
2. Prototype the Polymarket Gamma API call (unauthenticated, low risk) to
   confirm what market categories are actually worth showing before building
   the full odds widget (Phase 4)
3. Revisit caching (ISR or a shorter-lived cache layer) on the homepage rails
   once there's enough content volume for the per-request DB fetch to matter
