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
})
