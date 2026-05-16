import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockSupabase, setSessionsResult, setSessionPlayersResult } = vi.hoisted(() => {
  let sessionsResult: { data: unknown; error: unknown } = { data: [], error: null }
  let sessionPlayersResult: { data: unknown; error: unknown } = { data: [], error: null }

  function makeSessionsBuilder() {
    return {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve(sessionsResult)),
    }
  }

  function makeSessionPlayersBuilder() {
    return {
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockImplementation(() => Promise.resolve(sessionPlayersResult)),
    }
  }

  const mockSupabase = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "sessions") return makeSessionsBuilder()
      if (table === "session_players") return makeSessionPlayersBuilder()
      return { select: vi.fn().mockReturnThis() }
    }),
  }

  return {
    mockSupabase,
    setSessionsResult: (r: { data: unknown; error: unknown }) => { sessionsResult = r },
    setSessionPlayersResult: (r: { data: unknown; error: unknown }) => { sessionPlayersResult = r },
  }
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

import { getUpcomingSessions } from "../queries"

const NOW = new Date("2026-05-16T20:00:00")

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    sport_type: "futsal",
    date: "2026-05-17",
    start_time: "21:00:00",
    end_time: "23:00:00",
    capacity: 10,
    price_per_pax: 10,
    ...overrides,
  }
}

describe("getUpcomingSessions", () => {
  beforeEach(() => {
    setSessionsResult({ data: [], error: null })
    setSessionPlayersResult({ data: [], error: null })
  })

  it("includes a session scheduled for a future date", async () => {
    setSessionsResult({ data: [makeSession({ date: "2026-05-17" })], error: null })

    const result = await getUpcomingSessions(NOW)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe("session-1")
  })

  it("excludes a session scheduled for a past date", async () => {
    // DB returns nothing for past dates (gte filter), so empty result
    setSessionsResult({ data: [], error: null })

    const result = await getUpcomingSessions(NOW)

    expect(result).toHaveLength(0)
  })

  it("includes today's session when end_time has not yet passed", async () => {
    // NOW is 20:00:00, session ends at 22:00:00
    setSessionsResult({
      data: [makeSession({ date: "2026-05-16", end_time: "22:00:00" })],
      error: null,
    })

    const result = await getUpcomingSessions(NOW)

    expect(result).toHaveLength(1)
  })

  it("excludes today's session when end_time has already passed", async () => {
    // NOW is 20:00:00, session ended at 19:00:00
    setSessionsResult({
      data: [makeSession({ date: "2026-05-16", end_time: "19:00:00" })],
      error: null,
    })

    const result = await getUpcomingSessions(NOW)

    expect(result).toHaveLength(0)
  })

  it("computes spots_remaining as capacity minus active headcount, excluding cancelled players", async () => {
    // capacity 10, 3 pending + 1 cancelled = headcount 3, spots_remaining 7
    setSessionsResult({ data: [makeSession({ capacity: 10 })], error: null })
    setSessionPlayersResult({
      data: [
        { session_id: "session-1", payment_status: "pending" },
        { session_id: "session-1", payment_status: "pending" },
        { session_id: "session-1", payment_status: "pending" },
        { session_id: "session-1", payment_status: "cancelled" },
      ],
      error: null,
    })

    const result = await getUpcomingSessions(NOW)

    expect(result[0].headcount).toBe(3)
    expect(result[0].spots_remaining).toBe(7)
  })
})
