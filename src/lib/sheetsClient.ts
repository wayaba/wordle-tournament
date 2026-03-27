import { fallbackPlayers } from '../config/players'
import type { LeaderboardRow, Player, SubmissionEntry } from '../types'
import { appendEntry, leaderboardFromEntries, readEntries } from './localStore'

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

export async function fetchInit(monthKey: string): Promise<{ players: Player[]; leaderboard: LeaderboardRow[] }> {
  if (!endpoint) {
    return {
      players: fallbackPlayers,
      leaderboard: leaderboardFromEntries(readEntries(), monthKey)
    }
  }

  const cacheKey = `init:${monthKey}`
  const cached = cacheGet<{ players: Player[]; leaderboard: LeaderboardRow[] }>(cacheKey)
  if (cached) return cached

  const result = await getJson<{ players: Player[]; leaderboard: LeaderboardRow[] }>(new URLSearchParams({ action: 'init', month: monthKey }))

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
