import type { LeaderboardRow, SubmissionEntry } from '../types'
import { buildSubmissionId } from './scoring'

const STORAGE_KEY = 'wordle_tournament_entries_v1'

export function readEntries(): SubmissionEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SubmissionEntry[]) : []
  } catch {
    return []
  }
}

export function appendEntry(entry: SubmissionEntry): void {
  const entries = readEntries()
  const incomingId = buildSubmissionId(entry)
  if (entries.some((e) => buildSubmissionId(e) === incomingId)) {
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

function toMonthKey(value: string | Date): string {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`
  }
  const match = String(value).match(/^(\d{4}-\d{2})/)
  return match ? match[1] : String(value)
}

function calcScore(solved: boolean, attempts: number, maxAttempts: number): number {
  if (!solved) return 0
  return (maxAttempts ?? 6) - attempts + 1
}

type PlayerStats = {
  playerId: string
  playerName: string
  totalPoints: number
  wins: number
  played: number
  attemptSum: number
  solvedCount: number
  submittedAtSum: number
}

export function leaderboardFromEntries(entries: SubmissionEntry[], monthKey: string): LeaderboardRow[] {
  const stats = new Map<string, PlayerStats>()

  for (const entry of entries) {
    if (toMonthKey(entry.weekKey) !== monthKey) continue

    const current = stats.get(entry.playerId) ?? {
      playerId: entry.playerId,
      playerName: entry.playerName,
      totalPoints: 0,
      wins: 0,
      played: 0,
      attemptSum: 0,
      solvedCount: 0,
      submittedAtSum: 0
    }

    const score = calcScore(entry.solved, entry.attempts ?? 0, entry.maxAttempts ?? 6)
    const ts = entry.submittedAt ? new Date(entry.submittedAt).getTime() : 0

    current.played += 1
    current.totalPoints += score
    current.submittedAtSum += ts

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
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      return b.wins - a.wins
    })
}
