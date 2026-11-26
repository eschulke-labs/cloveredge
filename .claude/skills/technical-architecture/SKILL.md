---
name: technical-architecture
description: Use when making CloverEdge system design decisions across Next.js, Prisma/Postgres, the public site, Studio, integrations, jobs, or deployment boundaries.
---

# Technical Architecture

Design for CloverEdge's current scale and roadmap, keeping the architecture understandable and reversible. Inspect `AGENTS.md`, `DEVELOPMENT_PLAN.md`, `package.json`, `prisma/schema.prisma`, and affected source before recommending a change. For Next.js work, first read the relevant installed guide under `node_modules/next/dist/docs/`; this repo explicitly warns that framework conventions differ from older versions.

## Current shape

The current stack is Next.js App Router, TypeScript, React, Tailwind, Auth.js, Prisma 7, and PostgreSQL. The public product and staff Studio are separate entry points in one codebase and share a database/schema. The knowledge graph is modeled relationally in Prisma/Postgres. Existing product behavior includes editorial homepage/content, topic and guest-interest signals, video discovery, staff workflows, and a growing graph. Check the active workspace and current plan before assuming route or schema details.

## Architectural rules

- Prefer the existing stack and established patterns. Add a dependency, service, queue, database, or deployment boundary only for a concrete need documented in the plan or supported by measured constraints.
- Keep public site and Studio authorization separate. Enforce permissions on the server for every protected read/write; UI gating is only a convenience. Keep staff-only notes and operational metadata private.
- Model the Data Factory's six responsibilities as independently runnable, observable, retryable processes with explicit state and idempotent contracts. They can initially share the same app, database, and runtime. Separate them physically only when scale, reliability, permissions, or ownership justify it.
- Keep long-running external API/AI work out of page rendering. Respect rate limits and quotas, cache/source-stamp metadata, bound cost, and make retries safe. Handle partial failures per record/process.
- Preserve provenance from external source through extraction, validation, review, and publication. Keep model outputs distinct from human decisions and published facts. Audit consequential editorial and review actions.
- Preserve existing deployment and host-routing decisions in `DEVELOPMENT_PLAN.md`; do not hard-code production host assumptions into local/Codespaces behavior.
- Explain non-obvious schema or architecture choices near the code and keep the plan aligned when the task calls for a documented decision.

## Change controls

Never read or print secret files. Never run a database migration, mutate production data, deploy, or publish unless the user explicitly authorizes that action. For a schema proposal, show the intended model/relations and migration implications without executing them. Do not install packages or create infrastructure unless needed and authorized.
