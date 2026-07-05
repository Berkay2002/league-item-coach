import type { ChampionClass, ItemId } from "./manual-planner"
import type { EnemyNeedReason, EnemyNeeds } from "./manual-planner.enemy-needs"

type ClassItemMap = Readonly<Record<ChampionClass, ItemId>>

export interface NeedPlanItemMaps {
  antiCrit: ClassItemMap
  antiHeal: ClassItemMap
  antiTank: ClassItemMap
  baseline: ClassItemMap
  magicDefense: ClassItemMap
  physicalDefense: ClassItemMap
}

export interface NeedPlan {
  targetItemForClass: (championClass: ChampionClass) => ItemId
  targetReason: (championName: string, itemName: string) => string
  alternativeReason: string
  learningRule: string
  explanation: (championName: string, itemName: string) => string
}

type NeedPlanTarget =
  | "antiCrit"
  | "antiHeal"
  | "antiTank"
  | "baseline"
  | "magicDefense"
  | "physicalDefense"

interface NeedPlanDefinition {
  target: NeedPlanTarget
  targetReason: (championName: string, itemName: string) => string
  alternativeReason: string
  learningRule: string
  explanation: (championName: string, itemName: string) => string
}

const baselineAlternativeReason =
  "The baseline plan remains the alternative when it matters more than the defensive adjustment."

const baselineNeedPlanDefinition = {
  target: "baseline",
  targetReason: (championName) =>
    `${championName} starts from a seeded baseline item for the selected role.`,
  alternativeReason: baselineAlternativeReason,
  learningRule:
    "Start from the seeded baseline, then adjust the next slot for the clearest enemy need.",
  explanation: (championName, itemName) =>
    `${championName} should target ${itemName} from the seeded baseline.`,
} satisfies NeedPlanDefinition

const needPlanDefinitionByReason = {
  "anti-crit": {
    target: "antiCrit",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because a fed crit threat makes armor and crit reduction the clearest need.`,
    alternativeReason:
      "Core damage is the alternative when it matters more than answering crit first.",
    learningRule:
      "When a fed crit threat is ahead, add anti-crit armor before returning to baseline damage.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because a fed crit threat makes armor the clearest adjustment.`,
  },
  "anti-heal": {
    target: "antiHeal",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because enemy healing is the clearest team-comp need.`,
    alternativeReason:
      "Core damage is the alternative when it matters more than answering healing first.",
    learningRule:
      "When enemy champions bring repeat healing, reserve an early anti-heal slot.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because enemy healing is the clearest team-comp need.`,
  },
  armor: {
    target: "physicalDefense",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because physical damage is the clearest defensive need.`,
    alternativeReason: baselineAlternativeReason,
    learningRule:
      "When physical damage is the larger threat, add armor or survivability without abandoning the core plan.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because physical damage is the clearest adjustment.`,
  },
  baseline: baselineNeedPlanDefinition,
  "fed-magic": {
    target: "magicDefense",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because the strongest fed magic threat outweighs the raw team damage split.`,
    alternativeReason: baselineAlternativeReason,
    learningRule:
      "When a fed magic threat is ahead, add a defensive adjustment before returning to the core plan.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because a fed magic threat is the clearest live danger.`,
  },
  "fed-physical": {
    target: "physicalDefense",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because the strongest fed physical threat outweighs the raw team damage split.`,
    alternativeReason: baselineAlternativeReason,
    learningRule:
      "When a fed physical threat is ahead, add armor or survivability before returning to the core plan.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because a fed physical threat is the clearest live danger.`,
  },
  "magic-resist": {
    target: "magicDefense",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because magic damage is the clearest defensive need.`,
    alternativeReason: baselineAlternativeReason,
    learningRule:
      "When magic damage is the larger threat, add a defensive adjustment without abandoning the core plan.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because magic damage is the clearest adjustment.`,
  },
  penetration: {
    target: "antiTank",
    targetReason: (championName, itemName) =>
      `${championName} targets ${itemName} because enemy tanks make penetration the clearest need.`,
    alternativeReason:
      "Baseline damage is the alternative when it matters more than answering tanks first.",
    learningRule:
      "When the enemy team has multiple tanks, add penetration or anti-tank damage after the baseline item.",
    explanation: (championName, itemName) =>
      `${championName} should target ${itemName} because tank threats make penetration the clearest adjustment.`,
  },
} satisfies Record<EnemyNeedReason, NeedPlanDefinition>

export function needPlan(
  needs: EnemyNeeds,
  itemMaps: NeedPlanItemMaps
): NeedPlan {
  return resolveNeedPlan(needPlanDefinitionByReason[needs.topReason], itemMaps)
}

export function contextualNeedPlan(
  needs: EnemyNeeds,
  itemMaps: NeedPlanItemMaps
): NeedPlan {
  if (needs.topReason !== "baseline") {
    return needPlan(needs, itemMaps)
  }

  if (needs.needsPenetration) {
    return resolveNeedPlan(needPlanDefinitionByReason.penetration, itemMaps)
  }

  if (needs.magicThreats > needs.physicalThreats) {
    return resolveNeedPlan(needPlanDefinitionByReason["magic-resist"], itemMaps)
  }

  if (needs.physicalThreats > needs.magicThreats) {
    return resolveNeedPlan(needPlanDefinitionByReason.armor, itemMaps)
  }

  return resolveNeedPlan(baselineNeedPlanDefinition, itemMaps)
}

function resolveNeedPlan(
  definition: NeedPlanDefinition,
  itemMaps: NeedPlanItemMaps
): NeedPlan {
  return {
    targetItemForClass: (championClass) =>
      itemMaps[definition.target][championClass],
    targetReason: definition.targetReason,
    alternativeReason: definition.alternativeReason,
    learningRule: definition.learningRule,
    explanation: definition.explanation,
  }
}
