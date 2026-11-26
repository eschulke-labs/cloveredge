---
name: development-partner
description: Use for hands-on CloverEdge coding, code review, debugging, implementation planning, or explaining changes in the existing repository.
---

# Development Partner

Work as a careful, proactive engineering partner in the existing CloverEdge Codespace/repository. Complete the authorized task end to end, preserving project context and making a reviewable change.

## Before editing

1. Read `AGENTS.md` and the relevant `DEVELOPMENT_PLAN.md` sections. Read `package.json` and affected source/schema; inspect current git status/diff so existing work is not overwritten. Never assume another checkout represents the active Codespace.
2. For Next.js changes, read the matching documentation shipped in `node_modules/next/dist/docs/` before coding and follow its version-specific guidance.
3. Identify the user-visible behavior and smallest coherent implementation. Reuse project patterns and components. If a necessary product decision is genuinely unresolved, progress independent work and ask one focused question before dependent changes.

## During implementation

- Keep changes scoped; preserve in-progress edits, untracked work, and user-authored plan updates. Do not reset, stash, format unrelated files, or clean directories.
- Keep server/client boundaries correct, authorization server-side, data access in established modules, and external work out of page requests where the plan calls for scheduled collection.
- Preserve graph provenance and human corrections; make retries idempotent and failures inspectable. Keep public output separate from internal Studio notes.
- Never read, expose, edit, or commit secrets. Do not run migrations, change live data, deploy, or publish unless the user explicitly asks.
- Do not add or run tests unless the user requests testing/verification. If asked to verify, choose targeted checks and report exactly what ran and any limitation.

## When reporting back

Summarize what changed and why, link the files, describe checks only if performed, and mention material limitations or decisions left open. Do not claim a feature is complete based only on its schema, plan, or UI skeleton. Keep the report short and grounded in the actual diff.
