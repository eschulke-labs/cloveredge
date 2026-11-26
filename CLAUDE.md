@AGENTS.md

# CloverEdge

CloverEdge is a public, newsletter-style casino information and discovery product. It helps people find useful information about online and land-based casinos, games, creators, promotions, regulations, and gameplay videos. The name means both luck and the advantage created by connected, evidence-backed knowledge. Build for trustworthy discovery and user understanding; never frame gambling as guaranteed income or encourage risky play. Responsible-gambling and jurisdictional compliance requirements are product constraints.

## Read these sources first

- `AGENTS.md` supplies repository-wide agent instructions. Preserve and follow it. Its Next.js warning is deliberate: before changing Next.js code, read the relevant guide bundled in `node_modules/next/dist/docs/` and follow current-version guidance.
- `DEVELOPMENT_PLAN.md` is the guiding mission and vision: product decisions, rationale, roadmap, and open questions. Read the relevant sections before architecture or product changes. Update it only when the mission, vision, or a product decision changes (Edward, 2026-11-26). It may contain intentional in-progress edits; preserve them.
- `DEVELOPMENT_LOG.md` is the running record of work and conversations, newest first. Read the latest entries to learn current status. Add or extend today's entry at the end of every working session (work done, decisions with who/why, open items) without being asked.
- `prisma/schema.prisma` is the source of truth for the current data model. Read it before changing graph, extraction, video, or persistence code.
- `package.json` defines the actual framework and available libraries. Do not rely on older README/version references when they disagree with the installed project.

Use the relevant skill in `.claude/skills/` for substantial product strategy, graph, video-intelligence, personalization, architecture, or implementation-partner work. Skills add focused guidance; they do not override `AGENTS.md`, the current plan, or an explicit user decision.

## Product and implementation baseline

The public site is an editorially curated, useful-without-login dashboard. Anonymous engagement and explicit signed-in topic preferences can reorder or emphasize content; personalization should boost relevant items rather than silently hide the catalog. The project also has a staff Studio for managing and reviewing the underlying data. The public site and Studio share one Next.js codebase, database, and Prisma schema, with separate routes/entry points and access controls. Keep the Studio distinct in navigation and authorization from public pages; follow the current `DEVELOPMENT_PLAN.md` for host routing and deployment details.

The working stack is Next.js App Router, TypeScript, React, Tailwind, Prisma 7, and PostgreSQL, with Auth.js. The current package manifest is authoritative. Existing areas include the public homepage/content/video experience, topic and guest signals, authentication, editorial administration, and the Studio work in the current checkout. The Prisma schema includes a relational knowledge graph and video/extraction concepts such as creators, games, game providers, plays, wins, aliases, and extraction runs. The initial graph data and Studio workflows are still being built out; do not describe planned automation or complete coverage as already live. Inspect current source and plan before claiming implementation status.

## Data Factory: target architecture

The Data Factory is a target made of six independently runnable processes with explicit persisted inputs, outputs, status, provenance, and retry behavior. Independence means each process can be operated, retried, observed, and improved without requiring one long fragile run; it does not by itself require six services or databases. Keep process boundaries and contracts clear, and avoid duplicate records on retries.

1. **Acquisition** discovers candidate videos/sources and records their origin, query or acquisition context, stable external identity, and deduplication state. Discovery is not a claim that a video is relevant or safe to publish.
2. **YouTube metadata collection** fetches and refreshes official YouTube metadata for known candidates using approved APIs. Respect quotas, cache results, retain source/fetch timestamps, and distinguish source facts from CloverEdge inferences.
3. **AI video intelligence** turns available evidence into structured candidate facts and graph links (for example creator, game, provider, venue, play, win/loss, bet size, and relevant timestamps). Preserve evidence, confidence, model/prompt version, and uncertainty at the field level where practical. Never fabricate missing facts.
4. **Validation** applies deterministic schema, taxonomy, range, consistency, identity, and provenance checks. It should flag ambiguity or conflict for review instead of silently coercing or discarding important facts.
5. **Human review and learning** lets authorized reviewers confirm, correct, reject, or annotate candidate facts. Record attributable corrections as training/evaluation examples; curate examples before reuse. Staff notes and review metadata are internal.
6. **Publishing with continuous enrichment** exposes eligible content and graph facts to the public experience, then allows later metadata, evidence, and corrected facts to enrich the same canonical entities without duplication. Track material changes and preserve provenance.

Treat this as six separate process responsibilities even when an early version runs in one repository or scheduled job. Use durable states and idempotent boundaries so a failure in one stage does not corrupt completed work in another. Publishing policy is publish-then-review (decided 2026-09-30, reconfirmed by Edward 2026-11-26): videos go live immediately; staff then fix mistakes or fill missing facts, and those corrections train the AI. Validation and low confidence route items to the review queue; they do not hold them back from publishing. Do not add a review-before-publish gate unless Edward changes this decision in `DEVELOPMENT_PLAN.md`.

Use only permitted source access. YouTube's official metadata and embedded player are acceptable project paths; do not scrape unauthorized transcripts or bypass access controls. Any future frame sampling, model provider, schedule, cost, or review-gating choice must follow the current plan or be surfaced as an open decision, not invented as settled architecture.

## Working and safety rules

- Make the smallest coherent, reviewable change. Preserve user changes and unrelated work, especially modified `DEVELOPMENT_PLAN.md` and in-progress Studio/graph work. Never reset, overwrite, or “clean up” unrequested changes.
- Keep secrets safe: do not read, print, alter, commit, or expose `.env*` files, tokens, credentials, or production data. Ask for an approved secret-handling path if a task truly needs credentials.
- Do not run database migrations or deploy/publish changes unless the user explicitly asks. Do not seed or mutate a live database.
- Respect separate public, reviewer, and admin access. Enforce authorization on the server, not only in the interface; keep auditability for consequential review/admin actions.
- When changing architecture, explain the reason in the code. Record the work in `DEVELOPMENT_LOG.md`; change `DEVELOPMENT_PLAN.md` only for mission/vision or product-decision changes. Keep implementation claims grounded in inspected code.
- Git workflow (Edward, 2026-11-26): each piece of work goes on its own branch, then a GitHub pull request, then Edward approves, then merge to `main`. Never commit directly to `main`; pushing/merging `main` deploys production. Push only with Edward's OK.
- Do not install dependencies or add infrastructure just to anticipate future needs. Prefer the existing Prisma/Postgres design unless evidence and the plan justify a change.
