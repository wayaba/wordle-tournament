import type { LeaderboardRow, SubmissionEntry } from '../types'
import { buildSubmissionId } from './scoring'

const STORAGE_KEY = 'wordle_tournament_entries_v1'

export function readEntries(): SubmissionEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as SubmissionEntry[]
  } catch {
    return []
  }
}

export function appendEntry(entry: SubmissionEntry): void {
  const entries = readEntries()
  const incomingId = buildSubmissionId(entry)
  const duplicate = entries.some((existing) => buildSubmissionId(existing) === incomingId)
  if (duplicate) {
    throw new Error('Ya existe un resultado tuyo para esa palabra del día.')
  }

  entries.push(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function replaceEntries(entries: SubmissionEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function clearEntries(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function leaderboardFromEntries(entries: SubmissionEntry[], monthKey: string): LeaderboardRow[] {
  const stats = new Map<
    string,
    {
      playerId: string
      playerName: string
      totalPoints: number
      wins: number
      played: number
      attemptSum: number
      solvedCount: number
    }
  >()

  for (const entry of entries) {
    if (entry.weekKey !== monthKey) {
      continue
    }

    const current = stats.get(entry.playerId) ?? {
      playerId: entry.playerId,
      playerName: entry.playerName,
      totalPoints: 0,
      wins: 0,
      played: 0,
      attemptSum: 0,
      solvedCount: 0
    }

    current.played += 1
    current.totalPoints += entry.score
    if (entry.solved && entry.attempts !== null) {
      current.wins += 1
      current.attemptSum += entry.attempts
      current.solvedCount += 1
    }

    stats.set(entry.playerId, current)
  }

  return [...stats.values()]
    .map((row) => ({
      playerId: row.playerId,
      playerName: row.playerName,
      totalPoints: row.totalPoints,
      wins: row.wins,
      played: row.played,
      averageAttempts: row.solvedCount > 0 ? Number((row.attemptSum / row.solvedCount).toFixed(2)) : 0
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      if (b.wins !== a.wins) {
        return b.wins - a.wins
      }
      if (a.averageAttempts !== b.averageAttempts) {
        return a.averageAttempts - b.averageAttempts
      }
      return a.playerName.localeCompare(b.playerName)
    })
}
