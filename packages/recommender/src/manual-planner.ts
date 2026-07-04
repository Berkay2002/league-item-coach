import {
  assertRecommendationOutputAllowed,
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
    tags: ["magic-resist", "survivability"],
    fits: ["mage"],
  },
  "black-cleaver": {
    id: "black-cleaver",
    name: "Black Cleaver",
    tags: ["damage", "anti-tank", "survivability"],
    fits: ["fighter"],
  },
  "executioners-calling": {
    id: "executioners-calling",
    name: "Executioner's Calling",
    tags: ["anti-heal", "damage"],
    fits: ["fighter", "marksman"],
  },
  "hollow-radiance": {
    id: "hollow-radiance",
    name: "Hollow Radiance",
    tags: ["magic-resist", "survivability"],
    fits: ["tank"],
  },
  "imperial-mandate": {
    id: "imperial-mandate",
    name: "Imperial Mandate",
    tags: ["support", "damage"],
    fits: ["enchanter", "mage"],
  },
  "infinity-edge": {
    id: "infinity-edge",
    name: "Infinity Edge",
    tags: ["crit", "damage"],
    fits: ["marksman"],
  },
  "kraken-slayer": {
    id: "kraken-slayer",
    name: "Kraken Slayer",
    tags: ["damage"],
    fits: ["marksman"],
  },
  "liandrys-torment": {
    id: "liandrys-torment",
    name: "Liandry's Torment",
    tags: ["anti-tank", "damage"],
    fits: ["mage"],
  },
  "lord-dominiks-regards": {
    id: "lord-dominiks-regards",
    name: "Lord Dominik's Regards",
    tags: ["anti-tank", "penetration", "crit"],
    fits: ["marksman"],
  },
  morellonomicon: {
    id: "morellonomicon",
    name: "Morellonomicon",
    tags: ["anti-heal", "damage"],
    fits: ["mage"],
  },
  "mortal-reminder": {
    id: "mortal-reminder",
    name: "Mortal Reminder",
    tags: ["anti-heal", "penetration", "crit"],
    fits: ["marksman"],
  },
  "steraks-gage": {
    id: "steraks-gage",
    name: "Sterak's Gage",
    tags: ["survivability", "damage"],
    fits: ["fighter"],
  },
  "sunfire-aegis": {
    id: "sunfire-aegis",
    name: "Sunfire Aegis",
    tags: ["armor", "survivability"],
    fits: ["tank"],
  },
  "zhonyas-hourglass": {
    id: "zhonyas-hourglass",
    name: "Zhonya's Hourglass",
    tags: ["armor", "survivability"],
    fits: ["mage"],
  },
} as const satisfies Record<string, SeededItem>

export type ChampionId = keyof typeof seededChampionCatalog
export type ItemId = keyof typeof seededItemCatalog

export interface ManualPlannerInput {
  championId: ChampionId
  role: Role
  allyChampionIds: readonly ChampionId[]
  enemyChampionIds: readonly ChampionId[]
}

export interface PlannerItemRecommendation {
  itemId: ItemId
  name: string
  reason: string
  tags: readonly ItemTag[]
}

export interface ManualPlannerRecommendation {
  input: ManualPlannerInput
  champion: (typeof seededChampionCatalog)[ChampionId]
  role: Role
  allies: readonly (typeof seededChampionCatalog)[ChampionId][]
  enemies: readonly (typeof seededChampionCatalog)[ChampionId][]
  primaryItem: PlannerItemRecommendation
  alternativeItem?: PlannerItemRecommendation
  buyNowComponent?: PlannerItemRecommendation
  fullBuild: readonly PlannerItemRecommendation[]
  confidence: "seeded"
  explanation: string
  learningRule: string
  compliance: RecommendationOutputComplianceResult
}

export const seededPlannerCatalog = {
  roles: ["top", "jungle", "mid", "bot", "support"] as const,
  champions: seededChampionCatalog,
  championOptions: Object.values(
    seededChampionCatalog
  ) as readonly (typeof seededChampionCatalog)[ChampionId][],
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
  const primaryItemId = baselineItemByClass[champion.class]
  const alternativeItemId = chooseAlternativeItemId(champion.class, needs)
  const fullBuildIds = chooseFullBuildIds(champion.class, primaryItemId, needs)

  const primaryItem = toRecommendationItem(
    primaryItemId,
    primaryReason(champion, needs)
  )
  const alternativeItem =
    alternativeItemId === primaryItemId
      ? undefined
      : toRecommendationItem(
          alternativeItemId,
          alternativeReason(alternativeItemId, needs)
        )
  const fullBuild = fullBuildIds.map((itemId) =>
    toRecommendationItem(itemId, fullBuildReason(itemId))
  )
  const buyNowItemId: ItemId = antiHealItemByClass[champion.class]
  const buyNowComponent = needs.hasHealing
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
    confidence: "seeded" as const,
    explanation: `${champion.name} gets a stable ${primaryItem.name} plan from the seeded ${input.role} catalog.`,
    learningRule: learningRule(needs),
  }

  assertRecommendationOutputAllowed(recommendationWithoutCompliance)

  return {
    ...recommendationWithoutCompliance,
    compliance: validateRecommendationOutput(recommendationWithoutCompliance),
  }
}

interface EnemyNeeds {
  physicalThreats: number
  magicThreats: number
  tankCount: number
  hasHealing: boolean
}

function summarizeEnemyNeeds(
  enemies: readonly (typeof seededChampionCatalog)[ChampionId][]
): EnemyNeeds {
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

function chooseAlternativeItemId(
  championClass: ChampionClass,
  needs: EnemyNeeds
): ItemId {
  if (needs.hasHealing) {
    return antiHealItemByClass[championClass]
  }

  if (needs.tankCount >= 2) {
    return antiTankItemByClass[championClass]
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return championClass === "tank" ? "hollow-radiance" : "banshees-veil"
  }

  if (needs.physicalThreats > needs.magicThreats && championClass === "mage") {
    return "zhonyas-hourglass"
  }

  return baselineItemByClass[championClass]
}

function chooseFullBuildIds(
  championClass: ChampionClass,
  primaryItemId: ItemId,
  needs: EnemyNeeds
): ItemId[] {
  const ids: ItemId[] = [primaryItemId]

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
    ids.push(
      championClass === "marksman" ? "mortal-reminder" : "morellonomicon"
    )
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
    reason,
    tags: item.tags,
  }
}

function primaryReason(
  champion: (typeof seededChampionCatalog)[ChampionId],
  needs: EnemyNeeds
): string {
  if (needs.hasHealing) {
    return `${champion.name} still starts from the baseline item, then answers enemy healing with the next slot.`
  }

  if (needs.tankCount >= 2) {
    return `${champion.name} starts from the baseline item before adding anti-tank damage.`
  }

  return `${champion.name} starts from a seeded baseline item for the selected role.`
}

function alternativeReason(itemId: ItemId, needs: EnemyNeeds): string {
  if (hasTag(itemId, "anti-heal")) {
    return "Use this when enemy healing is the clearest adjustment."
  }

  if (needs.tankCount >= 2) {
    return "Use this when durable enemies are the main adjustment."
  }

  if (hasTag(itemId, "magic-resist")) {
    return "Use this when magic damage is the larger threat."
  }

  return "Use this when the enemy profile changes the baseline plan."
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
  champion: (typeof seededChampionCatalog)[ChampionId],
  trait: SeededChampion["traits"][number]
): boolean {
  return (champion.traits as readonly string[]).includes(trait)
}

function hasTag(itemId: ItemId, tag: ItemTag): boolean {
  return (seededItemCatalog[itemId].tags as readonly string[]).includes(tag)
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
