import type { LocalPlayer, Player } from '../types'

export const localPlayers: LocalPlayer[] = [
  { id: 'agus', name: 'Agus', pin: '1234' },
  { id: 'fede', name: 'Fede', pin: '1234' },
  { id: 'mati', name: 'Mati', pin: '1234' }
]

export const fallbackPlayers: Player[] = localPlayers.map(({ id, name }) => ({ id, name }))

export function validateLocalPlayerPin(playerId: string, pin: string): boolean {
  return localPlayers.some((player) => player.id === playerId && player.pin === pin)
}
