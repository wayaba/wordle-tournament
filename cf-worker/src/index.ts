export interface Env {
  CACHE: KVNamespace
  GAS_URL: string
}

const PLAYERS_TTL = 3600 // 1 hour  — players rarely change
const LEADERBOARD_TTL = 180 // 3 minutes — show new submissions quickly

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    try {
      if (request.method === 'GET') {
        return await handleGet(request, env)
      }
      if (request.method === 'POST') {
        return await handlePost(request, env)
      }
      return new Response('Method not allowed', { status: 405 })
    } catch (e) {
      console.error('Error handling request:', e)
      return jsonResponse({ ok: false, error: 'Worker error' }, 500)
    }
  }
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const month = url.searchParams.get('month')

  let cacheKey: string
  let ttl: number

  if (action === 'players') {
    cacheKey = 'players'
    ttl = PLAYERS_TTL
  } else if (action === 'init' && month) {
    cacheKey = `init:${month}`
    ttl = LEADERBOARD_TTL
  } else if (action === 'leaderboard' && month) {
    cacheKey = `leaderboard:${month}`
    ttl = LEADERBOARD_TTL
  } else {
    // Unknown action — pass through to GAS without caching
    return await proxyToGas(env.GAS_URL, url.searchParams)
  }

  // Try KV cache first
  const cached = await env.CACHE.get(cacheKey)
  if (cached) {
    return new Response(cached, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    })
  }

  // Cache miss — fetch from GAS
  const gasRes = await fetch(`${env.GAS_URL}?${url.searchParams.toString()}`)
  const body = await gasRes.text()

  // Only cache successful responses
  try {
    const parsed = JSON.parse(body)
    if (parsed.ok) {
      await env.CACHE.put(cacheKey, body, { expirationTtl: ttl })
    }
  } catch {
    // Body isn't JSON — return as-is without caching
  }

  return new Response(body, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
  })
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const bodyText = await request.text()

  const gasRes = await fetch(env.GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: bodyText
  })

  const responseText = await gasRes.text()

  // On success, invalidate the leaderboard cache for the affected month
  try {
    const result = JSON.parse(responseText)
    if (result.ok) {
      const body = JSON.parse(bodyText)
      if (body?.payload?.weekKey) {
        const month = toMonthKey(String(body.payload.weekKey))
        await Promise.all([env.CACHE.delete(`init:${month}`), env.CACHE.delete(`leaderboard:${month}`)])
      }
    }
  } catch {
    // Non-critical — cache will expire naturally
  }

  return new Response(responseText, {
    status: gasRes.status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}

async function proxyToGas(gasUrl: string, params: URLSearchParams): Promise<Response> {
  const gasRes = await fetch(`${gasUrl}?${params.toString()}`)
  const body = await gasRes.text()
  return new Response(body, {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  })
}

function toMonthKey(value: string): string {
  const match = value.match(/^(\d{4}-\d{2})/)
  return match ? match[1] : value
}
