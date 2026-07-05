import { useEffect, useMemo, useState } from "react"

import type { RecommendationConfidence } from "@workspace/recommender"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import {
  createLiveOverlayRecommendation,
  createOverlayRecommendationFromReplay,
  liveRecommendationRefreshMs,
  type OverlayRecommendation,
} from "./live-recommendation"
import { bundledReplayFixture } from "./replay-fixtures"

export function App() {
  const initialRecommendation = useMemo(
    () =>
      createOverlayRecommendationFromReplay(bundledReplayFixture, {
        source: "replay",
      }),
    []
  )
  const [recommendation, setRecommendation] = useState<OverlayRecommendation>(
    initialRecommendation
  )

  useEffect(() => {
    let isMounted = true
    let requestId = 0

    async function refreshRecommendation() {
      const currentRequestId = ++requestId
      const nextRecommendation = await createLiveOverlayRecommendation()

      if (isMounted && currentRequestId === requestId) {
        setRecommendation(nextRecommendation)
      }
    }

    let refreshId: number | undefined

    function scheduleRefresh() {
      refreshId = window.setTimeout(() => {
        void refreshRecommendation().finally(() => {
          if (isMounted) {
            scheduleRefresh()
          }
        })
      }, liveRecommendationRefreshMs)
    }

    void refreshRecommendation().finally(() => {
      if (isMounted) {
        scheduleRefresh()
      }
    })

    return () => {
      isMounted = false
      if (refreshId !== undefined) {
        window.clearTimeout(refreshId)
      }
    }
  }, [])

  return (
    <main className="dark min-h-svh bg-background p-3 text-foreground">
      <Card className="mx-auto grid max-w-[390px] gap-2 rounded-md border-border bg-card/95 p-2.5 shadow-lg">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                League Item Coach
              </p>
              <CardTitle className="truncate text-base">
                {recommendation.champion} {recommendation.roleLabel}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {confidenceLabel(recommendation.confidence)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid gap-2 p-0">
          <section className="grid gap-1 rounded-md border border-border bg-background p-2.5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-medium text-muted-foreground uppercase">
                Target item
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {recommendation.targetItem.itemId}
              </span>
            </div>
            <div className="text-lg leading-tight font-semibold">
              {recommendation.targetItem.name}
            </div>
            <p className="text-sm text-muted-foreground">
              {recommendation.targetItem.reason}
            </p>
            <TagList tags={recommendation.targetItem.tags} />
          </section>

          <div className="grid grid-cols-2 gap-2">
            <MiniItem
              label="Buy-now component"
              name={
                recommendation.affordableComponent?.name ?? "Not affordable yet"
              }
              reason={
                recommendation.affordableComponent?.reason ??
                "No matching component is affordable."
              }
            />
            <MiniItem
              label="Alternative"
              name={recommendation.alternativeItem?.name ?? "None"}
              reason={
                recommendation.alternativeItem?.reason ??
                "The primary item covers the main need."
              }
            />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

interface MiniItemProps {
  label: string
  name: string
  reason: string
}

function MiniItem({ label, name, reason }: MiniItemProps) {
  return (
    <section className="grid min-h-20 gap-1 rounded-md border border-border bg-background p-2">
      <h2 className="text-[0.68rem] font-medium text-muted-foreground uppercase">
        {label}
      </h2>
      <div className="text-sm leading-tight font-semibold">{name}</div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{reason}</p>
    </section>
  )
}

interface TagListProps {
  tags: readonly string[]
}

function TagList({ tags }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className="rounded px-1.5 py-0 text-[0.68rem]"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function confidenceLabel(confidence: RecommendationConfidence): string {
  return `${confidence[0].toUpperCase()}${confidence.slice(1)}`
}
