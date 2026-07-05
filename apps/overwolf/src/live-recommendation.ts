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
  role: Role
  roleLabel: string
  currentGold: number
  targetItem: OverlayItemRecommendation
  affordableComponent?: OverlayItemRecommendation
  alternativeItem?: OverlayItemRecommendation
  confidence: RecommendationConfidence
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
  fetcher?: LiveClientDataFetcher
  replayFallback?: LiveClientAllGameData
  requestTimeoutMs?: number
}

export interface LiveClientDataRequestInit {
  method: "GET"
  signal: AbortSignal
}

export type LiveClientDataFetcher = (
  endpoint: string,
  init: LiveClientDataRequestInit
) => Promise<LiveClientDataResponse>

interface LiveClientDataResponse {
  ok: boolean
  status: number
  json: () => Promise<unknown>
}

interface OverwolfRuntime {
  web?: {
    sendHttpRequest?: (
      url: string,
      method: "GET",
      headers: readonly OverwolfFetchHeader[],
      data: string,
      callback: (result: OverwolfSendHttpRequestResult) => void
    ) => void
  }
}

interface OverwolfFetchHeader {
  key: string
  value: string
}

interface OverwolfSendHttpRequestResult {
  success?: boolean
  error?: string
  statusCode?: number
  data?: string
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
  } catch {
    return createOverlayRecommendationFromReplay(
      options.replayFallback ?? bundledReplayFixture,
      {
        source: "replay",
        warnings: [liveClientUnavailableWarning()],
      }
    )
  }
}

export async function fetchLiveClientAllGameData({
  endpoint = liveClientAllGameDataUrl,
  fetcher = defaultLiveClientDataFetcher(),
  requestTimeoutMs = liveClientRequestTimeoutMs,
}: Pick<
  LiveRecommendationOptions,
  "endpoint" | "fetcher" | "requestTimeoutMs"
> = {}): Promise<LiveClientAllGameData> {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined

  try {
    const response = await Promise.race([
      fetcher(endpoint, {
        method: "GET",
        signal: controller.signal,
      }),
      new Promise<never>((_resolve, reject) => {
        timeoutId = globalThis.setTimeout(() => {
          controller.abort()
          reject(new Error("Live Client Data request timed out."))
        }, requestTimeoutMs)
      }),
    ])

    if (!response.ok) {
      throw new Error(`Live Client Data request failed: ${response.status}`)
    }

    return (await response.json()) as LiveClientAllGameData
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId)
    }
  }
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
      role: recommendation.role,
      roleLabel: roleLabels[recommendation.role],
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
      explanation: recommendation.explanation,
      learningRule: recommendation.learningRule,
      warnings,
    }

    assertRecommendationOutputAllowed(overlayRecommendation)

    return overlayRecommendation
  } catch {
    return createFallbackOverlayRecommendation(warnings)
  }
}

function createFallbackOverlayRecommendation(
  warnings: readonly string[]
): OverlayRecommendation {
  const fallbackRecommendation: OverlayRecommendation = {
    source: "fallback",
    champion: "Jinx",
    role: "bot",
    roleLabel: "Bot",
    currentGold: 0,
    targetItem: {
      itemId: "kraken-slayer",
      name: "Kraken Slayer",
      reason: "Fallback seeded item shown because live data is unavailable.",
      tags: ["damage"],
    },
    confidence: "low",
    explanation: "Live recommendation data is unavailable in this shell.",
    learningRule:
      "Item recommendations compare enemy needs with the next useful item slot.",
    warnings: [...warnings, recommendationErrorWarning()],
  }

  try {
    assertRecommendationOutputAllowed(fallbackRecommendation)
  } catch {
    return safeUnavailableOverlayRecommendation()
  }

  return fallbackRecommendation
}

function safeUnavailableOverlayRecommendation(): OverlayRecommendation {
  return {
    source: "fallback",
    champion: "Jinx",
    role: "bot",
    roleLabel: "Bot",
    currentGold: 0,
    targetItem: {
      itemId: "kraken-slayer",
      name: "Kraken Slayer",
      reason: "Recommendation unavailable.",
      tags: ["damage"],
    },
    confidence: "low",
    explanation: "Recommendation unavailable.",
    learningRule: "Recommendation unavailable.",
    warnings: [],
  }
}

function defaultLiveClientDataFetcher(): LiveClientDataFetcher {
  return overwolfWebTransport() ?? fetchTransport
}

function overwolfWebTransport(): LiveClientDataFetcher | undefined {
  const sendHttpRequest = overwolfRuntime()?.web?.sendHttpRequest

  if (!sendHttpRequest) {
    return undefined
  }

  return (endpoint) =>
    new Promise((resolve, reject) => {
      sendHttpRequest(endpoint, "GET", [], "", (result) => {
        if (!result.success) {
          reject(new Error("Overwolf web request failed."))
          return
        }

        const status = result.statusCode ?? 200

        resolve({
          ok: status >= 200 && status < 300,
          status,
          json: async () => JSON.parse(result.data ?? "{}") as unknown,
        })
      })
    })
}

async function fetchTransport(
  endpoint: string,
  init: LiveClientDataRequestInit
): Promise<LiveClientDataResponse> {
  const response = await fetch(endpoint, {
    cache: "no-store",
    method: init.method,
    signal: init.signal,
  })

  return response
}

function overwolfRuntime(): OverwolfRuntime | undefined {
  return (globalThis as typeof globalThis & { overwolf?: OverwolfRuntime })
    .overwolf
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

function liveClientUnavailableWarning(): string {
  return "Live Client Data unavailable; using bundled replay fixture."
}

function recommendationErrorWarning(): string {
  return "Recommendation generation failed."
}
