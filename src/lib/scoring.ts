import type { SubmissionEntry } from '../types'

export function calculateScore(attempts: number | null, solved: boolean): number {
  if (!solved || attempts === null) {
    return 0
  }

  if (attempts < 1 || attempts > 6) {
    return 0
  }

  return 7 - attempts
}

export function getLocalDateISO(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthKey(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(`${dateInput}T00:00:00`) : new Date(dateInput)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    throw new Error('El mes debe tener formato YYYY-MM.')
  }

  return {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10)
  }
}

export function getMonthBounds(monthKey: string): { start: Date; end: Date } {
  const { year, month } = parseMonthKey(monthKey)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  return { start, end }
}

export function shiftMonthKey(monthKey: string, offset: number): string {
  const { year, month } = parseMonthKey(monthKey)
  const shifted = new Date(year, month - 1 + offset, 1)
  return getMonthKey(shifted)
}

export function isPastMonth(monthKey: string, now = new Date()): boolean {
  const { end } = getMonthBounds(monthKey)
  const endOfMonth = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
  return now.getTime() > endOfMonth.getTime()
}

export function getDaysUntilMonthEnds(monthKey: string, now = new Date()): number {
  const { end } = getMonthBounds(monthKey)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.max(0, Math.round((monthEnd.getTime() - today.getTime()) / 86400000))
}

export function buildSubmissionId(entry: Pick<SubmissionEntry, 'playerId' | 'puzzleNumber'>): string {
  return `${entry.playerId}::${entry.puzzleNumber}`
}
