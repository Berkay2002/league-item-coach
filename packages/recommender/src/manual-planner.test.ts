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
    targetItemId: string
    targetItemName: string
    targetBuildStage: "component" | "completed"
    alternativeItemId: string
    buyNowComponentId?: string
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
    currentGold: 900,
    ownedComponentIds: [],
  },
  expected: {
    targetItemId: "mortal-reminder",
    targetItemName: "Mortal Reminder",
    targetBuildStage: "completed",
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

    expect(recommendation.targetItem.itemId).toBe(expected.targetItemId)
    expect(recommendation.targetItem.name).toBe(expected.targetItemName)
    expect(recommendation.targetItem.buildStage).toBe(expected.targetBuildStage)
    expect(recommendation.targetItem.reason).toContain(expected.reasonText)
    expect(recommendation.targetItem.tags).toContain(expected.tag)
    expect(recommendation.alternativeItem?.itemId).toBe(
      expected.alternativeItemId
    )
    expect(recommendation.buyNow.component?.itemId).toBe(
      expected.buyNowComponentId
    )
    expect(recommendation.buyNow.component?.buildStage).toBe("component")
    expect(recommendation.confidence).toBe(expected.confidence)
    expect(recommendation.explanation).toContain(expected.explanationText)
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test("omits the buy-now component when current gold cannot afford the next component", () => {
    const recommendation = recommendForManualPlanner({
      championId: "jinx",
      role: "bot",
      allyChampionIds: ["lux", "amumu"],
      enemyChampionIds: ["aatrox", "soraka"],
      currentGold: 500,
      ownedComponentIds: [],
    })

    expect(recommendation.targetItem.itemId).toBe("mortal-reminder")
    expect(recommendation.buyNow.component).toBeUndefined()
    expect(recommendation.buyNow.reason).toContain("Save")
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test("skips already-owned components when choosing the buy-now component", () => {
    const recommendation = recommendForManualPlanner({
      championId: "jinx",
      role: "bot",
      allyChampionIds: ["lux", "amumu"],
      enemyChampionIds: ["aatrox", "soraka"],
      currentGold: 1500,
      ownedComponentIds: ["executioners-calling"],
    })

    expect(recommendation.targetItem.itemId).toBe("mortal-reminder")
    expect(recommendation.buyNow.component?.itemId).toBe("last-whisper")
    expect(recommendation.buyNow.component?.buildStage).toBe("component")
    expect(recommendation.buyNow.reason).toContain("already own")
    expect(recommendation.compliance.allowed).toBe(true)
  })

  test("builds a compliance-safe recommendation from seeded planner state", () => {
    const input = staticHealingCompFixture.input

    const recommendation = recommendForManualPlanner(input)

    expect(seededPlannerCatalog.champions.jinx.name).toBe("Jinx")
    expect(recommendation.input).toEqual(input)
    expect(recommendation.targetItem.name).toBe("Mortal Reminder")
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
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "kraken-slayer",
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
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "sunfire-aegis",
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
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "liandrys-torment",
      alternativeItemId: undefined,
      fullBuildItemId: "zhonyas-hourglass",
      learningRule: "Start from the seeded baseline",
    },
  ])(
    "$name",
    ({
      input,
      targetItemId,
      alternativeItemId,
      fullBuildItemId,
      learningRule,
    }) => {
      const recommendation = recommendForManualPlanner(input)

      expect(recommendation.input).toEqual(input)
      expect(recommendation.targetItem.itemId).toBe(targetItemId)
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
