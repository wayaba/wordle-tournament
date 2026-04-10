// src/themes/monthlyThemes.ts

export interface MonthTheme {
  name: string
  emoji: string
  // Page structure
  background: string
  surface: string
  surfaceSoft: string
  accentSurface: string
  // Text
  text: string
  textMuted: string
  // Accent / buttons
  accent: string
  accentStrong: string
  // Borders
  line: string
  lineStrong: string
  lineAccent: string
  // Wordle tiles
  tileCorrect: string
  tilePresent: string
  tileAbsent: string
  font?: string
}

export const monthlyThemes: Record<number, MonthTheme> = {
  0: {
    // Enero — Verano & Playa
    name: 'Verano & Playa',
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
    // Febrero — Carnaval
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
    // Marzo — Otoño que llega
    name: 'Otoño',
    emoji: '🍂',
    background: '#1E0F00',
    surface: '#2D1800',
    surfaceSoft: '#3A2200',
    accentSurface: '#2A1A05',
    text: '#FFF3E0',
    textMuted: '#C49050',
    accent: '#E8A838',
    accentStrong: '#C07820',
    line: '#4A2E0A',
    lineStrong: '#6B4218',
    lineAccent: '#E8A83855',
    tileCorrect: '#8BC34A',
    tilePresent: '#FF7043',
    tileAbsent: '#3A1F00'
  },
  3: {
    // Abril — Pascuas & Lluvia
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
    // Mayo — Invierno se acerca
    name: 'Lluvia de Mayo',
    emoji: '🌧️',
    background: '#060D1A',
    surface: '#0D1B2E',
    surfaceSoft: '#132540',
    accentSurface: '#0F1E38',
    text: '#E0E8F4',
    textMuted: '#6890C0',
    accent: '#5C7AEA',
    accentStrong: '#3D5AFE',
    line: '#182845',
    lineStrong: '#22385A',
    lineAccent: '#5C7AEA55',
    tileCorrect: '#26C6DA',
    tilePresent: '#FFA726',
    tileAbsent: '#0F1C30'
  },
  5: {
    // Junio — Invierno
    name: 'Invierno',
    emoji: '❄️',
    background: '#080C18',
    surface: '#101828',
    surfaceSoft: '#172236',
    accentSurface: '#121E32',
    text: '#E3F2FD',
    textMuted: '#6898C0',
    accent: '#90CAF9',
    accentStrong: '#64B5F6',
    line: '#1A2A40',
    lineStrong: '#243A55',
    lineAccent: '#90CAF955',
    tileCorrect: '#4FC3F7',
    tilePresent: '#FFF176',
    tileAbsent: '#1A2035'
  },
  6: {
    // Julio — Invierno Polar
    name: 'Invierno Polar',
    emoji: '🧊',
    background: '#040810',
    surface: '#0A1020',
    surfaceSoft: '#10182E',
    accentSurface: '#0A1422',
    text: '#E1F5FE',
    textMuted: '#5A90B0',
    accent: '#B3E5FC',
    accentStrong: '#81D4FA',
    line: '#141E30',
    lineStrong: '#1E2E45',
    lineAccent: '#B3E5FC55',
    tileCorrect: '#00BCD4',
    tilePresent: '#E1F5FE',
    tileAbsent: '#101828'
  },
  7: {
    // Agosto — Volviendo al sol
    name: 'Volviendo al sol',
    emoji: '🌤️',
    background: '#120A00',
    surface: '#1E1200',
    surfaceSoft: '#2A1A00',
    accentSurface: '#221600',
    text: '#FFF8E1',
    textMuted: '#C09040',
    accent: '#FFAB40',
    accentStrong: '#FF8F00',
    line: '#2E1E00',
    lineStrong: '#3D2A00',
    lineAccent: '#FFAB4055',
    tileCorrect: '#69F0AE',
    tilePresent: '#FF8A65',
    tileAbsent: '#201600'
  },
  8: {
    // Septiembre — Primavera
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
    // Octubre — Halloween
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
    // Noviembre — Pre-verano
    name: 'Pre-verano',
    emoji: '🌊',
    background: '#001520',
    surface: '#002035',
    surfaceSoft: '#002C48',
    accentSurface: '#001E32',
    text: '#E0F7FA',
    textMuted: '#60B8C8',
    accent: '#26C6DA',
    accentStrong: '#00ACC1',
    line: '#00283A',
    lineStrong: '#003850',
    lineAccent: '#26C6DA55',
    tileCorrect: '#26C6DA',
    tilePresent: '#FFD54F',
    tileAbsent: '#00182A'
  },
  11: {
    // Diciembre — Navidad
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

export function getCurrentTheme(): MonthTheme {
  //const month = new Date().getMonth() // 0 = enero
  const month = 9
  return monthlyThemes[month]
}
