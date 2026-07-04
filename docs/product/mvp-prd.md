# League Item Coach MVP PRD

Date: 2026-07-04

Status: Draft

Vision PRD: League Item Coach Vision PRD

This PRD defines the first shippable version of the product. It is intentionally narrower than the full vision, but it preserves the core product promise: one clear next buy, updated from real match context, with a short explanation that teaches why.

## Problem Statement

The first version needs to prove that the item recommendation loop is useful before the project expands into a full companion platform.

The target MVP user is a Windows League player who struggles with itemization. They want help during the game without being overwhelmed. They also want rune help before the match starts, but runes are less dynamic because they are locked once the game begins.

The MVP must demonstrate:

- Contextual item planning.
- Live item adaptation from current match data.
- Buy-now component recommendations.
- Short deterministic explanations.
- A clean Windows overlay/companion experience.
- A web surface that reuses the same UI language and recommendation concepts.

## Solution

Build a TypeScript monorepo with:

- A Windows Overwolf app for the primary MVP experience.
- A simple web app for manual exploration and Mac users.
- A shared deterministic recommender package.
- A shared League data package for Data Dragon parsing and curated tags.
- A shared UI package using Tailwind and shadcn/ui.
- A Supabase backend that serves patch metadata and compact recommendation seed data.
- A minimal match-data pipeline or seeded baseline import sufficient to support MVP recommendations.

The MVP focuses on:

- Champion select rune recommendation.
- Starting item recommendation.
- Full planned build in collapsed form.
- Live in-game next item recommendation.
- Current-gold buy-now component recommendation.
- Dynamic re-ranking from enemy threat weights.
- Template explanations.
- Confidence labels.

The MVP avoids:

- LLMs.
- Full personalization.
- Auto rune import.
- Mac overlay.
- Macro advice.
- Pro-grade analytics.
- Huge champion-specific curated coverage.

## User Stories

1. As a Windows League player, I want the app to open with League, so that it is ready before I need it.
2. As a Windows League player, I want an Overwolf overlay or companion window, so that I can view recommendations while playing.
3. As a Windows League player, I want the overlay to stay compact, so that it does not block gameplay.
4. As a Windows League player, I want the recommendation to appear around shop/recall moments, so that I see it when I can act on it.
5. As a Windows League player, I want to see my next target item, so that I know what I am building toward.
6. As a Windows League player, I want to see what component to buy now, so that my current gold turns into a clear shop decision.
7. As a Windows League player, I want the app to update when I buy an item, so that it does not keep recommending something I already bought.
8. As a Windows League player, I want the app to update when enemy threats change, so that a fed enemy can affect defensive recommendations.
9. As a Windows League player, I want the app to use enemy KDA, CS, level, and items, so that "who is fed" affects item weighting.
10. As a Windows League player, I want the app to use enemy itemization, so that flexible champions are not treated as one fixed damage type.
11. As a Windows League player, I want the app to tell me when the strongest threat is physical damage, so that I know when armor matters.
12. As a Windows League player, I want the app to tell me when the strongest threat is magic damage, so that I know when magic resist matters.
13. As a Windows League player, I want the app to tell me when anti-heal matters, so that I do not ignore healing-heavy enemies.
14. As a Windows League player, I want the app to tell me when penetration matters, so that I do not build flat damage into tanks.
15. As a Windows League player, I want the app to show one primary recommendation, so that I am not comparing a long list in the shop.
16. As a Windows League player, I want one alternative only when there is a real tradeoff, so that I can understand meaningful choices without being overwhelmed.
17. As a Windows League player, I want a short explanation, so that I learn without reading a guide mid-game.
18. As a Windows League player, I want a simple learning rule, so that I can apply the logic in future games.
19. As a Windows League player, I want a collapsed full-build plan, so that I can see where the app is going if I have time.
20. As a Windows League player, I want recommended starting items, so that the app helps from minute one.
21. As a Windows League player, I want first-recall guidance, so that low-gold recalls do not ruin my build path.
22. As a Windows League player, I want rune recommendations in champion select, so that I enter the match with a reasonable page.
23. As a Windows League player, I want rune recommendations to show primary tree, keystone, secondary tree, and key minor runes, so that I know only what matters.
24. As a Windows League player, I want rune recommendations to explain the safety/aggression tradeoff, so that I understand why the page fits the match.
25. As a Windows League player, I want runes not to change in-game, so that the app does not suggest impossible actions.
26. As a Mac user, I want a web app with manual champion/role/enemy-comp selection, so that I can still learn and plan without an overlay.
27. As a web user, I want to view item/rune recommendations outside a live game, so that I can study champions before playing.
28. As a web user, I want the web app and Overwolf app to agree, so that recommendations feel consistent.
29. As a user, I want item/champion icons and names to match the current patch, so that I can trust the app.
30. As a user, I want confidence labels, so that I know when the app is strongly supported by data and tags.
31. As a user, I want the app to work for all champions, so that uncommon picks still get a recommendation.
32. As a user, I want better recommendations for the most common supported champions, so that the MVP feels genuinely useful in common games.
33. As a developer, I want one shared recommender module, so that web and Overwolf do not fork recommendation behavior.
34. As a developer, I want deterministic scoring, so that bad recommendations can be debugged with fixtures.
35. As a developer, I want curated item tags, so that the engine can reason about anti-heal, anti-crit, armor, magic resist, scaling, active-item complexity, and champion fit.
36. As a developer, I want curated champion tags, so that the engine can reason about champion class, damage profile, role, and common item families.
37. As a developer, I want Data Dragon sync, so that item IDs, prices, icons, and names are current.
38. As a developer, I want a compact recommendation table from Supabase, so that the client can start quickly.
39. As a developer, I want recommendation tables cached locally, so that the app remains usable during backend issues.
40. As a developer, I want Riot API secrets only in backend/worker contexts, so that shipped clients do not expose keys.
41. As a developer, I want local Live Client Data polling to be isolated behind an adapter, so that recommender tests can use fixtures instead of a live game.
42. As a developer, I want compliance rules documented in the MVP, so that forbidden features do not creep in.
43. As an Overwolf/Riot reviewer, I want the MVP to avoid cooldown timers, power-spike alerts, and action-dictating notifications, so that it fits game-integrity boundaries.

## Implementation Decisions

- Initialize the project as a TypeScript monorepo.
- Use the shadcn monorepo initializer with the supplied preset:

```bash
bunx --bun shadcn@latest init --preset b7DMx6v9s --template vite --monorepo
```

- Use Vite for the initial web app template.
- Use React for UI surfaces.
- Use Tailwind and shadcn/ui for shared components.
- Use shadcn components for buttons, cards, badges, tooltips, tabs, sheets/dialogs, separators, skeletons, command/search, form controls, and compact data display.
- Use semantic Tailwind tokens instead of raw one-off colors in product UI.
- Use one shared UI package for web and Overwolf where practical.
- Use one shared deterministic recommender package.
- Keep the recommender free of UI dependencies.
- Keep the recommender free of Overwolf dependencies.
- Use explicit typed input/output contracts for game state, recommendation context, item candidates, rune candidates, reasons, and explanations.
- Use Riot Data Dragon for official static item/champion/rune data and icons.
- Add curated tags on top of Data Dragon.
- Use Supabase Cloud for MVP backend data serving.
- Use Supabase Postgres for patch metadata, item tags, champion tags, baseline item recommendations, baseline rune recommendations, and recommendation versioning.
- MVP may start with seeded or partially generated baseline data, but the schema should support later Match-V5 aggregation.
- Use a worker for Match-V5 data collection and aggregation when moving beyond seed data.
- Use high-elo baseline assumptions, then apply beginner usability penalties in the recommender.
- Use local Live Client Data API polling in the Overwolf app for active match state.
- Use player list, player items, active player gold, player scores, champion names, levels, and game state as live inputs.
- Compute enemy threat weights locally.
- Threat weights should consider item value, level, CS, kills, assists, deaths, and enemy item damage profile.
- Convert enemy threat weights into recommendation needs such as armor, magic resist, anti-heal, anti-shield, penetration, anti-crit, survivability, and damage scaling.
- Recommend a target completed item.
- Recommend one buy-now component based on current gold and owned components.
- Generate explanation text from top scoring reasons.
- Use template explanations only.
- Do not use an LLM in the MVP.
- Show one primary item recommendation.
- Show one alternative only for real tradeoffs.
- Show full build plan collapsed or secondary.
- Show rune recommendations in champion select only.
- Do not auto-import rune pages in MVP.
- Do not require Riot login in MVP.
- Do not upload full live match state to the backend for final recommendations.
- Cache compact recommendation data locally.
- Build the Windows product as Overwolf-first.
- Build the web app as companion/manual planner, not a replacement for live overlay.
- Make Mac support web-only for MVP.

## Testing Decisions

- The primary test seam is the shared recommender package.
- Recommendation tests should use fixed fixtures and assert outputs, not implementation internals.
- A good recommender test should provide a clear game state and assert target item, buy-now component, explanation reason, and confidence.
- Include fixture tests for:
  - Raw enemy-comp recommendation.
  - Fed physical threat overrides raw AP champion count.
  - Fed magic threat overrides raw AD champion count.
  - Enemy healing moves anti-heal earlier.
  - Enemy crit carry moves anti-crit/armor higher.
  - Enemy tanks move penetration higher.
  - Beginner mode penalizes close active-item choices.
  - Owned components affect buy-now output.
  - Current gold affects buy-now output.
  - Already-owned items are not recommended again.
  - Full build plan updates after item purchase.
  - Explanation references the actual top reason.
  - Forbidden macro phrases are not emitted.
- Test rune recommendation fixtures for common champion/role/matchup cases.
- Test Data Dragon parsing against pinned fixture versions.
- Test item ID mapping from Live Client Data item IDs.
- Test Supabase recommendation-table contracts with schema-level tests or typed query fixtures.
- Test local cache behavior when backend data is unavailable.
- Test web UI with mocked recommender outputs.
- Test Overwolf UI in the runtime manually for overlay display, hotkeys, window behavior, and game-state polling.
- Add compliance checks for copy and notification types before public submission.

## Out of Scope

- Mac desktop overlay.
- Native Mac companion app.
- LLM recommendations.
- LLM explanations.
- Auto rune import.
- User accounts.
- Personalized long-term player modeling.
- Paid subscriptions.
- Ads.
- Full public Overwolf store launch.
- All-champion curated depth.
- Every item edge case.
- Post-game coaching.
- "Why not this item?" interactive explanations.
- Macro advice.
- Objective advice.
- Lane-state advice.
- Enemy location advice.
- Cooldown timers.
- Summoner spell timers.
- Ultimate timers.
- Jungle timers.
- Chat integration.
- Riot Sign-On.

## Further Notes

- The MVP should be judged by recommendation quality, not by platform breadth.
- If the recommender feels wrong, adding overlay polish will not save the product.
- The first curated champion set should be chosen by popularity and beginner relevance, but fallback logic must cover every champion.
- A practical first curated set could cover common ADC, mid, top, jungle, and support picks, but the exact list should be decided during implementation planning.
- The app should present confidence as user-facing trust, not as an apology for fallback behavior.
- The first Overwolf proposal should describe the product as an item/rune education and recommendation assistant with strict boundaries against live tactical coaching.
- Issue tracker publishing was not performed because this is a projectless planning thread with no tracker configured.
