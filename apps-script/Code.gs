const PLAYERS_SHEET = 'players'
const RESULTS_SHEET = 'results'
const RESULTS_ARCHIVE_SHEET = 'results_archive'
const MONTHLY_PODIUMS_SHEET = 'monthly_podiums'
const PODIUM_HEADERS = ['month', 'position', 'playerId', 'playerName', 'totalPoints', 'wins', 'played', 'averageAttempts']

function doGet(event) {
  const action = event.parameter.action

  try {
    if (action === 'players') {
      return jsonResponse({ ok: true, data: getActivePlayers() })
    }

    if (action === 'player_results') {
      const month = event.parameter.month
      const playerId = event.parameter.playerId
      if (!month || !playerId) {
        return jsonResponse({ ok: false, error: 'Faltan parámetros.' })
      }

      const rows = getRowsAsObjects(RESULTS_SHEET).filter((row) => toMonthKey(row.weekKey) === String(month) && String(row.playerId) === String(playerId))

      const data = rows
        .map((row) => ({
          playedOn: formatDateYMD(row.playedOn),
          solved: String(row.solved).toLowerCase() === 'true',
          attempts: row.attempts === '' ? null : Number(row.attempts),
          maxAttempts: row.maxAttempts === '' ? 6 : Number(row.maxAttempts),
          score: calcScore(String(row.solved).toLowerCase() === 'true', Number(row.attempts), row.maxAttempts === '' ? 6 : Number(row.maxAttempts)),
          puzzleNumber: row.puzzleNumber
        }))
        .sort((a, b) => String(a.playedOn).localeCompare(String(b.playedOn)))

      return jsonResponse({ ok: true, data })
    }

    if (action === 'leaderboard') {
      const month = event.parameter.month
      if (!month) {
        return jsonResponse({ ok: false, error: 'Falta month.' })
      }

      return jsonResponse({ ok: true, data: getLeaderboardForMonth(month) })
    }

    if (action === 'init') {
      const month = event.parameter.month
      if (!month) {
        return jsonResponse({ ok: false, error: 'Falta month.' })
      }

      const lastMonth = shiftMonthKey(month, -1)

      return jsonResponse({
        ok: true,
        data: {
          players: getActivePlayers(),
          leaderboard: getLeaderboardForMonth(month),
          lastMonthWinner: getLeaderboardForMonth(lastMonth)[0] ?? null
        }
      })
    }

    if (action === 'global_ranking') {
      return jsonResponse({ ok: true, data: getGlobalRanking() })
    }

    return jsonResponse({ ok: false, error: 'Accion GET no soportada.' })
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Error inesperado.' })
  }
}

function formatDateYMD(value) {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || '{}')
    const action = body.action

    if (action === 'submit') {
      const payload = body.payload
      const pin = String(body.pin || '')

      const lock = LockService.getScriptLock()
      lock.waitLock(30000)
      try {
        archiveClosedMonths()
        validateSubmission(payload, pin)
        appendResult(payload)
      } finally {
        lock.releaseLock()
      }

      return jsonResponse({ ok: true })
    }

    return jsonResponse({ ok: false, error: 'Accion POST no soportada.' })
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Error inesperado.' })
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON)
}

function getSheetOrThrow(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
  if (!sheet) {
    throw new Error(`No existe la hoja ${name}.`)
  }

  return sheet
}

function getRowsAsObjects(sheetName) {
  const sheet = getSheetOrThrow(sheetName)
  return getSheetRowsAsObjects(sheet)
}

function getRowsAsObjectsIfExists(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
  return sheet ? getSheetRowsAsObjects(sheet) : []
}

function getSheetRowsAsObjects(sheet) {
  const lastRow = sheet.getLastRow()
  const lastColumn = sheet.getLastColumn()
  if (lastRow < 2 || lastColumn < 1) return []

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues()

  if (values.length < 2) {
    return []
  }

  const headers = values[0]
  return values
    .slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const result = {}
      headers.forEach((header, index) => {
        result[String(header)] = row[index]
      })
      return result
    })
}

function getActivePlayers() {
  const cacheKey = 'players'
  const cached = getCached(cacheKey)
  if (cached) return cached

  const players = getRowsAsObjects(PLAYERS_SHEET)
    .filter((row) => String(row.active).toLowerCase() !== 'false')
    .map((row) => ({
      id: String(row.id),
      name: String(row.name)
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  setCached(cacheKey, players, 3600)
  return players
}

function validateSubmission(payload, pin) {
  if (!payload || !payload.playerId) {
    throw new Error('Falta payload del resultado.')
  }

  if (!pin) {
    throw new Error('Falta PIN.')
  }

  const players = getRowsAsObjects(PLAYERS_SHEET)
  const player = players.find((row) => String(row.id) === String(payload.playerId))

  if (!player) {
    throw new Error('Jugador inexistente.')
  }

  if (String(player.active).toLowerCase() === 'false') {
    throw new Error('Jugador inactivo.')
  }

  if (String(player.pin) !== pin) {
    throw new Error('PIN invalido para ese jugador.')
  }

  const existing = getRowsAsObjects(RESULTS_SHEET)
  const duplicate = existing.some((row) => String(row.playerId) === String(payload.playerId) && String(row.puzzleNumber) === String(payload.puzzleNumber))

  if (duplicate) {
    throw new Error('Ya existe un resultado de ese jugador para esa palabra del dia.')
  }
}

function appendResult(payload) {
  const sheet = getSheetOrThrow(RESULTS_SHEET)
  const lastColumn = sheet.getLastColumn()
  const headers = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : []

  if (!headers || headers.length === 0) {
    throw new Error('La hoja results no tiene encabezados.')
  }

  const row = headers.map((header) => {
    const value = payload[String(header)]
    return value === undefined ? '' : value
  })

  sheet.appendRow(row)
  removeCached(`leaderboard_${toMonthKey(payload.weekKey)}`)
}

function toMonthKey(value) {
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  const s = String(value)
  const match = s.match(/^(\d{4}-\d{2})/)
  return match ? match[1] : s
}

function getCached(key) {
  const raw = CacheService.getScriptCache().get(key)
  return raw ? JSON.parse(raw) : null
}

function setCached(key, data, ttl) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(data), ttl || 300)
  } catch (e) {
    // cache write failed silently — non-critical
  }
}

function removeCached(key) {
  CacheService.getScriptCache().remove(key)
}

function calcScore(solved, attempts, maxAttempts) {
  if (!solved) return 0
  const max = maxAttempts || 6
  return max - attempts + 1
}

function getLeaderboardForMonth(month) {
  const cacheKey = `leaderboard_${month}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const rows = getRowsAsObjects(RESULTS_SHEET).filter((row) => toMonthKey(row.weekKey) === String(month))
  if (rows.length === 0) {
    const archivedPodium = getArchivedPodium(month)
    if (archivedPodium.length > 0) return archivedPodium
  }

  const leaderboard = calculateLeaderboard(rows)
  setCached(cacheKey, leaderboard, 300)
  return leaderboard
}

function calculateLeaderboard(rows) {
  const stats = {}

  rows.forEach((row) => {
    const playerId = String(row.playerId)
    if (!stats[playerId]) {
      stats[playerId] = {
        playerId,
        playerName: String(row.playerName),
        totalPoints: 0,
        wins: 0,
        played: 0,
        attemptSum: 0,
        solvedCount: 0,
        submittedAtSum: 0
      }
    }

    const current = stats[playerId]
    const solved = String(row.solved).toLowerCase() === 'true'
    const attempts = row.attempts === '' ? null : Number(row.attempts)
    const maxAttempts = row.maxAttempts === '' ? 6 : Number(row.maxAttempts)
    const score = calcScore(solved, attempts, maxAttempts)

    // Parsear submittedAt a timestamp
    const submittedAt = row.submittedAt ? new Date(row.submittedAt).getTime() : 0

    current.played += 1
    current.totalPoints += score
    current.submittedAtSum += submittedAt

    if (solved && attempts !== null) {
      current.wins += 1
      current.attemptSum += attempts
      current.solvedCount += 1
    }
  })

  return Object.keys(stats)
    .map((playerId) => {
      const row = stats[playerId]
      return {
        playerId: row.playerId,
        playerName: row.playerName,
        totalPoints: row.totalPoints,
        wins: row.wins,
        played: row.played,
        averageAttempts: row.solvedCount > 0 ? Number((row.attemptSum / row.solvedCount).toFixed(2)) : 0
      }
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      // Desempate 1: quien más veces adivinó la palabra ese mes
      const winsA = stats[a.playerId].wins
      const winsB = stats[b.playerId].wins
      if (winsB !== winsA) return winsB - winsA
      // Desempate 2: quien adivinó más temprano en promedio
      const avgA = winsA > 0 ? stats[a.playerId].submittedAtSum / winsA : Infinity
      const avgB = winsB > 0 ? stats[b.playerId].submittedAtSum / winsB : Infinity
      return avgA - avgB
    })

}

function getGlobalRanking() {
  const cacheKey = 'global_ranking'
  const cached = getCached(cacheKey)
  if (cached) return cached

  const podiumRows = getRowsAsObjectsIfExists(MONTHLY_PODIUMS_SHEET)
  const savedMonths = {}
  podiumRows.forEach((row) => { savedMonths[String(row.month)] = true })

  // Compatibilidad durante la primera migración: si aún quedan meses cerrados
  // en results, se incluyen hasta que archiveClosedMonths los consolide.
  const currentMonth = toMonthKey(new Date())
  const pendingRowsByMonth = {}
  getRowsAsObjects(RESULTS_SHEET).forEach((row) => {
    const month = toMonthKey(row.weekKey)
    if (month >= currentMonth || savedMonths[month]) return
    if (!pendingRowsByMonth[month]) pendingRowsByMonth[month] = []
    pendingRowsByMonth[month].push(row)
  })
  Object.keys(pendingRowsByMonth).forEach((month) => {
    calculateLeaderboard(pendingRowsByMonth[month]).slice(0, 3).forEach((entry, index) => {
      podiumRows.push(Object.assign({ month, position: index + 1 }, entry))
    })
  })

  const counts = {}
  podiumRows.forEach((entry) => {
    const playerId = String(entry.playerId)
    if (!counts[playerId]) {
      counts[playerId] = { playerId, playerName: String(entry.playerName), firsts: 0, seconds: 0, thirds: 0 }
    }
    const position = Number(entry.position)
    if (position === 1) counts[playerId].firsts += 1
    else if (position === 2) counts[playerId].seconds += 1
    else if (position === 3) counts[playerId].thirds += 1
  })

  const result = Object.values(counts).sort((a, b) => {
    if (b.firsts !== a.firsts) return b.firsts - a.firsts
    if (b.seconds !== a.seconds) return b.seconds - a.seconds
    return b.thirds - a.thirds
  })

  setCached(cacheKey, result, 3600)
  return result
}

function getArchivedPodium(month) {
  return getRowsAsObjectsIfExists(MONTHLY_PODIUMS_SHEET)
    .filter((row) => String(row.month) === String(month))
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map((row) => ({
      playerId: String(row.playerId),
      playerName: String(row.playerName),
      totalPoints: Number(row.totalPoints),
      wins: Number(row.wins),
      played: Number(row.played),
      averageAttempts: Number(row.averageAttempts)
    }))
}

function ensureSheetWithHeaders(name, headers) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(name)
  if (!sheet) sheet = spreadsheet.insertSheet(name)
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  return sheet
}

function appendObjectRows(sheet, headers, objects) {
  if (objects.length === 0) return
  const values = objects.map((object) => headers.map((header) => object[String(header)] === undefined ? '' : object[String(header)]))
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values)
}

// Punto de entrada para ejecución manual o mediante un trigger mensual.
function runMonthlyArchive() {
  const lock = LockService.getScriptLock()
  lock.waitLock(30000)
  try {
    archiveClosedMonths()
  } finally {
    lock.releaseLock()
  }
}

// Es segura al repetirse: no duplica ni los podios ni los resultados archivados.
function archiveClosedMonths() {
  const resultsSheet = getSheetOrThrow(RESULTS_SHEET)
  const lastColumn = resultsSheet.getLastColumn()
  if (resultsSheet.getLastRow() < 2 || lastColumn < 1) {
    clearRankingCaches()
    return
  }

  const headers = resultsSheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
  const rows = getSheetRowsAsObjects(resultsSheet)
  const currentMonth = toMonthKey(new Date())
  const closedRows = rows.filter((row) => toMonthKey(row.weekKey) < currentMonth)
  if (closedRows.length === 0) {
    clearRankingCaches()
    return
  }

  const podiumSheet = ensureSheetWithHeaders(MONTHLY_PODIUMS_SHEET, PODIUM_HEADERS)
  const savedMonths = {}
  getSheetRowsAsObjects(podiumSheet).forEach((row) => { savedMonths[String(row.month)] = true })

  const rowsByMonth = {}
  closedRows.forEach((row) => {
    const month = toMonthKey(row.weekKey)
    if (!rowsByMonth[month]) rowsByMonth[month] = []
    rowsByMonth[month].push(row)
  })

  const newPodiums = []
  Object.keys(rowsByMonth).sort().forEach((month) => {
    if (savedMonths[month]) return
    calculateLeaderboard(rowsByMonth[month]).slice(0, 3).forEach((entry, index) => {
      newPodiums.push(Object.assign({ month, position: index + 1 }, entry))
    })
  })
  appendObjectRows(podiumSheet, PODIUM_HEADERS, newPodiums)

  const archiveSheet = ensureSheetWithHeaders(RESULTS_ARCHIVE_SHEET, headers)
  const archivedKeys = {}
  getSheetRowsAsObjects(archiveSheet).forEach((row) => {
    archivedKeys[`${row.playerId}|${row.puzzleNumber}`] = true
  })
  const rowsToArchive = closedRows.filter((row) => !archivedKeys[`${row.playerId}|${row.puzzleNumber}`])
  appendObjectRows(archiveSheet, headers, rowsToArchive)

  const activeRows = rows.filter((row) => toMonthKey(row.weekKey) >= currentMonth)
  resultsSheet.getRange(2, 1, resultsSheet.getLastRow() - 1, lastColumn).clearContent()
  appendObjectRows(resultsSheet, headers, activeRows)

  clearRankingCaches()
}

function clearRankingCaches() {
  getRowsAsObjectsIfExists(MONTHLY_PODIUMS_SHEET).forEach((row) => {
    removeCached(`leaderboard_${toMonthKey(row.month)}`)
  })
  removeCached('global_ranking')
}
