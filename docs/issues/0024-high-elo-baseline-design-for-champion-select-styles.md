# High-Elo Baseline Design For Champion-Select Styles

## Parent

#13

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

GitHub issue: https://github.com/Berkay2002/league-item-coach/issues/24

## What to build

Extend the high-elo baseline design to cover champion-select style candidates: rune pages, stat shards, summoner spell pairs, sample gates, rank weighting, and curated overrides.

This should build on the existing Match-V5 baseline design instead of duplicating it. The output should explain how Emerald+ coverage, higher-rank weighting, low-sample protection, and manual curation produce compact resolved candidates for the recommendation-version bundle.

## Goal

Produce a design document that extends the high-elo Match-V5 baseline pipeline to champion-select styles and specifies the exact aggregation outputs needed for patch-versioned rune, shard, and summoner candidates.

## Acceptance criteria

- [ ] The design extends the Match-V5 aggregation path to include rune page, stat shard, and summoner spell pair baselines.
- [ ] The design defines style candidates per champion and role, including support for multiple legitimate styles for flexible champions.
- [ ] The design defines sample-size gates, adjusted winrate, pickrate, confidence, and higher-rank weighting for Emerald+ through Challenger data.
- [ ] The design explains curated constraints and overrides for misleading raw stats, specialist-only pages, beginner penalties, and champion-specific locks.
- [ ] The design keeps Riot API keys on backend or worker surfaces only and cites the pinned Riot OpenAPI schema where endpoint fields are used.
- [ ] The design writes compact outputs compatible with the local recommendation-version contract.

## Blocked by

- #11
