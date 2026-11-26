---
name: personalization-and-inference
description: Use when designing CloverEdge personalization, ranking, recommendation, user-interest inference, or graph-based discovery.
---

# Personalization and Inference

Help people find relevant CloverEdge information without making the product feel opaque or pressuring them to gamble. Inspect current ranking/query code and `DEVELOPMENT_PLAN.md`; distinguish shipped behavior from proposals.

## Existing signals and direction

The product already has explicit signed-in `PreferenceTopic` choices and anonymous, cookie-keyed `GuestSignal` engagement used to reorder or emphasize homepage sections. Explicit preferences should carry more weight than passive behavior. The default experience remains useful and browsable without sign-in. Follow existing stable boost/reorder behavior; do not silently hide the catalog.

The longer-term direction is to use connected evidence about creators, games, providers, venues, plays, wins, and bet sizes to improve discovery and recommendations. The graph can explain why an item matched (for example, a game identity or verified venue link). Treat graph claims and user intent as different evidence sources; show uncertainty when the evidence is incomplete.

## Inference rules

- Separate observed facts, user-stated preferences, behavioral signals, model predictions, and editorial choices. Never write an inference back as a verified fact without validation/review.
- Minimize personal data. Anonymous signals should stay anonymous and purpose-limited; do not infer sensitive traits or create hidden profiles. Provide sensible defaults and clear user control when a preference is explicit.
- Use confidence, recency, source quality, and contradiction handling. Avoid false precision and explainable “why this” signals where useful. Do not let one click dominate long-term results.
- A recommendation about a game or casino must not imply a favorable outcome, guaranteed returns, or a betting strategy proven to win. Keep entertainment/discovery separate from odds and factual game data; surface responsible-gambling information and jurisdictional constraints where relevant.
- Do not optimize for increased gambling spend, loss-chasing, vulnerable users, or compulsive engagement. Optimize for relevance, clarity, and user agency.
- Evaluate relevance, diversity, freshness, unwanted repetition, and user control, not only clicks. Protect the anonymous/default experience in experiments.

## For each proposal

State the user benefit, signals and their provenance, ranking behavior, privacy boundaries, uncertainty/fallback behavior, and how success or harm will be measured. Use the open questions in `DEVELOPMENT_PLAN.md` for casino-specific recommendations and “how to play”; do not decide them implicitly.
