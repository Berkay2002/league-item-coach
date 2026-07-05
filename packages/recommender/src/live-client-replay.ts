import {
  seededPlannerCatalog,
  type ChampionId,
  type ComponentItemId,
  type ManualPlannerEnemyItem,
  type ManualPlannerEnemySnapshot,
  type ManualPlannerInput,
  type Role,
} from "./manual-planner"
import type {
  LiveClientActivePlayer,
  LiveClientAllGameData,
  LiveClientItemId,
  LiveClientPlayer,
  LiveClientPlayerItem,
  LiveClientPlayerScore,
  LiveClientPosition,
  LiveClientReplayAdapterOptions,
  LiveClientReplayAdapterResult,
  NormalizedLiveClientItem,
  NormalizedLiveClientPlayer,
  NormalizedLiveClientReplay,
} from "./live-client-replay.types"

export type {
  LiveClientActivePlayer,
  LiveClientAllGameData,
  LiveClientGameData,
  LiveClientItemId,
  LiveClientPlayer,
  LiveClientPlayerItem,
  LiveClientPlayerScore,
  LiveClientPosition,
  LiveClientReplayAdapterOptions,
  LiveClientReplayAdapterResult,
  LiveClientReplayAdapterStatus,
  LiveClientTeam,
  NormalizedLiveClientItem,
  NormalizedLiveClientPlayer,
  NormalizedLiveClientReplay,
} from "./live-client-replay.types"

const defaultFallbackInput = {
  championId: "jinx",
  role: "bot",
  allyChampionIds: [],
  enemyChampionIds: [],
  currentGold: 0,
  ownedComponentIds: [],
} as const satisfies ManualPlannerInput

const championIdByNormalizedName = Object.fromEntries(
  Object.values(seededPlannerCatalog.champions).map((champion) => [
    normalizeLookupKey(champion.name),
    champion.id,
  ])
) as Record<string, ChampionId>

const roleByLiveClientPosition: Record<string, Role> = {
  BOTTOM: "bot",
  JUNGLE: "jungle",
  MIDDLE: "mid",
  TOP: "top",
  UTILITY: "support",
}

const componentItemIdByLiveClientItemId: Partial<
  Record<LiveClientItemId, ComponentItemId>
> = {
  3035: "last-whisper",
  3123: "executioners-calling",
}

export function adaptLiveClientReplayToPlannerInput(
  replay: LiveClientAllGameData | null | undefined,
  options: LiveClientReplayAdapterOptions = {}
): LiveClientReplayAdapterResult {
  const fallbackInput = options.fallbackInput ?? defaultFallbackInput
  const warnings: string[] = []

  if (!replay) {
    return unavailableResult(
      fallbackInput,
      {
        players: [],
      },
      [...warnings, "Live Client Data replay is unavailable."]
    )
  }

  const players = (replay.allPlayers ?? []).map(normalizePlayer)
  const normalizedReplay: NormalizedLiveClientReplay = {
    activePlayerRiotId: canonicalRiotId(replay.activePlayer),
    gameState: replay.gameData,
    players,
  }
  const activePlayer = findActivePlayer(players, replay.activePlayer)

  if (!activePlayer) {
    return unavailableResult(fallbackInput, normalizedReplay, [
      ...warnings,
      "Active player is missing from Live Client Data replay.",
    ])
  }

  if (!activePlayer.championId) {
    return unavailableResult(fallbackInput, normalizedReplay, [
      ...warnings,
      "Active champion is missing from the seeded recommender catalog.",
    ])
  }

  const rawGold = replay.activePlayer?.currentGold
  const currentGold = normalizeGold(rawGold, fallbackInput.currentGold)

  if (!isNonNegativeFiniteNumber(rawGold)) {
    warnings.push("Active player current gold is missing or invalid.")
  }

  if (!activePlayer.team) {
    warnings.push(
      "Active player's team is unknown; ally and enemy champions could not be determined."
    )
  }

  const sameTeamPlayers = activePlayer.team
    ? players.filter((player) => player.team === activePlayer.team)
    : []
  const otherTeamPlayers = activePlayer.team
    ? players.filter((player) => player.team && player.team !== activePlayer.team)
    : []
  if (!activePlayer.role) {
    warnings.push(
      "Active player's role could not be determined from position data."
    )
  }
  const role = activePlayer.role ?? fallbackInput.role

  return {
    input: {
      championId: activePlayer.championId,
      role,
      allyChampionIds: championIdsWithoutActive(sameTeamPlayers, activePlayer),
      enemyChampionIds: championIds(otherTeamPlayers),
      enemyLiveSnapshots: enemyLiveSnapshots(otherTeamPlayers),
      currentGold,
      ownedComponentIds: ownedComponentIds(activePlayer),
    },
    replay: normalizedReplay,
    status: "ready",
    warnings,
  }
}

function normalizePlayer(player: LiveClientPlayer): NormalizedLiveClientPlayer {
  return {
    championId: championIdForName(player.championName),
    championName: player.championName,
    items: (player.items ?? []).flatMap(normalizeItem),
    level: normalizeNonNegativeInteger(player.level, 0),
    position: player.position,
    riotId: canonicalRiotId(player),
    riotIdGameName: player.riotIdGameName,
    riotIdTagLine: player.riotIdTagLine,
    role: roleForPosition(player.position),
    score: normalizeScore(player.scores),
    summonerName: player.summonerName,
    team: player.team,
  }
}

function normalizeItem(
  item: LiveClientPlayerItem
): NormalizedLiveClientItem[] {
  if (!isNonNegativeFiniteNumber(item.itemID)) {
    return []
  }

  return [
    {
      count: normalizeNonNegativeInteger(item.count, 1),
      displayName: item.displayName,
      itemId: item.itemID,
      price: normalizeNonNegativeInteger(item.price, 0),
      slot: normalizeNonNegativeInteger(item.slot, 0),
    },
  ]
}

function findActivePlayer(
  players: readonly NormalizedLiveClientPlayer[],
  activePlayer: LiveClientActivePlayer | undefined
): NormalizedLiveClientPlayer | undefined {
  if (!activePlayer) {
    return undefined
  }

  const activeRiotId = normalizeIdentity(canonicalRiotId(activePlayer))
  const activeSummonerName = normalizeIdentity(activePlayer.summonerName)

  return players.find((player) => {
    return (
      (activeRiotId && normalizeIdentity(player.riotId) === activeRiotId) ||
      (activeSummonerName &&
        normalizeIdentity(player.summonerName) === activeSummonerName)
    )
  })
}

function championIdsWithoutActive(
  players: readonly NormalizedLiveClientPlayer[],
  activePlayer: NormalizedLiveClientPlayer
): ChampionId[] {
  return championIds(players.filter((player) => player !== activePlayer))
}

function championIds(
  players: readonly NormalizedLiveClientPlayer[]
): ChampionId[] {
  return players.flatMap((player) =>
    player.championId ? [player.championId] : []
  )
}

function enemyLiveSnapshots(
  players: readonly NormalizedLiveClientPlayer[]
): ManualPlannerEnemySnapshot[] {
  return players.flatMap((player) =>
    player.championId
      ? [
          {
            championId: player.championId,
            items: plannerEnemyItems(player.items),
            level: player.level,
            creepScore: player.score.creepScore,
            kills: player.score.kills,
            assists: player.score.assists,
            deaths: player.score.deaths,
          },
        ]
      : []
  )
}

function plannerEnemyItems(
  items: readonly NormalizedLiveClientItem[]
): ManualPlannerEnemyItem[] {
  return items.map((item) => ({
    displayName: item.displayName,
    itemId: item.itemId,
    price: item.price,
  }))
}

function ownedComponentIds(
  activePlayer: NormalizedLiveClientPlayer
): ComponentItemId[] {
  return activePlayer.items.flatMap((item) => {
    const componentId = componentItemIdByLiveClientItemId[item.itemId]

    return componentId ? [componentId] : []
  })
}

function championIdForName(name: string | undefined): ChampionId | undefined {
  if (!name) {
    return undefined
  }

  return championIdByNormalizedName[normalizeLookupKey(name)]
}

function roleForPosition(
  position: LiveClientPosition | undefined
): Role | undefined {
  if (!position) {
    return undefined
  }

  return roleByLiveClientPosition[position.trim().toUpperCase()]
}

function normalizeScore(
  score: LiveClientPlayerScore | undefined
): Required<LiveClientPlayerScore> {
  return {
    assists: normalizeNonNegativeInteger(score?.assists, 0),
    creepScore: normalizeNonNegativeInteger(score?.creepScore, 0),
    deaths: normalizeNonNegativeInteger(score?.deaths, 0),
    kills: normalizeNonNegativeInteger(score?.kills, 0),
    wardScore: normalizeNonNegativeInteger(score?.wardScore, 0),
  }
}

function normalizeGold(value: number | undefined, fallback: number): number {
  if (!isNonNegativeFiniteNumber(value)) {
    return fallback
  }

  return Math.floor(value)
}

function normalizeNonNegativeNumber(
  value: number | undefined,
  fallback: number
): number {
  if (!isNonNegativeFiniteNumber(value)) {
    return fallback
  }

  return value
}

function normalizeNonNegativeInteger(
  value: number | undefined,
  fallback: number
): number {
  return Math.floor(normalizeNonNegativeNumber(value, fallback))
}

function isNonNegativeFiniteNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

function normalizeIdentity(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase()
}

function canonicalRiotId(
  identity:
    | Pick<LiveClientActivePlayer, "riotId" | "riotIdGameName" | "riotIdTagLine">
    | undefined
): string | undefined {
  const riotId = identity?.riotId?.trim()

  if (riotId) {
    return riotId
  }

  const gameName = identity?.riotIdGameName?.trim()
  const tagLine = identity?.riotIdTagLine?.trim()

  if (gameName && tagLine) {
    return `${gameName}#${tagLine}`
  }

  return undefined
}

function normalizeLookupKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function unavailableResult(
  input: ManualPlannerInput,
  replay: NormalizedLiveClientReplay,
  warnings: readonly string[]
): LiveClientReplayAdapterResult {
  return {
    input,
    replay,
    status: "unavailable",
    warnings: [
      ...warnings,
      "Returned planner input is a fallback, not live game data.",
    ],
  }
}
