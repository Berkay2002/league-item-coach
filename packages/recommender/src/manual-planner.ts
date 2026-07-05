import {
  validateRecommendationOutput,
  type RecommendationOutputComplianceResult,
} from "./compliance"
import {
  chooseSeededRunePage,
  explainRunePage,
  type PlannerRuneRecommendation,
} from "./manual-planner.runes"
import {
  summarizeEnemyNeeds,
  type EnemyNeeds,
} from "./manual-planner.enemy-needs"
import {
  contextualNeedPlan,
  needPlan,
  type NeedPlanItemMaps,
} from "./manual-planner.need-plan"

export type Role = "top" | "jungle" | "mid" | "bot" | "support"

export type DamageProfile = "physical" | "magic" | "mixed"

export type ChampionClass =
  "assassin" | "enchanter" | "fighter" | "mage" | "marksman" | "tank"

export type ItemTag =
  | "anti-crit"
  | "anti-heal"
  | "anti-tank"
  | "armor"
  | "crit"
  | "damage"
  | "magic-resist"
  | "penetration"
  | "support"
  | "survivability"

export interface SeededChampion {
  id: string
  name: string
  roles: readonly Role[]
  class: ChampionClass
  damageProfile: DamageProfile
  traits: readonly ("crit" | "healing" | "tank")[]
}

export interface SeededItem {
  id: string
  name: string
  buildStage: "component" | "completed"
  goldCost?: number
  tags: readonly ItemTag[]
  fits: readonly ChampionClass[]
}

const seededChampionCatalog = {
  aatrox: {
    id: "aatrox",
    name: "Aatrox",
    roles: ["top"],
    class: "fighter",
    damageProfile: "physical",
    traits: ["healing"],
  },
  ahri: {
    id: "ahri",
    name: "Ahri",
    roles: ["mid"],
    class: "mage",
    damageProfile: "magic",
    traits: [],
  },
  amumu: {
    id: "amumu",
    name: "Amumu",
    roles: ["jungle", "support"],
    class: "tank",
    damageProfile: "magic",
    traits: ["tank"],
  },
  darius: {
    id: "darius",
    name: "Darius",
    roles: ["top"],
    class: "fighter",
    damageProfile: "physical",
    traits: [],
  },
  garen: {
    id: "garen",
    name: "Garen",
    roles: ["top"],
    class: "fighter",
    damageProfile: "physical",
    traits: [],
  },
  jinx: {
    id: "jinx",
    name: "Jinx",
    roles: ["bot"],
    class: "marksman",
    damageProfile: "physical",
    traits: ["crit"],
  },
  kaisa: {
    id: "kaisa",
    name: "Kai'Sa",
    roles: ["bot"],
    class: "marksman",
    damageProfile: "mixed",
    traits: [],
  },
  leona: {
    id: "leona",
    name: "Leona",
    roles: ["support"],
    class: "tank",
    damageProfile: "magic",
    traits: ["tank"],
  },
  lux: {
    id: "lux",
    name: "Lux",
    roles: ["mid", "support"],
    class: "mage",
    damageProfile: "magic",
    traits: [],
  },
  malphite: {
    id: "malphite",
    name: "Malphite",
    roles: ["top"],
    class: "tank",
    damageProfile: "magic",
    traits: ["tank"],
  },
  soraka: {
    id: "soraka",
    name: "Soraka",
    roles: ["support"],
    class: "enchanter",
    damageProfile: "magic",
    traits: ["healing"],
  },
  zed: {
    id: "zed",
    name: "Zed",
    roles: ["mid"],
    class: "assassin",
    damageProfile: "physical",
    traits: [],
  },
} as const satisfies Record<string, SeededChampion>

const seededItemCatalog = {
  "banshees-veil": {
    id: "banshees-veil",
    name: "Banshee's Veil",
    buildStage: "completed",
    tags: ["magic-resist", "survivability"],
    fits: ["mage"],
  },
  "black-cleaver": {
    id: "black-cleaver",
    name: "Black Cleaver",
    buildStage: "completed",
    tags: ["damage", "anti-tank", "survivability"],
    fits: ["fighter"],
  },
  "executioners-calling": {
    id: "executioners-calling",
    name: "Executioner's Calling",
    buildStage: "component",
    goldCost: 800,
    tags: ["anti-heal", "damage"],
    fits: ["fighter", "marksman"],
  },
  "hollow-radiance": {
    id: "hollow-radiance",
    name: "Hollow Radiance",
    buildStage: "completed",
    tags: ["magic-resist", "survivability"],
    fits: ["tank"],
  },
  "imperial-mandate": {
    id: "imperial-mandate",
    name: "Imperial Mandate",
    buildStage: "completed",
    tags: ["support", "damage"],
    fits: ["enchanter", "mage"],
  },
  "infinity-edge": {
    id: "infinity-edge",
    name: "Infinity Edge",
    buildStage: "completed",
    tags: ["crit", "damage"],
    fits: ["marksman"],
  },
  "kraken-slayer": {
    id: "kraken-slayer",
    name: "Kraken Slayer",
    buildStage: "completed",
    tags: ["damage"],
    fits: ["marksman"],
  },
  "liandrys-torment": {
    id: "liandrys-torment",
    name: "Liandry's Torment",
    buildStage: "completed",
    tags: ["anti-tank", "damage"],
    fits: ["mage"],
  },
  "lord-dominiks-regards": {
    id: "lord-dominiks-regards",
    name: "Lord Dominik's Regards",
    buildStage: "completed",
    tags: ["anti-tank", "penetration", "crit"],
    fits: ["marksman"],
  },
  "last-whisper": {
    id: "last-whisper",
    name: "Last Whisper",
    buildStage: "component",
    goldCost: 1450,
    tags: ["penetration", "damage"],
    fits: ["assassin", "marksman"],
  },
  morellonomicon: {
    id: "morellonomicon",
    name: "Morellonomicon",
    buildStage: "completed",
    tags: ["anti-heal", "damage"],
    fits: ["enchanter", "mage"],
  },
  "mortal-reminder": {
    id: "mortal-reminder",
    name: "Mortal Reminder",
    buildStage: "completed",
    tags: ["anti-heal", "penetration", "crit"],
    fits: ["assassin", "marksman"],
  },
  "randuins-omen": {
    id: "randuins-omen",
    name: "Randuin's Omen",
    buildStage: "completed",
    tags: ["anti-crit", "armor", "survivability"],
    fits: ["assassin", "enchanter", "fighter", "mage", "marksman", "tank"],
  },
  "steraks-gage": {
    id: "steraks-gage",
    name: "Sterak's Gage",
    buildStage: "completed",
    tags: ["survivability", "damage"],
    fits: ["fighter"],
  },
  "sunfire-aegis": {
    id: "sunfire-aegis",
    name: "Sunfire Aegis",
    buildStage: "completed",
    tags: ["armor", "survivability"],
    fits: ["tank"],
  },
  thornmail: {
    id: "thornmail",
    name: "Thornmail",
    buildStage: "completed",
    tags: ["anti-heal", "armor", "survivability"],
    fits: ["fighter", "tank"],
  },
  "zhonyas-hourglass": {
    id: "zhonyas-hourglass",
    name: "Zhonya's Hourglass",
    buildStage: "completed",
    tags: ["armor", "survivability"],
    fits: ["mage"],
  },
} as const satisfies Record<string, SeededItem>

export type ChampionId = keyof typeof seededChampionCatalog
export type ItemId = keyof typeof seededItemCatalog
export type ComponentItemId = {
  [K in ItemId]: (typeof seededItemCatalog)[K]["buildStage"] extends "component"
    ? K
    : never
}[ItemId]
type CatalogChampion = (typeof seededChampionCatalog)[ChampionId]

export interface ManualPlannerInput {
  championId: ChampionId
  role: Role
  allyChampionIds: readonly ChampionId[]
  enemyChampionIds: readonly ChampionId[]
  enemyLiveSnapshots?: readonly ManualPlannerEnemySnapshot[]
  currentGold: number
  ownedComponentIds: readonly ComponentItemId[]
}

export interface ManualPlannerEnemyItem {
  displayName?: string
  itemId: number
  price: number
}

export interface ManualPlannerEnemySnapshot {
  championId: ChampionId
  items: readonly ManualPlannerEnemyItem[]
  level: number
  creepScore: number
  kills: number
  assists: number
  deaths: number
}

export interface PlannerItemRecommendation {
  itemId: ItemId
  name: string
  buildStage: SeededItem["buildStage"]
  reason: string
  tags: readonly ItemTag[]
}

export interface PlannerBuyNowRecommendation {
  component?: PlannerItemRecommendation
  reason: string
}

export type RecommendationConfidence = "low" | "medium"

export interface ManualPlannerRecommendation {
  input: ManualPlannerInput
  champion: CatalogChampion
  role: Role
  allies: readonly CatalogChampion[]
  enemies: readonly CatalogChampion[]
  targetItem: PlannerItemRecommendation
  alternativeItem?: PlannerItemRecommendation
  buyNow: PlannerBuyNowRecommendation
  runeRecommendation: PlannerRuneRecommendation
  fullBuild: readonly PlannerItemRecommendation[]
  confidence: RecommendationConfidence
  explanation: string
  learningRule: string
  compliance: RecommendationOutputComplianceResult
}

export const seededPlannerCatalog = {
  roles: ["top", "jungle", "mid", "bot", "support"] as const,
  champions: seededChampionCatalog,
  championOptions: Object.values(
    seededChampionCatalog
  ) as readonly CatalogChampion[],
  items: seededItemCatalog,
}

const baselineItemByClass = {
  assassin: "kraken-slayer",
  enchanter: "imperial-mandate",
  fighter: "steraks-gage",
  mage: "liandrys-torment",
  marksman: "kraken-slayer",
  tank: "sunfire-aegis",
} as const satisfies Record<ChampionClass, ItemId>

const completedAntiHealItemByClass = {
  assassin: "mortal-reminder",
  enchanter: "morellonomicon",
  fighter: "thornmail",
  mage: "morellonomicon",
  marksman: "mortal-reminder",
  tank: "thornmail",
} as const satisfies Record<ChampionClass, ItemId>

const targetComponentIdsByItemId: Partial<
  Record<ItemId, readonly ComponentItemId[]>
> = {
  "lord-dominiks-regards": ["last-whisper"],
  "mortal-reminder": ["executioners-calling", "last-whisper"],
}

const antiTankItemByClass = {
  assassin: "black-cleaver",
  enchanter: "liandrys-torment",
  fighter: "black-cleaver",
  mage: "liandrys-torment",
  marksman: "lord-dominiks-regards",
  tank: "sunfire-aegis",
} as const satisfies Record<ChampionClass, ItemId>

const physicalDefenseItemByClass = {
  assassin: "steraks-gage",
  enchanter: "zhonyas-hourglass",
  fighter: "steraks-gage",
  mage: "zhonyas-hourglass",
  marksman: "kraken-slayer",
  tank: "sunfire-aegis",
} as const satisfies Record<ChampionClass, ItemId>

const magicDefenseItemByClass = {
  assassin: "banshees-veil",
  enchanter: "banshees-veil",
  fighter: "steraks-gage",
  mage: "banshees-veil",
  marksman: "kraken-slayer",
  tank: "hollow-radiance",
} as const satisfies Record<ChampionClass, ItemId>

const antiCritItemByClass = {
  assassin: "randuins-omen",
  enchanter: "randuins-omen",
  fighter: "randuins-omen",
  mage: "randuins-omen",
  marksman: "randuins-omen",
  tank: "randuins-omen",
} as const satisfies Record<ChampionClass, ItemId>

const needPlanItemMaps = {
  antiCrit: antiCritItemByClass,
  antiHeal: completedAntiHealItemByClass,
  antiTank: antiTankItemByClass,
  baseline: baselineItemByClass,
  magicDefense: magicDefenseItemByClass,
  physicalDefense: physicalDefenseItemByClass,
} satisfies NeedPlanItemMaps

export function recommendForManualPlanner(
  input: ManualPlannerInput
): ManualPlannerRecommendation {
  const champion = seededChampionCatalog[input.championId]
  const allies = input.allyChampionIds.map((id) => seededChampionCatalog[id])
  const enemies = input.enemyChampionIds.map((id) => seededChampionCatalog[id])
  const needs = summarizeEnemyNeeds({
    championCatalog: seededChampionCatalog,
    enemies,
    snapshots: input.enemyLiveSnapshots ?? [],
  })
  const targetItemId = chooseTargetItemId(champion.class, needs)
  const alternativeItemId = chooseAlternativeItemId(
    champion.class,
    targetItemId,
    needs
  )
  const fullBuildIds = chooseFullBuildIds(champion.class, targetItemId, needs)

  const targetItem = toRecommendationItem(
    targetItemId,
    targetReason(champion, targetItemId, needs)
  )
  const alternativeItem = alternativeItemId
    ? toRecommendationItem(alternativeItemId, alternativeReason(needs))
    : undefined
  const fullBuild = fullBuildIds.map((itemId) =>
    toRecommendationItem(itemId, fullBuildReason(itemId))
  )
  const buyNow = chooseBuyNowRecommendation(input, champion.class, targetItemId)
  const runePage = chooseSeededRunePage({
    championId: input.championId,
    championClass: champion.class,
    role: input.role,
  })
  const runeRecommendation = explainRunePage(
    {
      championName: champion.name,
      physicalThreats: needs.physicalThreats,
      magicThreats: needs.magicThreats,
      tankCount: needs.tankCount,
      hasHealing: needs.hasHealing,
    },
    runePage
  )

  const recommendationWithoutCompliance = {
    input,
    champion,
    role: input.role,
    allies,
    enemies,
    targetItem,
    alternativeItem,
    buyNow,
    runeRecommendation,
    fullBuild,
    confidence: confidenceForNeeds(needs),
    explanation: explanationForRecommendation(champion, targetItem, needs),
    learningRule: learningRule(needs),
  }

  const compliance = validateRecommendationOutput(
    recommendationWithoutCompliance
  )

  if (!compliance.allowed) {
    const summary = compliance.violations
      .map((violation) => `${violation.category} at ${violation.path}`)
      .join(", ")

    throw new Error(`Forbidden recommendation output: ${summary}`)
  }

  return {
    ...recommendationWithoutCompliance,
    compliance,
  }
}

function chooseTargetItemId(
  championClass: ChampionClass,
  needs: EnemyNeeds
): ItemId {
  return needPlan(needs, needPlanItemMaps).targetItemForClass(championClass)
}

function chooseAlternativeItemId(
  championClass: ChampionClass,
  targetItemId: ItemId,
  needs: EnemyNeeds
): ItemId | undefined {
  const baselineItemId = baselineItemByClass[championClass]

  if (targetItemId !== baselineItemId) {
    return baselineItemId
  }

  if (needs.needsPenetration) {
    return differentItem(antiTankItemByClass[championClass], targetItemId)
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return differentItem(
      championClass === "tank" ? "hollow-radiance" : "banshees-veil",
      targetItemId
    )
  }

  if (needs.physicalThreats > needs.magicThreats) {
    return differentItem(physicalDefenseItemByClass[championClass], targetItemId)
  }

  return undefined
}

function differentItem(
  itemId: ItemId,
  currentItemId: ItemId
): ItemId | undefined {
  return itemId === currentItemId ? undefined : itemId
}

function chooseBuyNowRecommendation(
  input: ManualPlannerInput,
  championClass: ChampionClass,
  targetItemId: ItemId
): PlannerBuyNowRecommendation {
  const targetItem = seededItemCatalog[targetItemId]
  const componentIds = targetComponentIdsByItemId[targetItemId] ?? []
  const ownedComponentIds = new Set(input.ownedComponentIds)

  if (componentIds.length === 0) {
    return {
      reason: `No seeded component path is available for ${targetItem.name}.`,
    }
  }

  const unownedComponentIds = componentIds.filter(
    (itemId) => !ownedComponentIds.has(itemId)
  )
  const ownedTargetComponentIds = componentIds.filter((itemId) =>
    ownedComponentIds.has(itemId)
  )
  const fittingUnownedComponentIds = unownedComponentIds.filter((itemId) =>
    hasFit(itemId, championClass)
  )
  const sortedFittingUnownedComponentIds = [...fittingUnownedComponentIds].sort(
    (left, right) => componentGoldCost(left) - componentGoldCost(right)
  )
  const componentId = sortedFittingUnownedComponentIds.find(
    (itemId) => componentGoldCost(itemId) <= input.currentGold
  )

  if (componentId) {
    const component = toRecommendationItem(
      componentId,
      `Buy ${seededItemCatalog[componentId].name} now because it builds toward ${targetItem.name}.`
    )

    if (ownedTargetComponentIds.length > 0) {
      return {
        component,
        reason: `You already own ${formatItemList(ownedTargetComponentIds)}, so buy ${component.name} next for ${targetItem.name}.`,
      }
    }

    return {
      component,
      reason: `Buy ${component.name} now for ${targetItem.name}.`,
    }
  }

  if (unownedComponentIds.length === 0) {
    return {
      reason: `You already own the seeded components for ${targetItem.name}.`,
    }
  }

  if (sortedFittingUnownedComponentIds.length === 0) {
    return {
      reason: `No fitting seeded component is available for ${targetItem.name}.`,
    }
  }

  return {
    reason: `Save for ${seededItemCatalog[sortedFittingUnownedComponentIds[0]].name} to keep building toward ${targetItem.name}.`,
  }
}

function chooseFullBuildIds(
  championClass: ChampionClass,
  targetItemId: ItemId,
  needs: EnemyNeeds
): ItemId[] {
  const ids: ItemId[] = [targetItemId, baselineItemByClass[championClass]]

  if (championClass === "marksman") {
    ids.push("infinity-edge")
  }

  if (championClass === "mage") {
    ids.push("zhonyas-hourglass")
  }

  if (championClass === "fighter") {
    ids.push("black-cleaver")
  }

  if (championClass === "tank") {
    ids.push("hollow-radiance")
  }

  if (needs.hasHealing) {
    ids.push(completedAntiHealItemByClass[championClass])
  }

  if (needs.needsPenetration) {
    ids.push(antiTankItemByClass[championClass])
  }

  return Array.from(new Set(ids)).slice(0, 4)
}

function toRecommendationItem(
  itemId: ItemId,
  reason: string
): PlannerItemRecommendation {
  const item = seededItemCatalog[itemId]

  return {
    itemId,
    name: item.name,
    buildStage: item.buildStage,
    reason,
    tags: item.tags,
  }
}

function targetReason(
  champion: CatalogChampion,
  itemId: ItemId,
  needs: EnemyNeeds
): string {
  return needPlan(needs, needPlanItemMaps).targetReason(
    champion.name,
    seededItemCatalog[itemId].name
  )
}

function alternativeReason(needs: EnemyNeeds): string {
  return contextualNeedPlan(needs, needPlanItemMaps).alternativeReason
}

function fullBuildReason(itemId: ItemId): string {
  if (hasTag(itemId, "anti-crit")) {
    return "Keeps an armor answer available for fed crit damage."
  }

  if (hasTag(itemId, "anti-heal")) {
    return "Keeps anti-heal available in the planned build."
  }

  if (hasTag(itemId, "anti-tank")) {
    return "Keeps armor or health stacking from blocking damage."
  }

  if (hasTag(itemId, "survivability")) {
    return "Adds survivability without leaving the item plan."
  }

  return "Continues the seeded baseline build."
}

function hasTag(itemId: ItemId, tag: ItemTag): boolean {
  return (seededItemCatalog[itemId].tags as readonly string[]).includes(tag)
}

function hasFit(itemId: ItemId, championClass: ChampionClass): boolean {
  return (seededItemCatalog[itemId].fits as readonly string[]).includes(
    championClass
  )
}

function componentGoldCost(itemId: ComponentItemId): number {
  return seededItemCatalog[itemId].goldCost ?? Number.POSITIVE_INFINITY
}

function formatItemList(itemIds: readonly ItemId[]): string {
  return itemIds.map((itemId) => seededItemCatalog[itemId].name).join(", ")
}

function learningRule(needs: EnemyNeeds): string {
  return contextualNeedPlan(needs, needPlanItemMaps).learningRule
}

function confidenceForNeeds(
  needs: EnemyNeeds
): ManualPlannerRecommendation["confidence"] {
  if (
    needs.hasHealing ||
    needs.hasAntiCrit ||
    needs.needsPenetration ||
    needs.needsSurvivability ||
    needs.topReason !== "baseline"
  ) {
    return "medium"
  }

  return "low"
}

function explanationForRecommendation(
  champion: CatalogChampion,
  targetItem: PlannerItemRecommendation,
  needs: EnemyNeeds
): string {
  return needPlan(needs, needPlanItemMaps).explanation(
    champion.name,
    targetItem.name
  )
}
