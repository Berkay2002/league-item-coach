import { describe, expect, test } from "bun:test"

import {
  recommendForManualPlanner,
  seededPlannerCatalog,
  type ChampionId,
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

function enemySnapshot(
  championId: ChampionId,
  overrides: Partial<
    NonNullable<ManualPlannerInput["enemyLiveSnapshots"]>[number]
  > = {}
): NonNullable<ManualPlannerInput["enemyLiveSnapshots"]>[number] {
  return {
    championId,
    items: [],
    level: 9,
    creepScore: 80,
    kills: 1,
    assists: 2,
    deaths: 2,
    ...overrides,
  }
}

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

  test("returns a champion-select rune fixture for a champion, role, and matchup", () => {
    const recommendation = recommendForManualPlanner(
      staticHealingCompFixture.input
    )

    expect(recommendation.runeRecommendation.primaryTree).toEqual(
      expect.objectContaining({
        dataDragonId: 8000,
        name: "Precision",
      })
    )
    expect(recommendation.runeRecommendation.keystone).toEqual(
      expect.objectContaining({
        dataDragonId: 8008,
        name: "Lethal Tempo",
      })
    )
    expect(recommendation.runeRecommendation.secondaryTree).toEqual(
      expect.objectContaining({
        dataDragonId: 8400,
        name: "Resolve",
      })
    )
    expect(
      recommendation.runeRecommendation.keyMinorRunes.map((rune) => rune.name)
    ).toEqual([
      "Presence of Mind",
      "Legend: Bloodline",
      "Cut Down",
      "Bone Plating",
      "Overgrowth",
    ])
    expect(recommendation.runeRecommendation.explanation).toContain("safety")
    expect(recommendation.runeRecommendation.explanation).toContain("matchup")
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
      name: "fed physical threat overrides a raw AP-heavy enemy comp",
      input: {
        championId: "lux",
        role: "mid",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["zed", "ahri", "soraka"],
        enemyLiveSnapshots: [
          enemySnapshot("zed", {
            items: [
              {
                displayName: "Infinity Edge",
                itemId: 3031,
                price: 3450,
              },
            ],
            level: 13,
            creepScore: 142,
            kills: 10,
            assists: 4,
            deaths: 1,
          }),
          enemySnapshot("ahri"),
          enemySnapshot("soraka"),
        ],
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "zhonyas-hourglass",
      alternativeItemId: "liandrys-torment",
      fullBuildItemId: "liandrys-torment",
      learningRule: "fed physical threat",
    },
    {
      name: "fed magic threat overrides a raw AD-heavy enemy comp",
      input: {
        championId: "malphite",
        role: "top",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["ahri", "zed", "darius", "jinx", "garen"],
        enemyLiveSnapshots: [
          enemySnapshot("ahri", {
            items: [
              {
                displayName: "Rabadon's Deathcap",
                itemId: 3089,
                price: 3600,
              },
            ],
            level: 14,
            creepScore: 155,
            kills: 11,
            assists: 5,
            deaths: 1,
          }),
          enemySnapshot("zed"),
          enemySnapshot("darius"),
          enemySnapshot("jinx"),
          enemySnapshot("garen"),
        ],
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "hollow-radiance",
      alternativeItemId: "sunfire-aegis",
      fullBuildItemId: "sunfire-aegis",
      learningRule: "fed magic threat",
    },
    {
      name: "live healing threat moves anti-heal into the primary target",
      input: {
        championId: "jinx",
        role: "bot",
        allyChampionIds: ["lux"],
        enemyChampionIds: ["aatrox", "soraka", "zed"],
        enemyLiveSnapshots: [
          enemySnapshot("aatrox", {
            items: [
              {
                displayName: "Black Cleaver",
                itemId: 3071,
                price: 3000,
              },
            ],
            level: 12,
            creepScore: 122,
            kills: 7,
            assists: 4,
            deaths: 1,
          }),
          enemySnapshot("soraka", {
            level: 10,
            creepScore: 18,
            kills: 1,
            assists: 12,
            deaths: 1,
          }),
          enemySnapshot("zed"),
        ],
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "mortal-reminder",
      alternativeItemId: "kraken-slayer",
      fullBuildItemId: "mortal-reminder",
      learningRule: "repeat healing",
    },
    {
      name: "enemy anti-heal item does not create an anti-heal need",
      input: {
        championId: "lux",
        role: "mid",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["ahri", "zed"],
        enemyLiveSnapshots: [
          enemySnapshot("ahri", {
            items: [
              {
                displayName: "Morellonomicon",
                itemId: 3165,
                price: 2850,
              },
            ],
            level: 10,
            creepScore: 105,
            kills: 3,
            assists: 4,
            deaths: 2,
          }),
          enemySnapshot("zed"),
        ],
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "banshees-veil",
      alternativeItemId: "liandrys-torment",
      fullBuildItemId: "zhonyas-hourglass",
      learningRule: "fed magic threat",
    },
    {
      name: "fed crit carry moves anti-crit armor into the primary target",
      input: {
        championId: "darius",
        role: "top",
        allyChampionIds: ["jinx"],
        enemyChampionIds: ["jinx", "zed", "garen"],
        enemyLiveSnapshots: [
          enemySnapshot("jinx", {
            items: [
              {
                displayName: "Infinity Edge",
                itemId: 3031,
                price: 3450,
              },
            ],
            level: 13,
            creepScore: 170,
            kills: 9,
            assists: 3,
            deaths: 1,
          }),
          enemySnapshot("zed"),
          enemySnapshot("garen"),
        ],
        currentGold: 900,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "randuins-omen",
      alternativeItemId: "steraks-gage",
      fullBuildItemId: "steraks-gage",
      learningRule: "fed crit threat",
    },
    {
      name: "tank threats move penetration into the primary target",
      input: {
        championId: "jinx",
        role: "bot",
        allyChampionIds: ["lux"],
        enemyChampionIds: ["malphite", "leona", "amumu"],
        enemyLiveSnapshots: [
          enemySnapshot("malphite", {
            items: [
              {
                displayName: "Sunfire Aegis",
                itemId: 3068,
                price: 2700,
              },
            ],
            level: 12,
            creepScore: 135,
            kills: 4,
            assists: 8,
            deaths: 2,
          }),
          enemySnapshot("leona", {
            items: [
              {
                displayName: "Thornmail",
                itemId: 3075,
                price: 2450,
              },
            ],
            level: 11,
            creepScore: 35,
            kills: 2,
            assists: 12,
            deaths: 2,
          }),
          enemySnapshot("amumu", {
            level: 11,
            creepScore: 118,
            kills: 5,
            assists: 7,
            deaths: 3,
          }),
        ],
        currentGold: 1500,
        ownedComponentIds: [],
      } satisfies ManualPlannerInput,
      targetItemId: "lord-dominiks-regards",
      alternativeItemId: "kraken-slayer",
      fullBuildItemId: "kraken-slayer",
      learningRule: "penetration",
    },
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
