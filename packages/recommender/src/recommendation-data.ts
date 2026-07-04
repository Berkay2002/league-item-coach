import type {
  ChampionClass,
  ChampionId,
  DamageProfile,
  ItemId,
  ItemTag,
  Role,
} from "./manual-planner"
import type {
  RuneSelection,
  RuneTreeSelection,
} from "./manual-planner.runes"

export const recommendationVersionCacheKey =
  "league-item-coach:recommendation-version:v1"

export interface RecommendationPatchMetadata {
  versionId: string
  patchVersion: string
  dataDragonVersion: string
  importedAt: string
}

export interface RecommendationItemTag {
  itemId: ItemId
  name: string
  buildStage: "component" | "completed"
  goldCost?: number
  tags: readonly ItemTag[]
  fits: readonly ChampionClass[]
}

export interface RecommendationChampionTag {
  championId: ChampionId
  name: string
  roles: readonly Role[]
  class: ChampionClass
  damageProfile: DamageProfile
  traits: readonly ("crit" | "healing" | "tank")[]
}

export interface BaselineItemRecommendation {
  championId: ChampionId
  role: Role
  targetItemId: ItemId
  alternativeItemId?: ItemId
  fullBuildItemIds: readonly ItemId[]
  explanation: string
  confidence: "low" | "medium" | "high"
}

export interface BaselineRuneRecommendation {
  championId: ChampionId
  role: Role
  primaryTree: RuneTreeSelection
  keystone: RuneSelection
  secondaryTree: RuneTreeSelection
  keyMinorRunes: readonly RuneSelection[]
  explanation: string
}

export interface RecommendationVersion {
  patch: RecommendationPatchMetadata
  itemTags: readonly RecommendationItemTag[]
  championTags: readonly RecommendationChampionTag[]
  baselineItemRecommendations: readonly BaselineItemRecommendation[]
  baselineRuneRecommendations: readonly BaselineRuneRecommendation[]
}

export interface SupabaseRecommendationVersionResponse {
  id: string
  patch_version: string
  data_dragon_version: string
  imported_at: string
  item_tags: readonly SupabaseRecommendationItemTagRow[]
  champion_tags: readonly SupabaseRecommendationChampionTagRow[]
  baseline_item_recommendations: readonly SupabaseBaselineItemRecommendationRow[]
  baseline_rune_recommendations: readonly SupabaseBaselineRuneRecommendationRow[]
}

export interface SupabaseRecommendationItemTagRow {
  item_id: ItemId
  name: string
  build_stage: "component" | "completed"
  gold_cost?: number
  tags: readonly ItemTag[]
  fits: readonly ChampionClass[]
}

export interface SupabaseRecommendationChampionTagRow {
  champion_id: ChampionId
  name: string
  roles: readonly Role[]
  class: ChampionClass
  damage_profile: DamageProfile
  traits: readonly ("crit" | "healing" | "tank")[]
}

export interface SupabaseBaselineItemRecommendationRow {
  champion_id: ChampionId
  role: Role
  target_item_id: ItemId
  alternative_item_id?: ItemId
  full_build_item_ids: readonly ItemId[]
  explanation: string
  confidence: "low" | "medium" | "high"
}

export interface SupabaseBaselineRuneRecommendationRow {
  champion_id: ChampionId
  role: Role
  primary_tree: RuneTreeSelection
  keystone: RuneSelection
  secondary_tree: RuneTreeSelection
  key_minor_runes: readonly RuneSelection[]
  explanation: string
}

export interface RecommendationVersionCache {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
}

export interface RecommendationVersionStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface RecommendationVersionSource {
  loadActiveVersion: () => Promise<SupabaseRecommendationVersionResponse>
}

export interface BaselineRecommendationSelection {
  championId: ChampionId
  role: Role
}

export interface SelectedBaselineRecommendations {
  itemRecommendation?: BaselineItemRecommendation
  runeRecommendation?: BaselineRuneRecommendation
}

export type RecommendationVersionLoadResult =
  | {
      status: "ready"
      source: "cache" | "backend"
      version: RecommendationVersion
    }
  | {
      status: "unavailable"
      reason: string
    }

export const mockSupabaseRecommendationVersionResponse = {
  id: "rec-version-15.24-seeded-v1",
  patch_version: "15.24",
  data_dragon_version: "15.24.1",
  imported_at: "2026-07-04T00:00:00.000Z",
  item_tags: [
    {
      item_id: "kraken-slayer",
      name: "Kraken Slayer",
      build_stage: "completed",
      tags: ["damage"],
      fits: ["marksman"],
    },
    {
      item_id: "mortal-reminder",
      name: "Mortal Reminder",
      build_stage: "completed",
      tags: ["anti-heal", "penetration", "crit"],
      fits: ["assassin", "marksman"],
    },
    {
      item_id: "executioners-calling",
      name: "Executioner's Calling",
      build_stage: "component",
      gold_cost: 800,
      tags: ["anti-heal", "damage"],
      fits: ["fighter", "marksman"],
    },
  ],
  champion_tags: [
    {
      champion_id: "jinx",
      name: "Jinx",
      roles: ["bot"],
      class: "marksman",
      damage_profile: "physical",
      traits: ["crit"],
    },
    {
      champion_id: "soraka",
      name: "Soraka",
      roles: ["support"],
      class: "enchanter",
      damage_profile: "magic",
      traits: ["healing"],
    },
  ],
  baseline_item_recommendations: [
    {
      champion_id: "jinx",
      role: "bot",
      target_item_id: "kraken-slayer",
      alternative_item_id: "mortal-reminder",
      full_build_item_ids: ["kraken-slayer", "mortal-reminder"],
      explanation: "Jinx starts from the seeded marksman baseline.",
      confidence: "low",
    },
  ],
  baseline_rune_recommendations: [
    {
      champion_id: "jinx",
      role: "bot",
      primary_tree: {
        id: "precision",
        dataDragonId: 8000,
        name: "Precision",
        iconPath: "perk-images/Styles/7201_Precision.png",
      },
      keystone: {
        dataDragonId: 8008,
        key: "LethalTempo",
        name: "Lethal Tempo",
        iconPath:
          "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
      },
      secondary_tree: {
        id: "resolve",
        dataDragonId: 8400,
        name: "Resolve",
        iconPath: "perk-images/Styles/7204_Resolve.png",
      },
      key_minor_runes: [
        {
          dataDragonId: 8009,
          key: "PresenceOfMind",
          name: "Presence of Mind",
          iconPath:
            "perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png",
        },
        {
          dataDragonId: 8473,
          key: "BonePlating",
          name: "Bone Plating",
          iconPath: "perk-images/Styles/Resolve/BonePlating/BonePlating.png",
        },
      ],
      explanation:
        "Jinx keeps Precision with Lethal Tempo as the seeded champion-select page.",
    },
  ],
} as const satisfies SupabaseRecommendationVersionResponse

export function createStaticRecommendationVersionSource(
  source:
    | SupabaseRecommendationVersionResponse
    | RecommendationVersionSource = mockSupabaseRecommendationVersionResponse
): RecommendationVersionSource {
  if ("loadActiveVersion" in source) {
    return source
  }

  return {
    loadActiveVersion: async () => source,
  }
}

export function createMemoryRecommendationVersionCache(
  entries: readonly [string, string][] = []
): RecommendationVersionCache {
  const values = new Map(entries)

  return {
    get: (key) => values.get(key) ?? null,
    set: (key, value) => {
      values.set(key, value)
    },
  }
}

export function createStorageRecommendationVersionCache(
  storage: RecommendationVersionStorage
): RecommendationVersionCache {
  return {
    get: (key) => storage.getItem(key),
    set: (key, value) => {
      storage.setItem(key, value)
    },
  }
}

export async function loadRecommendationVersion({
  cache,
  source,
  cacheKey = recommendationVersionCacheKey,
}: {
  cache: RecommendationVersionCache
  source: RecommendationVersionSource
  cacheKey?: string
}): Promise<RecommendationVersionLoadResult> {
  const cachedVersion = readCachedRecommendationVersion(cache, cacheKey)

  if (cachedVersion) {
    return {
      status: "ready",
      source: "cache",
      version: cachedVersion,
    }
  }

  try {
    const response = await source.loadActiveVersion()
    const version = normalizeSupabaseRecommendationVersion(response)

    writeCachedRecommendationVersion(cache, cacheKey, version)

    return {
      status: "ready",
      source: "backend",
      version,
    }
  } catch (error) {
    return {
      status: "unavailable",
      reason: errorReason(error),
    }
  }
}

export function normalizeSupabaseRecommendationVersion(
  response: SupabaseRecommendationVersionResponse
): RecommendationVersion {
  return {
    patch: {
      versionId: response.id,
      patchVersion: response.patch_version,
      dataDragonVersion: response.data_dragon_version,
      importedAt: response.imported_at,
    },
    itemTags: response.item_tags.map((row) => ({
      itemId: row.item_id,
      name: row.name,
      buildStage: row.build_stage,
      goldCost: row.gold_cost,
      tags: row.tags,
      fits: row.fits,
    })),
    championTags: response.champion_tags.map((row) => ({
      championId: row.champion_id,
      name: row.name,
      roles: row.roles,
      class: row.class,
      damageProfile: row.damage_profile,
      traits: row.traits,
    })),
    baselineItemRecommendations: response.baseline_item_recommendations.map(
      (row) => ({
        championId: row.champion_id,
        role: row.role,
        targetItemId: row.target_item_id,
        alternativeItemId: row.alternative_item_id,
        fullBuildItemIds: row.full_build_item_ids,
        explanation: row.explanation,
        confidence: row.confidence,
      })
    ),
    baselineRuneRecommendations: response.baseline_rune_recommendations.map(
      (row) => ({
        championId: row.champion_id,
        role: row.role,
        primaryTree: row.primary_tree,
        keystone: row.keystone,
        secondaryTree: row.secondary_tree,
        keyMinorRunes: row.key_minor_runes,
        explanation: row.explanation,
      })
    ),
  }
}

export function selectBaselineRecommendations(
  version: RecommendationVersion,
  selection: BaselineRecommendationSelection
): SelectedBaselineRecommendations {
  return {
    itemRecommendation: version.baselineItemRecommendations.find(
      (recommendation) =>
        recommendation.championId === selection.championId &&
        recommendation.role === selection.role
    ),
    runeRecommendation: version.baselineRuneRecommendations.find(
      (recommendation) =>
        recommendation.championId === selection.championId &&
        recommendation.role === selection.role
    ),
  }
}

function readCachedRecommendationVersion(
  cache: RecommendationVersionCache,
  cacheKey: string
): RecommendationVersion | undefined {
  let value: string | null

  try {
    value = cache.get(cacheKey)
  } catch {
    return undefined
  }

  if (!value) {
    return undefined
  }

  try {
    return JSON.parse(value) as RecommendationVersion
  } catch {
    return undefined
  }
}

function writeCachedRecommendationVersion(
  cache: RecommendationVersionCache,
  cacheKey: string,
  version: RecommendationVersion
): void {
  try {
    cache.set(cacheKey, JSON.stringify(version))
  } catch {
    return
  }
}

function errorReason(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return "recommendation version unavailable"
}
