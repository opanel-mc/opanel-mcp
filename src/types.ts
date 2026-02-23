export enum GameMode {
  ADVENTURE = "adventure",
  SURVIVAL = "survival",
  CREATIVE = "creative",
  SPECTATOR = "spectator"
}

export enum Difficulty {
  PEACEFUL = "peaceful",
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard"
}

export interface Save {
  name: string
  displayName: string // base64
  path: string
  size: number
  isRunning: boolean
  isCurrent: boolean
  defaultGameMode: GameMode
  difficulty: Difficulty
  isDifficultyLocked: boolean
  isHardcore: boolean
  datapacks: Record<string, boolean>
}

export interface Player {
  name?: string // bot players may not have a name
  uuid: string
  isOnline: boolean
  isOp: boolean
  isBanned: boolean
  gamemode: GameMode
  banReason?: string // base64
  isWhitelisted?: boolean
  ping?: number
  ip?: string
}

export type Whitelist = {
  name: string
  uuid: string
}[]

export interface Plugin {
  fileName: string // base64
  name: string
  version?: string
  description?: string // base64
  authors: string[]
  website?: string
  icon?: string
  size: number
  enabled: boolean
  loaded: boolean
}

export interface ScheduledTask {
  id: string
  name: string // base64
  cron: string
  commands: string[]
  enabled: boolean
}
