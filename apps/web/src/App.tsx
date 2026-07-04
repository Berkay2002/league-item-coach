import { useEffect, useMemo, useState } from "react"

import {
  createStorageRecommendationVersionCache,
  loadRecommendationVersion,
  recommendForManualPlanner,
  selectBaselineRecommendations,
  seededPlannerCatalog,
  type ChampionId,
  type ComponentItemId,
  type ManualPlannerInput,
  type PlannerItemRecommendation,
  type PlannerRuneRecommendation,
  type RecommendationConfidence,
  type RecommendationVersionLoadResult,
  type Role,
} from "@workspace/recommender"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Select } from "@workspace/ui/components/select"

import { createAppRecommendationVersionSource } from "./recommendation-version-source"

type CatalogItem =
  (typeof seededPlannerCatalog.items)[keyof typeof seededPlannerCatalog.items]
type ComponentOption = Extract<CatalogItem, { buildStage: "component" }>
type RecommendationDataState = "loading" | RecommendationVersionLoadResult

const championOptions = seededPlannerCatalog.championOptions
const componentOptions: ComponentOption[] = Object.values(
  seededPlannerCatalog.items
).filter(isComponentOption)

export function App() {
  const [recommendationDataState, setRecommendationDataState] =
    useState<RecommendationDataState>("loading")
  const [championId, setChampionId] = useState<ChampionId>("jinx")
  const [role, setRole] = useState<Role>("bot")
  const [allyChampionIds, setAllyChampionIds] = useState<ChampionId[]>([
    "lux",
    "amumu",
  ])
  const [enemyChampionIds, setEnemyChampionIds] = useState<ChampionId[]>([
    "aatrox",
    "soraka",
    "zed",
  ])
  const [currentGold, setCurrentGold] = useState(900)
  const [ownedComponentIds, setOwnedComponentIds] = useState<ComponentItemId[]>(
    []
  )

  const plannerInput = useMemo<ManualPlannerInput>(
    () => ({
      championId,
      role,
      allyChampionIds,
      enemyChampionIds,
      currentGold,
      ownedComponentIds,
    }),
    [
      allyChampionIds,
      championId,
      currentGold,
      enemyChampionIds,
      ownedComponentIds,
      role,
    ]
  )
  const recommendation = useMemo(
    () => recommendForManualPlanner(plannerInput),
    [plannerInput]
  )
  const versionedBaseline = useMemo(() => {
    if (
      recommendationDataState === "loading" ||
      recommendationDataState.status !== "ready"
    ) {
      return undefined
    }

    return selectBaselineRecommendations(recommendationDataState.version, {
      championId,
      role,
    })
  }, [championId, recommendationDataState, role])
  const selectedChampion = seededPlannerCatalog.champions[championId]
  const selectedChampionRoleOptions = selectedChampion.roles

  useEffect(() => {
    let mounted = true

    async function loadRecommendationData() {
      try {
        const result = await loadRecommendationVersion({
          cache: createStorageRecommendationVersionCache(window.localStorage),
          source: createAppRecommendationVersionSource(),
        })

        if (mounted) {
          setRecommendationDataState(result)
        }
      } catch {
        if (mounted) {
          setRecommendationDataState({
            status: "unavailable",
            reason: "recommendation data failed to load",
          })
        }
      }
    }

    void loadRecommendationData()

    return () => {
      mounted = false
    }
  }, [])

  function changeChampion(nextChampionId: ChampionId) {
    const nextChampion = seededPlannerCatalog.champions[nextChampionId]

    setChampionId(nextChampionId)
    setRole((currentRole) =>
      (nextChampion.roles as readonly Role[]).includes(currentRole)
        ? currentRole
        : nextChampion.roles[0]
    )
    setAllyChampionIds((selected) =>
      selected.filter((id) => id !== nextChampionId)
    )
    setEnemyChampionIds((selected) =>
      selected.filter((id) => id !== nextChampionId)
    )
    setOwnedComponentIds([])
  }

  function toggleAlly(championIdToToggle: ChampionId) {
    setEnemyChampionIds((selected) =>
      selected.filter((id) => id !== championIdToToggle)
    )
    setAllyChampionIds((selected) =>
      toggleChampionSelection(selected, championIdToToggle, 4)
    )
  }

  function toggleEnemy(championIdToToggle: ChampionId) {
    setAllyChampionIds((selected) =>
      selected.filter((id) => id !== championIdToToggle)
    )
    setEnemyChampionIds((selected) =>
      toggleChampionSelection(selected, championIdToToggle, 5)
    )
  }

  function toggleOwnedComponent(componentIdToToggle: ComponentItemId) {
    setOwnedComponentIds((selected) =>
      selected.includes(componentIdToToggle)
        ? selected.filter((id) => id !== componentIdToToggle)
        : [...selected, componentIdToToggle]
    )
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:px-8">
        <Card className="grid gap-5 p-4 sm:p-5">
          <CardHeader className="p-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Manual planner
            </p>
            <CardTitle className="text-2xl">Seeded item plan</CardTitle>
            <CardDescription className="max-w-2xl">
              Pick a champion, role, allies, and enemies from the shared seeded
              catalog. The same state is passed into the recommender package.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 p-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Champion
                <Select
                  value={championId}
                  onChange={(event) =>
                    changeChampion(event.target.value as ChampionId)
                  }
                >
                  {championOptions.map((champion) => (
                    <option key={champion.id} value={champion.id}>
                      {champion.name}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Role
                <Select
                  className="capitalize"
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                >
                  {selectedChampionRoleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabel(roleOption)}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <ChampionPicker
              championId={championId}
              selectedIds={allyChampionIds}
              excludedIds={enemyChampionIds}
              title="Allies"
              limitLabel="Select up to 4 allies"
              onToggle={toggleAlly}
            />

            <ChampionPicker
              championId={championId}
              selectedIds={enemyChampionIds}
              excludedIds={allyChampionIds}
              title="Enemies"
              limitLabel="Select up to 5 enemies"
              onToggle={toggleEnemy}
            />

            <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr]">
              <label className="grid gap-2 text-sm font-medium">
                Current gold
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={currentGold}
                  onChange={(event) =>
                    setCurrentGold(Math.max(0, Number(event.target.value) || 0))
                  }
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>

              <ComponentPicker
                selectedIds={ownedComponentIds}
                onToggle={toggleOwnedComponent}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="grid content-start gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Recommendation
              </p>
              <h2 className="text-xl font-semibold">
                {recommendation.targetItem.name}
              </h2>
            </div>
            <Badge variant="secondary">
              {confidenceLabel(recommendation.confidence)}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {recommendation.explanation}
          </p>

          <RuneBlock recommendation={recommendation.runeRecommendation} />

          <div className="grid gap-3">
            <h3 className="text-sm font-medium">In-game item plan</h3>

            <ItemBlock label="Target item" item={recommendation.targetItem} />

            {recommendation.alternativeItem ? (
              <ItemBlock
                label="Alternative"
                item={recommendation.alternativeItem}
              />
            ) : null}

            {recommendation.buyNow.component ? (
              <ItemBlock
                label="Buy-now component"
                item={recommendation.buyNow.component}
              />
            ) : (
              <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                {recommendation.buyNow.reason}
              </div>
            )}

            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Full build plan</h3>
              <ol className="grid gap-2">
                {recommendation.fullBuild.map((item) => (
                  <li
                    key={item.itemId}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.reason}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <div className="font-medium">Learning rule</div>
            <p className="mt-1 text-muted-foreground">
              {recommendation.learningRule}
            </p>
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            Input: {recommendation.champion.name} {roleLabel(role)} with{" "}
            {recommendation.allies.length} allies and{" "}
            {recommendation.enemies.length} enemies, {currentGold} gold
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            {recommendationDataLabel(recommendationDataState)}
          </div>

          {versionedBaseline ? (
            <div className="font-mono text-xs text-muted-foreground">
              {versionedBaselineLabel(versionedBaseline)}
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  )
}

interface ChampionPickerProps {
  championId: ChampionId
  selectedIds: readonly ChampionId[]
  excludedIds?: readonly ChampionId[]
  title: string
  limitLabel: string
  onToggle: (championId: ChampionId) => void
}

function ChampionPicker({
  championId,
  selectedIds,
  excludedIds = [],
  title,
  limitLabel,
  onToggle,
}: ChampionPickerProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-xs text-muted-foreground">{limitLabel}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {championOptions.map((champion) => {
          const id = champion.id
          const selected = selectedIds.includes(id)
          const disabled = id === championId || excludedIds.includes(id)

          return (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onToggle(id)}
            >
              {champion.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface ComponentPickerProps {
  selectedIds: readonly ComponentItemId[]
  onToggle: (componentId: ComponentItemId) => void
}

function ComponentPicker({ selectedIds, onToggle }: ComponentPickerProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Owned components</h2>
        <span className="text-xs text-muted-foreground">
          Select components already bought
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {componentOptions.map((component) => {
          const id = component.id
          const selected = selectedIds.includes(id)

          return (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => onToggle(id)}
            >
              {component.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function isComponentOption(item: CatalogItem): item is ComponentOption {
  return item.buildStage === "component"
}

interface RuneBlockProps {
  recommendation: PlannerRuneRecommendation
}

function RuneBlock({ recommendation }: RuneBlockProps) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="text-sm font-medium">Champion-select runes</h3>
          <div className="text-xs text-muted-foreground">
            {recommendation.primaryTree.name} primary,{" "}
            {recommendation.secondaryTree.name} secondary
          </div>
        </div>
        <Badge variant="secondary">{recommendation.keystone.name}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {recommendation.explanation}
      </p>
      <div className="flex flex-wrap gap-1">
        {recommendation.keyMinorRunes.map((rune) => (
          <Badge
            key={rune.dataDragonId}
            variant="secondary"
            className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {rune.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

interface ItemBlockProps {
  label: string
  item: PlannerItemRecommendation
}

function ItemBlock({ label, item }: ItemBlockProps) {
  return (
    <div className="grid gap-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{label}</h3>
        <span className="text-xs text-muted-foreground">{item.itemId}</span>
      </div>
      <div className="font-medium">{item.name}</div>
      <p className="text-sm text-muted-foreground">{item.reason}</p>
      <div className="flex flex-wrap gap-1">
        {item.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function toggleChampionSelection(
  selectedIds: ChampionId[],
  championId: ChampionId,
  maxSelected: number
): ChampionId[] {
  if (selectedIds.includes(championId)) {
    return selectedIds.filter((selectedId) => selectedId !== championId)
  }

  if (selectedIds.length >= maxSelected) {
    return selectedIds
  }

  return [...selectedIds, championId]
}

function roleLabel(role: Role): string {
  if (role === "bot") {
    return "Bot"
  }

  return role[0].toUpperCase() + role.slice(1)
}

function confidenceLabel(confidence: RecommendationConfidence): string {
  return `${confidence[0].toUpperCase() + confidence.slice(1)} confidence`
}

function recommendationDataLabel(state: RecommendationDataState): string {
  if (state === "loading") {
    return "Recommendation data: loading"
  }

  if (state.status === "unavailable") {
    return `Recommendation data: unavailable (${state.reason})`
  }

  const source = state.source === "cache" ? "local cache" : "local mock"

  return `Recommendation data: patch ${state.version.patch.patchVersion} from ${source}`
}

function versionedBaselineLabel(
  baseline: NonNullable<
    ReturnType<typeof selectBaselineRecommendations>
  >
): string {
  const item = baseline.itemRecommendation?.targetItemId ?? "no item baseline"
  const rune = baseline.runeRecommendation?.keystone.name ?? "no rune baseline"

  return `Versioned baseline: ${item}, ${rune}`
}
