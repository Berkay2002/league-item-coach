import type { ChampionClass, ChampionId, Role } from "./manual-planner"

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

export interface PlannerRuneRecommendation extends SeededRunePage {
  explanation: string
}

export interface RunePageSelectionInput {
  championId: ChampionId
  championClass: ChampionClass
  role: Role
}

export interface RunePageExplanationInput {
  championName: string
  physicalThreats: number
  magicThreats: number
  tankCount: number
  hasHealing: boolean
}

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

export function chooseSeededRunePage(
  input: RunePageSelectionInput
): SeededRunePage {
  return (
    seededRunePagesByChampionRole[input.championId]?.[input.role] ??
    fallbackRunePagesByClass[input.championClass]
  )
}

export function explainRunePage(
  input: RunePageExplanationInput,
  page: SeededRunePage
): PlannerRuneRecommendation {
  return {
    ...page,
    explanation: runeExplanation(input, page),
  }
}

function runeExplanation(
  input: RunePageExplanationInput,
  page: SeededRunePage
): string {
  if (input.hasHealing || input.physicalThreats > input.magicThreats) {
    return `${input.championName} keeps ${page.primaryTree.name} with ${page.keystone.name} for reliable damage, while ${page.secondaryTree.name} secondary trades some lane aggression for safety in this matchup.`
  }

  if (input.tankCount >= 2) {
    return `${input.championName} keeps ${page.primaryTree.name} with ${page.keystone.name} for scaling damage, accepting a slower lane for a stronger tank matchup.`
  }

  return `${input.championName} keeps ${page.primaryTree.name} with ${page.keystone.name} as the stable seeded page, with ${page.secondaryTree.name} secondary covering the main comp tradeoff.`
}
