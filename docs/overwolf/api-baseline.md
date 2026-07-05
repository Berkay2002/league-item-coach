# Overwolf API Baseline

This file records the Overwolf Native API surface needed for the League Item Coach MVP.

The product target is an Overwolf Native Framework WebApp: HTML, JavaScript, React, `manifest.json`, and Overwolf JavaScript APIs running inside the Overwolf Desktop App. It is not a standalone Electron app.

## Primary Docs

- SDK introduction: https://dev.overwolf.com/ow-native/reference/ow-sdk-introduction
- API overview: https://dev.overwolf.com/ow-native/reference/ow-api-overview
- Manifest file: https://dev.overwolf.com/ow-native/reference/manifest/manifest-json
- Manifest validation: https://dev.overwolf.com/ow-native/reference/manifest/validate-your-manifest-json
- Manifest schema: https://github.com/overwolf/community-gists/blob/master/overwolf-manifest-schema.json
- Raw manifest schema: https://raw.githubusercontent.com/overwolf/community-gists/master/overwolf-manifest-schema.json
- Windows API: https://dev.overwolf.com/ow-native/reference/windows/ow-windows

## Manifest Baseline

The Overwolf app must keep a valid `apps/overwolf/public/manifest.json`.

Current repo validation is local and pinned:

```bash
cd apps/overwolf
bun run validate:manifest
```

The validator uses `apps/overwolf/overwolf-manifest-schema.json` and `ajv-cli`. Do not fetch the schema from GitHub during normal lint, test, or build runs. Refresh the pinned schema intentionally when Overwolf changes the manifest format.

Read more:

- The Manifest file: https://dev.overwolf.com/ow-native/reference/manifest/manifest-json
- Validate your manifest.json: https://dev.overwolf.com/ow-native/reference/manifest/validate-your-manifest-json

## Required For MVP

### `overwolf.games`

Use this API for app shell lifecycle and current game state.

League identifiers:

- League of Legends game ID: `5426`
- League of Legends launcher ID: `10902`

Needed methods and events:

- `overwolf.games.getRunningGameInfo2(callback)`
- `overwolf.games.onGameInfoUpdated`

Use these to answer:

- Is League currently running?
- Did League start or terminate?
- Is the game focused?
- Did the game resolution or overlay state change?
- Is the overlay likely usable?

Do not use deprecated `overwolf.games.getRunningGameInfo()`; the docs say to use `getRunningGameInfo2()`.

Read more:

- `overwolf.games`: https://dev.overwolf.com/ow-native/reference/games/ow-games

### `overwolf.windows`

Use this API for declared Overwolf window lifecycle and small overlay controls.

Needed methods and events:

- `overwolf.windows.getCurrentWindow(callback)`
- `overwolf.windows.obtainDeclaredWindow(windowName, callback)`
- `overwolf.windows.getWindow(windowName, callback)`
- `overwolf.windows.getWindowState(windowId, callback)`
- `overwolf.windows.onStateChanged`
- `overwolf.windows.restore(windowIdOrName, callback)`
- `overwolf.windows.hide(windowIdOrName, callback)`
- `overwolf.windows.bringToFront(windowIdOrName, callback)`

Possibly useful for basic UX:

- `overwolf.windows.dragMove(windowId, callback)`
- `overwolf.windows.changePosition(windowId, left, top, callback)`
- `overwolf.windows.changeSize(changeSizeParams, callback)`

Use these to answer:

- What is the current overlay window id?
- Is the overlay normal, minimized, hidden, closed, or maximized?
- Should the overlay be restored or hidden when League starts, exits, or focus changes?
- Can the user drag the compact overlay to a better spot?

Use `window_state_ex` and `stateEx` fields, not the deprecated `window_state` or `state` fields.

Avoid by default:

- `overwolf.windows.requestOverlayFocus(...)`
- `overwolf.windows.bringToFront(..., grabFocus: true, ...)`
- `overwolf.windows.setTopmost(...)`
- `overwolf.windows.setWindowStyle(...InputPassThrough...)`
- `overwolf.windows.sendMessage(...)`
- `overwolf.windows.getOpenWindows(...)`

Reason: focus stealing and topmost behavior can be bad in-game UX, pass-through styles need explicit interaction design, and the docs recommend `getMainWindow()` over `sendMessage()` for multi-window communication. The MVP currently has one compact window, so multi-window messaging is unnecessary.

Do not use deprecated `changeSize(windowId, width, height, callback)` or `setDesktopOnly(...)`.

Read more:

- `overwolf.windows`: https://dev.overwolf.com/ow-native/reference/windows/ow-windows

### Riot Live Client Data API

The recommendation input can come from Riot's local Live Client Data API:

```text
https://127.0.0.1:2999/liveclientdata/allgamedata
```

Use it for:

- active player gold
- active player items
- player list
- champion names
- teams
- KDA
- CS
- levels
- enemy item state

This direct HTTP path is useful for local replay fixtures, development outside Overwolf, and deterministic recommender tests.

Overwolf owns the app shell, overlay, windows, and game lifecycle. Riot Live Client Data owns the match-state input for local recommendation decisions, whether that data arrives through direct local HTTP or through Overwolf's League `live_client_data` feature.

## Optional Later

### `overwolf.games.events`

Use this if we want the Overwolf-native path for League match data and match lifecycle.

League exposes these relevant features:

- `live_client_data`
- `matchState`
- `match_info`
- `summoner_info`
- `teams`

Preferred MVP feature set:

```ts
["live_client_data", "matchState"]
```

Expanded safe feature set if needed:

```ts
["live_client_data", "matchState", "summoner_info", "teams"]
```

The `live_client_data` feature exposes:

- `active_player`
- `all_players`
- `events`
- `game_data`
- `port`

Potentially useful features:

- `matchState`
- `summoner_info`
- `teams`

Potentially useful methods and events:

- `overwolf.games.events.setRequiredFeatures(features, callback)`
- `overwolf.games.events.getInfo(callback)`
- `overwolf.games.events.onInfoUpdates2`

Important constraint: if this API is used, relevant game event features must be declared in the manifest under `game_events`. The docs also say `setRequiredFeatures()` should be called only from a background controller when an app has one, and success should be confirmed before relying on events.

Avoid `overwolf.games.events.onNewEvents` for MVP recommendation behavior. It is meant for discrete events such as kill and death. Building around kill or death triggers pushes the product toward live tactical coaching. Passive KDA from Live Client Data is enough for item weighting.

League-specific exclusions:

- Do not use `kill`, `death`, `assist`, `respawn`, `announcer`, or `counters` for recommendation triggers.
- Do not use `abilities`, `team_frames`, or cooldown-related features. `team_frames` exposes ultimate cooldown timers, which are outside the MVP guardrails.
- Do not use `jungle_camps`; it is objective and timer adjacent.
- Do not use `chat`; the docs say it is intended for real-time usage only and should not be logged.
- Do not use `gameMode`; the League docs currently say this feature is incorrect. Use `queueId` from `matchState` instead.
- Avoid Brawl-related data entirely. The League docs state that Riot does not approve Brawl-related data being aggregated or visible on third-party products/apps.

Read more:

- `overwolf.games.events`: https://dev.overwolf.com/ow-native/reference/games/events
- Using game events guide: https://dev.overwolf.com/ow-native/guides/general-tech/using-game-events-in-your-app
- Game IDs: https://dev.overwolf.com/ow-native/guides/dev-tools/games-ids

## Not Needed For MVP

### `overwolf.games.tracked`

Do not use this for League Item Coach.

The docs describe `overwolf.games.tracked` as an API for games defined as unsupported in the Gameslist. It requires `tracked` under `launch_events` in `manifest.json`, and `track_all_games` for unsupported game launch events.

League is a supported Overwolf target for this app. Adding tracked or track-all-games behavior would broaden app scope unnecessarily.

Read more:

- `overwolf.games.tracked`: https://dev.overwolf.com/ow-native/reference/games/tracked

### `overwolf.games.launchers`

Skip unless the app later needs Riot Client launcher lifecycle separately from the League game process.

Read more:

- `overwolf.games.launchers`: https://dev.overwolf.com/ow-native/reference/games/launchers
- `overwolf.games.launchers.events`: https://dev.overwolf.com/ow-native/reference/games/launchers-events

### `overwolf.games.inputTracking`

Avoid for this product. The MVP does not need player input tracking, and the feature is more sensitive than the recommendation loop requires.

Read more:

- `overwolf.games.inputTracking`: https://dev.overwolf.com/ow-native/reference/games/input-tracking

## Explicitly Out Of Scope

These API areas are not needed for the MVP unless a later issue gives a concrete reason:

- ads
- crossapp campaign
- cryptography
- extensions and custom plugins
- io
- logitech
- media
- notifications
- os
- profile
- settings
- social
- streaming
- web
- OBS
- Overwolf OIDC
- App Subscriptions API

## Implementation Rule

Default to the smallest Overwolf API surface:

1. Use `overwolf.games` to know whether League is running and whether the overlay shell should be in live or fallback mode.
2. Use Riot Live Client Data for recommendation inputs.
3. Use `overwolf.games.events` only for match lifecycle if Riot Live Client Data is not enough.
4. Do not add manifest permissions or event features until the code needs them.
