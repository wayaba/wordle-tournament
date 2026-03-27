import type { ParsedResult } from '../types'

const PUZZLE_REGEX = /palabra\s+del\s+d[ií]a\s*#\s*(\d+)/i
const ATTEMPT_REGEX = /(?:^|\s)([1-6xX])\s*\/\s*(\d+)(?:\s|$)/m
const GRID_LINE_REGEX = /^[⬛⬜🟩🟨🟦🟪]{5}$/

export function parseSharedResult(input: string): ParsedResult {
  const rawText = input.trim()

  if (!rawText) {
    throw new Error('Pegá el texto compartido antes de enviar.')
  }

  const puzzleMatch = rawText.match(PUZZLE_REGEX)
  if (!puzzleMatch) {
    throw new Error('No pude encontrar el número de palabra (#1541).')
  }

  const attemptMatch = rawText.match(ATTEMPT_REGEX)
  if (!attemptMatch) {
    throw new Error('No pude encontrar el resultado tipo 4/6 o X/6.')
  }

  const attemptToken = attemptMatch[1]
  const maxAttempts = Number.parseInt(attemptMatch[2], 10)
  if (!Number.isFinite(maxAttempts) || maxAttempts <= 0) {
    throw new Error('El número máximo de intentos no es válido.')
  }

  const solved = !/^x$/i.test(attemptToken)
  const attempts = solved ? Number.parseInt(attemptToken, 10) : null

  if (solved && (!attempts || attempts < 1 || attempts > maxAttempts)) {
    throw new Error('La cantidad de intentos no es válida.')
  }

  const grid = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => GRID_LINE_REGEX.test(line))

  return {
    puzzleNumber: Number.parseInt(puzzleMatch[1], 10),
    attempts,
    maxAttempts,
    solved,
    grid,
    rawText
  }
}
