import {
  assertRecommendationOutputAllowed,
  recommendForManualPlanner,
  type ItemId,
  type ItemTag,
  type ManualPlannerInput,
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
      ? toOverlayItem(recommendation.buyNow.component, {
          reason: `${recommendation.buyNow.component.name} fits the ${recommendation.targetItem.name} path at ${mockPlannerInput.currentGold} gold.`,
        })
      : undefined,
    alternativeItem: recommendation.alternativeItem
      ? toOverlayItem(recommendation.alternativeItem, {
          reason: `${recommendation.alternativeItem.name} is the damage-first tradeoff if healing is less important.`,
        })
      : undefined,
    confidence: recommendation.confidence,
    explanation: recommendation.explanation,
    learningRule: recommendation.learningRule,
  }

  assertRecommendationOutputAllowed(overlayRecommendation)

  return overlayRecommendation
}

function toOverlayItem(
  item: ReturnType<typeof recommendForManualPlanner>["targetItem"],
  overrides: Partial<Pick<OverlayItemRecommendation, "reason">> = {}
): OverlayItemRecommendation {
  return {
    itemId: item.itemId,
    name: item.name,
    reason: overrides.reason ?? item.reason,
    tags: item.tags,
  }
}
