import { describe, expect, test } from "bun:test"

import { validateRecommendationOutput } from "@workspace/recommender"

import {
  createLiveOverlayRecommendation,
  createOverlayRecommendationFromReplay,
  fetchLiveClientAllGameData,
  liveClientRequestTimeoutMs,
  liveClientAllGameDataUrl,
  type LiveClientDataFetcher,
} from "./live-recommendation"
import { bundledReplayFixture } from "./replay-fixtures"

describe("live Overwolf recommendation loop", () => {
  test("builds the overlay recommendation from normalized replay data", () => {
    const recommendation = createOverlayRecommendationFromReplay(
      bundledReplayFixture,
      {
        source: "replay",
      }
    )

    expect(recommendation.source).toBe("replay")
    expect(recommendation.champion).toBe("Jinx")
    expect(recommendation.role).toBe("bot")
    expect(recommendation.roleLabel).toBe("Bot")
    expect(recommendation.currentGold).toBe(1500)
    expect(recommendation.targetItem.name).toBe("Mortal Reminder")
    expect(recommendation.affordableComponent?.name).toBe("Last Whisper")
    expect(recommendation.confidence).toBe("medium")
    expect(recommendation.targetItem.reason).toContain("enemy healing")
    expect(validateRecommendationOutput(recommendation).allowed).toBe(true)
  })

  test("changes the buy-now component when owned live items change", () => {
    const withoutOwnedComponent = {
      ...bundledReplayFixture,
      allPlayers: bundledReplayFixture.allPlayers.map((player, index) =>
        index === 0 ? { ...player, items: [] } : player
      ),
    }

    const beforePurchase = createOverlayRecommendationFromReplay(
      withoutOwnedComponent,
      {
        source: "live",
      }
    )
    const afterPurchase = createOverlayRecommendationFromReplay(
      bundledReplayFixture,
      {
        source: "live",
      }
    )

    expect(beforePurchase.affordableComponent?.name).toBe(
      "Executioner's Calling"
    )
    expect(afterPurchase.affordableComponent?.name).toBe("Last Whisper")
  })

  test("changes target item when live threat data changes", () => {
    const tankThreatReplay = {
      ...bundledReplayFixture,
      allPlayers: bundledReplayFixture.allPlayers.map((player) => {
        if (player.team !== "CHAOS") {
          return player
        }

        return {
          ...player,
          championName: "Malphite",
          items: [
            {
              count: 1,
              displayName: "Sunfire Aegis",
              itemID: 3068,
              price: 2700,
              slot: 0,
            },
          ],
          level: 12,
          scores: {
            assists: 8,
            creepScore: 130,
            deaths: 2,
            kills: 4,
            wardScore: 8,
          },
        }
      }),
    }

    const recommendation = createOverlayRecommendationFromReplay(
      tankThreatReplay,
      {
        source: "live",
      }
    )

    expect(recommendation.targetItem.name).toBe("Lord Dominik's Regards")
    expect(recommendation.targetItem.reason).toContain("penetration")
  })

  test("uses bundled replay data when League is not running", async () => {
    const recommendation = await createLiveOverlayRecommendation({
      fetcher: async () => {
        throw new Error("connection refused")
      },
    })

    expect(recommendation.source).toBe("replay")
    expect(recommendation.champion).toBe("Jinx")
    expect(recommendation.warnings.join(" ")).toContain(
      "Live Client Data unavailable"
    )
    expect(validateRecommendationOutput(recommendation).allowed).toBe(true)
  })

  test("fetches only the local Live Client Data endpoint with GET", async () => {
    const calls: unknown[] = []
    const fetcher: LiveClientDataFetcher = async (input, init) => {
      calls.push([input, init])

      return {
        ok: true,
        status: 200,
        json: async () => bundledReplayFixture,
      }
    }

    const replay = await fetchLiveClientAllGameData({ fetcher })

    expect(replay).toBe(bundledReplayFixture)
    expect(calls).toEqual([
      [
        liveClientAllGameDataUrl,
        expect.objectContaining({
          method: "GET",
          signal: expect.any(AbortSignal),
        }),
      ],
    ])
  })

  test("times out hung local Live Client Data requests", async () => {
    const fetcher: LiveClientDataFetcher = async (_input, init) => {
      return await new Promise((_resolve, reject) => {
        const signal = init?.signal

        if (signal instanceof AbortSignal) {
          signal.addEventListener("abort", () => {
            reject(new Error("aborted"))
          })
        }
      })
    }

    await expect(
      fetchLiveClientAllGameData({
        fetcher,
        requestTimeoutMs: 1,
      })
    ).rejects.toThrow("timed out")
    expect(liveClientRequestTimeoutMs).toBeGreaterThan(1)
  })

  test("uses Overwolf web transport when the runtime provides it", async () => {
    const originalOverwolf = (
      globalThis as typeof globalThis & { overwolf?: unknown }
    ).overwolf
    const calls: unknown[] = []

    ;(globalThis as typeof globalThis & { overwolf?: unknown }).overwolf = {
      web: {
        sendHttpRequest: (
          url: string,
          method: string,
          headers: readonly unknown[],
          data: string,
          callback: (result: unknown) => void
        ) => {
          calls.push([url, method, headers, data])
          callback({
            success: true,
            statusCode: 200,
            data: JSON.stringify(bundledReplayFixture),
          })
        },
      },
    }

    try {
      const replay = await fetchLiveClientAllGameData()

      expect(replay).toEqual(bundledReplayFixture)
      expect(calls).toEqual([[liveClientAllGameDataUrl, "GET", [], ""]])
    } finally {
      ;(globalThis as typeof globalThis & { overwolf?: unknown }).overwolf =
        originalOverwolf
    }
  })

  test("includes Overwolf web failure details", async () => {
    const originalOverwolf = (
      globalThis as typeof globalThis & { overwolf?: unknown }
    ).overwolf

    ;(globalThis as typeof globalThis & { overwolf?: unknown }).overwolf = {
      web: {
        sendHttpRequest: (
          _url: string,
          _method: string,
          _headers: readonly unknown[],
          _data: string,
          callback: (result: unknown) => void
        ) => {
          callback({
            success: false,
            statusCode: 403,
            error: "missing Web permission",
          })
        },
      },
    }

    try {
      await expect(fetchLiveClientAllGameData()).rejects.toThrow(
        "Overwolf web request failed: status 403; missing Web permission"
      )
    } finally {
      ;(globalThis as typeof globalThis & { overwolf?: unknown }).overwolf =
        originalOverwolf
    }
  })
})
