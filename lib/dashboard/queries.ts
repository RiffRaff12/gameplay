'use server'

import { createClient } from '@/lib/supabase/server'

export type DashboardSession = {
  id: string
  sport_type: string
  date: string
  start_time: string
  capacity: number
  price_per_pax: number
  headcount: number
  pending_count: number
  paid_count: number
}

export async function getDashboardSessions(): Promise<DashboardSession[]> {
  const supabase = await createClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 28)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, sport_type, date, start_time, capacity, price_per_pax')
    .gte('date', cutoffStr)
    .order('date', { ascending: false })

  if (sessionsError) throw new Error(sessionsError.message)
  if (!sessions || sessions.length === 0) return []

  const sessionIds = sessions.map((s) => s.id)

  const { data: players, error: playersError } = await supabase
    .from('session_players')
    .select('session_id, payment_status')
    .in('session_id', sessionIds)

  if (playersError) throw new Error(playersError.message)

  const countMap = new Map<string, { headcount: number; pending_count: number; paid_count: number }>()

  for (const session of sessions) {
    countMap.set(session.id, { headcount: 0, pending_count: 0, paid_count: 0 })
  }

  for (const player of players ?? []) {
    const counts = countMap.get(player.session_id)
    if (!counts) continue
    if (player.payment_status !== 'cancelled') {
      counts.headcount++
    }
    if (player.payment_status === 'pending') {
      counts.pending_count++
    }
    if (player.payment_status === 'paid') {
      counts.paid_count++
    }
  }

  return sessions.map((session) => {
    const counts = countMap.get(session.id) ?? { headcount: 0, pending_count: 0, paid_count: 0 }
    return {
      id: session.id,
      sport_type: session.sport_type,
      date: session.date,
      start_time: session.start_time,
      capacity: session.capacity,
      price_per_pax: session.price_per_pax,
      headcount: counts.headcount,
      pending_count: counts.pending_count,
      paid_count: counts.paid_count,
    }
  })
}
