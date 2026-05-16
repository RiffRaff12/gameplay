'use server'

import { createClient } from '@/lib/supabase/server'

export type UpcomingSession = {
  id: string
  sport_type: string
  date: string
  start_time: string
  end_time: string
  capacity: number
  price_per_pax: number
  headcount: number
  spots_remaining: number
}

export async function getUpcomingSessions(now = new Date()): Promise<UpcomingSession[]> {
  const supabase = await createClient()

  const todayStr = now.toISOString().slice(0, 10)
  const nowTimeStr = now.toTimeString().slice(0, 8)

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, sport_type, date, start_time, end_time, capacity, price_per_pax')
    .gte('date', todayStr)
    .order('date', { ascending: true })

  if (sessionsError) throw new Error(sessionsError.message)
  if (!sessions || sessions.length === 0) return []

  const upcoming = (sessions as UpcomingSession[]).filter(s =>
    s.date > todayStr || s.end_time > nowTimeStr
  )

  if (upcoming.length === 0) return []

  const sessionIds = upcoming.map(s => s.id)

  const { data: players, error: playersError } = await supabase
    .from('session_players')
    .select('session_id, payment_status')
    .in('session_id', sessionIds)

  if (playersError) throw new Error(playersError.message)

  const headcountMap = new Map<string, number>()
  for (const s of upcoming) headcountMap.set(s.id, 0)
  for (const p of (players ?? []) as { session_id: string; payment_status: string }[]) {
    if (p.payment_status !== 'cancelled') {
      headcountMap.set(p.session_id, (headcountMap.get(p.session_id) ?? 0) + 1)
    }
  }

  return upcoming.map(s => {
    const headcount = headcountMap.get(s.id) ?? 0
    return { ...s, headcount, spots_remaining: s.capacity - headcount }
  })
}
