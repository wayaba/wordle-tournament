import { fallbackPlayers } from '../config/players'
import type { SubmissionEntry } from '../types'
import { calculateScore, getMonthBounds, getMonthKey, shiftMonthKey } from './scoring'

type DemoPlan = {
  playerId: string
  attempts: number | null
}

const demoMonths: DemoPlan[][] = [
  [
    { playerId: 'agus', attempts: 3 },
    { playerId: 'fede', attempts: 5 },
    { playerId: 'mati', attempts: 2 }
  ],
  [
    { playerId: 'agus', attempts: 4 },
    { playerId: 'fede', attempts: 2 },
    { playerId: 'mati', attempts: null }
  ],
  [
    { playerId: 'agus', attempts: 2 },
    { playerId: 'fede', attempts: 6 },
    { playerId: 'mati', attempts: 3 }
  ],
  [
    { playerId: 'agus', attempts: 5 },
    { playerId: 'fede', attempts: 3 },
    { playerId: 'mati', attempts: 2 }
  ]
]

export function createDemoEntries(referenceDate = new Date()): SubmissionEntry[] {
  const availablePlayers = fallbackPlayers.filter((player) => demoMonths.some((month) => month.some((entry) => entry.playerId === player.id)))

  if (availablePlayers.length === 0) {
    return []
  }

  const currentMonth = getMonthKey(referenceDate)
  const targetMonths = [shiftMonthKey(currentMonth, -3), shiftMonthKey(currentMonth, -2), shiftMonthKey(currentMonth, -1), currentMonth]
  const dayOffsets = [4, 11, 18]

  return targetMonths.flatMap((monthKey, monthIndex) => {
    const { start } = getMonthBounds(monthKey)

    return demoMonths[monthIndex].flatMap((plan, playerIndex) => {
      const player = availablePlayers.find((candidate) => candidate.id === plan.playerId)
      if (!player) {
        return []
      }

      return Array.from({ length: 3 }, (_, gameIndex) => {
        const gameDate = new Date(start)
        gameDate.setDate(start.getDate() + dayOffsets[gameIndex])
        const playedOn = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}-${String(gameDate.getDate()).padStart(2, '0')}`
        const attempts = plan.attempts === null ? null : Math.min(6, Math.max(1, plan.attempts + ((gameIndex + playerIndex) % 2 === 0 ? 0 : 1)))
        const solved = attempts !== null
        const score = calculateScore(attempts, solved)
        const puzzleNumber = 1400 + monthIndex * 10 + gameIndex

        return {
          playerId: player.id,
          playerName: player.name,
          puzzleNumber,
          attempts,
          maxAttempts: 6,
          solved,
          score,
          rawResult: `Demo ${monthKey} ${player.name} ${solved ? `${attempts}/6` : 'X/6'}`,
          playedOn,
          weekKey: monthKey,
          submittedAt: `${playedOn}T12:00:00.000Z`
        }
      })
    })
  })
}
