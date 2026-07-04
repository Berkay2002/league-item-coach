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
  loadActiveVersion: () => Promise<RecommendationVersion>
}

export interface RecommendationVersionCacheEntry {
  cachedAt: string
  version: RecommendationVersion
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

export function createStaticRecommendationVersionSource(
  source: RecommendationVersion | RecommendationVersionSource
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
  cacheMaxAgeMs,
  source,
  cacheKey = recommendationVersionCacheKey,
}: {
  cache: RecommendationVersionCache
  cacheMaxAgeMs?: number
  source: RecommendationVersionSource
  cacheKey?: string
}): Promise<RecommendationVersionLoadResult> {
  const cachedVersion = readCachedRecommendationVersion(
    cache,
    cacheKey,
    cacheMaxAgeMs
  )

  if (cachedVersion) {
    return {
      status: "ready",
      source: "cache",
      version: cachedVersion,
    }
  }

  try {
    const version = await source.loadActiveVersion()

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

export function parseSupabaseRecommendationVersionResponse(
  value: unknown
): SupabaseRecommendationVersionResponse {
  if (!isRecord(value)) {
    throw new Error("Recommendation version response must be an object")
  }

  requireString(value, "id")
  requireString(value, "patch_version")
  requireString(value, "data_dragon_version")
  requireString(value, "imported_at")
  requireArray(value, "item_tags").forEach((row) =>
    requireSupabaseItemTagRow(row)
  )
  requireArray(value, "champion_tags").forEach((row) =>
    requireSupabaseChampionTagRow(row)
  )
  requireArray(value, "baseline_item_recommendations").forEach((row) =>
    requireSupabaseBaselineItemRecommendationRow(row)
  )
  requireArray(value, "baseline_rune_recommendations").forEach((row) =>
    requireSupabaseBaselineRuneRecommendationRow(row)
  )

  return value as unknown as SupabaseRecommendationVersionResponse
}

export function parseRecommendationVersion(value: unknown): RecommendationVersion {
  if (!isRecord(value)) {
    throw new Error("Recommendation version cache entry must be an object")
  }

  requireObject(value, "patch")
  requireArray(value, "itemTags").forEach((row) =>
    requireRecommendationItemTag(row)
  )
  requireArray(value, "championTags").forEach((row) =>
    requireRecommendationChampionTag(row)
  )
  requireArray(value, "baselineItemRecommendations").forEach((row) =>
    requireBaselineItemRecommendation(row)
  )
  requireArray(value, "baselineRuneRecommendations").forEach((row) =>
    requireBaselineRuneRecommendation(row)
  )

  return value as unknown as RecommendationVersion
}

export function parseRecommendationVersionCacheEntry(
  value: unknown
): RecommendationVersionCacheEntry {
  if (!isRecord(value)) {
    throw new Error("Recommendation version cache entry must be an object")
  }

  const cachedAt = value.cachedAt
  if (typeof cachedAt !== "string") {
    throw new Error("Recommendation version response missing cachedAt")
  }

  return {
    cachedAt,
    version: parseRecommendationVersion(value.version),
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
  cacheKey: string,
  cacheMaxAgeMs: number | undefined
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
    const parsed = JSON.parse(value) as unknown
    const entry = parseCachedRecommendationVersionValue(parsed)

    if (cacheMaxAgeMs !== undefined && isExpired(entry, cacheMaxAgeMs)) {
      return undefined
    }

    return entry.version
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
    const cacheEntry = {
      cachedAt: new Date().toISOString(),
      version,
    } satisfies RecommendationVersionCacheEntry

    cache.set(cacheKey, JSON.stringify(cacheEntry))
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireString(value: Record<string, unknown>, property: string): void {
  if (typeof value[property] !== "string") {
    throw new Error(`Recommendation version response missing ${property}`)
  }
}

function requireArray(
  value: Record<string, unknown>,
  property: string
): unknown[] {
  if (!Array.isArray(value[property])) {
    throw new Error(`Recommendation version response missing ${property}`)
  }

  return value[property]
}

function requireObject(
  value: Record<string, unknown>,
  property: string
): Record<string, unknown> {
  const nested = value[property]

  if (!isRecord(nested)) {
    throw new Error(`Recommendation version response missing ${property}`)
  }

  return nested
}

function requireSupabaseItemTagRow(value: unknown): void {
  const row = requireRow(value, "item_tags")

  requireString(row, "item_id")
  requireString(row, "name")
  requireString(row, "build_stage")
  requireArray(row, "tags")
  requireArray(row, "fits")
}

function requireSupabaseChampionTagRow(value: unknown): void {
  const row = requireRow(value, "champion_tags")

  requireString(row, "champion_id")
  requireString(row, "name")
  requireArray(row, "roles")
  requireString(row, "class")
  requireString(row, "damage_profile")
  requireArray(row, "traits")
}

function requireSupabaseBaselineItemRecommendationRow(value: unknown): void {
  const row = requireRow(value, "baseline_item_recommendations")

  requireString(row, "champion_id")
  requireString(row, "role")
  requireString(row, "target_item_id")
  requireArray(row, "full_build_item_ids")
  requireString(row, "explanation")
  requireString(row, "confidence")
}

function requireSupabaseBaselineRuneRecommendationRow(value: unknown): void {
  const row = requireRow(value, "baseline_rune_recommendations")

  requireString(row, "champion_id")
  requireString(row, "role")
  requireObject(row, "primary_tree")
  requireObject(row, "keystone")
  requireObject(row, "secondary_tree")
  requireArray(row, "key_minor_runes")
  requireString(row, "explanation")
}

function requireRecommendationItemTag(value: unknown): void {
  const row = requireRow(value, "itemTags")

  requireString(row, "itemId")
  requireString(row, "name")
  requireString(row, "buildStage")
  requireArray(row, "tags")
  requireArray(row, "fits")
}

function requireRecommendationChampionTag(value: unknown): void {
  const row = requireRow(value, "championTags")

  requireString(row, "championId")
  requireString(row, "name")
  requireArray(row, "roles")
  requireString(row, "class")
  requireString(row, "damageProfile")
  requireArray(row, "traits")
}

function requireBaselineItemRecommendation(value: unknown): void {
  const row = requireRow(value, "baselineItemRecommendations")

  requireString(row, "championId")
  requireString(row, "role")
  requireString(row, "targetItemId")
  requireArray(row, "fullBuildItemIds")
  requireString(row, "explanation")
  requireString(row, "confidence")
}

function requireBaselineRuneRecommendation(value: unknown): void {
  const row = requireRow(value, "baselineRuneRecommendations")

  requireString(row, "championId")
  requireString(row, "role")
  requireObject(row, "primaryTree")
  requireObject(row, "keystone")
  requireObject(row, "secondaryTree")
  requireArray(row, "keyMinorRunes")
  requireString(row, "explanation")
}

function requireRow(
  value: unknown,
  collectionName: string
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Recommendation version response has invalid ${collectionName}`)
  }

  return value
}

function parseCachedRecommendationVersionValue(
  value: unknown
): RecommendationVersionCacheEntry {
  try {
    return parseRecommendationVersionCacheEntry(value)
  } catch {
    return {
      cachedAt: new Date(0).toISOString(),
      version: parseRecommendationVersion(value),
    }
  }
}

function isExpired(
  entry: RecommendationVersionCacheEntry,
  cacheMaxAgeMs: number
): boolean {
  const cachedAtMs = Date.parse(entry.cachedAt)

  if (!Number.isFinite(cachedAtMs)) {
    return true
  }

  return Date.now() - cachedAtMs > cacheMaxAgeMs
}
