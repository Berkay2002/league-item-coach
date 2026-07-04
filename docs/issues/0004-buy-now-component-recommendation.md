# Buy-Now Component Recommendation

## What to build

Add current-gold component recommendations to the item recommendation path.

PRD: `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] Planner input includes current gold and owned components.
- [ ] The recommender returns both `targetItem` and `buyNow` outputs.
- [ ] The component recommendation respects current gold.
- [ ] The component recommendation respects already-owned components.
- [ ] Fixtures cover low-gold, normal-gold, and owned-component cases.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- Static Item Recommendation Tracer Bullet
