import { describe, expect, test } from "bun:test"

import { validateRecommendationOutput } from "@workspace/recommender"

import { createMockOverlayRecommendation } from "./mock-recommendation"

describe("mock Overwolf recommendation output", () => {
  test("returns one compact next-item recommendation with current-gold context", () => {
    const recommendation = createMockOverlayRecommendation()

    expect(recommendation.source).toBe("mock")
    expect(recommendation.champion).toBe("Jinx")
    expect(recommendation.targetItem.name).toBe("Mortal Reminder")
    expect(recommendation.affordableComponent?.name).toBe(
      "Executioner's Calling"
    )
    expect(recommendation.currentGold).toBe(900)
    expect(recommendation.alternativeItem?.name).toBe("Kraken Slayer")
  })

  test("keeps mocked overlay text inside MVP compliance boundaries", () => {
    const recommendation = createMockOverlayRecommendation()
    const result = validateRecommendationOutput(recommendation)

    expect(result.allowed).toBe(true)
    expect(result.violations).toEqual([])
  })

  test("does not render command-like notification copy", () => {
    const recommendation = createMockOverlayRecommendation()
    const serialized = JSON.stringify(recommendation)

    expect(serialized).not.toMatch(/\bbuy\b.*\bnow\b/i)
    expect(serialized).not.toMatch(/\buse this when\b/i)
    expect(serialized).not.toMatch(/\bpower[- ]?spike\b/i)
    expect(serialized).not.toMatch(/\b(timer|cooldown)\b/i)
  })
})

describe("Overwolf manifest", () => {
  test("declares a loadable one-window WebApp shell", async () => {
    const manifest = await Bun.file(
      new URL("../public/manifest.json", import.meta.url)
    ).json()

    expect(manifest.manifest_version).toBe(1)
    expect(manifest.type).toBe("WebApp")
    expect(manifest.meta.icon).toBe("assets/icon.png")
    expect(manifest.data.start_window).toBe("main")
    expect(manifest.data.windows.main.file).toBe("index.html")
    expect(manifest.data.windows.main.size).toEqual({
      width: 390,
      height: 330,
    })
    expect(manifest.data.windows.main.min_size).toEqual({
      width: 390,
      height: 330,
    })
    expect(manifest.permissions ?? []).toEqual([])
  })
})
