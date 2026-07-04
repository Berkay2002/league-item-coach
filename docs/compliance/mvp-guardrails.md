# MVP Compliance Guardrails

Source of truth:

- MVP PRD: `docs/product/mvp-prd.md`
- GitHub PRD issue: https://github.com/Berkay2002/league-item-coach/issues/13
- Baseline issue: https://github.com/Berkay2002/league-item-coach/issues/1

League Item Coach MVP recommendations must stay inside item and rune education. The app can explain why an item, component, rune page, or confidence label fits the current recommendation context. It must not become live tactical coaching.

## Allowed MVP output

- Next completed item recommendation.
- Buy-now component recommendation based on current gold and owned components.
- Collapsed full-build plan.
- Champion-select rune recommendation.
- Short deterministic explanation text from scoring reasons.
- Confidence label for the recommendation.
- Itemization concepts such as armor, magic resist, anti-heal, anti-shield, penetration, anti-crit, survivability, damage scaling, and active-item complexity.

## Forbidden MVP output

The MVP must not emit:

- LLM-generated recommendation or explanation behavior.
- Macro advice, including wave, roam, rotation, warding, lane-state, split-push, gank, or map-movement calls.
- Cooldown timers.
- Summoner spell timers.
- Ultimate timers.
- Jungle timers.
- Enemy position tracking.
- Objective calls for dragon, Baron, Rift Herald, Voidgrubs, towers, inhibitors, or Nexus pushes.

## Recommendation-output guard

The reusable guard lives in `packages/recommender/src/compliance.ts` and is exported from `@workspace/recommender`.

Use `validateRecommendationOutput` before showing generated recommendation copy from the recommender or UI fixtures. It scans nested output objects and returns every forbidden phrase match with a category and field path.

Use `assertRecommendationOutputAllowed` at hard boundaries where forbidden output should fail fast, such as fixture tests, generated recommendation snapshots, or future adapter tests.

The guard is intentionally text-based. It is not a replacement for product review, but it gives the codebase a testable baseline against the MVP boundaries in this document.
