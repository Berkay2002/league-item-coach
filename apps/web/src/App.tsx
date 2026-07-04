import { useMemo, useState } from "react"

import {
  recommendForManualPlanner,
  seededPlannerCatalog,
  type ChampionId,
  type ManualPlannerInput,
  type PlannerItemRecommendation,
  type RecommendationConfidence,
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

const championOptions = seededPlannerCatalog.championOptions

export function App() {
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

  const plannerInput = useMemo<ManualPlannerInput>(
    () => ({
      championId,
      role,
      allyChampionIds,
      enemyChampionIds,
    }),
    [allyChampionIds, championId, enemyChampionIds, role]
  )
  const recommendation = useMemo(
    () => recommendForManualPlanner(plannerInput),
    [plannerInput]
  )
  const selectedChampion = seededPlannerCatalog.champions[championId]
  const selectedChampionRoleOptions = selectedChampion.roles

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
          </CardContent>
        </Card>

        <Card className="grid content-start gap-4 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Recommendation
              </p>
              <h2 className="text-xl font-semibold">
                {recommendation.primaryItem.name}
              </h2>
            </div>
            <Badge variant="secondary">
              {confidenceLabel(recommendation.confidence)}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            {recommendation.explanation}
          </p>

          <ItemBlock label="Primary item" item={recommendation.primaryItem} />

          {recommendation.alternativeItem ? (
            <ItemBlock
              label="Alternative"
              item={recommendation.alternativeItem}
            />
          ) : null}

          {recommendation.buyNowComponent ? (
            <ItemBlock
              label="Buy-now component"
              item={recommendation.buyNowComponent}
            />
          ) : null}

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

          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <div className="font-medium">Learning rule</div>
            <p className="mt-1 text-muted-foreground">
              {recommendation.learningRule}
            </p>
          </div>

          <div className="font-mono text-xs text-muted-foreground">
            Input: {recommendation.champion.name} {roleLabel(role)} with{" "}
            {recommendation.allies.length} allies and{" "}
            {recommendation.enemies.length} enemies
          </div>
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
