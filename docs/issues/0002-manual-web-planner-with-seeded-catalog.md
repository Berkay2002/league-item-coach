# Manual Web Planner With Seeded Catalog

## What to build

Create the first manual planner path in the web app using seeded catalog data.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Ship a web planner path where a user can select champion, role, allies, and enemies from seeded catalog data, pass that state into the shared recommender shape, and verify with `bun run typecheck`, `bun run lint`, and `bun run build`.

## Acceptance criteria

- [ ] The web app exposes a manual planner screen for champion, role, ally, and enemy selection.
- [ ] The planner uses shared TypeScript types for its input and output shape.
- [ ] The planner uses a seeded item/champion catalog instead of hardcoded UI-only strings.
- [ ] The same seeded planner state can be passed to the recommender package, even if the recommendation is still simple.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #1
