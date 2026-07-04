# Static Item Recommendation Tracer Bullet

## What to build

Implement the first deterministic item recommendation path and show it in the web planner.

PRD: `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] The shared recommender package returns a target completed item for at least one static team-comp fixture.
- [ ] The web planner renders the recommender output instead of a UI-only placeholder.
- [ ] The output includes one primary recommendation, confidence, and a short explanation.
- [ ] Tests cover at least one static comp-only scenario.
- [ ] Recommendation output passes the compliance guard from the baseline slice.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- Manual Web Planner With Seeded Catalog
