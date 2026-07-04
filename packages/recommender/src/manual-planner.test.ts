import { describe, expect, test } from "bun:test"

import {
  recommendForManualPlanner,
  seededPlannerCatalog,
  type ManualPlannerInput,
} from "./index"

describe("manual planner recommendation", () => {
  test("builds a compliance-safe recommendation from seeded planner state", () => {
    const input: ManualPlannerInput = {
      championId: "jinx",
      role: "bot",
      allyChampionIds: ["lux", "amumu"],
      enemyChampionIds: ["aatrox", "soraka", "zed"],
    }

    const recommendation = recommendForManualPlanner(input)

    expect(seededPlannerCatalog.champions.jinx.name).toBe("Jinx")
    expect(recommendation.input).toEqual(input)
    expect(recommendation.primaryItem.name).toBe("Kraken Slayer")
    expect(recommendation.alternativeItem?.name).toBe("Executioner's Calling")
    expect(recommendation.fullBuild.map((item) => item.itemId)).toContain(
      "infinity-edge"
    )
    expect(recommendation.explanation).toContain("Jinx")
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test.each([
    {
      name: "tank-heavy enemies move anti-tank into the plan",
      input: {
        championId: "jinx",
        role: "bot",
        allyChampionIds: ["lux"],
        enemyChampionIds: ["malphite", "leona", "amumu"],
      } satisfies ManualPlannerInput,
      primaryItemId: "kraken-slayer",
      alternativeItemId: "lord-dominiks-regards",
      fullBuildItemId: "lord-dominiks-regards",
      learningRule: "multiple tanks",
    },
    {
      name: "magic-threat-heavy enemies produce a magic-resist alternative",
      input: {
        championId: "malphite",
        role: "top",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["ahri", "lux", "leona"],
      } satisfies ManualPlannerInput,
      primaryItemId: "sunfire-aegis",
      alternativeItemId: "hollow-radiance",
      fullBuildItemId: "hollow-radiance",
      learningRule: "magic damage is the larger threat",
    },
    {
      name: "balanced enemies keep the baseline item without an alternative",
      input: {
        championId: "lux",
        role: "mid",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["ahri", "zed"],
      } satisfies ManualPlannerInput,
      primaryItemId: "liandrys-torment",
      alternativeItemId: undefined,
      fullBuildItemId: "zhonyas-hourglass",
      learningRule: "Start from the seeded baseline",
    },
  ])(
    "$name",
    ({
      input,
      primaryItemId,
      alternativeItemId,
      fullBuildItemId,
      learningRule,
    }) => {
      const recommendation = recommendForManualPlanner(input)

      expect(recommendation.input).toEqual(input)
      expect(recommendation.primaryItem.itemId).toBe(primaryItemId)
      expect(recommendation.alternativeItem?.itemId).toBe(alternativeItemId)
      expect(recommendation.fullBuild.map((item) => item.itemId)).toContain(
        fullBuildItemId
      )
      expect(recommendation.explanation).toContain(
        seededPlannerCatalog.champions[input.championId].name
      )
      expect(recommendation.learningRule).toContain(learningRule)
      expect(recommendation.compliance.allowed).toBe(true)
    }
  )
})
