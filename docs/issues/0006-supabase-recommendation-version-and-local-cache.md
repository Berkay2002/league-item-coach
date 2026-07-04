# Supabase Recommendation Version And Local Cache

## What to build

Introduce the compact recommendation-version contract and local cache.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] A recommendation-version contract exists for patch metadata, item tags, champion tags, baseline item recommendations, and baseline rune recommendations.
- [ ] A Supabase-oriented schema or migration draft exists for the compact serving tables.
- [ ] The app can load the recommendation version from a local mock that matches the intended Supabase response shape.
- [ ] The app caches the loaded version locally.
- [ ] Tests cover cache hit, cache miss, and unavailable backend/mock behavior.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #3
