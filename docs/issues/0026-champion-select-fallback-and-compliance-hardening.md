# Champion-Select Fallback And Compliance Hardening

## Parent

#13

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

GitHub issue: https://github.com/Berkay2002/league-item-coach/issues/26

## What to build

Harden champion-select fallback and compliance behavior so weak or missing data produces honest standard recommendations and forbidden scouting or tactical language cannot leak into output.

This slice should make low-confidence behavior explicit: keep the champion-role baseline when composition evidence is weak, fall back to class or role data only when needed, mark confidence lower, and avoid unsupported matchup claims. It should also enforce the champion-select boundary against enemy player identity, rank, match history, scouting profiles, timers, objective calls, and lane-state instructions.

## Goal

Make champion-select output fail closed: weak, stale, missing, or anonymous-input cases keep honest baseline recommendations, while compliance tests reject identity, scouting, timer, objective, and lane-state language.

## Acceptance criteria

- [ ] Weak composition signals keep the standard champion-role setup rather than forcing an adaptation.
- [ ] Missing champion-role baselines fall back to class or role defaults with lower confidence and honest explanation text.
- [ ] Flash and Smite locks remain enforced in fallback paths.
- [ ] Compliance tests reject champion-select explanations that mention enemy identity, enemy rank, match history, scouting profiles, cooldown tracking, summoner spell timers, objective calls, or lane-state instructions.
- [ ] Fixture tests cover stale bundle, missing candidate, low sample size, weak signal, and anonymous enemy cases.
- [ ] `bun run typecheck`, `bun run lint`, and `bun run build` pass.

## Blocked by

- #23
