# Champion-Select Candidate Bundle With Summoners And Shards

## Parent

#13

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

GitHub issue: https://github.com/Berkay2002/league-item-coach/issues/22

## What to build

Add the first resolved champion-select recommendation bundle shape so the app can load exact rune page, stat shard, and summoner spell candidates from local versioned data.

This slice should make champion-select setup data concrete without adding full composition scoring yet. The client-facing bundle should contain resolved candidates for champion, role, style, rune page, stat shards, summoner pair, evidence, constraints, tags, and confidence.

## Goal

Define and consume one valid local champion-select candidate bundle that renders an exact rune page, stat shards, and summoner spell pair in the web planner, with malformed candidate data rejected by contract tests.

## Acceptance criteria

- [ ] A versioned champion-select candidate contract exists for resolved rune pages, stat shards, summoner pairs, evidence, constraints, tags, and confidence.
- [ ] The recommendation data loader can return champion-select candidates from local seeded or cached data.
- [ ] The web planner can display one seeded exact champion-select setup including primary tree, keystone, secondary tree, key minor runes, stat shards, and summoner spell pair.
- [ ] Contract tests reject malformed rune trees, missing stat shards, invalid summoner pairs, missing patch metadata, and missing confidence.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

None - can start immediately
