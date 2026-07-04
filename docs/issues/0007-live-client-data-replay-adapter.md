# Live Client Data Replay Adapter

## What to build

Create a Live Client Data-shaped replay adapter for recommender fixtures.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] Fixture data represents Live Client Data player list, items, scores, levels, current gold, and game state.
- [ ] The adapter converts fixture data into the shared recommender input type.
- [ ] The adapter handles missing or unavailable local data gracefully.
- [ ] Tests cover normal fixture conversion and missing-data fallback.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #4
