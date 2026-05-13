import { describe, it, expect } from 'vitest'
import { computeSummary, buildChaseMessage } from '../summary'
import type { SessionPlayer } from '../types'

function makePlayer(
  id: string,
  name: string,
  payment_status: SessionPlayer['payment_status'],
): SessionPlayer {
  return {
    id,
    session_id: 'session-1',
    player_id: `player-${id}`,
    payment_status,
    created_at: '2024-01-01T00:00:00Z',
    player: { name, phone_number: `+6011${id.padStart(8, '0')}` },
  }
}

const roster: SessionPlayer[] = [
  makePlayer('1', 'Alice', 'paid'),
  makePlayer('2', 'Bob', 'pending'),
  makePlayer('3', 'Charlie', 'pending'),
  makePlayer('4', 'Dave', 'free'),
  makePlayer('5', 'Eve', 'cancelled'),
]

describe('computeSummary', () => {
  it('counts non-cancelled players as totalPlayers', () => {
    const summary = computeSummary(roster, 20)
    expect(summary.totalPlayers).toBe(4) // all except cancelled
  })

  it('computes expectedRevenue as totalPlayers * pricePerPax', () => {
    const summary = computeSummary(roster, 20)
    expect(summary.expectedRevenue).toBe(80) // 4 * 20
  })

  it('computes collected as paid count * pricePerPax', () => {
    const summary = computeSummary(roster, 20)
    expect(summary.collected).toBe(20) // 1 paid * 20
  })

  it('computes outstanding as pending count * pricePerPax', () => {
    const summary = computeSummary(roster, 20)
    expect(summary.outstanding).toBe(40) // 2 pending * 20
  })

  it('returns zeros for an empty roster', () => {
    const summary = computeSummary([], 20)
    expect(summary).toEqual({ totalPlayers: 0, expectedRevenue: 0, collected: 0, outstanding: 0 })
  })
})

describe('buildChaseMessage', () => {
  it('includes pending players with correct name and amount', () => {
    const message = buildChaseMessage(roster, 20)
    expect(message).toContain('Hi Bob, could you please transfer RM20 for the session? Thank you!')
    expect(message).toContain(
      'Hi Charlie, could you please transfer RM20 for the session? Thank you!',
    )
  })

  it('excludes paid players', () => {
    const message = buildChaseMessage(roster, 20)
    expect(message).not.toContain('Alice')
  })

  it('excludes free players', () => {
    const message = buildChaseMessage(roster, 20)
    expect(message).not.toContain('Dave')
  })

  it('excludes cancelled players', () => {
    const message = buildChaseMessage(roster, 20)
    expect(message).not.toContain('Eve')
  })

  it('returns empty string when no pending players', () => {
    const noPending: SessionPlayer[] = [
      makePlayer('1', 'Alice', 'paid'),
      makePlayer('2', 'Bob', 'free'),
      makePlayer('3', 'Charlie', 'cancelled'),
    ]
    expect(buildChaseMessage(noPending, 20)).toBe('')
  })
})
