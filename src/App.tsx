import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { validateLocalPlayerPin } from './config/players'
import { createDemoEntries } from './lib/demoData'
import { replaceEntries } from './lib/localStore'
import { parseSharedResult } from './lib/parser'
import { calculateScore, getDaysUntilMonthEnds, getMonthBounds, getMonthKey, getLocalDateISO, isPastMonth, shiftMonthKey } from './lib/scoring'
import { fetchInit, fetchMonthlyLeaderboard, hasRemoteEndpoint, submitResult } from './lib/sheetsClient'
import type { LeaderboardRow, ParsedResult, Player, SubmissionEntry } from './types'
import './App.css'

const monthFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric'
})

function getRankLabel(position: number): string {
  if (position === 0) {
    return '1'
  }

  if (position === 1) {
    return '2'
  }

  if (position === 2) {
    return '3'
  }

  return String(position + 1)
}

function App() {
  const currentMonthKey = getMonthKey(new Date())
  const [playerOptions, setPlayerOptions] = useState<Player[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [pin, setPin] = useState('')
  const [shareText, setShareText] = useState('')
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedPlayer = useMemo<Player | undefined>(() => playerOptions.find((player) => player.id === selectedPlayerId), [playerOptions, selectedPlayerId])

  const parsedResult = useMemo<ParsedResult | null>(() => {
    if (!shareText.trim()) {
      return null
    }

    try {
      return parseSharedResult(shareText)
    } catch {
      return null
    }
  }, [shareText])

  const monthSummary = useMemo(() => {
    const { start } = getMonthBounds(monthKey)
    const isCurrentMonth = monthKey === currentMonthKey
    const isFinished = isPastMonth(monthKey)
    const daysLeft = isCurrentMonth ? getDaysUntilMonthEnds(monthKey) : 0
    const winner = rows[0] ?? null

    return {
      isCurrentMonth,
      isFinished,
      daysLeft,
      winner,
      rangeLabel: monthFormatter.format(start)
    }
  }, [currentMonthKey, rows, monthKey])

  async function refreshLeaderboard(targetMonth: string): Promise<void> {
    setLoadingBoard(true)
    setError(null)

    try {
      const leaderboard = await fetchMonthlyLeaderboard(targetMonth)
      setRows(leaderboard)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'No se pudo cargar la tabla.'
      setError(message)
    } finally {
      setLoadingBoard(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setFeedback(null)

    if (!selectedPlayer) {
      setError('Seleccioná un jugador antes de enviar.')
      return
    }

    if (!pin.trim()) {
      setError('Ingresá el PIN antes de enviar.')
      return
    }

    if (!hasRemoteEndpoint && !validateLocalPlayerPin(selectedPlayer.id, pin)) {
      setError('PIN inválido para ese jugador.')
      return
    }

    let parsed: ParsedResult
    try {
      parsed = parseSharedResult(shareText)
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'El texto no es válido.'
      setError(message)
      return
    }

    const playedOn = getLocalDateISO()
    const entryMonth = getMonthKey(playedOn)
    const score = calculateScore(parsed.attempts, parsed.solved)
    const payload: SubmissionEntry = {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      puzzleNumber: parsed.puzzleNumber,
      attempts: parsed.attempts,
      maxAttempts: parsed.maxAttempts,
      solved: parsed.solved,
      score,
      rawResult: parsed.rawText,
      playedOn,
      weekKey: entryMonth,
      submittedAt: new Date().toISOString()
    }

    setSubmitting(true)
    try {
      await submitResult(payload, pin)
      setFeedback(`Resultado cargado: ${selectedPlayer.name} sumó ${score} puntos.`)
      setShareText('')
      setPin('')
      setMonthKey(entryMonth)
      await refreshLeaderboard(entryMonth)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'No se pudo guardar el resultado.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLoadDemo(): Promise<void> {
    setError(null)
    setFeedback(null)
    setLoadingDemo(true)

    try {
      const entries = createDemoEntries(new Date())
      replaceEntries(entries)
      setMonthKey(currentMonthKey)
      await refreshLeaderboard(currentMonthKey)
      setFeedback('Se cargaron datos demo para 4 meses, incluyendo meses anteriores con ganadores.')
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos demo.'
      setError(message)
    } finally {
      setLoadingDemo(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadPlayers(): Promise<void> {
      setLoadingPlayers(true)

      try {
        const { players, leaderboard } = await fetchInit(currentMonthKey)
        if (cancelled) {
          return
        }

        setPlayerOptions(players)
        setSelectedPlayerId((current) => {
          if (current && players.some((player) => player.id === current)) {
            return current
          }

          return players[0]?.id ?? ''
        })
        setRows(leaderboard)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        const message = loadError instanceof Error ? loadError.message : 'No se pudo cargar la lista de jugadores.'
        setError(message)
      } finally {
        if (!cancelled) {
          setLoadingPlayers(false)
        }
      }
    }

    void loadPlayers()

    return () => {
      cancelled = true
    }
  }, [])

  const [initialMonthKey] = useState(currentMonthKey)

  useEffect(() => {
    if (monthKey === initialMonthKey) {
      return
    }

    void refreshLeaderboard(monthKey)
  }, [monthKey])

  return (
    <main className="page">
      <header className="hero">
        <p className="kicker">Liga Mensual</p>
        <h1>Torneo de La Palabra del Día</h1>
        <p className="subtitle">Carga rápida con texto compartido, puntaje automático y tabla mensual.</p>
        {!hasRemoteEndpoint && (
          <div className="hero-tools">
            <button type="button" className="secondary-button" onClick={handleLoadDemo} disabled={loadingDemo}>
              {loadingDemo ? 'Cargando demo...' : 'Cargar meses demo'}
            </button>
            <p className="hero-note">Carga 4 meses de ejemplo en modo local para probar ganadores y navegación.</p>
          </div>
        )}
      </header>

      <section className="panel">
        <h2>Cargar resultado</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Jugador
            <select
              value={selectedPlayerId}
              onChange={(event) => setSelectedPlayerId(event.target.value)}
              disabled={loadingPlayers || playerOptions.length === 0}
            >
              {playerOptions.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            PIN
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="4 dígitos"
              disabled={loadingPlayers || playerOptions.length === 0}
            />
          </label>

          <label className="span-2">
            Resultado compartido
            <textarea
              value={shareText}
              onChange={(event) => setShareText(event.target.value)}
              placeholder={'Pegá el link del resultado de tu juego del día'}
              rows={7}
              disabled={loadingPlayers || playerOptions.length === 0}
            />
          </label>

          <div className="preview span-2">
            {parsedResult ? (
              <>
                <p>
                  Palabra #{parsedResult.puzzleNumber} |{' '}
                  {parsedResult.solved ? `${parsedResult.attempts}/${parsedResult.maxAttempts}` : `X/${parsedResult.maxAttempts}`} |{' '}
                  {calculateScore(parsedResult.attempts, parsedResult.solved)} pts
                </p>
                {parsedResult.grid.length > 0 && <pre>{parsedResult.grid.join('\n')}</pre>}
              </>
            ) : (
              <p>La vista previa aparece cuando el formato es válido.</p>
            )}
          </div>

          <button type="submit" disabled={submitting || loadingPlayers || playerOptions.length === 0} className="span-2">
            {loadingPlayers ? 'Cargando jugadores...' : submitting ? 'Guardando...' : 'Guardar resultado'}
          </button>
        </form>

        {feedback && <p className="message ok">{feedback}</p>}
        {error && <p className="message error">{error}</p>}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Tabla mensual</h2>
            <p className="week-range">{monthSummary.rangeLabel}</p>
          </div>
          <div className="week-nav">
            <button type="button" onClick={() => setMonthKey((current) => shiftMonthKey(current, -1))}>
              Mes anterior
            </button>
            <button type="button" onClick={() => setMonthKey(currentMonthKey)} disabled={monthKey === currentMonthKey}>
              Mes actual
            </button>
            <button type="button" onClick={() => setMonthKey((current) => shiftMonthKey(current, 1))} disabled={monthKey === currentMonthKey}>
              Mes siguiente
            </button>
          </div>
        </div>

        <div className="week-status important-surface">
          {monthSummary.isCurrentMonth ? (
            <p>
              {monthSummary.daysLeft === 0
                ? 'El mes actual termina hoy.'
                : monthSummary.daysLeft === 1
                  ? 'El mes actual termina mañana.'
                  : `El mes actual termina en ${monthSummary.daysLeft} días.`}
            </p>
          ) : monthSummary.isFinished ? (
            monthSummary.winner ? (
              <p>
                Campeón de {monthSummary.rangeLabel}: <strong>{monthSummary.winner.playerName}</strong> con {monthSummary.winner.totalPoints} puntos.
              </p>
            ) : (
              <p>El mes {monthSummary.rangeLabel} ya terminó y no registró resultados.</p>
            )
          ) : (
            <p>Estás viendo un mes futuro.</p>
          )}

          {monthSummary.winner && monthSummary.isCurrentMonth && (
            <p className="week-leader">
              Va primero: <strong>{monthSummary.winner.playerName}</strong> con {monthSummary.winner.totalPoints} puntos.
            </p>
          )}
        </div>

        {loadingBoard ? (
          <p>Cargando tabla...</p>
        ) : rows.length === 0 ? (
          <p>Aún no hay resultados para este mes.</p>
        ) : (
          <div className="leaderboard-card">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jugador</th>
                  <th>Puntos</th>
                  <th>Aciertos</th>
                  <th>Partidas</th>
                  <th>Prom. intentos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.playerId}
                    className={['leaderboard-row', index === 0 ? 'leader-row' : '', index < 3 ? `podium-row podium-row-${index + 1}` : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td>
                      <span className={['rank-badge', index < 3 ? `rank-badge-${index + 1}` : ''].filter(Boolean).join(' ')}>{getRankLabel(index)}</span>
                    </td>
                    <td>
                      <div className="player-cell">
                        <span className="player-name">{row.playerName}</span>
                        {index === 0 && <span className="player-tag">Lider</span>}
                        {index === 1 && <span className="player-tag subdued">Cebollita</span>}
                      </div>
                    </td>
                    <td>
                      <span className="stat-pill stat-pill-points">{row.totalPoints} pts</span>
                    </td>
                    <td>
                      <span className="stat-pill">{row.wins}</span>
                    </td>
                    <td>
                      <span className="stat-pill">{row.played}</span>
                    </td>
                    <td>
                      <span className="stat-pill stat-pill-soft">{row.averageAttempts === 0 ? '-' : row.averageAttempts}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="hint">Si no configurás endpoint, se usa modo local del navegador para probar.</p>
      </section>
    </main>
  )
}

export default App
