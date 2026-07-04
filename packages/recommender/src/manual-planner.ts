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
  goldCost?: number
  tags: readonly ItemTag[]
  fits: readonly ChampionClass[]
}

export type RuneTreeId =
  "domination" | "inspiration" | "precision" | "resolve" | "sorcery"

export type RuneTreeName =
  "Domination" | "Inspiration" | "Precision" | "Resolve" | "Sorcery"

export interface RuneTreeSelection {
  id: RuneTreeId
  dataDragonId: number
  name: RuneTreeName
  iconPath: string
}

export interface RuneSelection {
  dataDragonId: number
  key: string
  name: string
  iconPath: string
}

export interface SeededRunePage {
  primaryTree: RuneTreeSelection
  keystone: RuneSelection
  secondaryTree: RuneTreeSelection
  keyMinorRunes: readonly RuneSelection[]
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

const runeTrees = {
  domination: {
    id: "domination",
    dataDragonId: 8100,
    name: "Domination",
    iconPath: "perk-images/Styles/7200_Domination.png",
  },
  inspiration: {
    id: "inspiration",
    dataDragonId: 8300,
    name: "Inspiration",
    iconPath: "perk-images/Styles/7203_Whimsy.png",
  },
  precision: {
    id: "precision",
    dataDragonId: 8000,
    name: "Precision",
    iconPath: "perk-images/Styles/7201_Precision.png",
  },
  resolve: {
    id: "resolve",
    dataDragonId: 8400,
    name: "Resolve",
    iconPath: "perk-images/Styles/7204_Resolve.png",
  },
  sorcery: {
    id: "sorcery",
    dataDragonId: 8200,
    name: "Sorcery",
    iconPath: "perk-images/Styles/7202_Sorcery.png",
  },
} as const satisfies Record<RuneTreeId, RuneTreeSelection>

const runeCatalog = {
  arcaneComet: {
    dataDragonId: 8229,
    key: "ArcaneComet",
    name: "Arcane Comet",
    iconPath: "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
  },
  biscuitDelivery: {
    dataDragonId: 8345,
    key: "BiscuitDelivery",
    name: "Biscuit Delivery",
    iconPath:
      "perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png",
  },
  bonePlating: {
    dataDragonId: 8473,
    key: "BonePlating",
    name: "Bone Plating",
    iconPath: "perk-images/Styles/Resolve/BonePlating/BonePlating.png",
  },
  conqueror: {
    dataDragonId: 8010,
    key: "Conqueror",
    name: "Conqueror",
    iconPath: "perk-images/Styles/Precision/Conqueror/Conqueror.png",
  },
  cutDown: {
    dataDragonId: 8014,
    key: "CutDown",
    name: "Cut Down",
    iconPath: "perk-images/Styles/Precision/CutDown/CutDown.png",
  },
  demolish: {
    dataDragonId: 8446,
    key: "Demolish",
    name: "Demolish",
    iconPath: "perk-images/Styles/Resolve/Demolish/Demolish.png",
  },
  electrocute: {
    dataDragonId: 8112,
    key: "Electrocute",
    name: "Electrocute",
    iconPath: "perk-images/Styles/Domination/Electrocute/Electrocute.png",
  },
  graspOfTheUndying: {
    dataDragonId: 8437,
    key: "GraspOfTheUndying",
    name: "Grasp of the Undying",
    iconPath:
      "perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
  },
  legendBloodline: {
    dataDragonId: 9103,
    key: "LegendBloodline",
    name: "Legend: Bloodline",
    iconPath:
      "perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png",
  },
  legendHaste: {
    dataDragonId: 9105,
    key: "LegendHaste",
    name: "Legend: Haste",
    iconPath: "perk-images/Styles/Precision/LegendHaste/LegendHaste.png",
  },
  lethalTempo: {
    dataDragonId: 8008,
    key: "LethalTempo",
    name: "Lethal Tempo",
    iconPath: "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
  },
  manaflowBand: {
    dataDragonId: 8226,
    key: "ManaflowBand",
    name: "Manaflow Band",
    iconPath: "perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png",
  },
  overgrowth: {
    dataDragonId: 8451,
    key: "Overgrowth",
    name: "Overgrowth",
    iconPath: "perk-images/Styles/Resolve/Overgrowth/Overgrowth.png",
  },
  presenceOfMind: {
    dataDragonId: 8009,
    key: "PresenceOfMind",
    name: "Presence of Mind",
    iconPath: "perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png",
  },
  pressTheAttack: {
    dataDragonId: 8005,
    key: "PressTheAttack",
    name: "Press the Attack",
    iconPath: "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
  },
  revitalize: {
    dataDragonId: 8453,
    key: "Revitalize",
    name: "Revitalize",
    iconPath: "perk-images/Styles/Resolve/Revitalize/Revitalize.png",
  },
  scorch: {
    dataDragonId: 8237,
    key: "Scorch",
    name: "Scorch",
    iconPath: "perk-images/Styles/Sorcery/Scorch/Scorch.png",
  },
  secondWind: {
    dataDragonId: 8444,
    key: "SecondWind",
    name: "Second Wind",
    iconPath: "perk-images/Styles/Resolve/SecondWind/SecondWind.png",
  },
  suddenImpact: {
    dataDragonId: 8143,
    key: "SuddenImpact",
    name: "Sudden Impact",
    iconPath: "perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png",
  },
  summonAery: {
    dataDragonId: 8214,
    key: "SummonAery",
    name: "Summon Aery",
    iconPath: "perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
  },
  transcendence: {
    dataDragonId: 8210,
    key: "Transcendence",
    name: "Transcendence",
    iconPath: "perk-images/Styles/Sorcery/Transcendence/Transcendence.png",
  },
  treasureHunter: {
    dataDragonId: 8135,
    key: "TreasureHunter",
    name: "Treasure Hunter",
    iconPath: "perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png",
  },
  triumph: {
    dataDragonId: 9111,
    key: "Triumph",
    name: "Triumph",
    iconPath: "perk-images/Styles/Precision/Triumph.png",
  },
} as const satisfies Record<string, RuneSelection>

const seededRunePagesByChampionRole: Partial<
  Record<ChampionId, Partial<Record<Role, SeededRunePage>>>
> = {
  jinx: {
    bot: {
      primaryTree: runeTrees.precision,
      keystone: runeCatalog.lethalTempo,
      secondaryTree: runeTrees.resolve,
      keyMinorRunes: [
        runeCatalog.presenceOfMind,
        runeCatalog.legendBloodline,
        runeCatalog.cutDown,
        runeCatalog.bonePlating,
        runeCatalog.overgrowth,
      ],
    },
  },
}

const fallbackRunePagesByClass = {
  assassin: {
    primaryTree: runeTrees.domination,
    keystone: runeCatalog.electrocute,
    secondaryTree: runeTrees.precision,
    keyMinorRunes: [
      runeCatalog.suddenImpact,
      runeCatalog.treasureHunter,
      runeCatalog.triumph,
    ],
  },
  enchanter: {
    primaryTree: runeTrees.sorcery,
    keystone: runeCatalog.summonAery,
    secondaryTree: runeTrees.resolve,
    keyMinorRunes: [
      runeCatalog.manaflowBand,
      runeCatalog.scorch,
      runeCatalog.revitalize,
    ],
  },
  fighter: {
    primaryTree: runeTrees.precision,
    keystone: runeCatalog.conqueror,
    secondaryTree: runeTrees.resolve,
    keyMinorRunes: [
      runeCatalog.triumph,
      runeCatalog.legendHaste,
      runeCatalog.secondWind,
    ],
  },
  mage: {
    primaryTree: runeTrees.sorcery,
    keystone: runeCatalog.arcaneComet,
    secondaryTree: runeTrees.inspiration,
    keyMinorRunes: [
      runeCatalog.manaflowBand,
      runeCatalog.transcendence,
      runeCatalog.biscuitDelivery,
    ],
  },
  marksman: {
    primaryTree: runeTrees.precision,
    keystone: runeCatalog.pressTheAttack,
    secondaryTree: runeTrees.inspiration,
    keyMinorRunes: [
      runeCatalog.presenceOfMind,
      runeCatalog.legendBloodline,
      runeCatalog.biscuitDelivery,
    ],
  },
  tank: {
    primaryTree: runeTrees.resolve,
    keystone: runeCatalog.graspOfTheUndying,
    secondaryTree: runeTrees.inspiration,
    keyMinorRunes: [
      runeCatalog.demolish,
      runeCatalog.secondWind,
      runeCatalog.biscuitDelivery,
    ],
  },
} as const satisfies Record<ChampionClass, SeededRunePage>

export interface ManualPlannerInput {
  championId: ChampionId
  role: Role
  allyChampionIds: readonly ChampionId[]
  enemyChampionIds: readonly ChampionId[]
  currentGold: number
  ownedComponentIds: readonly ComponentItemId[]
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

export interface PlannerRuneRecommendation extends SeededRunePage {
  explanation: string
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

export function recommendForManualPlanner(
  input: ManualPlannerInput
): ManualPlannerRecommendation {
  const champion = seededChampionCatalog[input.championId]
  const allies = input.allyChampionIds.map((id) => seededChampionCatalog[id])
  const enemies = input.enemyChampionIds.map((id) => seededChampionCatalog[id])
  const needs = summarizeEnemyNeeds(enemies)
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
  const runeRecommendation = chooseRuneRecommendation(input, champion, needs)

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

function chooseTargetItemId(
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
  targetItemId: ItemId,
  needs: EnemyNeeds
): ItemId | undefined {
  const baselineItemId = baselineItemByClass[championClass]

  if (targetItemId !== baselineItemId) {
    return baselineItemId
  }

  if (needs.tankCount >= 2) {
    return differentItem(antiTankItemByClass[championClass], targetItemId)
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return differentItem(
      championClass === "tank" ? "hollow-radiance" : "banshees-veil",
      targetItemId
    )
  }

  if (needs.physicalThreats > needs.magicThreats && championClass === "mage") {
    return differentItem("zhonyas-hourglass", targetItemId)
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

function chooseRuneRecommendation(
  input: ManualPlannerInput,
  champion: CatalogChampion,
  needs: EnemyNeeds
): PlannerRuneRecommendation {
  const page =
    seededRunePagesByChampionRole[input.championId]?.[input.role] ??
    fallbackRunePagesByClass[champion.class]

  return {
    ...page,
    keyMinorRunes: [...page.keyMinorRunes],
    explanation: runeExplanation(champion, page, needs),
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

function targetReason(
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

function componentGoldCost(itemId: ComponentItemId): number {
  return seededItemCatalog[itemId].goldCost ?? Number.POSITIVE_INFINITY
}

function formatItemList(itemIds: readonly ItemId[]): string {
  return itemIds.map((itemId) => seededItemCatalog[itemId].name).join(", ")
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

function runeExplanation(
  champion: CatalogChampion,
  page: SeededRunePage,
  needs: EnemyNeeds
): string {
  if (needs.hasHealing || needs.physicalThreats > needs.magicThreats) {
    return `${champion.name} keeps ${page.primaryTree.name} with ${page.keystone.name} for reliable damage, while ${page.secondaryTree.name} secondary trades some lane aggression for safety in this matchup.`
  }

  if (needs.tankCount >= 2) {
    return `${champion.name} keeps ${page.primaryTree.name} with ${page.keystone.name} for scaling damage, accepting a slower lane for a stronger tank matchup.`
  }

  return `${champion.name} keeps ${page.primaryTree.name} with ${page.keystone.name} as the stable seeded page, with ${page.secondaryTree.name} secondary covering the main comp tradeoff.`
}

function explanationForRecommendation(
  champion: CatalogChampion,
  targetItem: PlannerItemRecommendation,
  needs: EnemyNeeds
): string {
  if (needs.hasHealing) {
    return `${champion.name} should target ${targetItem.name} because enemy healing is the clearest team-comp need.`
  }

  return `${champion.name} should target ${targetItem.name} from the seeded ${targetItem.tags[0]} baseline.`
}
