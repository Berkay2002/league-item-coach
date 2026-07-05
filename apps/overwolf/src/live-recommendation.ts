import {
  adaptLiveClientReplayToPlannerInput,
  assertRecommendationOutputAllowed,
  recommendForManualPlanner,
  type ItemId,
  type ItemTag,
  type LiveClientAllGameData,
  type PlannerItemRecommendation,
  type RecommendationConfidence,
  type Role,
} from "@workspace/recommender"

import { bundledReplayFixture } from "./replay-fixtures"

export const liveClientAllGameDataUrl =
  "https://127.0.0.1:2999/liveclientdata/allgamedata"
export const liveRecommendationRefreshMs = 5_000
export const liveClientRequestTimeoutMs = 2_000

export type OverlayRecommendationSource = "live" | "replay" | "fallback"

export interface OverlayRecommendation {
  source: OverlayRecommendationSource
  champion: string
  role: string
  currentGold: number
  targetItem: OverlayItemRecommendation
  affordableComponent?: OverlayItemRecommendation
  alternativeItem?: OverlayItemRecommendation
  confidence: RecommendationConfidence
  reason: string
  explanation: string
  learningRule: string
  warnings: readonly string[]
}

export interface OverlayItemRecommendation {
  itemId: ItemId
  name: string
  reason: string
  tags: readonly ItemTag[]
}

export interface LiveRecommendationOptions {
  endpoint?: string
  fetcher?: typeof fetch
  replayFallback?: LiveClientAllGameData
  requestTimeoutMs?: number
}

const roleLabels = {
  top: "Top",
  jungle: "Jungle",
  mid: "Mid",
  bot: "Bot",
  support: "Support",
} satisfies Record<Role, string>

export async function createLiveOverlayRecommendation(
  options: LiveRecommendationOptions = {}
): Promise<OverlayRecommendation> {
  try {
    const replay = await fetchLiveClientAllGameData(options)

    return createOverlayRecommendationFromReplay(replay, {
      source: "live",
    })
  } catch (error) {
    return createOverlayRecommendationFromReplay(
      options.replayFallback ?? bundledReplayFixture,
      {
        source: "replay",
        warnings: [liveClientUnavailableWarning(error)],
      }
    )
  }
}

export async function fetchLiveClientAllGameData({
  endpoint = liveClientAllGameDataUrl,
  fetcher = fetch,
  requestTimeoutMs = liveClientRequestTimeoutMs,
}: Pick<
  LiveRecommendationOptions,
  "endpoint" | "fetcher" | "requestTimeoutMs"
> = {}): Promise<LiveClientAllGameData> {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    requestTimeoutMs
  )

  let response: Response

  try {
    response = await fetcher(endpoint, {
      cache: "no-store",
      method: "GET",
      signal: controller.signal,
    })
  } finally {
    globalThis.clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`Live Client Data request failed: ${response.status}`)
  }

  return (await response.json()) as LiveClientAllGameData
}

export function createOverlayRecommendationFromReplay(
  replay: LiveClientAllGameData,
  {
    source,
    warnings = [],
  }: {
    source: OverlayRecommendationSource
    warnings?: readonly string[]
  }
): OverlayRecommendation {
  const adapted = adaptLiveClientReplayToPlannerInput(replay)

  return createOverlayRecommendationFromPlannerInput({
    input: adapted.input,
    source: adapted.status === "ready" ? source : "fallback",
    warnings: [...warnings, ...adapted.warnings],
  })
}

function createOverlayRecommendationFromPlannerInput({
  input,
  source,
  warnings,
}: {
  input: Parameters<typeof recommendForManualPlanner>[0]
  source: OverlayRecommendationSource
  warnings: readonly string[]
}): OverlayRecommendation {
  try {
    const recommendation = recommendForManualPlanner(input)
    const overlayRecommendation: OverlayRecommendation = {
      source,
      champion: recommendation.champion.name,
      role: roleLabels[recommendation.role],
      currentGold: input.currentGold,
      targetItem: toOverlayItem(recommendation.targetItem),
      affordableComponent: recommendation.buyNow.component
        ? toOverlayItem(
            recommendation.buyNow.component,
            recommendation.buyNow.reason
          )
        : undefined,
      alternativeItem: recommendation.alternativeItem
        ? toOverlayItem(recommendation.alternativeItem)
        : undefined,
      confidence: recommendation.confidence,
      reason: recommendation.targetItem.reason,
      explanation: recommendation.explanation,
      learningRule: recommendation.learningRule,
      warnings,
    }

    assertRecommendationOutputAllowed(overlayRecommendation)

    return overlayRecommendation
  } catch (error) {
    return createFallbackOverlayRecommendation(error, warnings)
  }
}

function createFallbackOverlayRecommendation(
  error: unknown,
  warnings: readonly string[]
): OverlayRecommendation {
  const fallbackRecommendation: OverlayRecommendation = {
    source: "fallback",
    champion: "Jinx",
    role: "Bot",
    currentGold: 0,
    targetItem: {
      itemId: "kraken-slayer",
      name: "Kraken Slayer",
      reason: "Fallback seeded item shown because live data is unavailable.",
      tags: ["damage"],
    },
    confidence: "low",
    reason: "Fallback seeded item shown because live data is unavailable.",
    explanation: "Live recommendation data is unavailable in this shell.",
    learningRule:
      "Item recommendations compare enemy needs with the next useful item slot.",
    warnings: [...warnings, recommendationErrorWarning(error)],
  }

  try {
    assertRecommendationOutputAllowed(fallbackRecommendation)
  } catch (complianceError) {
    return {
      ...fallbackRecommendation,
      warnings: [
        ...fallbackRecommendation.warnings,
        recommendationErrorWarning(complianceError),
      ],
    }
  }

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

function liveClientUnavailableWarning(error: unknown): string {
  return `Live Client Data unavailable; using bundled replay fixture. ${errorMessage(error)}`
}

function recommendationErrorWarning(error: unknown): string {
  return `Recommendation generation failed. ${errorMessage(error)}`
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error."
}
