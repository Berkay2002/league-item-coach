# Overwolf Live Recommendation Loop

## What to build

Wire the Overwolf shell to the live/replay adapter and shared recommender.

PRD: [League Item Coach MVP PRD](https://github.com/Berkay2002/league-item-coach/issues/13), source `docs/product/mvp-prd.md`

## Goal

Wire the Overwolf shell to normalized live/replay data and the shared recommender so it displays target item, buy-now component, confidence, and one short reason, verified with replay fixtures and compliance guards.

## Acceptance criteria

- [ ] The Overwolf app consumes normalized live/replay adapter output.
- [ ] The Overwolf app calls the shared item recommender locally.
- [ ] The overlay shows target item, buy-now component, confidence, and one short reason.
- [ ] Recommendations update when owned items or relevant live threat data changes.
- [ ] The loop works with replay fixtures even when League is not running.
- [ ] No full live match state is uploaded to the backend for final recommendation decisions.
- [ ] Compliance guards pass.

## Blocked by

- #7
- #8
- #9
