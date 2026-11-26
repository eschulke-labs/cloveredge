# CloverEdge — Development Log

What was done, when, and what we talked about. Newest first.

**How this differs from `DEVELOPMENT_PLAN.md`** (decided by Edward,
2026-11-26): the plan is the guiding mission and vision. It changes only
when the mission or vision changes. This log is the running record: every
working session adds an entry covering the work done, decisions made
(with who and why), questions asked and answered, and what's next.
Conversations with other assistants (e.g. ChatGPT) that shaped the vision
are summarized here too, or saved in `docs/conversations/` and linked.

Entry format: date · branch/commits · what changed · decisions · open items.

---

## 2026-11-26 — Assistant guidance, plan refresh, Studio branch, this log

**Work**
- Committed ChatGPT's `CLAUDE.md` rewrite, its `DEVELOPMENT_PLAN.md`
  Studio-skeleton note, and six assistant skills in `.claude/skills/`
  (`c4e7a31`, on `main`).
- Refreshed the plan to match reality (`f11347b`, on `main`): Studio built
  but not shipped; Data Factory's six processes mapped to milestones;
  added a validation step to Milestone 3; Vercel Cron vs Schedules noted
  as open; data-model table and next steps updated.
- Committed the Studio skeleton code on branch `studio-skeleton`
  (`96747da`). Type-checks; not yet pushed, not live.
- Wrote `STUDIO_SETUP_STEPS.txt` (not committed): click-by-click steps to
  add `studio.cloveredge.net` in Vercel and GoDaddy.
- Started this log; updated `CLAUDE.md` to match the decisions below.
- Added `TODO.md` (Edward's idea): to-dos, decisions waiting on Edward,
  and undecided ideas, kept up to date as we work.

- Edward added **`CloverEdge Development Strategy.docx`** (Data Factory
  Architecture & Knowledge Acquisition Strategy v1.0, written with
  ChatGPT, status "Proposed"). Moved to `docs/strategy/` with a Markdown
  copy, `docs/strategy/data-factory-strategy.md`, so GitHub and assistants
  can read it. Reviewed against the plan and schema — it fits the
  existing design and adds richer metadata (betting behaviour, playing
  style, content/session type, game features), staged publishing
  (Publishable → Enriched → Complete), job-tracking records, a
  Studio operations dashboard, and historical backfill. Waiting on Edward
  to say whether it's adopted (then it goes into the plan).

**Decisions (Edward)**
1. **Plan vs log**: `DEVELOPMENT_PLAN.md` = mission/vision, updated only
   when those change; `DEVELOPMENT_LOG.md` = all work and conversations,
   updated every session.
2. **ChatGPT's role**: helped write the skills only, plus Edward's
   conversations with it about the site and vision. It is not editing
   code, so no cross-assistant branch rules needed.
3. **Publish-then-review reconfirmed**: videos go live immediately; staff
   fix mistakes or fill missing facts afterwards, and those fixes train
   the AI.
4. **Git workflow**: each piece of work on its own branch → pull request
   on GitHub → Edward approves → merge to `main` (which deploys live).
   Nothing goes straight to `main`.

**Why the Studio isn't merged yet**: merging makes `/admin/homepage`
redirect to `studio.cloveredge.net`, which doesn't exist until Edward
adds it in Vercel + GoDaddy. Merging first would lock admins out.

**Open**
- Edward: Vercel + GoDaddy steps for `studio.cloveredge.net`.
- Pushed both branches (Edward's OK). PR #1 = docs (ready to merge);
  PR #2 = Studio (draft — merge only after the domain is set up and #1
  is merged). `main` wasn't pushed directly; PR #1 carries its commits.
- Edward: verify the 5 first-pass-tagged videos.
- Edward to share the ChatGPT conversations to save in `docs/conversations/`.
- Questions raised about publish-then-review details (see the 2026-11-26
  chat): what makes a video eligible to go live, how unverified facts
  look on the public site, and how corrections feed the AI.

---

## Earlier history (reconstructed from git, summarized)

- **2026-11-22** — Reset the plan to "we're at the very beginning";
  production moved to Neon (separate dev/prod DBs); design system
  installed (shadcn/ui, Motion, Lucide, Sonner); `cloveredge.net`
  connected; knowledge graph v1 schema shipped via expand + contract
  migrations; first-pass tags for the 5 original videos
  (`prisma/gold/tag-v0.ts`); Studio reference-data milestone planned.
- **2026-09-30** — Renamed CasinoWatch → CloverEdge; knowledge-graph schema
  stubs added; governance/continuity principle added to the plan; Vercel
  GitHub auto-deploy connected; build fixed with `postinstall: prisma
  generate`.
- **2026-07-12** — `VideoEmbed` with 5 real slot videos played inline;
  `/videos` filter page; advertising chosen as primary monetization;
  Top Story carousel, Trending Now pins; Resend email live.
- **2026-07-10** — Project scaffolded (Next.js + Prisma); Phase 1
  (database, auth, subscribe flow) and Phase 2 (MSN-style homepage with
  guest + signed-in personalization) completed; first Vercel deploy.
