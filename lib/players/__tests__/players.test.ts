import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) },
}))

const { mockSupabase, getQueryBuilder, setMockResult } = vi.hoisted(() => {
  let mockResult: { data: unknown; error: unknown } = { data: [], error: null }

  function makeQueryBuilder() {
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve(mockResult)),
      single: vi.fn().mockImplementation(() => Promise.resolve(mockResult)),
      then: vi.fn().mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(mockResult).then(resolve)
      ),
    }
  }

  let currentBuilder = makeQueryBuilder()

  const mockSupabase = {
    from: vi.fn().mockImplementation(() => currentBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-abc" } } }),
    },
  }

  return {
    mockSupabase,
    getQueryBuilder: () => currentBuilder,
    setMockResult: (result: { data: unknown; error: unknown }) => {
      mockResult = result
      currentBuilder = makeQueryBuilder()
      mockSupabase.from.mockImplementation(() => currentBuilder)
    },
  }
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

import { searchPlayers, createPlayer } from "../actions"

const makePlayers = (names: string[]) =>
  names.map((name, i) => ({
    id: `id-${i}`,
    user_id: "user-abc",
    name,
    phone_number: `6011000000${i}`,
    sport_preference: "football",
    created_at: new Date().toISOString(),
  }))

describe("searchPlayers", () => {
  beforeEach(() => {
    setMockResult({ data: [], error: null })
  })

  it("returns players whose name matches the query (case-insensitive)", async () => {
    setMockResult({ data: makePlayers(["Ahmad Fariz", "Ahmad Zaki"]), error: null })
    const result = await searchPlayers("ahmad")
    const qb = getQueryBuilder()
    expect(mockSupabase.from).toHaveBeenCalledWith("players")
    expect(qb.ilike).toHaveBeenCalledWith("name", "%ahmad%")
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("Ahmad Fariz")
  })

  it("returns an empty array when no players match", async () => {
    setMockResult({ data: [], error: null })
    const result = await searchPlayers("zzznomatch")
    expect(result).toEqual([])
  })
})

describe("createPlayer", () => {
  beforeEach(() => {
    setMockResult({ data: null, error: null })
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-abc" } } })
  })

  it("inserts the player with correct fields and returns success", async () => {
    const result = await createPlayer({
      name: "Razif",
      phone_number: "60123456789",
      sport_preference: "futsal",
    })
    const qb = getQueryBuilder()
    expect(mockSupabase.from).toHaveBeenCalledWith("players")
    expect(qb.insert).toHaveBeenCalledWith({
      user_id: "user-abc",
      name: "Razif",
      phone_number: "60123456789",
      sport_preference: "futsal",
    })
    expect(result).toEqual({ success: true })
  })

  it("returns a friendly error on duplicate phone number (unique constraint)", async () => {
    setMockResult({
      data: null,
      error: { code: "23505", message: "duplicate key value violates unique constraint" },
    })
    const result = await createPlayer({
      name: "Razif",
      phone_number: "60123456789",
      sport_preference: "football",
    })
    expect(result).toEqual({
      success: false,
      error: "A player with this phone number already exists.",
    })
  })
})
