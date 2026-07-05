import { describe, expect, test } from "bun:test"

import { validateRecommendationOutput } from "@workspace/recommender"

import {
  createLiveOverlayRecommendation,
  createOverlayRecommendationFromReplay,
  fetchLiveClientAllGameData,
  liveClientAllGameDataUrl,
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
    expect(recommendation.role).toBe("Bot")
    expect(recommendation.currentGold).toBe(1500)
    expect(recommendation.targetItem.name).toBe("Mortal Reminder")
    expect(recommendation.affordableComponent?.name).toBe("Last Whisper")
    expect(recommendation.confidence).toBe("medium")
    expect(recommendation.reason).toContain("enemy healing")
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
    expect(recommendation.reason).toContain("penetration")
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
    const fetcher: typeof fetch = async (input, init) => {
      calls.push([input, init])

      return {
        ok: true,
        json: async () => bundledReplayFixture,
      } as Response
    }

    const replay = await fetchLiveClientAllGameData({ fetcher })

    expect(replay).toBe(bundledReplayFixture)
    expect(calls).toEqual([
      [
        liveClientAllGameDataUrl,
        {
          cache: "no-store",
          method: "GET",
        },
      ],
    ])
  })
})
