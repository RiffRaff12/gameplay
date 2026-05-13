import type { SessionPlayer } from './types'

export type SessionSummary = {
  totalPlayers: number
  expectedRevenue: number
  collected: number
  outstanding: number
}

export function computeSummary(roster: SessionPlayer[], pricePerPax: number): SessionSummary {
  const nonCancelled = roster.filter(sp => sp.payment_status !== 'cancelled')
  const totalPlayers = nonCancelled.length
  const paidCount = roster.filter(sp => sp.payment_status === 'paid').length
  const pendingCount = roster.filter(sp => sp.payment_status === 'pending').length

  return {
    totalPlayers,
    expectedRevenue: totalPlayers * pricePerPax,
    collected: paidCount * pricePerPax,
    outstanding: pendingCount * pricePerPax,
  }
}

export function buildChaseMessage(roster: SessionPlayer[], pricePerPax: number): string {
  const pendingPlayers = roster.filter(sp => sp.payment_status === 'pending')

  if (pendingPlayers.length === 0) {
    return ''
  }

  return pendingPlayers
    .map(
      sp =>
        `Hi ${sp.player.name}, could you please transfer RM${pricePerPax} for the session? Thank you!`,
    )
    .join('\n')
}
