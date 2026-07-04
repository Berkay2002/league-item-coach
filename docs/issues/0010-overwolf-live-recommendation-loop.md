# Overwolf Live Recommendation Loop

## What to build

Wire the Overwolf shell to the live/replay adapter and shared recommender.

PRD: `docs/product/mvp-prd.md`

## Acceptance criteria

- [ ] The Overwolf app consumes normalized live/replay adapter output.
- [ ] The Overwolf app calls the shared item recommender locally.
- [ ] The overlay shows target item, buy-now component, confidence, and one short reason.
- [ ] Recommendations update when owned items or relevant live threat data changes.
- [ ] The loop works with replay fixtures even when League is not running.
- [ ] No full live match state is uploaded to the backend for final recommendation decisions.
- [ ] Compliance guards pass.

## Blocked by

- Live Client Data Replay Adapter
- Dynamic Threat-Weighted Item Updates
- Overwolf Overlay Shell With Mocked Recommendations
