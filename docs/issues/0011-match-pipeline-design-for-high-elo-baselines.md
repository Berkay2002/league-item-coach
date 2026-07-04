# Match Pipeline Design For High-Elo Baselines

## What to build

Document the Riot Match-V5 aggregation path for high-elo baseline tables.

PRD: `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] The design explains how match IDs are collected by region and rank band.
- [ ] The design lists the Match-V5 detail and timeline fields needed for items, runes, roles, patch, game duration, outcome, gold, CS, KDA, and team comps.
- [ ] The design defines aggregation outputs for champion, role, patch, item slot, rune page, sample size, adjusted winrate, pickrate, and confidence.
- [ ] The design keeps Riot API keys on backend or worker surfaces only.
- [ ] The design writes compact outputs compatible with the Supabase recommendation-version contract.

## Blocked by

- Supabase Recommendation Version And Local Cache
