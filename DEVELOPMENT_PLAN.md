# CasinoWatch — Development Plan

CasinoWatch is a newsletter-style site delivering customizable information about
online and land-based casinos — news, bonuses, reviews, odds, and regulatory
updates. The homepage works like MSN.com: a public, browsable, editorially
curated dashboard that anyone can see without an account, with personalization
layered on top for both anonymous visitors and signed-in users.

Repo: [eschulke-labs/casinowatch](https://github.com/eschulke-labs/casinowatch) (private)

## Current priority: video filtering is the first main feature (building now)

Everything else in this document — ratings (Phase 3), prediction markets and
creator promotion (rest of Phase 4), newsletter delivery (Phase 5), feed
sourcing at scale (Phase 6), billing (Phase 7) — is real, scoped, and staying
in the plan, but is now explicitly **secondary**. It gets built over time.
The thing being built right now is: **letting people tell CasinoWatch what
videos they want to see.**

The video rail and the real slot-play videos in it (Phase 4) are the
foundation this sits on. What's missing is user input — right now the rail
shows the same fixed set to everyone. The feature:

1. **On-page filters, no account required** — filter chips above the video
   rail (and eventually its own `/videos` page once there's enough volume to
   justify one) for the dimensions `VideoEmbed` already has: game type
   (Slots/Blackjack/Roulette/Poker/Sports Betting), venue (Online/Land-Based),
   and a sort (Newest/Most Viewed). Implemented as URL search params
   (`?gameType=SLOTS`) rather than client-only state, so a filtered view is
   shareable/bookmarkable and stays consistent with how the rest of the site
   is server-rendered.
2. **Saved preference for signed-in users (later, not blocking)** — remember
   a user's last-used filter as their default view, and eventually feed the
   same filter dimensions into the Phase 5 newsletter digest so the emailed
   video picks match what someone actually filters for on-site.
3. Since only slots are populated right now, most filter combinations will
   return an empty state — that's expected and fine (clear "no blackjack
   videos yet" messaging beats hiding the option).

- [x] Filter chips UI — built as a dedicated `/videos` page
      ([`src/app/videos/page.tsx`](src/app/videos/page.tsx)) rather than
      cramming chips into the homepage rail's 4-item preview, since this is
      the first main feature and deserves its own page. The homepage rail
      now links out via "Filter & see all →" ([`src/components/Rail.tsx`](src/components/Rail.tsx))
- [x] Server-side filtering via URL search params
      ([`src/lib/videos.ts`](src/lib/videos.ts): `getVideos({ gameType, venueType, sort })`),
      no client JS — filter chips are plain links, so `/videos?gameType=SLOTS`
      is shareable/bookmarkable. Verified: filtering to `BLACKJACK` (no data
      yet) shows the empty state; `SLOTS` + `sort=popular` returns all 5
      real videos correctly ordered by view count (15,548 → 6,096 → 1,614 →
      887 → 350)
- [x] Empty-state messaging per filter combination — verified live
- [ ] (Later) persist a signed-in user's preferred filter as their default
- [ ] (Later) wire the same filter dimensions into the Phase 5 digest

## Monetization: advertising is primary, paid tier is not a growth priority (decided)

**The growth goal is free-account signups, not paid conversions.** The pitch
to a visitor is: create a free account and get customization (video filters,
topic preferences), notifications (the newsletter digest), and a curated
feed of videos/news/information tuned to you — that curation *is* the value
of the site. Revenue comes from **advertising**, not from charging visitors
to unlock content.

Three access tiers still exist in the schema, but the emphasis has shifted:

1. **Anonymous** — no account. Sees the public MSN-style homepage/rails (Phase 2).
2. **Free account — the actual growth target.** Signed up, gets newsletter
   delivery, saved preferences/filters, notifications. This is the
   "subscription" being sold, and it's free.
3. **Paid subscriber** — `AccessTier.PAID`-gated content (e.g. the comment/
   review feature) still exists and is still real, but converting people to
   *pay* is explicitly **not a current priority**. Don't build more paid-only
   features before the free-account growth loop (video filters →
   personalization → newsletter → repeat visits) is working.

`User.tier` and `ContentItem.tier` (`AccessTier`: `FREE` | `PAID`) remain in
the schema exactly as built — nothing to undo. Stripe/billing work (Phase 7)
is now explicitly low priority, not removed.

**Advertising research**: standard Google AdSense / Ad Manager **does not
work here** — Google's publisher policy restricts gambling-adjacent content
from standard AdSense placements, separate from (and stricter than) the
advertiser-side gambling-ad certification process. The viable paths instead:

- **Gambling-specific ad networks** (RichAds, Adsterra, AdMaven, PropellerAds,
  and similar) — CPM/CPC display advertising built for this vertical. Worth
  a UX/brand caution: several of these networks lean on aggressive formats
  (popunders, push notifications) that could clash with the site's editorial
  feel — vet format options per-network before integrating, don't assume
  "banner ad" is the only option offered.
- **Affiliate revenue-share deals** with licensed casino operators — the
  highest-earning model in this vertical per the research, but this is the
  same mechanism as the "Affiliate links" open decision below: it requires
  partnering with properly licensed operators, clear disclosure, and the
  same compliance review as promotional content generally.

Both paths route through the same compliance gate as before — see the flag
below. Advertising doesn't get a free pass just because it's not the paywall.

## Open decisions (currently deferred by design)

- **Content sourcing** — manual CMS entry vs. automated feeds, both supported
  from day one via `ContentItem.source` (`MANUAL` | `FEED`).
- **Which advertising path(s)** — gambling-specific ad network, affiliate
  revenue-share, or both. Both are viable per the research above; which to
  pursue (and which specific network/partners) isn't decided yet. **Not
  blocking anything** — any network-specific limits or restrictions get
  dealt with whenever that work actually starts, not now. The current
  priority is the free-account value (video filtering), not ad setup.

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
| Advertising (primary monetization) | Gambling-specific ad networks: RichAds, Adsterra, AdMaven, PropellerAds, etc. | **Standard Google AdSense doesn't work for gambling-adjacent content** — restricted by Google's publisher policy. These networks are built for this vertical instead; some lean on aggressive formats (popunder/push) worth vetting per-network before integrating. |
| Affiliate revenue-share (alternate/complementary monetization) | Direct deals with licensed operators, or networks like Income Access / Catena Media | Reportedly the highest-earning model in this vertical, but requires partnering with properly licensed operators and clear disclosure — same compliance gate as advertising. |

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
- `YOUTUBE_API_KEY` (local `.env` only, restricted to YouTube Data API v3) —
  used by `prisma/seed.ts` to pull real video data at seed time. The running
  app doesn't call the YouTube API itself yet (videos are read from
  `VideoEmbed` rows already in Postgres), so this key isn't needed on Vercel
  until Phase 4's scheduled refresh job gets built.

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
| `VideoEmbed` | Real YouTube video (official metadata) + `gameType`/`venueType`/`sentiment` (classification, not official API fields), one-to-one with a `ContentItem` | Built — populated with 5 real slot videos; other game types/automation still open |
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

**Decided**: regular users don't get a direct "drag to reorder my homepage"
control — only admins do (`/admin/homepage`). For everyone else, ordering is
*indirect*: picking topics in the subscribe form, or just clicking around as
a guest, is what surfaces "the modules that matter to them." Considered
adding an explicit per-user reorder UI and decided against it for now — the
indirect signal is the intended experience, not a placeholder for it.

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
### YouTube gameplay videos — slots live, other game types researched but not built

**Live now**: `VideoEmbed` model (built) + real YouTube Data API integration,
populating the "Game & Casino Videos" rail with 5 real slot-play videos
(`prisma/seed.ts`) — this is the initial focus per direction; other game
types are researched below but intentionally not populated yet.

**API research findings** (pulled real sample videos, not just docs):

- Official metadata (`videos.list` with `snippet`/`contentDetails`/
  `statistics`) gives title, description, creator tags, duration, view/like
  counts, and category — but **creator-set tags are unreliable even from
  established channels** (a well-known gambling channel posted real
  blackjack footage with zero tags). Title text is the most consistently
  present signal.
- **`categoryId` is too coarse to trust alone** — real gameplay and an
  unrelated indie-game trailer both landed in category 20 ("Gaming").
  Keyword search alone surfaces false positives (non-gameplay content) that
  need filtering before display.
- **No official transcript access** for videos you don't own (`captions.
  download` requires OAuth + ownership). The common workaround (scraping
  YouTube's internal `timedtext` endpoint) is not sanctioned by YouTube's
  terms — decided **not** to do this. Thumbnail image + title/description
  is the fallback for sparse-metadata videos instead, and it works: tested
  on a 24-second untagged clip and correctly identified it as a blackjack
  table, a big chip stack, and a streamer reacting, purely from the image.
- `gameType` / `venueType` / `sentiment` on `VideoEmbed` are **not official
  YouTube fields** — they're filled in by a classification step (title +
  description + tags + thumbnail review), currently done manually per video
  as a training exercise, not yet automated.

**Open classification questions from the first training pass** (real
examples hit all of these — revisit before automating):
1. Keyword search returns non-gameplay false positives (e.g. a video-game
   trailer that mentions "casino") — needs a pre-filter, not yet designed.
2. Some videos give no signal on outcome (e.g. an ongoing "Part 2" session)
   — currently tagged `sentiment: UNKNOWN` rather than guessed.
3. Metadata can conflict (one video's title says "Vegas," its tags mention
   online-casino platform names) — no resolution rule decided yet for
   title-vs-tags disagreement.
4. Poker tournament coverage doesn't fit personal win/loss `sentiment` the
   way solo-play clips do — may need its own `content_type` distinction
   from personal gameplay clips rather than forcing it into `sentiment`.

- [ ] Automate the classification step (currently manual) once the open
      questions above have real answers — likely an LLM call per video
      given title/description/tags/thumbnail, not a hand-written rule set
- [ ] Expand `VideoEmbed` population beyond slots to blackjack/roulette/
      poker/sports betting once the classification approach is solid
- [ ] Refresh job (currently one-time seed data) — poll for new videos on
      a schedule via cheap `videos.list` calls per the quota-caching rule
- [ ] Filters UI on the "Game & Casino Videos" rail using `gameType`/
      `venueType`/`sentiment` once there's enough classified volume to filter
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

Advertising is the priority within this phase; paid billing is real but
explicitly not urgent — see "Monetization" near the top of this document.

- [ ] Pick and integrate a gambling-specific ad network (RichAds/Adsterra/
      AdMaven/PropellerAds or similar) — ad placements on the homepage rails
      and/or content pages, format TBD (avoid aggressive popunder/push formats
      that clash with the editorial feel unless there's a clear reason to accept that)
- [ ] Affiliate revenue-share deals with licensed operators (tracked outbound
      links, disclosure banners, per-partner reporting on `Bonus`/`Casino`) —
      pursue alongside or instead of ad-network placements; still undecided
      which path(s) to prioritize
- [ ] **(Lower priority)** Stripe integration: checkout, customer portal,
      webhook handling (subscription created/renewed/canceled → update
      `User.tier`) — only build once the free-account growth loop (video
      filters → personalization → newsletter) is actually working
- [ ] **(Lower priority)** Server-side entitlement enforcement: any route/
      query serving `ContentItem` where `tier = PAID` must check the
      requesting user's `tier`, not just hide it client-side
- [ ] **(Lower priority)** Pricing/plan decision (single tier vs. multiple
      paid tiers) — not yet made, not urgent
- **Do not enable ad placements, affiliate links, or billing without
  confirming gambling-advertising compliance requirements for the target
  jurisdictions first** — see compliance flag above; this applies to
  advertising exactly as much as it applied to the paywall

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

1. **Video filtering** (see "Current priority" above) — filter chips + URL
   search params on the video rail; this is the active focus
2. Everything below is real roadmap, not urgent right now:
   - Phase 3: casino/slot ratings + the paid-tier comment/review submission UI
   - Prototype the Polymarket Gamma API call before building the odds widget
   - Revisit caching (ISR or a shorter-lived cache layer) on homepage rails
     once there's enough content volume for the per-request DB fetch to matter
