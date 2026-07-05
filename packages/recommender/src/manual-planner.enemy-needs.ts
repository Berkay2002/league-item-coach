import type {
  ChampionId,
  ManualPlannerEnemySnapshot,
  SeededChampion,
} from "./manual-planner"

export interface EnemyNeeds {
  physicalThreats: number
  magicThreats: number
  tankCount: number
  hasHealing: boolean
  hasAntiCrit: boolean
  needsPenetration: boolean
  needsSurvivability: boolean
  needsDamageScaling: boolean
  topReason: EnemyNeedReason
}

export type EnemyNeedReason =
  | "anti-crit"
  | "anti-heal"
  | "baseline"
  | "fed-magic"
  | "fed-physical"
  | "magic-resist"
  | "armor"
  | "penetration"

type EnemyNeedChampion = Pick<
  SeededChampion,
  "damageProfile" | "id" | "traits"
>
type EnemyNeedChampionCatalog = Record<ChampionId, EnemyNeedChampion>
type StaticEnemyNeeds = Pick<
  EnemyNeeds,
  "hasAntiCrit" | "hasHealing" | "magicThreats" | "physicalThreats" | "tankCount"
>

interface WeightedEnemyThreat {
  physical: number
  magic: number
  maxPhysical: number
  maxMagic: number
  healing: number
  crit: number
  tank: number
}

interface EnemyItemThreatProfile {
  physical?: number
  magic?: number
  crit?: number
  healing?: number
  tank?: number
}

type WeightedEnemyItemThreat = Omit<
  WeightedEnemyThreat,
  "maxPhysical" | "maxMagic"
>

const liveItemIds = {
  blackCleaver: 3071,
  bladeOfTheRuinedKing: 3153,
  infinityEdge: 3031,
  krakenSlayer: 3124,
  liandrysTorment: 6653,
  lordDominiksRegards: 3036,
  morellonomicon: 3165,
  rabadonsDeathcap: 3089,
  sunfireAegis: 3068,
  thornmail: 3075,
  warmogsArmor: 3083,
} as const

const itemThreatGoldUnit = 1200
const championLevelThreatWeight = 0.12
const championCreepScoreThreatWeight = 0.012
const championKillThreatWeight = 0.55
const championAssistThreatWeight = 0.18
const championDeathThreatPenalty = 0.35
const minimumChampionThreat = 0.25
const liveHealingPresentThreshold = 5
const liveCritPresentThreshold = 6
const livePenetrationThreshold = 6
const livePrimaryHealingThreshold = 8
const livePrimaryCritThreshold = 8
const liveDominantSingleThreatThreshold = 8
const fallbackReasonScoreThreshold = 5

const enemyItemThreatProfileById: Record<number, EnemyItemThreatProfile> = {
  [liveItemIds.blackCleaver]: { physical: 0.9, tank: 0.5 },
  [liveItemIds.bladeOfTheRuinedKing]: { physical: 0.9, tank: 0.8 },
  [liveItemIds.infinityEdge]: { physical: 1.25, crit: 1.5 },
  [liveItemIds.krakenSlayer]: { physical: 1 },
  [liveItemIds.liandrysTorment]: { magic: 1, tank: 0.9 },
  [liveItemIds.lordDominiksRegards]: { physical: 1, crit: 0.75, tank: 0.75 },
  [liveItemIds.morellonomicon]: { magic: 0.8 },
  [liveItemIds.rabadonsDeathcap]: { magic: 1.6 },
  [liveItemIds.sunfireAegis]: { tank: 1.4 },
  [liveItemIds.thornmail]: { tank: 1.2 },
  [liveItemIds.warmogsArmor]: { tank: 1.6 },
}

export function summarizeEnemyNeeds({
  championCatalog,
  enemies,
  snapshots,
}: {
  championCatalog: EnemyNeedChampionCatalog
  enemies: readonly EnemyNeedChampion[]
  snapshots: readonly ManualPlannerEnemySnapshot[]
}): EnemyNeeds {
  const staticNeeds = summarizeStaticEnemyNeeds(enemies)

  if (snapshots.length === 0) {
    return {
      ...staticNeeds,
      hasAntiCrit: staticNeeds.hasAntiCrit,
      needsPenetration: staticNeeds.tankCount >= 2,
      needsSurvivability: false,
      needsDamageScaling: true,
      topReason: staticTopReason(staticNeeds),
    }
  }

  const weighted = snapshots.reduce<WeightedEnemyThreat>(
    (total, snapshot) => {
      const threat = weightedThreatForSnapshot(snapshot, championCatalog)

      return {
        physical: total.physical + threat.physical,
        magic: total.magic + threat.magic,
        maxPhysical: Math.max(total.maxPhysical, threat.physical),
        maxMagic: Math.max(total.maxMagic, threat.magic),
        healing: total.healing + threat.healing,
        crit: total.crit + threat.crit,
        tank: total.tank + threat.tank,
      }
    },
    {
      physical: 0,
      magic: 0,
      maxPhysical: 0,
      maxMagic: 0,
      healing: 0,
      crit: 0,
      tank: 0,
    }
  )
  const topReason = weightedTopReason(weighted)

  return {
    physicalThreats: weighted.physical,
    magicThreats: weighted.magic,
    tankCount: staticNeeds.tankCount,
    hasHealing: weighted.healing >= liveHealingPresentThreshold,
    hasAntiCrit: weighted.crit >= liveCritPresentThreshold,
    needsPenetration: weighted.tank >= livePenetrationThreshold,
    needsSurvivability:
      topReason === "fed-physical" ||
      topReason === "fed-magic" ||
      topReason === "anti-crit",
    needsDamageScaling:
      topReason === "baseline" || topReason === "penetration",
    topReason,
  }
}

function summarizeStaticEnemyNeeds(
  enemies: readonly EnemyNeedChampion[]
): StaticEnemyNeeds {
  return enemies.reduce<StaticEnemyNeeds>(
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
      hasAntiCrit: needs.hasAntiCrit || hasTrait(enemy, "crit"),
    }),
    {
      physicalThreats: 0,
      magicThreats: 0,
      tankCount: 0,
      hasHealing: false,
      hasAntiCrit: false,
    }
  )
}

function weightedThreatForSnapshot(
  snapshot: ManualPlannerEnemySnapshot,
  championCatalog: EnemyNeedChampionCatalog
): WeightedEnemyThreat {
  const champion = championCatalog[snapshot.championId]
  const championThreat = championThreatWeight(snapshot)
  const itemValueThreat = snapshot.items.reduce(
    (total, item) => total + Math.max(0, item.price) / itemThreatGoldUnit,
    0
  )
  const itemThreat = snapshot.items.reduce<WeightedEnemyItemThreat>(
    (total, item) => {
      const priceWeight = Math.max(0, item.price) / itemThreatGoldUnit
      const profile = enemyItemThreatProfileById[item.itemId] ?? {}

      return {
        physical: total.physical + priceWeight * (profile.physical ?? 0),
        magic: total.magic + priceWeight * (profile.magic ?? 0),
        healing: total.healing + priceWeight * (profile.healing ?? 0),
        crit: total.crit + priceWeight * (profile.crit ?? 0),
        tank: total.tank + priceWeight * (profile.tank ?? 0),
      }
    },
    {
      physical: 0,
      magic: 0,
      healing: 0,
      crit: 0,
      tank: 0,
    }
  )
  const { magicShare, physicalShare } = damageThreatShares(
    champion.damageProfile
  )
  const championAndItemValueThreat = championThreat + itemValueThreat

  return {
    physical:
      championAndItemValueThreat * physicalShare + itemThreat.physical,
    magic: championAndItemValueThreat * magicShare + itemThreat.magic,
    maxPhysical: 0,
    maxMagic: 0,
    healing:
      (hasTrait(champion, "healing") ? championThreat : 0) +
      itemThreat.healing,
    crit: (hasTrait(champion, "crit") ? championThreat : 0) + itemThreat.crit,
    tank: (hasTrait(champion, "tank") ? championThreat : 0) + itemThreat.tank,
  }
}

function championThreatWeight(snapshot: ManualPlannerEnemySnapshot): number {
  return Math.max(
    minimumChampionThreat,
    1 +
      snapshot.level * championLevelThreatWeight +
      snapshot.creepScore * championCreepScoreThreatWeight +
      snapshot.kills * championKillThreatWeight +
      snapshot.assists * championAssistThreatWeight -
      snapshot.deaths * championDeathThreatPenalty
  )
}

function damageThreatShares(
  damageProfile: SeededChampion["damageProfile"]
): { physicalShare: number; magicShare: number } {
  if (damageProfile === "physical") {
    return { physicalShare: 1, magicShare: 0 }
  }

  if (damageProfile === "magic") {
    return { physicalShare: 0, magicShare: 1 }
  }

  return { physicalShare: 0.6, magicShare: 0.6 }
}

function staticTopReason(
  needs: StaticEnemyNeeds
): EnemyNeedReason {
  if (needs.hasHealing) {
    return "anti-heal"
  }

  return "baseline"
}

function weightedTopReason(weighted: WeightedEnemyThreat): EnemyNeedReason {
  if (weighted.healing >= livePrimaryHealingThreshold) {
    return "anti-heal"
  }

  if (weighted.crit >= livePrimaryCritThreshold) {
    return "anti-crit"
  }

  if (weighted.tank >= livePenetrationThreshold) {
    return "penetration"
  }

  if (
    weighted.maxPhysical >= liveDominantSingleThreatThreshold &&
    weighted.maxPhysical > weighted.maxMagic
  ) {
    return "fed-physical"
  }

  if (
    weighted.maxMagic >= liveDominantSingleThreatThreshold &&
    weighted.maxMagic > weighted.maxPhysical
  ) {
    return "fed-magic"
  }

  const reasons: readonly [EnemyNeedReason, number][] = [
    ["anti-heal", weighted.healing],
    ["anti-crit", weighted.crit],
    ["penetration", weighted.tank],
    ["fed-physical", weighted.physical - weighted.magic],
    ["fed-magic", weighted.magic - weighted.physical],
  ]
  const [reason, score] = [...reasons].sort(
    (left, right) => right[1] - left[1]
  )[0]

  return score >= fallbackReasonScoreThreshold ? reason : "baseline"
}

function hasTrait(
  champion: EnemyNeedChampion,
  trait: SeededChampion["traits"][number]
): boolean {
  return (champion.traits as readonly string[]).includes(trait)
}
