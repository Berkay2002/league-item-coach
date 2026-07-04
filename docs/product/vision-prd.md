# League Item Coach Vision PRD

Date: 2026-07-04

Status: Draft

Vision PRD for a League of Legends item, rune, and learning companion. This document captures the whole product direction at a high/medium level. The first MVP slice is covered separately in the MVP PRD, and later PRDs can cover future product slices.

## Problem Statement

Many League of Legends players do not understand what to buy, when to adapt, or why a recommended item is correct. Existing build tools often show static high-pickrate builds, broad winrate lists, or opaque recommendations. That helps with copying, but it does not teach the player how to reason.

The target user is a player who is bad, unsure, or overwhelmed by itemization and rune choices. They need one clear recommendation at a time, based on the current game context, with a short explanation that builds a reusable mental model.

The product should not become a live tactical coach. It should help the player buy better items and choose better runes, not tell them where to move, when to fight, when to take objectives, or how to exploit hidden information.

## Solution

Build a League of Legends companion product with:

- A Windows Overwolf app with in-game overlay and companion windows.
- A web app for champion/item/rune learning, manual planning, and Mac users.
- A deterministic recommendation engine written in TypeScript.
- A Supabase-backed data service for patch data, curated tags, and high-elo baseline recommendations.
- A scheduled match-data pipeline using Riot Match-V5 to learn high-quality baseline builds and rune pages.
- A local live-game adapter using Riot's Live Client Data API to adjust item recommendations during a match.

The product gives a full build plan, but the UI emphasizes the next decision:

- "Buy now" component.
- "Target item" completed item.
- One short reason.
- One learning rule.
- Optional collapsed details for threat profile and confidence.

Runes are recommended before the game starts. Items can update during the game when relevant buy-related inputs change.

The core product promise:

> One clear next buy, updated from real match context, with a short explanation that teaches why.

## User Stories

1. As a bad League player, I want one clear next item recommendation, so that I do not freeze in the shop.
2. As a bad League player, I want the app to tell me what component to buy with my current gold, so that I do not need to mentally reverse-engineer build paths.
3. As a bad League player, I want the app to explain why an item is recommended, so that I learn itemization instead of only copying.
4. As a bad League player, I want explanations to be short, so that I can understand them during a real match.
5. As a bad League player, I want the full planned build available but not dominant, so that I can plan ahead without being overwhelmed.
6. As a bad League player, I want the next item to update when the enemy threats change, so that the app does not stay stuck on a static build.
7. As a bad League player, I want the app to weigh who is fed, so that armor or magic resist recommendations reflect the actual strongest enemies.
8. As a bad League player, I want the app to consider enemy itemization, so that flexible champions are treated correctly when they build AP, AD, tank, crit, healing, or shielding.
9. As a bad League player, I want the app to recommend safer beginner-friendly items when choices are close, so that I am not forced into high-execution choices.
10. As a bad League player, I want the app to recommend active items only when they are clearly valuable, so that I do not buy items I will fail to use.
11. As a bad League player, I want the app to tell me when anti-heal matters, so that I stop ignoring healing-heavy teams.
12. As a bad League player, I want the app to tell me when armor penetration or magic penetration matters, so that I do not build flat damage into tanks.
13. As a bad League player, I want the app to tell me when defensive items are justified, so that I understand that damage is not always the best buy.
14. As a bad League player, I want the app to distinguish champion count from threat weight, so that I do not overbuild against three weak AP champions while two AD champions carry the game.
15. As a bad League player, I want the app to show a simple learning rule, so that I can reuse it in future games.
16. As a bad League player, I want optional details hidden by default, so that I can inspect the reasoning only when I have time.
17. As a bad League player, I want the app to work for every champion, so that it does not break when I pick something uncommon.
18. As a bad League player, I want the app to be better for curated/common champions, so that the most common cases are high quality.
19. As a bad League player, I want a confidence indicator, so that I know when a recommendation is strongly supported.
20. As a bad League player, I want rune recommendations in champion select, so that I do not enter the game with a poor page.
21. As a bad League player, I want rune recommendations to account for matchup and enemy comp, so that the page is not blindly copied.
22. As a bad League player, I want runes explained as tradeoffs, so that I understand why a safe page may be better than a greedy page.
23. As a Windows player, I want an Overwolf overlay, so that I can see recommendations without alt-tabbing.
24. As a Windows player, I want the overlay to appear only at useful moments, so that it does not distract me during fights.
25. As a Mac player, I want a web experience, so that I can still learn builds and plan manually even without an overlay.
26. As a user, I want the app to work without Riot login at first, so that onboarding is simple.
27. As a user, I want the app to cache recommendation data locally, so that it remains usable if the backend is slow.
28. As a user, I want recommendations to update per patch, so that the app does not suggest outdated items or runes.
29. As a user, I want item icons and champion names to be correct, so that the app feels trustworthy.
30. As a user, I want the app to avoid macro advice, so that it stays focused on item/rune learning.
31. As a Riot/Overwolf reviewer, I want the app to avoid cooldown timers and action-dictating notifications, so that it respects game integrity.
32. As a Riot/Overwolf reviewer, I want champion select anonymity respected, so that the app does not undermine ranked anonymity rules.
33. As a developer, I want a shared TypeScript recommender, so that web and Overwolf outputs do not diverge.
34. As a developer, I want deterministic scoring, so that recommendations can be tested and debugged.
35. As a developer, I want template explanations generated from scoring reasons, so that the reason matches the actual recommendation.
36. As a developer, I want curated item and champion tags, so that the system can reason beyond raw Riot metadata.
37. As a developer, I want high-elo match data baselines, so that the app learns from strong players instead of low-rank mistakes.
38. As a developer, I want beginner adaptation on top of high-elo baselines, so that recommendations remain usable for the target audience.
39. As a developer, I want sample-size and snowball-bias controls, so that rare high-winrate items do not dominate.
40. As a developer, I want patch-versioned recommendation tables, so that old data does not silently pollute new recommendations.
41. As a developer, I want the live recommender to run locally, so that latency is low and live game state is not uploaded.
42. As a developer, I want Riot API keys kept on the backend, so that secrets are not shipped in the desktop app.
43. As a developer, I want a batch worker for Riot Match-V5 aggregation, so that desktop clients do not hit Riot APIs for global stats.
44. As a developer, I want Supabase to serve compact recommendation tables, so that app startup stays fast.
45. As a developer, I want the UI built from shared components, so that web and overlay share product language.
46. As a developer, I want Tailwind and shadcn/ui, so that dense UI can be built quickly without inventing a component system.
47. As a developer, I want the monorepo initialized with the shadcn monorepo preset, so that workspace structure and UI conventions start correctly.
48. As a developer, I want clear compliance docs, so that future features do not drift into forbidden live coaching.

## Implementation Decisions

- Use a TypeScript monorepo from day one.
- Use a package manager/workspace setup compatible with the shadcn monorepo initializer.
- Use the shadcn monorepo preset command as the preferred scaffold command:

```bash
bunx --bun shadcn@latest init --preset b7DMx6v9s --template vite --monorepo
```

- Prefer Vite for the initial web/desktop UI shell because the Overwolf app and web app can share React components without committing immediately to a server-first framework.
- Use Tailwind and shadcn/ui for the UI layer.
- Use semantic design tokens and shadcn components instead of custom component styling where possible.
- Use Overwolf for the Windows overlay product.
- Do not attempt Mac overlay support in v1 because Overwolf overlay support is Windows-only.
- Provide a web app for Mac users and non-overlay use cases.
- Use Supabase Cloud as the product backend.
- Use Supabase Postgres for compact recommendation tables, patch metadata, curated tags, app metadata, and future account state.
- Use Supabase Storage or external object storage for raw match JSON, timeline JSON, and batch artifacts if needed.
- Use a separate batch worker for Riot Match-V5 collection and aggregation.
- Use Riot Data Dragon for official static data: champions, items, runes/perks, summoner spells, icons, prices, names, descriptions, and patch versions.
- Treat Data Dragon as the official dictionary, not the recommendation brain.
- Maintain a curated knowledge base of item tags, champion tags, role labels, damage profiles, item counters, beginner difficulty, and explanation hooks.
- Use Riot Match-V5 data to compute high-elo baseline builds and rune recommendations.
- Optimize baseline data from Emerald+ or Diamond+ rather than low-rank games.
- Apply beginner usability adjustments locally when choices are close.
- Use a combined baseline score instead of pure winrate or pure pickrate.
- Account for adjusted winrate, popularity, sample size, patch freshness, item slot, role, and snowball bias.
- Evaluate item choices by item slot/order so first items are not compared against sixth items.
- Run final live item recommendation locally in the desktop app.
- Keep Riot API keys out of shipped client applications.
- Use Riot Live Client Data API locally for current match state.
- Use live inputs only for item/rune-adjacent decisions, not macro calls.
- Allowed live inputs include player list, current inventory, current gold, enemy items, enemy level, enemy KDA, enemy CS, champion identities, role, and game time when needed for item slot context.
- Disallowed product behaviors include cooldown tracking, ultimate timers, summoner spell timers, jungle timers, enemy position tracking, objective calls, lane-state instructions, and action-dictating notifications.
- Rune recommendations happen before game start and are not updated live because runes are locked.
- Auto-importing rune pages is a future improvement, not required for the core product.
- Use deterministic recommendation logic and template explanations.
- Do not use an LLM in v1 recommendation, explanation, or decision flows.
- Keep optional LLM use as a future non-critical enhancement for post-game teaching or "why not this item?" interactions, if ever needed.
- Use one primary recommendation by default.
- Show one alternative only when there is a real tradeoff.
- Make "buy now" and "target item" separate outputs.
- Keep full planned build available but secondary.
- Provide confidence labels without exposing implementation language like "fallback" to users.
- Support all champions through fallback logic.
- Provide higher-quality curated support for common/beginner-priority champions first.

## Testing Decisions

- The main test seam is the deterministic recommendation engine.
- Tests should validate external behavior: given a champion, role, team comp, current items, gold, enemy items, and enemy scores, the engine returns the expected target item, buy-now component, explanation reason, and confidence.
- Tests should not assert internal score constants unless those constants are part of a published tuning contract.
- Use fixed game-state fixtures for common recommendation scenarios.
- Include fixtures for raw comp-only recommendations, fed AD threat overrides, fed AP threat overrides, anti-heal, anti-shield, tank-heavy enemies, crit-heavy enemies, and beginner item penalties.
- Test that explanation templates are generated from actual scoring reasons.
- Test that the engine does not generate macro advice.
- Test Data Dragon parsing with versioned fixture files.
- Test item ID mapping from Live Client Data item IDs to internal item records.
- Test baseline aggregation with normalized Match-V5 fixtures.
- Test that low sample-size items do not outrank trusted baseline items without strong contextual reasons.
- Test that item-slot comparisons do not compare early items against late-game items incorrectly.
- Test web and Overwolf UI at the component level where components consume the same recommender output shape.
- Manually test Overwolf overlay behavior in the Overwolf runtime because local browser tests cannot fully simulate injection, game events, and overlay behavior.
- Maintain compliance regression tests as content/policy tests: no forbidden notification types, no forbidden timer surfaces, no hidden enemy tracking claims.

## Out of Scope

- Mac desktop overlay support.
- Mobile app.
- LLM-based item decisions.
- LLM-based live coaching.
- Macro advice such as where to move, when to fight, when to recall, or when to take objectives.
- Enemy cooldown tracking.
- Enemy summoner spell tracking.
- Ultimate timers.
- Jungle camp timers.
- Enemy position tracking.
- Automatic player messaging or chat suggestions.
- Memory reading, packet sniffing, game client injection beyond approved Overwolf surfaces, or any unsupported game modification.
- Full pro/coaching-grade analytics in the first product milestone.
- Perfect support quality for every champion on day one.

## Further Notes

- The product's main risk is not API access. The hard part is building a reliable knowledge layer and evaluation process.
- The app should be framed as an item/rune education assistant, not a tactical match coach.
- The highest-value UX principle is reducing shop uncertainty. The player should usually see one answer, one reason, and one rule.
- Public Overwolf release requires Overwolf approval/whitelisting.
- Riot API production access requires Riot approval for public product usage.
- Monetization on Overwolf should use Overwolf-approved ads or subscriptions if monetization is added.
- A future issue-writing pass should split this vision PRD into backend, worker, recommender, Overwolf, web, UI, and compliance issue tracks.
