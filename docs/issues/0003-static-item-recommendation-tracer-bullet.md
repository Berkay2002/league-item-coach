# Static Item Recommendation Tracer Bullet

## What to build

Implement the first deterministic item recommendation path and show it in the web planner.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Implement one static team-comp item recommendation path that returns a target item, confidence, and explanation in the web planner, with fixture coverage and passing `bun run typecheck`, `bun run lint`, and `bun run build`.

## Acceptance criteria

- [ ] The shared recommender package returns a target completed item for at least one static team-comp fixture.
- [ ] The web planner renders the recommender output instead of a UI-only placeholder.
- [ ] The output includes one primary recommendation, confidence, and a short explanation.
- [ ] Tests cover at least one static comp-only scenario.
- [ ] Recommendation output passes the compliance guard from the baseline slice.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #2
