---
name: video-intelligence
description: Use when acquiring casino gameplay videos, collecting YouTube metadata, extracting video facts with AI, validating evidence, or designing video review/publishing flows.
---

# Video Intelligence

Design a trustworthy pipeline that makes existing casino gameplay videos searchable by the questions viewers ask: who posted it, which game/provider or venue appears, what happened, and what bet size or time range is evidenced. Inspect the current `VideoEmbed`/graph models, seed/import code, Studio workflow, and `DEVELOPMENT_PLAN.md` before changing behavior.

## Six independent processes

1. **Acquisition:** discover candidate video IDs/URLs from approved sources; retain query/origin and deduplicate. Discovery is only a candidate signal.
2. **YouTube metadata collection:** use official APIs and approved embedded-player access. Cache and timestamp metadata; respect quota. Keep metadata such as title/channel/duration separate from CloverEdge classification.
3. **AI video intelligence:** produce structured candidate facts from available evidence. Attach field-level evidence, confidence, model/prompt version, and extraction run; say unknown when evidence is insufficient. Use text first when appropriate; image/frame analysis only as authorized by the current plan.
4. **Validation:** check types, allowed taxonomy, ranges, internal consistency, entity resolution, and evidence coverage. Route conflicts and low confidence to review.
5. **Human review and learning:** authorized staff confirm or correct fields, preserve attribution and before/after values, and curate corrections for evaluation or carefully selected few-shot examples. Do not feed unreviewed noise back as ground truth.
6. **Publishing and continuous enrichment:** publish eligible records according to the current project decision, then enrich them as new metadata or corrections arrive while retaining stable identities and history.

Keep the six processes operationally independent with durable state and retryable, idempotent inputs/outputs. Do not collapse all steps into a fragile per-request chain. Do not assume that process names alone change the current publish-then-review policy; follow the latest explicit decision in `DEVELOPMENT_PLAN.md`.

## Evidence and policy

- Use official YouTube metadata and permitted player/embed access. Do not scrape YouTube's unauthorized transcript/timed-text endpoints or bypass access restrictions. Do not download video unless the project has an explicitly permitted source and workflow.
- Distinguish creator/channel from game manufacturer/provider, and specific game from broad game type. Do not infer venue, denomination, or a win/loss from a title keyword alone when evidence is weak or conflicting.
- Keep exact amounts distinct from denomination buckets; preserve the source and uncertainty. Do not infer gambling advice or guarantee outcomes from isolated clips.
- Preserve human overrides against later automated refreshes unless the reviewer explicitly reopens the field. Record classifier and validation versions so results can be reproduced and compared.
- Ensure moderation/reviewer access is enforced server-side and staff notes are never exposed publicly.

For implementation, propose the smallest stage that improves the workflow, include failure/retry behavior and an evaluation signal, and update the current plan only if requested. Never run migrations or deploy as part of this skill unless the user explicitly authorizes it.
