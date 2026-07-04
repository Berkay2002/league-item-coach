# Repo Baseline And Compliance Guardrails

## What to build

Set up the project baseline, docs, local issue tracker, and compliance guardrails.

PRD: `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] Product docs are available under `docs/product` and linked from the README.
- [ ] Local markdown issues are available under `docs/issues` and follow vertical-slice structure.
- [ ] A compliance document exists under `docs/compliance` and references the MVP boundaries.
- [ ] A testable recommendation-output guard exists that rejects macro advice, cooldown timers, summoner spell timers, ultimate timers, jungle timers, enemy position tracking, and objective calls.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

None - can start immediately.
