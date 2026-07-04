import { describe, expect, test } from "bun:test"

import {
  recommendForManualPlanner,
  seededPlannerCatalog,
  type ManualPlannerInput,
  type RecommendationConfidence,
} from "./index"

interface StaticCompFixture {
  name: string
  input: ManualPlannerInput
  expected: {
    primaryItemId: string
    primaryItemName: string
    primaryBuildStage: "component" | "completed"
    alternativeItemId: string
    buyNowComponentId: string
    confidence: RecommendationConfidence
    explanationText: string
    reasonText: string
    tag: string
  }
}

const staticHealingCompFixture = {
  name: "healing-heavy enemies move the primary target to completed anti-heal",
  input: {
    championId: "jinx",
    role: "bot",
    allyChampionIds: ["lux", "amumu"],
    enemyChampionIds: ["aatrox", "soraka", "zed"],
  },
  expected: {
    primaryItemId: "mortal-reminder",
    primaryItemName: "Mortal Reminder",
    primaryBuildStage: "completed",
    alternativeItemId: "kraken-slayer",
    buyNowComponentId: "executioners-calling",
    confidence: "medium",
    explanationText: "enemy healing",
    reasonText: "enemy healing",
    tag: "anti-heal",
  },
} satisfies StaticCompFixture

describe("manual planner recommendation", () => {
  test.each([staticHealingCompFixture])("$name", ({ input, expected }) => {
    const recommendation = recommendForManualPlanner(input)

    expect(recommendation.primaryItem.itemId).toBe(expected.primaryItemId)
    expect(recommendation.primaryItem.name).toBe(expected.primaryItemName)
    expect(recommendation.primaryItem.buildStage).toBe(
      expected.primaryBuildStage
    )
    expect(recommendation.primaryItem.reason).toContain(expected.reasonText)
    expect(recommendation.primaryItem.tags).toContain(expected.tag)
    expect(recommendation.alternativeItem?.itemId).toBe(
      expected.alternativeItemId
    )
    expect(recommendation.buyNowComponent?.itemId).toBe(
      expected.buyNowComponentId
    )
    expect(recommendation.buyNowComponent?.buildStage).toBe("component")
    expect(recommendation.confidence).toBe(expected.confidence)
    expect(recommendation.explanation).toContain(expected.explanationText)
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test("omits buy-now anti-heal when the mapped item is not a fitting component", () => {
    const recommendation = recommendForManualPlanner({
      championId: "lux",
      role: "mid",
      allyChampionIds: ["jinx"],
      enemyChampionIds: ["aatrox", "soraka"],
    })

    expect(recommendation.primaryItem.itemId).toBe("morellonomicon")
    expect(recommendation.primaryItem.buildStage).toBe("completed")
    expect(recommendation.buyNowComponent).toBeUndefined()
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test("builds a compliance-safe recommendation from seeded planner state", () => {
    const input = staticHealingCompFixture.input

    const recommendation = recommendForManualPlanner(input)

    expect(seededPlannerCatalog.champions.jinx.name).toBe("Jinx")
    expect(recommendation.input).toEqual(input)
    expect(recommendation.primaryItem.name).toBe("Mortal Reminder")
    expect(recommendation.alternativeItem?.name).toBe("Kraken Slayer")
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
