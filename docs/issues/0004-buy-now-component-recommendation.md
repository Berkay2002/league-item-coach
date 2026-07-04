# Buy-Now Component Recommendation

## What to build

Add current-gold component recommendations to the item recommendation path.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Extend item recommendations to return both a target item and one buy-now component based on current gold and owned components, with low-gold, normal-gold, and owned-component fixtures passing.

## Acceptance criteria

- [ ] Planner input includes current gold and owned components.
- [ ] The recommender returns both `targetItem` and `buyNow` outputs.
- [ ] The component recommendation respects current gold.
- [ ] The component recommendation respects already-owned components.
- [ ] Fixtures cover low-gold, normal-gold, and owned-component cases.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #3
