# Curated Matchup Tags For First Champion Set

## Parent

#13

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

GitHub issue: https://github.com/Berkay2002/league-item-coach/issues/25

## What to build

Add the first curated champion and matchup tags needed for proper composition-aware champion-select recommendations.

The tag set should cover the first supported champion set and the matchup signals the scorer needs: poke, burst, dive, hard CC, scaling, sustain, shielding, tanks, engage, disengage, lane pressure, and bot-lane partner archetypes. The slice should avoid a full champion-vs-champion matrix while supporting curated exceptions for important matchups.

## Goal

Add enough curated champion, lane, pairing, and composition tags for the first supported champion set to drive at least one tested rune, shard, or summoner adaptation from matchup context.

## Acceptance criteria

- [ ] A curated tag model exists for champion, lane matchup, bot-lane pairing, and composition signals used by champion-select scoring.
- [ ] The first supported champion set has enough tags to exercise poke, burst, dive, hard CC, tank-heavy, sustain, shielding, engage, disengage, and lane-pressure fixtures.
- [ ] The model supports curated matchup exceptions without requiring a full all-champion matchup matrix.
- [ ] The web planner can surface at least one recommendation whose reason comes from curated matchup or composition tags.
- [ ] Fixture tests prove tag-driven recommendations affect rune, shard, or summoner selection only when the candidate style supports it.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #23
