// src/themes/applyTheme.ts
import type { MonthTheme } from './monthlyThemes'

export function applyTheme(theme: MonthTheme) {
  const root = document.documentElement
  // Page structure — maps to index.css variables
  root.style.setProperty('--paper', theme.background)
  root.style.setProperty('--surface', theme.surface)
  root.style.setProperty('--surface-soft', theme.surfaceSoft)
  root.style.setProperty('--surface-accent', theme.accentSurface)
  // Text
  root.style.setProperty('--ink', theme.text)
  root.style.setProperty('--muted', theme.textMuted)
  // Accent / interactive
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-strong', theme.accentStrong)
  // Borders
  root.style.setProperty('--line', theme.line)
  root.style.setProperty('--line-strong', theme.lineStrong)
  root.style.setProperty('--line-accent', theme.lineAccent)
  // Wordle tiles
  root.style.setProperty('--tile-correct', theme.tileCorrect)
  root.style.setProperty('--tile-present', theme.tilePresent)
  root.style.setProperty('--tile-absent', theme.tileAbsent)

  if (theme.font) {
    root.style.setProperty('--font-display', theme.font)
    document.body.style.fontFamily = theme.font
  } else {
    document.body.style.fontFamily = ''
  }
}
