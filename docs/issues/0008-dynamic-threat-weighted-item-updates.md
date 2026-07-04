# Dynamic Threat-Weighted Item Updates

## What to build

Make the item recommender adapt from live-style enemy threat signals.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Implement threat-weighted item re-ranking from enemy items, level, CS, kills, assists, and deaths, verified by fed AD/AP override, anti-heal, anti-crit, and tank/penetration fixtures with compliance guards passing.

## Acceptance criteria

- [ ] The recommender computes enemy threat weights from items, level, CS, kills, assists, and deaths.
- [ ] The recommender converts enemy threat weights into needs such as armor, magic resist, anti-heal, anti-crit, penetration, survivability, and damage scaling.
- [ ] Fixtures cover fed physical threat overriding a raw AP-heavy comp.
- [ ] Fixtures cover fed magic threat overriding a raw AD-heavy comp.
- [ ] Fixtures cover anti-heal, anti-crit, and tank/penetration cases.
- [ ] Output still passes compliance guards and does not include macro advice.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #7
