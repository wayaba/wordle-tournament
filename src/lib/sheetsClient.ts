import { fallbackPlayers } from '../config/players'
import type { GlobalRankingRow, LeaderboardRow, Player, SubmissionEntry } from '../types'
import { appendEntry, leaderboardFromEntries, readEntries } from './localStore'
import { shiftMonthKey, calculateScore, getMonthKey, isPastMonth } from './scoring'

type ApiResult<T> = {
  ok: boolean
  data?: T
  error?: string
}

const endpoint = import.meta.env.VITE_SHEETS_WEBAPP_URL?.trim()

export const hasRemoteEndpoint = Boolean(endpoint)

const memCache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 4 * 60 * 1000 // 4 minutes

function cacheGet<T>(key: string): T | null {
  const hit = memCache.get(key)
  if (!hit) return null
  if (Date.now() - hit.ts > CACHE_TTL) {
    memCache.delete(key)
    return null
  }
  return hit.data as T
}

function cacheSet(key: string, data: unknown): void {
  memCache.set(key, { data, ts: Date.now() })
}

function cacheInvalidateMonth(monthKey: string): void {
  for (const key of memCache.keys()) {
    if (key.includes(monthKey)) memCache.delete(key)
  }
}

async function postJson<T>(payload: unknown): Promise<ApiResult<T>> {
  if (!endpoint) {
    return { ok: false, error: 'Endpoint no configurado' }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    return { ok: false, error: 'No se pudo guardar el resultado.' }
  }

  return (await response.json()) as ApiResult<T>
}

async function getJson<T>(params: URLSearchParams): Promise<ApiResult<T>> {
  if (!endpoint) {
    return { ok: false, error: 'Endpoint no configurado' }
  }

  const response = await fetch(`${endpoint}?${params.toString()}`)
  if (!response.ok) {
    return { ok: false, error: 'No se pudo leer la tabla semanal.' }
  }

  return (await response.json()) as ApiResult<T>
}

export async function fetchPlayers(): Promise<Player[]> {
  if (!endpoint) {
    return fallbackPlayers
  }

  const result = await getJson<Player[]>(new URLSearchParams({ action: 'players' }))

  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'No se pudo cargar la lista de jugadores.')
  }

  return result.data
}

export type PlayerDayResult = {
  playedOn: string
  solved: boolean
  attempts: number | null
  maxAttempts: number
  score: number
  puzzleNumber: number
}

export async function fetchPlayerResults(playerId: string, monthKey: string): Promise<PlayerDayResult[]> {
  if (!endpoint) {
    const entries = readEntries()
    return entries
      .filter((e) => e.playerId === playerId && e.weekKey.startsWith(monthKey))
      .map((e) => ({
        playedOn: e.playedOn,
        solved: e.solved,
        attempts: e.attempts,
        maxAttempts: e.maxAttempts ?? 6,
        score: calculateScore(e.attempts, e.solved),
        puzzleNumber: e.puzzleNumber
      }))
      .sort((a, b) => a.playedOn.localeCompare(b.playedOn))
  }

  const cacheKey = `player_results:${playerId}:${monthKey}`
  const cached = cacheGet<PlayerDayResult[]>(cacheKey)
  if (cached) return cached

  const result = await getJson<PlayerDayResult[]>(new URLSearchParams({ action: 'player_results', playerId, month: monthKey }))

  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'No se pudo cargar el detalle del jugador.')
  }

  cacheSet(cacheKey, result.data)
  return result.data
}

export async function fetchInit(monthKey: string): Promise<{
  players: Player[]
  leaderboard: LeaderboardRow[]
  lastMonthWinner: LeaderboardRow | null
}> {
  if (!endpoint) {
    const lastMonthKey = shiftMonthKey(monthKey, -1)
    return {
      players: fallbackPlayers,
      leaderboard: leaderboardFromEntries(readEntries(), monthKey),
      lastMonthWinner: leaderboardFromEntries(readEntries(), lastMonthKey)[0] ?? null
    }
  }

  type InitData = { players: Player[]; leaderboard: LeaderboardRow[]; lastMonthWinner: LeaderboardRow | null }

  const cacheKey = `init:${monthKey}`
  const cached = cacheGet<InitData>(cacheKey)
  if (cached) return cached

  const result = await getJson<InitData>(new URLSearchParams({ action: 'init', month: monthKey }))

  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'No se pudo inicializar la app.')
  }

  cacheSet(cacheKey, result.data)
  return result.data
}

export async function submitResult(entry: SubmissionEntry, pin: string): Promise<void> {
  if (!endpoint) {
    appendEntry(entry)
    return
  }

  const result = await postJson<null>({ action: 'submit', payload: entry, pin })
  if (!result.ok) {
    throw new Error(result.error ?? 'Error al guardar en Google Sheets.')
  }

  cacheInvalidateMonth(entry.weekKey)
}

export async function fetchMonthlyLeaderboard(monthKey: string): Promise<LeaderboardRow[]> {
  if (!endpoint) {
    return leaderboardFromEntries(readEntries(), monthKey)
  }

  const cacheKey = `leaderboard:${monthKey}`
  const cached = cacheGet<LeaderboardRow[]>(cacheKey)
  if (cached) return cached

  const result = await getJson<LeaderboardRow[]>(new URLSearchParams({ action: 'leaderboard', month: monthKey }))

  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'Error al leer la tabla mensual.')
  }

  cacheSet(cacheKey, result.data)
  return result.data
}

export async function fetchGlobalRanking(): Promise<GlobalRankingRow[]> {
  if (!endpoint) {
    const entries = readEntries()
    const currentMonthKey = getMonthKey(new Date())
    const monthSet = new Set<string>()
    for (const entry of entries) {
      const mk = entry.weekKey.slice(0, 7)
      if (mk < currentMonthKey) monthSet.add(mk)
    }

    const counts = new Map<string, GlobalRankingRow>()
    for (const month of monthSet) {
      if (!isPastMonth(month)) continue
      const leaderboard = leaderboardFromEntries(entries, month)
      for (let pos = 0; pos < 3 && pos < leaderboard.length; pos++) {
        const row = leaderboard[pos]
        if (!counts.has(row.playerId)) {
          counts.set(row.playerId, { playerId: row.playerId, playerName: row.playerName, firsts: 0, seconds: 0, thirds: 0 })
        }
        const c = counts.get(row.playerId)!
        if (pos === 0) c.firsts += 1
        else if (pos === 1) c.seconds += 1
        else c.thirds += 1
      }
    }

    return [...counts.values()].sort((a, b) => {
      if (b.firsts !== a.firsts) return b.firsts - a.firsts
      if (b.seconds !== a.seconds) return b.seconds - a.seconds
      return b.thirds - a.thirds
    })
  }

  const cacheKey = 'global_ranking'
  const cached = cacheGet<GlobalRankingRow[]>(cacheKey)
  if (cached) return cached

  const result = await getJson<GlobalRankingRow[]>(new URLSearchParams({ action: 'global_ranking' }))

  if (!result.ok || !result.data) {
    throw new Error(result.error ?? 'No se pudo cargar el ranking histórico.')
  }

  cacheSet(cacheKey, result.data)
  return result.data
}
