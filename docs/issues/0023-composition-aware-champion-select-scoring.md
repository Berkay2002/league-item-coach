# Composition-Aware Champion-Select Scoring

## Parent

#13

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

GitHub issue: https://github.com/Berkay2002/league-item-coach/issues/23

## What to build

Select one champion-select setup from resolved candidates using champion, role, lane matchup, enemy composition, ally composition, and explicit user skill or preference.

The scorer should treat baseline style confidence as the anchor. Composition may adapt secondary tree, minor runes, stat shards, and the second summoner spell more readily than keystones or primary trees. Keystone or primary-tree changes require a known valid champion-role style. Champion-select scoring must not use enemy player identity, enemy rank, match history, or scouting profiles.

## Goal

Return one deterministic champion-select recommendation from seeded candidates for at least the hard CC, burst/dive, poke, tank-heavy, weak-signal, Flash-lock, Smite-lock, and beginner-safe fixture cases.

## Acceptance criteria

- [ ] The shared recommender exposes a champion-select recommendation output with selected style, rune page, stat shards, summoner pair, baseline reference, confidence, and structured reasons.
- [ ] The scorer considers lane matchup, enemy composition, ally composition, and user profile without using enemy player identity or scouting data.
- [ ] Flash is locked for almost all recommendations and Smite is locked for jungle.
- [ ] Fixture tests cover hard CC, burst/dive, poke, tank-heavy drafts, weak signals, Flash lock, Smite lock, and beginner-safe close calls.
- [ ] The web planner renders one final champion-select setup rather than multiple competing pages.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #22
