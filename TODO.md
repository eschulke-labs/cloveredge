# CloverEdge — To-do & Ideas

A working list of things to do and ideas worth keeping, added to as we go
(Edward, 2026-11-26). Quick notes are fine here — nothing needs a full
write-up to get on the list.

- **To do** = agreed, needs doing. Tick it off and note the date when done.
- **Ideas** = not decided yet. When Edward decides yes, it moves to To do
  (and, if it changes the mission/vision, into `DEVELOPMENT_PLAN.md`).
- Finished items get recorded in `DEVELOPMENT_LOG.md`; clear them from
  here now and then so this stays short.

Owner tags: **[Edward]** needs you · **[Claude]** assistant can do it ·
**[Both]** needs a decision then work.

---

## To do — now

- [ ] **[Edward]** OK to push the `studio-skeleton` and `docs-dev-log`
      branches to GitHub and open pull requests.
- [ ] **[Edward]** Add `studio.cloveredge.net` in Vercel + GoDaddy
      (steps in `STUDIO_SETUP_STEPS.txt`).
- [ ] **[Claude]** After the domain shows "Valid Configuration": merge the
      Studio pull request, then check it live with Edward.
- [ ] **[Edward]** Share the ChatGPT conversations about the site/vision →
      **[Claude]** save them in `docs/conversations/` and link from the log.
- [ ] **[Edward]** Watch the 5 first-pass-tagged videos and confirm/fix the
      tags (venues, dates, bets, win amounts).

## To do — next

- [ ] **[Claude]** Studio Homepage actions write `AuditLogEntry` rows.
- [ ] **[Claude]** Studio reference data: casinos, games, makers, creators
      (list/search/add/edit, aliases, merge) — Milestone 2.
- [ ] **[Claude]** Studio "Add video" form — **[Edward]** add
      `YOUTUBE_API_KEY` on Vercel first.
- [ ] **[Edward]** Add `ANTHROPIC_API_KEY` locally and on Vercel before
      Milestone 3.

## Decisions waiting on Edward

- [ ] What makes a video **eligible to go live**? Suggested automatic
      checks: it's really casino gameplay, YouTube allows embedding, it's
      not deleted/private. Failing videos wait in the Studio.
- [ ] Should unverified AI facts show a label on the public site
      ("AI-tagged, not yet verified") until staff confirm them?
- [ ] AI training from corrections: hand-picked examples (current
      guidance) or something more automatic?
- [ ] Channel watchlist scheduler: Vercel Cron (legacy) or Vercel
      Schedules.
- [ ] Carried over: recommendations tied to a named casino or
      casino-agnostic? "How to play": strategy, rules, or both?

## Ideas (not decided)

- Add `CONTRIBUTING.md` before inviting other developers (from the plan's
  documentation principle).
- Second trusted person with emergency access to GitHub/Vercel, and
  credentials in a shared password manager (plan's continuity principle).
- Verify `cloveredge.net` in Resend so sign-in emails reach anyone, not
  just the account owner.
