export type Player = {
  id: string
  name: string
}

export type LocalPlayer = Player & {
  pin: string
}

export type ParsedResult = {
  puzzleNumber: number
  attempts: number | null
  maxAttempts: number
  solved: boolean
  grid: string[]
  rawText: string
}

export type SubmissionEntry = {
  playerId: string
  playerName: string
  puzzleNumber: number
  attempts: number | null
  maxAttempts: number
  solved: boolean
  score: number
  rawResult: string
  playedOn: string
  weekKey: string
  submittedAt: string
}

export type LeaderboardRow = {
  playerId: string
  playerName: string
  totalPoints: number
  wins: number
  played: number
  averageAttempts: number
}

export type GlobalRankingRow = {
  playerId: string
  playerName: string
  firsts: number
  seconds: number
  thirds: number
}
