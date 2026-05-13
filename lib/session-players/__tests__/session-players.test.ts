import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// We use a more explicit mock that tracks the sequence of `from()` calls.
// Each call to `from()` pops the next configured response off its queue.
const { mockSupabase, configureFromCalls } = vi.hoisted(() => {
  // Each entry represents one `.from()` call in sequence and its resolved value.
  type FromConfig = {
    finalValue: unknown
    isCount?: boolean
  }

  let queue: FromConfig[] = []

  function makeBuilder(config: FromConfig) {
    const value = config.finalValue
    const builder: Record<string, unknown> = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockImplementation(() => Promise.resolve(value)),
      order: vi.fn().mockImplementation(() => Promise.resolve(value)),
      single: vi.fn().mockImplementation(() => Promise.resolve(value)),
      then: vi.fn().mockImplementation((resolve: (v: unknown) => unknown) =>
        Promise.resolve(value).then(resolve),
      ),
    }
    return builder
  }

  const mockSupabase = {
    from: vi.fn().mockImplementation(() => {
      const config = queue.shift()
      if (!config) throw new Error('Unexpected from() call — queue empty')
      return makeBuilder(config)
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-abc' } } }),
    },
  }

  return {
    mockSupabase,
    /** Pre-load the queue with values for each sequential from() call */
    configureFromCalls: (calls: FromConfig[]) => {
      queue = [...calls]
    },
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

import { addPlayerToSession, removePlayerFromSession } from '../actions'

describe('addPlayerToSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('succeeds when under capacity', async () => {
    configureFromCalls([
      // 1st from('sessions').select().eq().single() → capacity 10
      { finalValue: { data: { capacity: 10 }, error: null } },
      // 2nd from('session_players').select('id', {count}).eq().neq() → count 5
      { finalValue: { count: 5, error: null } },
      // 3rd from('session_players').insert() → success
      { finalValue: { data: null, error: null } },
    ])

    const result = await addPlayerToSession('session-1', 'player-1')
    expect(result).toEqual({ success: true })
  })

  it('returns error when at capacity', async () => {
    configureFromCalls([
      // Session capacity = 10
      { finalValue: { data: { capacity: 10 }, error: null } },
      // Count = 10 (at capacity)
      { finalValue: { count: 10, error: null } },
      // No insert call expected
    ])

    const result = await addPlayerToSession('session-1', 'player-1')
    expect(result).toEqual({ success: false, error: 'Session is at full capacity.' })
  })

  it('returns error on duplicate (unique constraint code 23505)', async () => {
    configureFromCalls([
      // Session capacity = 10
      { finalValue: { data: { capacity: 10 }, error: null } },
      // Count = 2 (under capacity)
      { finalValue: { count: 2, error: null } },
      // Insert → duplicate constraint error
      { finalValue: { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } } },
    ])

    const result = await addPlayerToSession('session-1', 'player-1')
    expect(result).toEqual({ success: false, error: 'Player is already on this roster.' })
  })
})

describe('removePlayerFromSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls delete with the correct session player id', async () => {
    let capturedEqValue: unknown
    const deleteBuilder = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation((_col: string, val: unknown) => {
        capturedEqValue = val
        return Promise.resolve({ data: null, error: null })
      }),
    }
    mockSupabase.from.mockReturnValueOnce(deleteBuilder)

    await removePlayerFromSession('sp-uuid-123')

    expect(deleteBuilder.delete).toHaveBeenCalled()
    expect(capturedEqValue).toBe('sp-uuid-123')
  })
})
