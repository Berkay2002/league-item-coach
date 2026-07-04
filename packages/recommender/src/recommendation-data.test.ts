import { describe, expect, test } from "bun:test"

import {
  createMemoryRecommendationVersionCache,
  createStaticRecommendationVersionSource,
  loadRecommendationVersion,
  parseSupabaseRecommendationVersionResponse,
  recommendationVersionCacheKey,
  selectBaselineRecommendations,
} from "./recommendation-data"
import { mockRecommendationVersion } from "./recommendation-data.fixtures"

describe("recommendation data version loading", () => {
  test("returns a cached recommendation version without calling the source", async () => {
    const cache = createMemoryRecommendationVersionCache()
    const source = createStaticRecommendationVersionSource({
      loadActiveVersion: async () => {
        throw new Error("source should not be called on a cache hit")
      },
    })
    const cachedResult = await loadRecommendationVersion({
      cache,
      source: createStaticRecommendationVersionSource(mockRecommendationVersion),
    })

    expect(cachedResult.status).toBe("ready")
    expect(cache.get(recommendationVersionCacheKey)).toBeString()

    const result = await loadRecommendationVersion({ cache, source })

    expect(result).toEqual({
      status: "ready",
      source: "cache",
      version: cachedResult.version,
    })
  })

  test("loads and caches the active recommendation version on a cache miss", async () => {
    const cache = createMemoryRecommendationVersionCache()
    const source = createStaticRecommendationVersionSource(
      mockRecommendationVersion
    )

    const result = await loadRecommendationVersion({ cache, source })

    expect(result.status).toBe("ready")
    expect(result.source).toBe("backend")
    expect(result.version.patch.patchVersion).toBe("15.24")
    expect(result.version.itemTags).toContainEqual(
      expect.objectContaining({
        itemId: "mortal-reminder",
        tags: expect.arrayContaining(["anti-heal", "penetration"]),
      })
    )
    expect(result.version.championTags).toContainEqual(
      expect.objectContaining({
        championId: "jinx",
        roles: expect.arrayContaining(["bot"]),
      })
    )
    expect(result.version.baselineItemRecommendations).toContainEqual(
      expect.objectContaining({
        championId: "jinx",
        targetItemId: "kraken-slayer",
      })
    )
    expect(result.version.baselineRuneRecommendations).toContainEqual(
      expect.objectContaining({
        championId: "jinx",
        keystone: expect.objectContaining({ name: "Lethal Tempo" }),
      })
    )
    expect(
      selectBaselineRecommendations(result.version, {
        championId: "jinx",
        role: "bot",
      })
    ).toEqual({
      itemRecommendation: expect.objectContaining({
        targetItemId: "kraken-slayer",
      }),
      runeRecommendation: expect.objectContaining({
        keystone: expect.objectContaining({ name: "Lethal Tempo" }),
      }),
    })
    expect(cache.get(recommendationVersionCacheKey)).toBeString()
  })

  test("reports unavailable when the source fails and no cached version exists", async () => {
    const cache = createMemoryRecommendationVersionCache()
    const source = createStaticRecommendationVersionSource({
      loadActiveVersion: async () => {
        throw new Error("mock backend unavailable")
      },
    })

    const result = await loadRecommendationVersion({ cache, source })

    expect(result).toEqual({
      status: "unavailable",
      reason: "mock backend unavailable",
    })
    expect(cache.get(recommendationVersionCacheKey)).toBeNull()
  })

  test("ignores malformed cached recommendation data and loads from source", async () => {
    const cache = createMemoryRecommendationVersionCache([
      [recommendationVersionCacheKey, JSON.stringify({ patch: {} })],
    ])

    const result = await loadRecommendationVersion({
      cache,
      source: createStaticRecommendationVersionSource(mockRecommendationVersion),
    })

    expect(result.status).toBe("ready")
    expect(result.source).toBe("backend")
    expect(result.version.patch.patchVersion).toBe("15.24")
  })

  test("rejects malformed Supabase recommendation version rows", () => {
    expect(() =>
      parseSupabaseRecommendationVersionResponse({
        id: "rec-version-15.24-seeded-v1",
        patch_version: "15.24",
        data_dragon_version: "15.24.1",
        imported_at: "2026-07-04T00:00:00.000Z",
        item_tags: [{}],
        champion_tags: [],
        baseline_item_recommendations: [],
        baseline_rune_recommendations: [],
      })
    ).toThrow("item_id")
  })
})
