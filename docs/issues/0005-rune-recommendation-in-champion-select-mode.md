# Rune Recommendation In Champion Select Mode

## What to build

Add compact pre-game rune recommendations for champion select.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Add champion-select rune recommendations that return primary tree, keystone, secondary tree, key minor runes, and a tradeoff explanation, verified by at least one rune fixture and the standard project checks.

## Acceptance criteria

- [ ] The web planner has a champion-select mode or section for rune recommendations.
- [ ] The shared recommender returns primary tree, keystone, secondary tree, and key minor runes.
- [ ] The rune explanation describes a safety, aggression, matchup, or comp tradeoff.
- [ ] Tests cover at least one champion/role/matchup rune fixture.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #2
