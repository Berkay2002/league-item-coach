import type {
  ChampionId,
  ManualPlannerInput,
  Role,
} from "./manual-planner"

export interface LiveClientAllGameData {
  activePlayer?: LiveClientActivePlayer
  allPlayers?: readonly LiveClientPlayer[]
  gameData?: LiveClientGameData
}

export interface LiveClientActivePlayer {
  currentGold?: number
  level?: number
  riotId?: string
  riotIdGameName?: string
  riotIdTagLine?: string
  summonerName?: string
}

export interface LiveClientPlayer {
  championName?: string
  items?: readonly LiveClientPlayerItem[]
  level?: number
  position?: LiveClientPosition
  riotId?: string
  riotIdGameName?: string
  riotIdTagLine?: string
  scores?: LiveClientPlayerScore
  summonerName?: string
  team?: LiveClientTeam
}

export interface LiveClientPlayerItem {
  count?: number
  displayName?: string
  itemID?: LiveClientItemId
  price?: number
  slot?: number
}

export interface LiveClientPlayerScore {
  assists?: number
  creepScore?: number
  deaths?: number
  kills?: number
  wardScore?: number
}

export interface LiveClientGameData {
  gameMode?: string
  gameTime?: number
  mapName?: string
  mapNumber?: number
  mapTerrain?: string
}

export type LiveClientItemId = number
export type LiveClientPosition = string
export type LiveClientTeam = string

export interface NormalizedLiveClientReplay {
  activePlayerRiotId?: string
  gameState?: LiveClientGameData
  players: readonly NormalizedLiveClientPlayer[]
}

export interface NormalizedLiveClientPlayer {
  championId?: ChampionId
  championName?: string
  items: readonly NormalizedLiveClientItem[]
  level: number
  position?: LiveClientPosition
  riotId?: string
  riotIdGameName?: string
  riotIdTagLine?: string
  role?: Role
  score: Required<LiveClientPlayerScore>
  summonerName?: string
  team?: LiveClientTeam
}

export interface NormalizedLiveClientItem {
  count: number
  displayName?: string
  itemId: LiveClientItemId
  price: number
  slot: number
}

export type LiveClientReplayAdapterStatus = "ready" | "unavailable"

export interface LiveClientReplayAdapterResult {
  input: ManualPlannerInput
  replay: NormalizedLiveClientReplay
  status: LiveClientReplayAdapterStatus
  warnings: readonly string[]
}

export interface LiveClientReplayAdapterOptions {
  fallbackInput?: ManualPlannerInput
}
