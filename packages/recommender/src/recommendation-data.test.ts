import { describe, expect, test } from "bun:test"

import {
  createMemoryRecommendationVersionCache,
  createStaticRecommendationVersionSource,
  loadRecommendationVersion,
  mockSupabaseRecommendationVersionResponse,
  recommendationVersionCacheKey,
  selectBaselineRecommendations,
} from "./recommendation-data"

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
      source: createStaticRecommendationVersionSource(
        mockSupabaseRecommendationVersionResponse
      ),
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
      mockSupabaseRecommendationVersionResponse
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
})
