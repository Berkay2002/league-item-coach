import {
  validateRecommendationOutput,
  type RecommendationOutputComplianceResult,
} from "./compliance"

export type Role = "top" | "jungle" | "mid" | "bot" | "support"

export type DamageProfile = "physical" | "magic" | "mixed"

export type ChampionClass =
  "assassin" | "enchanter" | "fighter" | "mage" | "marksman" | "tank"

export type ItemTag =
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
type CatalogChampion = (typeof seededChampionCatalog)[ChampionId]

export interface ManualPlannerInput {
  championId: ChampionId
  role: Role
  allyChampionIds: readonly ChampionId[]
  enemyChampionIds: readonly ChampionId[]
}

export interface PlannerItemRecommendation {
  itemId: ItemId
  name: string
  buildStage: SeededItem["buildStage"]
  reason: string
  tags: readonly ItemTag[]
}

export type RecommendationConfidence = "low" | "medium"

export interface ManualPlannerRecommendation {
  input: ManualPlannerInput
  champion: CatalogChampion
  role: Role
  allies: readonly CatalogChampion[]
  enemies: readonly CatalogChampion[]
  primaryItem: PlannerItemRecommendation
  alternativeItem?: PlannerItemRecommendation
  buyNowComponent?: PlannerItemRecommendation
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

const antiHealItemByClass = {
  assassin: "executioners-calling",
  enchanter: "morellonomicon",
  fighter: "executioners-calling",
  mage: "morellonomicon",
  marksman: "executioners-calling",
  tank: "executioners-calling",
} as const satisfies Record<ChampionClass, ItemId>

const completedAntiHealItemByClass = {
  assassin: "mortal-reminder",
  enchanter: "morellonomicon",
  fighter: "thornmail",
  mage: "morellonomicon",
  marksman: "mortal-reminder",
  tank: "thornmail",
} as const satisfies Record<ChampionClass, ItemId>

const antiTankItemByClass = {
  assassin: "black-cleaver",
  enchanter: "liandrys-torment",
  fighter: "black-cleaver",
  mage: "liandrys-torment",
  marksman: "lord-dominiks-regards",
  tank: "sunfire-aegis",
} as const satisfies Record<ChampionClass, ItemId>

export function recommendForManualPlanner(
  input: ManualPlannerInput
): ManualPlannerRecommendation {
  const champion = seededChampionCatalog[input.championId]
  const allies = input.allyChampionIds.map((id) => seededChampionCatalog[id])
  const enemies = input.enemyChampionIds.map((id) => seededChampionCatalog[id])
  const needs = summarizeEnemyNeeds(enemies)
  const primaryItemId = choosePrimaryItemId(champion.class, needs)
  const alternativeItemId = chooseAlternativeItemId(
    champion.class,
    primaryItemId,
    needs
  )
  const fullBuildIds = chooseFullBuildIds(champion.class, primaryItemId, needs)

  const primaryItem = toRecommendationItem(
    primaryItemId,
    primaryReason(champion, primaryItemId, needs)
  )
  const alternativeItem = alternativeItemId
    ? toRecommendationItem(alternativeItemId, alternativeReason(needs))
    : undefined
  const fullBuild = fullBuildIds.map((itemId) =>
    toRecommendationItem(itemId, fullBuildReason(itemId))
  )
  const buyNowItemId = chooseBuyNowComponentItemId(champion.class, needs)
  const buyNowComponent = buyNowItemId
    ? toRecommendationItem(
        buyNowItemId,
        "Add anti-heal when the enemy team has repeat healing."
      )
    : undefined

  const recommendationWithoutCompliance = {
    input,
    champion,
    role: input.role,
    allies,
    enemies,
    primaryItem,
    alternativeItem,
    buyNowComponent,
    fullBuild,
    confidence: confidenceForNeeds(needs),
    explanation: explanationForRecommendation(champion, primaryItem, needs),
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

interface EnemyNeeds {
  physicalThreats: number
  magicThreats: number
  tankCount: number
  hasHealing: boolean
}

function summarizeEnemyNeeds(enemies: readonly CatalogChampion[]): EnemyNeeds {
  return enemies.reduce<EnemyNeeds>(
    (needs, enemy) => ({
      physicalThreats:
        needs.physicalThreats +
        (enemy.damageProfile === "physical" || enemy.damageProfile === "mixed"
          ? 1
          : 0),
      magicThreats:
        needs.magicThreats +
        (enemy.damageProfile === "magic" || enemy.damageProfile === "mixed"
          ? 1
          : 0),
      tankCount: needs.tankCount + (hasTrait(enemy, "tank") ? 1 : 0),
      hasHealing: needs.hasHealing || hasTrait(enemy, "healing"),
    }),
    {
      physicalThreats: 0,
      magicThreats: 0,
      tankCount: 0,
      hasHealing: false,
    }
  )
}

function choosePrimaryItemId(
  championClass: ChampionClass,
  needs: EnemyNeeds
): ItemId {
  if (needs.hasHealing) {
    return completedAntiHealItemByClass[championClass]
  }

  return baselineItemByClass[championClass]
}

function chooseAlternativeItemId(
  championClass: ChampionClass,
  primaryItemId: ItemId,
  needs: EnemyNeeds
): ItemId | undefined {
  const baselineItemId = baselineItemByClass[championClass]

  if (primaryItemId !== baselineItemId) {
    return baselineItemId
  }

  if (needs.tankCount >= 2) {
    return differentItem(antiTankItemByClass[championClass], primaryItemId)
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return differentItem(
      championClass === "tank" ? "hollow-radiance" : "banshees-veil",
      primaryItemId
    )
  }

  if (needs.physicalThreats > needs.magicThreats && championClass === "mage") {
    return differentItem("zhonyas-hourglass", primaryItemId)
  }

  return undefined
}

function differentItem(
  itemId: ItemId,
  currentItemId: ItemId
): ItemId | undefined {
  return itemId === currentItemId ? undefined : itemId
}

function chooseBuyNowComponentItemId(
  championClass: ChampionClass,
  needs: EnemyNeeds
): ItemId | undefined {
  if (!needs.hasHealing) {
    return undefined
  }

  const itemId = antiHealItemByClass[championClass]
  const item = seededItemCatalog[itemId]

  if (item.buildStage !== "component" || !hasFit(itemId, championClass)) {
    return undefined
  }

  return itemId
}

function chooseFullBuildIds(
  championClass: ChampionClass,
  primaryItemId: ItemId,
  needs: EnemyNeeds
): ItemId[] {
  const ids: ItemId[] = [primaryItemId, baselineItemByClass[championClass]]

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

  if (needs.tankCount >= 2) {
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

function primaryReason(
  champion: CatalogChampion,
  itemId: ItemId,
  needs: EnemyNeeds
): string {
  if (needs.hasHealing) {
    return `${champion.name} targets ${seededItemCatalog[itemId].name} because enemy healing is the clearest team-comp need.`
  }

  return `${champion.name} starts from a seeded baseline item for the selected role.`
}

function alternativeReason(needs: EnemyNeeds): string {
  if (needs.hasHealing) {
    return "Use this when core damage is more important than answering healing first."
  }

  if (needs.tankCount >= 2) {
    return "Use this when baseline damage is more important than answering tanks first."
  }

  return "Use this when the baseline plan matters more than the defensive adjustment."
}

function fullBuildReason(itemId: ItemId): string {
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

function hasTrait(
  champion: CatalogChampion,
  trait: SeededChampion["traits"][number]
): boolean {
  return (champion.traits as readonly string[]).includes(trait)
}

function hasTag(itemId: ItemId, tag: ItemTag): boolean {
  return (seededItemCatalog[itemId].tags as readonly string[]).includes(tag)
}

function hasFit(itemId: ItemId, championClass: ChampionClass): boolean {
  return (seededItemCatalog[itemId].fits as readonly string[]).includes(
    championClass
  )
}

function learningRule(needs: EnemyNeeds): string {
  if (needs.hasHealing) {
    return "When enemy champions bring repeat healing, reserve an early anti-heal slot."
  }

  if (needs.tankCount >= 2) {
    return "When the enemy team has multiple tanks, add penetration or anti-tank damage after the baseline item."
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return "When magic damage is the larger threat, add magic resist without abandoning the core plan."
  }

  if (needs.physicalThreats > needs.magicThreats) {
    return "When physical damage is the larger threat, add armor or survivability without abandoning the core plan."
  }

  return "Start from the seeded baseline, then adjust the next slot for the clearest enemy need."
}

function confidenceForNeeds(
  needs: EnemyNeeds
): ManualPlannerRecommendation["confidence"] {
  if (needs.hasHealing) {
    return "medium"
  }

  return "low"
}

function explanationForRecommendation(
  champion: CatalogChampion,
  primaryItem: PlannerItemRecommendation,
  needs: EnemyNeeds
): string {
  if (needs.hasHealing) {
    return `${champion.name} should target ${primaryItem.name} because enemy healing is the clearest team-comp need.`
  }

  return `${champion.name} should target ${primaryItem.name} from the seeded ${primaryItem.tags[0]} baseline.`
}
