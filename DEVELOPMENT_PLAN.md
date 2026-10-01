# CloverEdge — Development Plan

CloverEdge (formerly CasinoWatch — renamed 2026-09-30; code, docs, and
config are now renamed throughout. Two intentional exceptions: the seeded
demo content's `slug` and the demo admin email `admin@casinowatch.local`
stay as-is since both are upsert keys in `prisma/seed.ts` — renaming them
would create duplicate rows rather than rename the existing ones, and
neither is user-facing. The Vercel project itself has been renamed and is
live at `cloveredge.vercel.app`) is a newsletter-style site
delivering customizable information about online and land-based casinos —
news, bonuses, reviews, odds, and regulatory updates. The homepage works
like MSN.com: a public, browsable, editorially curated dashboard that
anyone can see without an account, with personalization layered on top for
both anonymous visitors and signed-in users.

**The name**: Clover is luck; Edge is the advantage the AI-built knowledge
graph (see "Current priority" below) gives a player — deliberately doubling
as the literal graph *edges* connecting videos, games, creators, and
providers together.

Repo: [eschulke-labs/cloveredge](https://github.com/eschulke-labs/cloveredge) (private)

## Foundational principle: business continuity, governance, and documentation (decided: 2026-09-30)

Explicit direction from Edward: this is not a launch-day checklist item —
it's a foundation the rest of the build has to respect going forward, on
equal footing with the feature roadmap below, not subordinate to it.

**Business continuity — don't let the project depend on one point of
failure.**

- **Database.** Production and local dev currently share one free Prisma
  Postgres dev instance (see "Current state" below) — no confirmed
  automated-backup guarantee, and no separation between "a schema
  experiment breaks something" and "the live site goes down." Splitting
  into separate dev/prod databases on a provider with automated backups
  (Neon, Supabase, Vercel Postgres, or a paid Prisma Postgres tier) is now
  a near-term priority, not just a "before public launch" nice-to-have.
- **Credentials/access.** The GitHub org, Vercel account, and all API keys
  (YouTube, Resend) currently sit with one person. Continuity means a
  second trusted person having emergency access — a backup owner/admin on
  the GitHub org and Vercel account — and credentials living in a shared
  vault (a password manager with sharing, e.g. 1Password or Bitwarden)
  rather than only in one person's local `.env` file or memory.
- **Deployment.** **Done (2026-09-30)**: Vercel's GitHub App is connected
  (Settings → Git shows `eschulke-labs/cloveredge`) — pushes to `main` now
  deploy automatically, removing the dependency on someone remembering to
  run `vercel deploy --prod` manually. See "Hosting & deployment" below for
  the one-time catch-up note: commits pushed *before* the connection was
  made don't retroactively trigger a deploy, only new pushes do.

**Governance — every consequential action should be attributable,
reversible, and access-controlled.**

- **Access control.** The `isAdmin`/`isContentReviewer` role split (see
  "Human-in-the-loop," below) is the first real piece of this —
  least-privilege by default, not everyone getting full admin access.
- **Audit trail.** `AuditLogEntry` (see Data model summary) exists
  specifically for this: who did what, when, to what — generic enough to
  log any admin/moderation action without a schema change per action type.
  Not fully wired in yet; each admin feature should start writing entries
  as it's built or touched, including retrofitting the already-built
  `/admin/homepage` Server Actions, which are consequential and currently
  unlogged.
- **Compliance sign-off.** The existing "Compliance flag" note (see
  Monetization) — no promotional/advertising/affiliate content goes live
  without legal review — is itself a governance practice, not a one-off
  footnote, and should be treated with the same weight as the access-control
  work above.

**Documentation — future developers need to understand what was built and
why, not just what exists.**

This document's own style — decisions attributed to a person and a date,
with the reasoning behind them, not just a checklist of what's done —
exists specifically so someone joining later (a contributor, eventually
maybe an investor's technical reviewer) can reconstruct *why* the site
works the way it does without asking the two of us directly. Practical
implications going forward:

- Every non-obvious schema/architecture decision gets a code comment
  pointing back to the rationale here — already the pattern in
  `prisma/schema.prisma` (e.g. why `GameProvider` is separate from
  `channelTitle`) — not a `DEVELOPMENT_PLAN.md` entry disconnected from the
  code it explains.
- Before inviting outside contributors (see "Immediate next steps"), add a
  short `CONTRIBUTING.md` — setup steps (already in README) plus the
  review/branching workflow — so a new developer's first question isn't
  "how do I even start."
- `DEVELOPMENT_PLAN.md` stays the single source of truth for *why*; it
  doesn't get allowed to drift out of sync with what's actually built, the
  same discipline "Current state" (below) already follows.

## Completed: basic video filtering (Phase 4 foundation) — done

Everything else in this document — ratings (Phase 3), prediction markets and
creator promotion (rest of Phase 4), newsletter delivery (Phase 5), feed
sourcing at scale (Phase 6), billing (Phase 7) — is real, scoped, and staying
in the plan, but is now explicitly **secondary**. It gets built over time.
The thing being built right now is: **letting people tell CloverEdge what
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

## Current priority: AI-powered video discovery — filter by creator, game, and denomination (building now)

**The core product insight** (from Edward, 2026-09-30): there's a large volume
of casino gameplay video on YouTube — from established gambling content
creators and regular people recording their own sessions — but YouTube's own
search and filtering can't answer the question a viewer actually has: "show
me videos of *this specific slot* at *this bet size* from *this creator*."
Cloveredge's value isn't hosting new video, it's making video that already
exists on YouTube findable along the dimensions casino players actually think
in, which YouTube doesn't support natively.

This extends the basic filtering above (gameType/venueType/sort) with three
more specific dimensions:

1. **Creator/channel** — `VideoEmbed.channelTitle` already exists as a flat
   string; filtering by it just needs a UI control, but see the open
   question below on whether it should become a proper relation shared with
   the Phase 4 `CreatorProfile` (creator promotion) concept rather than
   staying a disconnected string.
2. **Specific game** — not just `VideoGameType` (SLOTS/BLACKJACK/etc.) but
   the actual game title (e.g. "Buffalo Gold," "Dragon Link"). This is
   exactly what Phase 3's deferred `SlotGame` model was for — this direction
   pulls it forward and links it directly to `VideoEmbed`, since
   specific-game search is now core to the product, not a ratings feature.
3. **Denomination** — bet size/stake level (e.g. penny, $1, $5, high-limit).
   Entirely new; nothing in the current schema captures this.

**Proposed approach: extend the existing Prisma/Postgres schema, not a
separate graph database.** "Knowledge graph" here means richly-linked
structured entities (Video ↔ Game ↔ Creator ↔ Denomination, eventually ↔
Casino/venue) supporting multi-dimensional filtering and "show me more like
this" queries — Postgres with proper relations delivers that without a
second database technology. Flagged as an open question below in case
there's a specific reason to want dedicated graph-database tech instead
(e.g. visualizing the graph itself, or multi-hop traversal at a scale
relational joins won't handle well).

**AI extraction pipeline (extends the Phase 4 classification approach)**:
the existing plan already called for "an LLM call per video given
title/description/tags/thumbnail" to fill in `gameType`/`venueType`/
`sentiment` — this extends naturally to also extract game title,
denomination, and (already free from the API) creator. Proposed
tiering, cheapest first:

1. **Text pass** — many creators in this niche state the game and bet size
   directly in the title/description (e.g. "$50 SPINS on Buffalo Gold!!");
   an LLM call over title+description+tags likely resolves a large share of
   videos with no image analysis at all.
2. **Thumbnail vision pass** — fallback when text is silent or ambiguous;
   already validated by the Phase 4 research (a thumbnail alone correctly
   identified a blackjack table, chip stack, and streamer reaction on an
   untagged clip).
3. **(Stretch, not started) full video-frame sampling** — for cases where
   neither text nor thumbnail reveals the game/denomination. Meaningfully
   more expensive/complex than the other two tiers; worth deferring until we
   know how often tiers 1-2 fall short in practice.

### Open questions — need input before the schema/pipeline gets built

- **"Content provider" — which did you mean?** The YouTube creator/channel
  who posted the video (working assumption, since `channelTitle` already
  exists for this), the casino/venue shown in the footage, or the slot
  game's manufacturer (industry term "provider" usually means the game
  studio, e.g. Aristocrat/IGT/Light & Wonder — distinct from "creator")?
  This decides which entity gets modeled first.
- **Denomination — buckets or exact amounts?** Broad tiers (penny / $1-4 /
  $5-24 / high-limit $25+) are simpler to filter by and match how players
  actually talk about it, versus storing the literal bet amount whenever a
  creator states one (could also keep both — bucket for filtering, exact
  value alongside it).
- **Scope of "specific games" — slots only, or table games too?** Current
  content is 100% slots, and the deferred `SlotGame` model was slots-only.
  Table-game *variants* (e.g. a particular blackjack ruleset) are a
  different, less standardized kind of "specific game" — decide now whether
  to design for both from day one or go slots-first.
- **Graph database, or extend Postgres?** Default recommendation above is
  extending the existing Prisma schema — flag it if there's a specific
  reason to want dedicated graph-database technology instead.
- **How reliable is text (title/description) for game name and denomination
  in this content?** Determines how much of the pipeline can be cheap
  text-only extraction versus needing thumbnail/frame analysis for most
  videos.

**Working assumptions, proceeding unless corrected**: denomination is
captured as broad buckets (penny / $1-4 / $5-24 / high-limit $25+) with the
exact amount stored alongside when a creator states one; "specific games"
scope starts slots-only, matching current content; the knowledge graph is
built by extending the existing Prisma/Postgres schema rather than adopting
a separate graph database.

### Extends into: personalized recommendations + reviews (new — ties Phase 3 together)

**Second primary use case** (from Edward, 2026-09-30): beyond finding
videos, a user planning a casino visit wants recommendations on *which
games to play there* and *how to play them* — generated from the knowledge
graph this feature builds, not hand-written editorial content. This
retroactively explains why the Phase 3 `Comment`/review feature (signed-in
users reviewing their own casino experience, schema already built) matters
more than originally scoped: user-submitted reviews become a second input
signal for recommendations, alongside video-derived data, not just social
proof on a casino profile page.

This also resolves the "content provider" open question above as likely
**both** meanings at once, serving different purposes: the **creator**
(`channelTitle`, who posted the video — attribution/filtering) and the
**game provider/manufacturer** (Aristocrat, IGT, Light & Wonder, etc. — the
source of RTP/volatility data, which is exactly what Phase 3's deferred
`SlotGame` model was scoped to hold). A recommendation like "play this game
at this bet size" needs the provider's RTP data as much as it needs the
video evidence.

**Open questions on the recommendation mechanic specifically:**

- Is a recommendation scoped **to a specific casino** the user names (e.g.
  "I'm going to Caesars Palace with $200 — what should I play?", requiring
  we know which games a given venue actually offers), or **casino-agnostic**
  (recommend by game/style/budget without tying to a specific property)?
  The former needs a `Casino` ↔ `SlotGame`/game-availability relation that
  doesn't exist yet.
- Does "how they should play" mean **bankroll/betting strategy** (bet
  sizing, session length, budget pacing), **game mechanics/rules**
  explanation, or both?

### Human-in-the-loop: staff review, correction, and teaching the classifier (new)

**Decided direction** (from Edward, 2026-09-30): AI classification doesn't
run unsupervised. Staff review AI-generated tags, correct them, add their
own commentary, and that correction activity is what improves future
classification — not a one-time model build. This tracks with the Phase 4
research already in this doc, which surfaced real, unresolved edge cases
(unreliable creator tags, title/tag disagreement, ambiguous sentiment) that
a human clearly needs to arbitrate, at least until there's a large corrected
dataset to lean on.

Proposed shape, extending the existing `/admin` pattern (`/admin/homepage`
already does editorial Server Actions gated on `User.isAdmin`):

- **Review status per video** — `VideoEmbed` gets a review-state field
  (e.g. `UNREVIEWED` / `VERIFIED` / `NEEDS_FIXING`) plus `reviewedById` /
  `reviewedAt`, so staff have an actual queue instead of re-checking
  everything. AI-filled fields (`gameType`, provider, denomination,
  `sentiment`) stay editable by staff after the fact — same fields, human
  edits just overwrite/confirm the AI's guess.
- **Confidence score from the classification call** — captured alongside
  the AI's tag guesses so the review queue can surface low-confidence /
  disagreement cases first, rather than making staff review every video
  equally (which won't scale past a small catalog).
- **Staff commentary** — a notes field distinct from user-facing content
  (internal only), for context a reviewer wants to leave (e.g. "title says
  $5 but footage looks like a $1 machine — flagged, not corrected").
- **Teaching the classifier**: start simple — every human correction
  becomes a stored (AI guess → corrected value) example, and a curated set
  of these gets fed back into the classification prompt as few-shot
  examples, so the model sees real corrected cases from this exact content
  domain. Revisit actual fine-tuning only once there's enough corrected
  volume to justify it — same "prove the model with real usage before
  investing further" pattern this doc already applies elsewhere (e.g.
  content sourcing, ad network choice).

**Decided** (Edward, 2026-09-30):

- **Reviewers get their own role, separate from full admin.** Add
  `User.isContentReviewer` (additive, alongside the existing `isAdmin` —
  admins implicitly get reviewer access too) rather than overloading
  `isAdmin` for this. Keeps the video review queue open to staff who
  shouldn't also get site-config/`/admin/homepage` access.
- **Publish-then-review.** AI-tagged videos go live the moment they're
  classified; staff correct mistakes afterward via the review queue rather
  than gating publish on human confirmation. Prioritizes a fresh-feeling
  catalog over zero-mistake tagging — the confidence score + review queue
  is how mistakes get caught, not a pre-publish gate.

### Build sequence — many small phases, not one big build (decided: 2026-09-30)

Edward's explicit direction: all of the above (discovery, recommendations,
human-in-the-loop) is real and staying in the plan, but it ships as a
sequence of small, shippable increments as the site evolves — not one big
build. Proposed order, each step usable/demoable on its own:

1. **Data model foundation (next up)** — add a specific-game relation to
   `VideoEmbed` (pulling `SlotGame` forward from Phase 3, slots-only
   scope), a denomination field (bucket enum + optional exact value), a
   `GameProvider` entity (manufacturer, separate from `channelTitle`), the
   review-state fields (`reviewState`, `reviewedById`, `reviewedAt`,
   `confidenceScore`, `staffNotes`), and `User.isContentReviewer`.
2. **AI classification pipeline v1** — text-only tier (title/description/
   tags) filling gameType/provider-guess/denomination-guess/game-title-guess
   + a confidence score. Videos publish immediately per the decision above.
   No image analysis yet.
3. **Staff review queue UI** — `/admin/videos`-style page, gated on
   `isContentReviewer || isAdmin`, sorted lowest-confidence-first; staff
   edit tags, mark verified/needs-fixing, leave notes.
4. **Thumbnail vision fallback tier** — re-run low-confidence text-pass
   results through thumbnail image analysis.
5. **Teach-the-classifier loop** — store (AI guess → human correction)
   pairs from step 3's corrections, feed a curated set back into the steps
   2/4 prompts as few-shot examples from this exact content domain.
6. **Recommendation engine v1** — gated on answering the two open
   questions above (casino-specific vs. casino-agnostic; betting-strategy
   vs. mechanics explanation, or both) before this gets scoped further.
7. **(Stretch) full video-frame sampling tier** — only if steps 2 and 4
   still leave too many videos unresolved in practice.

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
| Online casino ratings | **Build in-house** | No viable licensing path found for AskGamblers/Casino.org-style data — it's proprietary editorial content; scraping it is a ToS/legal risk. CloverEdge needs its own rating methodology (see Phase 3). |
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

## Hosting & deployment (added 2026-09-30)

**Why Vercel runs the application**: Vercel is the company that builds
Next.js (this project's framework), so it runs this kind of app with no
extra server configuration — server components, API routes, image
optimization, and preview deployments all work out of the box. It's free
at this project's current scale (Hobby plan under the `eschulke-labs`
team), and it's simply what was already in place from the project's first
deployment. Not a permanent lock-in — Netlify, Railway, Render, and
Cloudflare Pages are the usual alternatives for a Next.js app if cost or a
specific feature ever justifies switching — but there's no reason to
revisit it now.

**Why the domain registrar (GoDaddy) is separate from hosting**: these are
two different jobs. GoDaddy (where `cloveredge.net` is registered) is the
domain's phone-book entry — it points the name at wherever the site
actually runs. Vercel is where the site actually runs — the real
application code and its database connection. GoDaddy's own hosting plans
are built for simple static/WordPress sites, not a Next.js app with a
database, so there's no reason to host there — the domain stays registered
at GoDaddy, DNS records there just point to Vercel.

**Connecting cloveredge.net (in progress)**: add the domain in the Vercel
project (Settings → Domains → Add); Vercel then displays the exact DNS
records to create (typically an A record for the root domain and a CNAME
for `www`, though Vercel's UI is the source of truth since exact values can
change). Add those records in GoDaddy's DNS management for cloveredge.net.
DNS propagation is usually fast but can take a few hours.

**GitHub auto-deploy connected (decided: 2026-09-30)**: Vercel's GitHub App
is now connected to `eschulke-labs/cloveredge` (Settings → Git), replacing
the manual `vercel deploy --prod` workflow — this is the continuity fix
flagged above under "Business continuity." One important mechanical detail
worth documenting so it doesn't look like a bug again: **the connection
only deploys commits pushed *after* it was established.** Vercel doesn't
retroactively build history that already existed in the repo when the
GitHub App was connected — so the batch of CloverEdge-rename commits that
were pushed before the connection existed (README, `package.json`,
`layout.tsx`, `schema.prisma`'s knowledge-graph additions, etc.) sat in
GitHub but never triggered a deployment. The fix is simply pushing again
(any new commit to `main`) — Vercel then builds from the current tip of
`main`, which already includes everything already pushed. Going forward,
every push to `main` deploys automatically with no manual step.

**Update**: the "just push again" fix above turned out not to be enough —
the first connection attempt never actually delivered any events at all
(repo's Settings → Webhooks showed nothing, and a follow-up push still
didn't trigger a build). The actual fix was disconnecting and reconnecting
the Git repository in Vercel's project Settings → Git, which forces Vercel
to redo its GitHub App authorization handshake rather than relying on
whatever partial state the first connection left behind. If this ever
recurs (e.g. after a repo transfer or rename), disconnect/reconnect is the
first thing to try, before assuming it's a webhook-specific problem.

With auto-deploy actually working, the first real build then failed on
`Module not found: Can't resolve '@/generated/prisma/client'`. Root cause:
`package.json`'s `build` script was just `next build`, with no step
generating the Prisma client first. Locally this was masked because
`prisma migrate dev` (run by hand during setup) generates the client as a
side effect — but Vercel does a fresh `npm install` on every build with
nothing pre-generated. Fixed by adding `"postinstall": "prisma generate"`
to `package.json`, which Vercel runs automatically right after install,
regardless of the npm `allowScripts` gating that blocks *dependencies'* own
install scripts (that gate doesn't apply to the project's own scripts).

## Current state

- **Live at [cloveredge.vercel.app](https://cloveredge.vercel.app)** (will
  move to cloveredge.net once that custom domain is connected — see
  "Hosting & deployment"). GitHub auto-deploy is now connected (see
  "Hosting & deployment" below): pushes to `main` deploy automatically.
  `vercel deploy --prod` from the repo root still works as a manual
  fallback if ever needed.
- Next.js 15 (App Router, TypeScript, Tailwind, ESLint)
- Prisma 7 ORM, schema at [`prisma/schema.prisma`](prisma/schema.prisma), migrated
  and seeded against a live Postgres database
- **Database**: a free Prisma Postgres dev instance (claimed, no longer
  expiring). **Production and local dev currently share this same database**
  — anything typed into the live site (subscribes, guest clicks) shows up
  locally too, and vice versa. Fine for a demo/share link; split into
  separate dev/prod databases before any real public launch.
- **Real magic-link email delivery is live** via Resend (pulled forward
  from Phase 5 — just the "send an email" piece, not the full digest
  system). `AUTH_RESEND_KEY` + `EMAIL_FROM` set both locally and on Vercel
  production. Sender is Resend's sandbox address (`onboarding@resend.dev`),
  which **only delivers to the email the Resend account itself was created
  with** — fine for the current admin accounts, but won't reach arbitrary
  visitors; verifying a real domain is needed before this works for anyone
  who signs up. Verified locally: sign-in flow reaches Auth.js's
  `/api/auth/verify-request` success page with no errors and no
  console-log fallback firing, confirming the real Resend path ran.
- **Two admin accounts** (`User.isAdmin = true`, seeded in `prisma/seed.ts`):
  `admin@casinowatch.local` (demo/test account, kept as-is — see the note
  at the top of this document) and `eschulke@hotmail.com`
  (the actual publisher — real admin access, can sign in for real now that
  email delivery works).
- **Homepage** ([`src/app/page.tsx`](src/app/page.tsx)) is the MSN-style
  dashboard described in Phase 2: hero, Trending Now, and topic rails driven
  by `HomepageModule`, all visible with zero login
- `POST /api/subscribe` — creates/updates a `User` with selected `PreferenceTopic`s
- Magic-link auth via Auth.js (`src/lib/auth.ts`), Prisma-backed sessions —
  see real email delivery note above.
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
| `User` | Account, jurisdiction, digest frequency, age-verification, `tier` (FREE/PAID), `isAdmin`/`isContentReviewer` roles | Built |
| `PreferenceTopic` | Opt-in unit — topic, region, or casino type; `pinnedTrendingOrder` for admin Trending Now override | Built |
| `Casino` | Online/land-based/hybrid entity | Built — needs rating breakdown fields (Phase 3) |
| `Bonus` | Promo offers tied to a casino | Built |
| `ContentItem` | Editorial content, source-tagged, `tier`-gated (FREE/PAID), `featured`/`featuredOrder` curate the "Top Story" carousel pool (order personalizes for signed-in preference matches, fixed default otherwise) | Built |
| `NewsletterIssue` | Sent-issue snapshot | Built |
| `Comment` | User review/comment on a casino experience, optional 1-5 rating, moderation status | Built |
| `Account` / `Session` / `VerificationToken` | Auth.js magic-link sign-in (Prisma adapter) | Built |
| `HomepageModule` | Configurable homepage rail (hero, category rail, trending widget) with ordering/active flags | Built |
| `GuestSignal` | Anonymous, cookie-keyed lightweight interest signal (no PII) for guest personalization | Built |
| `SlotGame` | Specific slot title, linked `GameProvider`, RTP, volatility | Built — schema only, not yet populated; pulled forward from Phase 3 because specific-game search is core to video discovery |
| `GameProvider` | Game manufacturer (Aristocrat, IGT, etc.) — distinct from `VideoEmbed.channelTitle` (who posted the video) | Built — schema only, not yet populated |
| `CasinoRatingCriteria` | Scored sub-categories (trust, payout speed, game variety, support) rolling up to `Casino.ratingAvg` | Planned — Phase 3 |
| `OddsSnapshot` | Cached Polymarket market/price snapshot, polled periodically | Planned — Phase 4 |
| `VideoEmbed` | Real YouTube video (official metadata) + `gameType`/`venueType`/`sentiment`/`slotGame`/`gameProvider`/`denomination` (classification, not official API fields) + human-review state (`reviewState`/`reviewedBy`/`confidenceScore`/`staffNotes`), one-to-one with a `ContentItem` | Built — populated with 5 real slot videos; new discovery/review fields added but not yet populated by the classification pipeline (Step 2) |
| `CreatorProfile` | Content creator/channel submission for promotion (status: pending/approved, featured flag) | Planned — Phase 4 |
| `AuditLogEntry` | Generic attributable log of consequential admin/moderation actions (who, what, when) | Built — schema only, not yet wired into any admin action (see "Foundational principle" above) |

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
- [x] "Top Story" is a fixed-pool carousel: `ContentItem.featured`/
      `featuredOrder` (schema) curate a set of stories (currently 13 real
      items — 15 is the target capacity, not yet reached; more get added as
      content grows, not padded with filler). **Default order is fixed and
      identical for every anonymous/no-preference visitor**; signed-in users
      who've set topic preferences (subscribe form) get that same pool
      reordered — stories matching their topics float to the front, same
      "boost don't hide" stable-sort pattern the rails use, reusing the
      exact `PreferenceTopic` data already collected for rails (no new
      preference UI needed). Deliberately **not** driven by passive
      `GuestSignal` click-tracking — only an explicit, subscribed
      preference personalizes it. `Carousel`
      ([`src/components/Carousel.tsx`](src/components/Carousel.tsx))
      auto-advances every 7s, pauses on hover, and has manual prev/next +
      dot navigation — verified: anonymous request shows "Welcome to
      CloverEdge" (the `featuredOrder: 0` item) first; setting a
      "Bonus & Promo Offers" preference for a signed-in test account
      correctly moved a bonus-tagged story to the front instead. Hit a real
      bug building this: a client component importing anything from a
      module that also uses `next/headers` breaks the build even for
      unrelated exports — fixed by extracting `isEntitled`/`ViewerTier`
      into a dependency-free [`src/lib/entitlement.ts`](src/lib/entitlement.ts)
- [x] Guest personalization: an anonymous `cw_guest_id` cookie (set in
      `src/proxy.ts`, no PII) plus `GuestSignal` rows recording which topics a
      visitor clicks into, boosting (not hiding) matching rails — verified:
      5 clicks on "Regulatory & Legal News" moved that rail to the top
- [x] Signed-in personalization: explicit `PreferenceTopic` selections score
      higher than guest clicks, so an account's stated preferences win
- [x] Trending Now module: top 3 topics by aggregate `GuestSignal` weight
      across all guests — verified rendering after generating signals
- [x] Trending Now pills are clickable, jumping to that topic's rail
      (`id="rail-{topicSlug}"` on `Rail`'s `<section>`). Hit a real Next.js
      quirk: `<Link href="#rail-x">` updates the URL hash but doesn't
      actually scroll for same-page anchor jumps — its scroll logic is
      built around "is the destination *page* visible," not "scroll to this
      specific hash target" — the fix was a plain `<a href="#...">` instead
      of `<Link>`, which triggers the browser's native anchor behavior
      directly and needs no framework help since there's no route change
      happening. Verified via a real `.click()` dispatch that scroll
      position moves to the target section.
- [x] Trending Now can be admin-pinned: `PreferenceTopic.pinnedTrendingOrder`
      (nullable — null means "not pinned"). When **any** topic has a pin,
      Trending Now shows **only** the pinned topics in pin order, full
      override, completely ignoring the computed `GuestSignal` aggregate;
      when nothing's pinned it falls back to the original real-click-data
      behavior. Managed at `/admin/homepage` (new "Trending Now pins"
      section, `updateTrendingPins` Server Action) — verified live: pinning
      Game & Casino Videos (1) and Bonus & Promo Offers (2) made Trending
      Now show exactly those two, in that order, replacing "Regulatory &
      Legal News" which had been dominating from earlier testing clicks —
      confirmed for both the signed-in admin session and anonymous (curl,
      no cookies), since pins are a global setting, not personalization.
- [x] Paywall teaser UI: rail/carousel cards always show title + excerpt
      (`ContentCard`, `Carousel`) with a "Subscribers only" badge; the full body
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
- [ ] `CasinoRatingCriteria` — define CloverEdge's own scoring rubric
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

- [x] Email provider — Resend, wired up for magic-link auth (see "Current
      state"). Sandbox sender only reaches the Resend account's own email;
      **domain verification is still needed** before this can send to
      actual newsletter subscribers, not just admins signing in
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
