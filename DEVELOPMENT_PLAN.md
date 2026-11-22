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
graph (see "Knowledge graph v1" below) gives a player — deliberately doubling
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
  "Decided earlier and still in force," below) is the first real piece of this —
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

## Where we actually are (reset: 2026-11-22)

Honest status, from Edward: **we are at the very beginning.** What exists is
a working skeleton — a homepage, auth, a `/videos` filter page over 5
hand-seeded slot videos, and schema stubs for games/providers that hold no
data. Nothing collects videos on its own, nothing "watches" them, and the
knowledge graph doesn't exist yet. Everything below this section (Phases
3-7) is still real, but it is **parked** until the near-term plan here is
running.

**The goal for "running soon"**: a loop that works end to end, even at small
scale —

1. **Collect** — add YouTube casino videos (one URL at a time at first, then
   from a watchlist of channels).
2. **Watch** — an AI pass reads each video's title/description/tags and
   looks at frames from it, and writes structured facts.
3. **Record** — the facts land in the knowledge graph: which game(s) were
   played, bet amount, whether there was a win, how big, where it was
   recorded, and when.
4. **Review** — staff (Edward, to start) confirm or fix what the AI wrote;
   every fix is kept to make the next pass better.
5. **Show** — the public site lets people browse and filter by any of those
   facts, in a design that looks modern and premium.

### What "watching" a video means, technically (decided: 2026-11-22)

Claude (the AI model) **does not take video files as input — it reads text
and still images.** So "watching" a video means: give the model the
title/description/tags *plus a set of frames from the video*, and ask it to
fill in a fixed schema. That works well for this content because the facts
we want are mostly **visible on screen**: the game's logo/title art, the
bet meter, the win meter, the credit meter, a handpay screen, casino carpet
and signage.

The constraint is **where the frames come from**:

- **YouTube thumbnails** (official, allowed): one creator-chosen image plus
  a few auto-generated stills per video. Free and allowed, but limited —
  often a "BIG WIN!!" thumbnail with a reaction face, not the meters.
- **Downloading the YouTube video to pull frames** (e.g. with `yt-dlp`):
  technically easy, but **against YouTube's Terms of Service**, same reason
  transcript scraping was ruled out in Phase 4. Not doing this without an
  explicit decision to accept that risk.
- **Footage the creator gives us** (upload, shared Drive link, or a
  creator's written permission): fully allowed, full-quality frames, and it
  fits the planned Creator Promotion program (Phase 4). Slower to get.

**Plan**: v1 runs on text + thumbnails so the loop is live immediately.
Creator-provided footage is the path to full frame-by-frame "watching" and
gets pursued in parallel. **Open decision for Edward**: whether any other
frame source (e.g. a video-understanding API that is licensed to read
YouTube URLs directly) is worth evaluating — to be checked against current
terms when we get there, not assumed.

**Model**: Claude Opus 5.5 (`claude-opus-5-5`) for extraction, using
structured outputs so every response matches the schema exactly. Revisit a
cheaper model only after there's a measured accuracy baseline (below).

**The first ~50 videos get tagged by hand, with Claude Code's help, in this
repo.** That's the fastest way to start the graph *and* it produces a
checked "gold" set — the yardstick the automated pipeline is measured
against before it's trusted to run unattended.

## Knowledge graph v1 — the starting design (approved by Edward: 2026-11-22)

**Principle**: start with a small set of well-defined *things* (nodes) and
*relationships* (edges), store every fact with where it came from, and grow
by adding new node types — never by cramming more meaning into existing
columns. It stays in Postgres (Prisma); no separate graph database until
there's a concrete query we can't answer with joins (re-evaluated at that
point — the Postgres extension Apache AGE is the low-effort option if it
comes to that).

### Nodes (the things)

| Node | What it is | Key fields | Notes |
|---|---|---|---|
| **Video** | A YouTube video | youtubeId, title, description, publishedAt, duration, views, thumbnail | Replaces/extends today's `VideoEmbed` |
| **Creator** | The YouTube channel that posted it | youtubeChannelId, name, handle | Today this is just a text column (`channelTitle`); becomes its own node so we can show "all of this creator's videos" and later run the Creator Promotion program |
| **Game** | A specific game title — "Dragon Link: Golden Century", "Buffalo Gold" | name, gameType (SLOTS / BLACKJACK / …), provider, RTP, volatility | Rename of the empty `SlotGame` stub, widened so table games fit later without a new model. Slots first in practice |
| **GameProvider** | The manufacturer — Aristocrat, IGT, Light & Wonder | name | Already in schema, empty |
| **Venue** | Where it was played — a physical casino, or an online casino site | name, type (LAND_BASED / ONLINE), city, state, country | The existing `Casino` model, plus location fields |

### Edges (the relationships), carrying the facts you asked for

| Edge | Connects | Facts on it | Answers |
|---|---|---|---|
| **posted by** | Video → Creator | — | "who made this" |
| **recorded at** | Video → Venue | confidence | **where** |
| **recorded on** | Video (field) | date + precision (exact day / month / year / unknown; publish date used only as a labeled fallback) | **when** |
| **Play** | Video → Game | start/end time in the video, **bet amount**, denomination bucket (penny / $1-4 / $5-24 / $25+), currency | **which game(s)** and **how much** — one video can have several Plays, which today's schema can't represent |
| **Win** | Play → (event) | time in video, win amount, bet at the time, **multiplier** (win ÷ bet), kind (line win / bonus / free spins / progressive / jackpot / handpay), size bucket | **was there a win, how big** |

Video-level summaries — "net result: WIN / LOSS / BREAK-EVEN / UNKNOWN",
"biggest win $", "biggest multiplier" — are **computed from the Plays and
Wins**, not typed in separately, so they can't disagree with the details.

**Win size buckets** (by multiplier, so a $50 win on a $0.50 bet ranks
above a $200 win on a $25 bet — the way players judge wins): under 10× =
small, 10-49× = nice, 50-99× = big, 100-499× = huge, 500×+ = epic; a
handpay or progressive jackpot is flagged separately regardless of
multiplier.

**Credits vs dollars**: slot meters often show *credits*, not dollars.
Every amount is stored in dollars only when the denomination is known;
otherwise it's stored as credits with the denomination marked unknown —
never silently guessed.

### Provenance — what makes the graph trustworthy and teachable

Every Play, Win, venue link and date carries:

- **source** — `AI`, `HUMAN`, or `YOUTUBE_API`
- **confidence** — 0-1 from the AI pass
- **extractionRunId** → an **ExtractionRun** record: model used, prompt
  version, which inputs it saw (text only / thumbnails / frames), the raw
  JSON it returned, and cost

A human correction edits the fact in place and flips its source to
`HUMAN` (and writes an `AuditLogEntry` with before/after). The AI's
original guess is never lost: it stays verbatim in `ExtractionRun.output`.
Diffing the two gives the "AI guessed X, human said Y" pairs the
teach-the-classifier loop (below) needs, and the raw output lets the whole
graph be re-run with a better model/prompt and compared. *(Changed while
building, 2026-11-22: the first draft added a second `HUMAN` row per
correction; editing in place gives the same history with much simpler
queries — no "which row is current" filtering on every read.)*

### Aliases — so the same thing isn't recorded five ways

An **Alias** table maps names as creators actually write them to the one
real node: "Cosmo" / "The Cosmo" → *The Cosmopolitan of Las Vegas*;
"DL Golden Century" → *Dragon Link: Golden Century*. Matching new videos
against aliases is how the graph stays connected instead of fragmenting.

### How it grows (later node types, no redesign needed)

- **Feature/Mechanic** (Hold & Spin, Cash on Reels, Must-Hit-By) and
  **Theme** — linked to Game; powers "games like this one."
- **Jurisdiction** — linked to Venue; powers compliance filtering.
- **User** edges — watched / saved / reviewed — powers personalization and
  the recommendation engine.
- **Session** grouping (several Plays in one casino trip) if creators'
  multi-game vlogs make that useful.

### What happens to today's schema

`SlotGame` and `GameProvider` hold no data, so reshaping them is free. On
`VideoEmbed`, the single-game fields (`slotGameId`, `denomination`,
`denominationExact`, `sentiment`) move onto Play/Win; `channelTitle`
becomes a link to Creator; the review fields stay. The 5 existing videos
get re-tagged into the new shape as part of the gold set.

**⚠ Before this migration runs**: production and local dev share one
database (see "Current state"). A schema migration run locally changes the
live site instantly. **Split dev/prod databases first** (Milestone 0).

## Two sites: the public site and the Studio (decided: 2026-11-22)

Edward's direction: two separate sites —

1. **CloverEdge (public)** — `cloveredge.net`. For commercial users: search
   and browse the knowledge graph (games, creators, casinos, wins), find
   videos, and **watch them on our site**.
2. **CloverEdge Studio (internal)** — `studio.cloveredge.net`. The
   maintenance and site-admin site. Sign-in required; nobody else can
   reach it. Two areas:
   - **Knowledge graph** (`isContentReviewer` or `isAdmin`): add videos and
     creator channels, run and review the AI "watch" pass, correct facts,
     merge aliases, manage creators/games/providers/venues.
   - **Site admin** (`isAdmin` only): homepage layout and rails, Top Story
     carousel, Trending Now pins, editorial content, users and their roles,
     comment moderation, and the audit log of who changed what.

**How it's built: one codebase, two front doors.** Both sites live in this
one Next.js project and share the same database and schema code, but have
completely separate layouts, navigation and look. `src/proxy.ts` sends
requests for `studio.` to the Studio pages and blocks Studio pages on the
public domain. Why not two separate projects: they read and write the same
knowledge graph, so two copies of the schema and data code would drift
apart; one project is one deploy and one place to fix things. If the two
ever need different teams or release schedules, it splits cleanly into
two apps sharing a package — not needed now.

The existing `/admin/homepage` page moves into the Studio.

**Watching on our site**: videos play through YouTube's official embedded
player (an `<iframe>` from `youtube-nocookie.com`). That is explicitly
allowed by YouTube's terms, needs no download, and the creator still gets
the view and ad revenue — which matters for the Creator Promotion
relationship. Our page wraps the player with the graph facts: jump-to-win
timestamps (the player can start at a given second), game and venue links,
"more videos of this game."

## Near-term roadmap — small milestones, each usable on its own (decided: 2026-11-22)

Replaces the earlier 7-step "Build sequence" (same ideas, re-ordered so the
collect → watch → record loop runs first).

**Milestone 0 — Foundations (now)**
- [x] Design system installed: **shadcn/ui** (component library built on
      Tailwind, which the site already uses) + **Motion** (animation) +
      **Lucide** (icons) + **Sonner** (toast notifications). See "Design
      system" below. Installing it changes nothing visible yet — the
      redesign is Milestone 5.
- [x] Separate dev and production databases — done 2026-11-22. Production
      is on **Neon** (via the Vercel integration, env prefix `NEON_`;
      production `DATABASE_URL` = Neon's *pooled* URL). Local dev uses the
      old Prisma Postgres instance (`DATABASE_URL` in `.env.local`). All
      data copied with row counts verified. See "Current state" for what
      this also fixed.
- [x] Point `cloveredge.net` (GoDaddy) at the Vercel site — done
      2026-11-22, see "Hosting & deployment."
- [ ] `ANTHROPIC_API_KEY` added locally and on Vercel.

**Milestone 1 — Knowledge graph schema v1**
- [x] Schema written (`prisma/schema.prisma`, "KNOWLEDGE GRAPH v1"
      block): `Creator`, `Game` (was `SlotGame`), `GameProvider`, venue
      fields on `Casino`, `Play`, `Win`, `ExtractionRun`, `Alias`, plus
      where/when fields on `VideoEmbed`. Smoke-tested on the dev DB: a
      full Video → Play → Game → Provider + Win + Venue + Alias chain
      reads back correctly via graph queries.
- [x] Part 1 migration, "expand" (`20261122100000_knowledge_graph_v1_expand`):
      additive only, so the live app keeps working while it's applied.
      Backfills one `Creator` per existing channel and links the 5
      videos. Applied to dev.
- [x] Apply part 1 to production (Neon), then deploy the code (2026-11-22).
- [x] Part 2 migration, "contract" (`20261122200000_knowledge_graph_v1_contract`, applied to dev + prod 2026-11-22): drop the old single-game columns on
      `VideoEmbed` (`slotGameId`, `gameProviderId`, `denomination`,
      `denominationExact`) and the empty `SlotGame` table — only after the
      code from part 1 is live, since the previous deployment still
      selects those columns.
- [x] First-pass tags for the 5 existing videos (`prisma/gold/tag-v0.ts`,
      dev + prod, 2026-11-22): 7 Plays, 5 Wins, 2 venues, 2 recording
      dates, from the YouTube Data API + title/tags/thumbnail/auto-chapters.
      Each video's `staffNotes` lists what's still unknown.
- [ ] Edward watches the 5 videos, confirms/corrects the tags and fills the
      gaps (venues, dates, bets, win amounts) → mark VERIFIED. These become
      the first gold-set entries (Milestone 2).
- [x] `YOUTUBE_API_KEY` in `.env.local` (key restricted to YouTube Data API
      v3). Not yet on Vercel — add it when Milestone 2's "Add video" form
      needs it.

**Milestone 2 — Collect videos**
- [ ] Studio skeleton: `studio.` subdomain routing in `src/proxy.ts`,
      Studio layout, reviewer/admin sign-in gate; move `/admin/homepage` in.
- [ ] Studio "Add video" form: paste a YouTube URL → fetch official metadata
      (`videos.list`, 1 quota unit) → create Video + Creator.
- [ ] Channel watchlist: admin adds creator channels; a scheduled job
      (Vercel Cron) checks them for new uploads using cheap API calls (per
      the quota rule in "Resources").
- [ ] Hand-tag the first ~50 videos with Claude Code → the gold set.

**Milestone 3 — "Watch" pipeline v1**
- [ ] For each new video: one Claude call over title/description/tags +
      thumbnails → Plays, Wins, venue, date, each with confidence; saved
      with an ExtractionRun.
- [ ] Videos publish immediately (publish-then-review, decided 2026-09-30).
- [ ] Measure the pipeline against the gold set: accuracy per field (game,
      bet, win amount, venue, date). This number decides what to improve
      next.

**Milestone 4 — Review queue**
- [ ] Studio review queue: lowest-confidence first, side-by-side AI guess vs
      editable fields, mark Verified / Needs fixing, internal notes.
      Gated on `isContentReviewer || isAdmin`.
- [ ] Each correction stored as an (AI guess → human value) pair; a curated
      set of them is added to the extraction prompt as examples.
- [ ] Every review action writes an `AuditLogEntry`.

**Milestone 5 — Public discovery + redesign**
- [ ] Redesign homepage, `/videos`, and new pages on the design system.
- [ ] Video watch page: embedded YouTube player + the graph facts around
      it, jump-to-win timestamps, related videos.
- [ ] Knowledge-graph search: one search box across games, creators,
      casinos and videos.
- [ ] Pages per node: `/games/[slug]`, `/creators/[slug]`,
      `/casinos/[slug]` — each listing connected videos and stats (e.g.
      "biggest wins on Dragon Link this month").
- [ ] Filters on `/videos`: game, provider, creator, venue, bet range, win
      size, recorded date.

**Milestone 6 — Better watching**
- [ ] Creator-provided footage → real frame sampling (every N seconds +
      around win moments).
- [ ] Recommendation engine v1 — still blocked on the two open questions
      below.

### Design system (decided: 2026-11-22)

Edward's direction: the site should look modern and sophisticated, which it
doesn't today. Chosen stack:

- **shadcn/ui** — not a package you depend on but a set of
  well-designed, accessible components (cards, dialogs, tabs, menus) copied
  into `src/components/ui/` so they can be restyled freely. It's the
  most widely used React component system today and is built on Tailwind
  (already in the project), so nothing gets thrown away. Config:
  `components.json`; theme colors are CSS variables in
  `src/app/globals.css`.
- **Motion** (formerly Framer Motion) — smooth animation: card hovers, page
  transitions, carousel motion, win-counter count-ups.
- **Lucide** — consistent icon set.
- **Sonner** — toast notifications (e.g. "Subscribed!").

Still to decide in Milestone 5: the visual direction itself (e.g. dark
"premium casino" look with gold/emerald accents vs. a light editorial
look), typography, and a CloverEdge color palette to replace the shadcn
default grays.

### Still-open questions (carried over from 2026-09-30)

- Recommendations: tied to a specific casino the user names, or
  casino-agnostic?
- "How to play": bankroll/betting strategy, game rules, or both?

### Decided earlier and still in force (2026-09-30)

- Reviewers get their own role (`User.isContentReviewer`), separate from
  full admin.
- Publish-then-review: AI-tagged videos go live immediately; the review
  queue catches mistakes.
- Denomination stored as a bucket plus exact amount when known.
- "Content provider" means both the creator (who posted) and the game
  provider (manufacturer) — both are nodes above.
- `/videos` filter page (game type / venue / sort via URL parameters) is
  built and live.

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

**Connecting cloveredge.net (done 2026-11-22)**: GoDaddy DNS has an A
record `@` → `216.198.79.1` and a CNAME `www`; both `cloveredge.net` and
`www.cloveredge.net` are added in Vercel, with `www` as the primary address.
Gotcha hit along the way: DNS pointing at Vercel isn't enough — Vercel only
issues an HTTPS certificate for names added to the project, so `www` showed
a certificate error until it was added there too. Original steps: add the domain in the Vercel
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


**Using GoDaddy for hosting too? No — decided 2026-11-22.** Edward asked
whether GoDaddy, where `cloveredge.net` was bought, could also host the
site. GoDaddy's hosting is built for WordPress/static sites and can't run
this app (server-rendered Next.js pages, sign-in, a database, scheduled
jobs) without moving to a GoDaddy VPS that we'd have to run and patch
ourselves. So: the **domain stays registered at GoDaddy**, and GoDaddy's
DNS settings point it at Vercel. Steps: in Vercel → project → Settings →
Domains, add `cloveredge.net`, `www.cloveredge.net` and
`studio.cloveredge.net`; Vercel shows the exact DNS records; enter those in
GoDaddy → My Products → cloveredge.net → DNS. HTTPS certificates are issued
automatically by Vercel.

## Current state

- **Live at [www.cloveredge.net](https://www.cloveredge.net)** (connected
  2026-11-22; `cloveredge.net` redirects to `www`, and
  `cloveredge.vercel.app` still works). Magic-link sign-in URLs already use
  the new domain — verified via `/api/auth/providers`. Pushes to `main` deploy
  automatically.
- **Next.js 16** (App Router, TypeScript, Tailwind v4, ESLint). Note: this
  version differs from older Next.js in places (e.g. `middleware.ts` is now
  `proxy.ts`) — check `node_modules/next/dist/docs/` before relying on
  memory.
- **Design system**: shadcn/ui components in `src/components/ui/`, Motion,
  Lucide icons, Sonner toasts — installed 2026-11-22, not yet used by any
  page.
- Prisma 7 ORM, schema at [`prisma/schema.prisma`](prisma/schema.prisma)
- **Databases (split 2026-11-22)**: production runs on **Neon** (Postgres
  18, provisioned through Vercel's Neon integration with env prefix `NEON_`;
  the app reads `DATABASE_URL`, which in Vercel Production is set to Neon's
  pooled URL). Local dev uses the old Prisma Postgres instance via
  `DATABASE_URL` in `.env.local` (`vercel env pull` overwrites that file —
  re-add the line after pulling). Vercel marks all of these values
  Sensitive, so `vercel env pull` returns placeholders, not real values.
  - **Schema changes now go through migrations only**: `npm run db:migrate`
    locally (dev DB), then `prisma migrate deploy` against Neon's
    *unpooled* URL for production. Never `db push`.
  - **What the move fixed**: (1) the September knowledge-graph stubs
    (`SlotGame`, `GameProvider`, `AuditLogEntry`, review fields,
    `isContentReviewer`) had been added to `schema.prisma` but never
    migrated, so every `/content/[slug]` page was returning a 500 in
    production — the missing migration is now
    `20261122000000_knowledge_graph_stubs`, applied to both databases;
    (2) the homepage intermittently failed with "too many database
    connections" on Prisma's free tier — Neon's pooled connection
    resolves it.
- **Email**: magic-link sign-in via Resend, sandbox sender only — delivers
  only to the Resend account owner's address until a domain is verified
  (`cloveredge.net` can be that domain once connected).
- **Admins**: `admin@casinowatch.local` (demo) and Edward's real account,
  both seeded in `prisma/seed.ts`.
- **Homepage** ([`src/app/page.tsx`](src/app/page.tsx)): MSN-style
  dashboard — Top Story carousel, Trending Now, topic rails, guest and
  signed-in personalization (Phase 2, done).
- **Videos**: 5 real slot videos, hand-seeded; `/videos` filter page live.
  No automated collection or AI tagging yet.
- `YOUTUBE_API_KEY` in local `.env` only (used by the seed script).

## Data model summary

| Model | Purpose | Status |
|---|---|---|
| `User` | Account, preferences, `tier`, `isAdmin`/`isContentReviewer` | Built |
| `PreferenceTopic` | Opt-in topic/region; Trending Now pins | Built |
| `Casino` | Online/land-based casino — becomes the graph's **Venue** node | Built — needs location fields (Milestone 1) |
| `Bonus` | Promo offers tied to a casino | Built |
| `ContentItem` | Editorial content, `tier`-gated, featured carousel | Built |
| `NewsletterIssue` | Sent-issue snapshot | Built |
| `Comment` | Paid-tier casino review, moderated | Built (no UI) |
| `Account` / `Session` / `VerificationToken` | Auth.js | Built |
| `HomepageModule` | Configurable homepage rails | Built |
| `GuestSignal` | Anonymous interest signal (no PII) | Built |
| `VideoEmbed` | YouTube video — becomes the graph's **Video** node | Built — 5 videos; reshaped in Milestone 1 |
| `Game` (was `SlotGame`) | Specific game title, provider, type | Built 2026-11-22, empty |
| `GameProvider` | Game manufacturer | Schema only, empty |
| `AuditLogEntry` | Who did what, when | Schema only, not wired in |
| **Creator, Play, Win, ExtractionRun, Alias** | Knowledge graph v1 | **Built 2026-11-22** (dev + production) — 5 creators backfilled |
| `CasinoRatingCriteria`, `OddsSnapshot`, `CreatorProfile` | Phase 3/4 | Planned, parked |

# Later roadmap (parked until the near-term milestones are running)

Original phase plan, kept for its decisions and research. Phases 1-2 are
done; 3-7 are parked.

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
- [x] Filters UI — built as the `/videos` page (game type / venue / sort);
      richer graph filters are Milestone 5
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
- **Deployment**: Vercel, with the domain at GoDaddy (see "Hosting & deployment")


## Immediate next steps

1. **Build the knowledge graph v1** (approved 2026-11-22) — Milestone 1.
2. Start the gold set: hand-tag the first videos with Claude Code
   (Milestone 2).
