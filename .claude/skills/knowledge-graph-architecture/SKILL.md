---
name: knowledge-graph-architecture
description: Use when designing or changing CloverEdge entities, relationships, aliases, provenance, extraction records, graph queries, or knowledge-graph workflows.
---

# Knowledge Graph Architecture

Treat CloverEdge's knowledge graph as a canonical, evidence-backed model of casino video knowledge. Before proposing a schema or query, inspect `prisma/schema.prisma`, the relevant Studio/public code, and `DEVELOPMENT_PLAN.md`. The current direction is relational PostgreSQL with Prisma; “graph” describes the connected domain model and traversal, not a mandate to add a graph database.

## Modeling principles

- Keep external identities and source records distinct from canonical entities. A YouTube video/channel, creator, game, game provider, venue, play, win, and alias have different meanings and lifecycle. Do not overload a channel title as a manufacturer or game name.
- Preserve the source and evidence behind every extracted claim: external ID/URL, source/fetch time, extraction run, relevant text or time range, confidence, and whether a value is observed, inferred, or human-corrected. Avoid overwriting the only copy of source metadata with an interpretation.
- Normalize reusable entities and represent relationships explicitly. Use aliases and identity resolution to merge spelling variants carefully; do not merge entities on a fuzzy match alone when it could connect the wrong creator, game, or venue.
- Represent unknown, ambiguous, conflicting, and not-applicable states honestly. Avoid fake precision, implicit defaults that look factual, and destructive “last write wins” behavior for reviewer corrections.
- Make imports and enrichment idempotent. Stable source keys, unique constraints, run records, and explicit update semantics should prevent duplicate videos, entities, plays, and facts on retry.
- Think through read paths with indexes and manageable joins. Add graph-specific query machinery only when a measured query or product need justifies it.
- Keep internal review notes, credentials, and private user signals out of public graph responses. Apply authorization at the server boundary.

## Data Factory boundaries

Use the six-process architecture in root `CLAUDE.md`: acquisition; official YouTube metadata collection; AI video intelligence; validation; human review and learning; publishing with continuous enrichment. Each process should consume a durable, versioned record and produce an inspectable result with status and provenance. A single codebase may host multiple processes; process independence does not imply separate databases. Separate source facts, model claims, validation results, reviewer decisions, and published/canonical values.

## Change workflow

Before a data-model change, explain why the current models cannot express the need, identify existing rows/relationships affected, and consider uniqueness, nullability, backfill, deletion, audit, and query behavior. Update schema, queries, UI, and plan consistently when the user authorizes implementation. Never run a migration or alter production data unless explicitly requested. For a design-only request, provide the proposed entities/edges and representative query shapes without editing the schema.
