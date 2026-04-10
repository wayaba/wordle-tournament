import { getCurrentTheme } from './monthlyThemes'

function ThemeBadge() {
  const theme = getCurrentTheme()
  return (
    <div
      style={{
        background: 'var(--surface-soft)',
        color: 'var(--ink)',
        border: '1px solid var(--line-strong)',
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: 'fit-content'
      }}
    >
      <span>{theme.emoji}</span>
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{theme.name}</span>
    </div>
  )
}

export default ThemeBadge
