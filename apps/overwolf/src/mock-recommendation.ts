import {
  assertRecommendationOutputAllowed,
  recommendForManualPlanner,
  type ItemId,
  type ItemTag,
  type ManualPlannerInput,
  type PlannerItemRecommendation,
  type RecommendationConfidence,
  type Role,
} from "@workspace/recommender"

export interface MockOverlayRecommendation {
  source: "mock"
  champion: string
  role: string
  currentGold: number
  targetItem: OverlayItemRecommendation
  affordableComponent?: OverlayItemRecommendation
  alternativeItem?: OverlayItemRecommendation
  confidence: RecommendationConfidence
  explanation: string
  learningRule: string
}

export interface OverlayItemRecommendation {
  itemId: ItemId
  name: string
  reason: string
  tags: readonly ItemTag[]
}

export const mockPlannerInput: ManualPlannerInput = {
  championId: "jinx",
  role: "bot",
  allyChampionIds: ["lux", "amumu"],
  enemyChampionIds: ["aatrox", "soraka", "zed"],
  currentGold: 900,
  ownedComponentIds: [],
}

const roleLabels = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
} satisfies Record<Role, string>

export function createMockOverlayRecommendation(
  input: ManualPlannerInput = mockPlannerInput
): MockOverlayRecommendation {
  try {
    return createRecommendedMockOverlayRecommendation(input)
  } catch (error) {
    console.warn("Mock overlay recommendation fallback rendered.", error)

    return createFallbackMockOverlayRecommendation()
  }
}

function createRecommendedMockOverlayRecommendation(
  input: ManualPlannerInput
): MockOverlayRecommendation {
  const recommendation = recommendForManualPlanner(input)
  const overlayRecommendation: MockOverlayRecommendation = {
    source: "mock",
    champion: recommendation.champion.name,
    role: roleLabels[recommendation.role],
    currentGold: input.currentGold,
    targetItem: toOverlayItem(recommendation.targetItem),
    affordableComponent: recommendation.buyNow.component
      ? toOverlayItem(recommendation.buyNow.component, recommendation.buyNow.reason)
      : undefined,
    alternativeItem: recommendation.alternativeItem
      ? toOverlayItem(recommendation.alternativeItem)
      : undefined,
    confidence: recommendation.confidence,
    explanation: recommendation.explanation,
    learningRule: recommendation.learningRule,
  }

  assertRecommendationOutputAllowed(overlayRecommendation)

  return overlayRecommendation
}

function createFallbackMockOverlayRecommendation(): MockOverlayRecommendation {
  const fallbackRecommendation: MockOverlayRecommendation = {
    source: "mock",
    champion: "Mock champion",
    role: "Bot",
    currentGold: 0,
    targetItem: {
      itemId: "kraken-slayer",
      name: "Kraken Slayer",
      reason: "Fallback seeded item shown because mock data is unavailable.",
      tags: ["damage"],
    },
    confidence: "low",
    explanation: "Mock recommendation data is unavailable in this shell.",
    learningRule:
      "Item recommendations compare enemy needs with the next useful item slot.",
  }

  assertRecommendationOutputAllowed(fallbackRecommendation)

  return fallbackRecommendation
}

function toOverlayItem(
  item: PlannerItemRecommendation,
  reason = item.reason
): OverlayItemRecommendation {
  return {
    itemId: item.itemId,
    name: item.name,
    reason,
    tags: item.tags,
  }
}
