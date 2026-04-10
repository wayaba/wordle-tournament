// src/themes/monthlyThemes.ts

export interface MonthTheme {
  name: string
  emoji: string

  background: string
  surface: string
  surfaceSoft: string
  accentSurface: string

  text: string
  textMuted: string

  accent: string
  accentStrong: string

  line: string
  lineStrong: string
  lineAccent: string

  tileCorrect: string
  tilePresent: string
  tileAbsent: string

  font?: string
}

// 🔵 THEMES BASE
export const monthlyThemes: Record<number, MonthTheme> = {
  0: {
    name: 'Verano Argentino',
    emoji: '🏖️',
    background: '#0A1628',
    surface: '#0F2040',
    surfaceSoft: '#152856',
    accentSurface: '#0F283A',
    text: '#E8F4FD',
    textMuted: '#7AAAC8',
    accent: '#00B4D8',
    accentStrong: '#0096B4',
    line: '#1E3A5F',
    lineStrong: '#2A5080',
    lineAccent: '#00B4D855',
    tileCorrect: '#06D6A0',
    tilePresent: '#FFD60A',
    tileAbsent: '#1A2E45',
    font: "'Pacifico', cursive"
  },

  1: {
    name: 'Carnaval',
    emoji: '🎭',
    background: '#1A0033',
    surface: '#260047',
    surfaceSoft: '#300058',
    accentSurface: '#2D0044',
    text: '#F8F0FF',
    textMuted: '#CC99FF',
    accent: '#E040FB',
    accentStrong: '#C800E0',
    line: '#3D0066',
    lineStrong: '#5500AA',
    lineAccent: '#E040FB55',
    tileCorrect: '#00E676',
    tilePresent: '#FF6D00',
    tileAbsent: '#2D0044'
  },

  2: {
    name: 'Vuelta a Clases',
    emoji: '📚',
    background: '#0D1B2A',
    surface: '#132A3A',
    surfaceSoft: '#1B3A4A',
    accentSurface: '#162F40',
    text: '#E3F2FD',
    textMuted: '#90AFC5',
    accent: '#64B5F6',
    accentStrong: '#1E88E5',
    line: '#1F3F5A',
    lineStrong: '#2A5A7A',
    lineAccent: '#64B5F655',
    tileCorrect: '#81C784',
    tilePresent: '#FFD54F',
    tileAbsent: '#1A2E40'
  },

  3: {
    name: 'Pascuas',
    emoji: '🐣',
    background: '#0D1A0D',
    surface: '#152615',
    surfaceSoft: '#1C331C',
    accentSurface: '#172817',
    text: '#E8F5E9',
    textMuted: '#88B888',
    accent: '#A8D8A8',
    accentStrong: '#6CB46C',
    line: '#243D24',
    lineStrong: '#325832',
    lineAccent: '#A8D8A855',
    tileCorrect: '#66BB6A',
    tilePresent: '#F48FB1',
    tileAbsent: '#1E2E1E'
  },

  4: {
    name: 'Revolución de Mayo',
    emoji: '🎉',
    background: '#0B1D3A',
    surface: '#102A54',
    surfaceSoft: '#183A6A',
    accentSurface: '#122F5A',
    text: '#FFFFFF',
    textMuted: '#AFCBFF',
    accent: '#75AADB',
    accentStrong: '#4A90E2',
    line: '#1F3F70',
    lineStrong: '#2E5A9A',
    lineAccent: '#75AADB55',
    tileCorrect: '#6FCF97',
    tilePresent: '#F2C94C',
    tileAbsent: '#1A2C4A'
  },

  5: {
    name: 'Mes del amigo',
    emoji: '🌕',
    background: '#0A1A33',
    surface: '#10264D',
    surfaceSoft: '#163366',
    accentSurface: '#122A55',
    text: '#FFFFFF',
    textMuted: '#AACBFF',
    accent: '#74ACDF',
    accentStrong: '#3A86D1',
    line: '#1C3A70',
    lineStrong: '#2A4F8A',
    lineAccent: '#74ACDF55',
    tileCorrect: '#4FC3F7',
    tilePresent: '#FFF176',
    tileAbsent: '#1A2A45'
  },

  6: {
    name: 'Independencia',
    emoji: '🏛️',
    background: '#0C0F1C',
    surface: '#151A2E',
    surfaceSoft: '#1E2440',
    accentSurface: '#161F35',
    text: '#E3F2FD',
    textMuted: '#8FA8C0',
    accent: '#90CAF9',
    accentStrong: '#5DADE2',
    line: '#1F2F4A',
    lineStrong: '#2D4060',
    lineAccent: '#90CAF955',
    tileCorrect: '#4FC3F7',
    tilePresent: '#FFD54F',
    tileAbsent: '#1A2035'
  },

  7: {
    name: 'San Martín',
    emoji: '⛰️',
    background: '#1A1408',
    surface: '#2A1E10',
    surfaceSoft: '#3A2A18',
    accentSurface: '#2F210F',
    text: '#FFF8E1',
    textMuted: '#C0A070',
    accent: '#D4A373',
    accentStrong: '#A47148',
    line: '#3A2A18',
    lineStrong: '#4A3622',
    lineAccent: '#D4A37355',
    tileCorrect: '#81C784',
    tilePresent: '#FF8A65',
    tileAbsent: '#2A1E10'
  },

  8: {
    name: 'Primavera',
    emoji: '🌸',
    background: '#130A1A',
    surface: '#1F1028',
    surfaceSoft: '#2A1635',
    accentSurface: '#261035',
    text: '#FCE4EC',
    textMuted: '#CC88AA',
    accent: '#F48FB1',
    accentStrong: '#EC407A',
    line: '#331540',
    lineStrong: '#4A2055',
    lineAccent: '#F48FB155',
    tileCorrect: '#A5D6A7',
    tilePresent: '#CE93D8',
    tileAbsent: '#201028'
  },

  9: {
    name: 'Halloween',
    emoji: '🎃',
    background: '#0A0A0A',
    surface: '#151515',
    surfaceSoft: '#202020',
    accentSurface: '#1A0F00',
    text: '#FFF3E0',
    textMuted: '#AA7744',
    accent: '#FF6F00',
    accentStrong: '#E65100',
    line: '#2A1A00',
    lineStrong: '#3D2500',
    lineAccent: '#FF6F0055',
    tileCorrect: '#4CAF50',
    tilePresent: '#9C27B0',
    tileAbsent: '#1A1A1A'
  },

  10: {
    name: 'Tradición',
    emoji: '🧉',
    background: '#0F1A0F',
    surface: '#1A2A1A',
    surfaceSoft: '#243824',
    accentSurface: '#1C2E1C',
    text: '#E8F5E9',
    textMuted: '#8FBF8F',
    accent: '#6BA368',
    accentStrong: '#3E7C41',
    line: '#2A3D2A',
    lineStrong: '#3A553A',
    lineAccent: '#6BA36855',
    tileCorrect: '#81C784',
    tilePresent: '#FFD54F',
    tileAbsent: '#1E2E1E'
  },

  11: {
    name: 'Navidad',
    emoji: '🎄',
    background: '#060F06',
    surface: '#0D1A0D',
    surfaceSoft: '#122012',
    accentSurface: '#0F1E0F',
    text: '#F1F8E9',
    textMuted: '#80A880',
    accent: '#FFD700',
    accentStrong: '#FFA000',
    line: '#162816',
    lineStrong: '#1F351F',
    lineAccent: '#FFD70055',
    tileCorrect: '#66BB6A',
    tilePresent: '#EF5350',
    tileAbsent: '#101A10'
  }
}

// 🔥 SPECIAL THEMES (OVERRIDE REAL)
const specialThemes: Record<string, MonthTheme> = {
  '25-05': {
    ...monthlyThemes[4],
    name: '25 de Mayo 🇦🇷',
    accent: '#FFD700',
    accentStrong: '#FFC107',
    background: '#09152A',
    tileCorrect: '#00E676'
  },

  '20-06': {
    ...monthlyThemes[5],
    name: 'Día de la Bandera 🇦🇷',
    accent: '#FFD700',
    accentStrong: '#FFB300',
    background: '#081529',
    tileCorrect: '#00BFFF'
  },

  '09-07': {
    ...monthlyThemes[6],
    name: 'Independencia 🇦🇷',
    accent: '#FFD700',
    accentStrong: '#FFA000',
    background: '#0A0D1A'
  },

  '17-08': {
    ...monthlyThemes[7],
    name: 'San Martín 🇦🇷',
    accent: '#FFD700',
    accentStrong: '#FFB300',
    background: '#241A10'
  }
}

// 🎯 GET THEME
export function getCurrentTheme(): MonthTheme {
  const now = new Date()

  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const key = `${day}-${month}`

  if (specialThemes[key]) {
    return specialThemes[key]
  }

  return monthlyThemes[now.getMonth()]
}
