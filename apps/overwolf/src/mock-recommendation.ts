import {
  assertRecommendationOutputAllowed,
  recommendForManualPlanner,
  type ItemId,
  type ItemTag,
  type ManualPlannerInput,
  type PlannerItemRecommendation,
  type RecommendationConfidence,
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

const mockPlannerInput: ManualPlannerInput = {
  championId: "jinx",
  role: "bot",
  allyChampionIds: ["lux", "amumu"],
  enemyChampionIds: ["aatrox", "soraka", "zed"],
  currentGold: 900,
  ownedComponentIds: [],
}

export function createMockOverlayRecommendation(): MockOverlayRecommendation {
  const recommendation = recommendForManualPlanner(mockPlannerInput)
  const overlayRecommendation: MockOverlayRecommendation = {
    source: "mock",
    champion: recommendation.champion.name,
    role: "Bot",
    currentGold: mockPlannerInput.currentGold,
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
