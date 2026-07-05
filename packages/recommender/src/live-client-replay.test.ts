import { describe, expect, test } from "bun:test"

import { adaptLiveClientReplayToPlannerInput } from "./index"
import { healingBotLaneLiveClientReplay } from "./live-client-replay.fixtures"

describe("Live Client Data replay adapter", () => {
  test("converts a Live Client Data fixture into manual planner input", () => {
    const result = adaptLiveClientReplayToPlannerInput(
      healingBotLaneLiveClientReplay
    )

    expect(result.status).toBe("ready")
    expect(result.warnings).toEqual([])
    expect(result.input).toEqual({
      championId: "jinx",
      role: "bot",
      allyChampionIds: ["lux", "amumu"],
      enemyChampionIds: ["aatrox", "soraka", "zed"],
      currentGold: 1500,
      ownedComponentIds: ["executioners-calling"],
    })
    expect(result.replay.gameState).toEqual({
      gameMode: "CLASSIC",
      gameTime: 910.25,
      mapName: "Map11",
      mapNumber: 11,
      mapTerrain: "Default",
    })
    expect(result.replay.players[0]).toEqual(
      expect.objectContaining({
        championId: "jinx",
        items: [
          {
            count: 1,
            displayName: "Executioner's Calling",
            itemId: 3123,
            price: 800,
            slot: 0,
          },
        ],
        level: 9,
        team: "ORDER",
        score: {
          assists: 3,
          creepScore: 92,
          deaths: 1,
          kills: 4,
          wardScore: 5,
        },
      })
    )
  })

  test("returns a fallback input when local game data is unavailable", () => {
    const result = adaptLiveClientReplayToPlannerInput(undefined)

    expect(result.status).toBe("unavailable")
    expect(result.input).toEqual({
      championId: "jinx",
      role: "bot",
      allyChampionIds: [],
      enemyChampionIds: [],
      currentGold: 0,
      ownedComponentIds: [],
    })
    expect(result.replay.players).toEqual([])
    expect(result.replay.gameState).toBeUndefined()
    expect(result.warnings).toContain("Live Client Data replay is unavailable.")
    expect(result.warnings).toContain(
      "Returned planner input is a fallback, not live game data."
    )
  })

  test("treats zero current gold as valid live data", () => {
    const result = adaptLiveClientReplayToPlannerInput({
      ...healingBotLaneLiveClientReplay,
      activePlayer: {
        ...healingBotLaneLiveClientReplay.activePlayer,
        currentGold: 0,
      },
    })

    expect(result.status).toBe("ready")
    expect(result.input.currentGold).toBe(0)
    expect(result.warnings).not.toContain(
      "Active player current gold is missing or invalid."
    )
  })

  test("matches active player from split Riot ID fields", () => {
    const replay = {
      ...healingBotLaneLiveClientReplay,
      activePlayer: {
        ...healingBotLaneLiveClientReplay.activePlayer,
        riotId: undefined,
      },
      allPlayers: healingBotLaneLiveClientReplay.allPlayers.map(
        (player, index) =>
          index === 0
            ? {
                ...player,
                riotId: undefined,
                riotIdGameName: "Coach Player",
                riotIdTagLine: "EUW",
              }
            : player
      ),
    }

    const result = adaptLiveClientReplayToPlannerInput(replay)

    expect(result.status).toBe("ready")
    expect(result.replay.activePlayerRiotId).toBe("Coach Player#EUW")
    expect(result.replay.players[0]?.riotId).toBe("Coach Player#EUW")
    expect(result.input.championId).toBe("jinx")
  })

  test("normalizes integer fields and trims live client positions", () => {
    const replay = {
      ...healingBotLaneLiveClientReplay,
      allPlayers: healingBotLaneLiveClientReplay.allPlayers.map(
        (player, index) =>
          index === 0
            ? {
                ...player,
                items: [
                  {
                    count: 1.8,
                    displayName: "Executioner's Calling",
                    itemID: 3123,
                    price: 800.9,
                    slot: 0.7,
                  },
                ],
                level: 9.9,
                position: " bottom ",
                scores: {
                  assists: 3.9,
                  creepScore: 92.5,
                  deaths: 1.2,
                  kills: 4.8,
                  wardScore: 5.1,
                },
              }
            : player
      ),
    }

    const result = adaptLiveClientReplayToPlannerInput(replay)

    expect(result.status).toBe("ready")
    expect(result.input.role).toBe("bot")
    expect(result.replay.players[0]).toEqual(
      expect.objectContaining({
        items: [
          {
            count: 1,
            displayName: "Executioner's Calling",
            itemId: 3123,
            price: 800,
            slot: 0,
          },
        ],
        level: 9,
        score: {
          assists: 3,
          creepScore: 92,
          deaths: 1,
          kills: 4,
          wardScore: 5,
        },
      })
    )
  })

  test("warns when role falls back because position is unavailable", () => {
    const replay = {
      ...healingBotLaneLiveClientReplay,
      allPlayers: healingBotLaneLiveClientReplay.allPlayers.map(
        (player, index) =>
          index === 0
            ? {
                ...player,
                position: undefined,
              }
            : player
      ),
    }

    const result = adaptLiveClientReplayToPlannerInput(replay)

    expect(result.status).toBe("ready")
    expect(result.input.role).toBe("bot")
    expect(result.warnings).toContain(
      "Active player's role could not be determined from position data."
    )
  })
})
