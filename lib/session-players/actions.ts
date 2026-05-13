'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SessionPlayer, PaymentStatus } from './types'

export async function getRoster(sessionId: string): Promise<SessionPlayer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('session_players')
    .select('id, session_id, player_id, payment_status, created_at, player:players(name, phone_number)')
    .eq('session_id', sessionId)
    .order('player(name)', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as SessionPlayer[]
}

export async function addPlayerToSession(
  sessionId: string,
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Fetch session capacity
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('capacity')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { success: false, error: 'Session not found.' }
  }

  // Count active (non-cancelled) players
  const { count, error: countError } = await supabase
    .from('session_players')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .neq('payment_status', 'cancelled')

  if (countError) {
    return { success: false, error: countError.message }
  }

  if ((count ?? 0) >= session.capacity) {
    return { success: false, error: 'Session is at full capacity.' }
  }

  // Insert
  const { error: insertError } = await supabase
    .from('session_players')
    .insert({ session_id: sessionId, player_id: playerId })

  if (insertError) {
    if (insertError.code === '23505') {
      return { success: false, error: 'Player is already on this roster.' }
    }
    return { success: false, error: insertError.message }
  }

  revalidatePath(`/sessions/${sessionId}`)
  return { success: true }
}

export async function removePlayerFromSession(sessionPlayerId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('session_players')
    .delete()
    .eq('id', sessionPlayerId)

  if (error) throw new Error(error.message)

  // Revalidate will be handled by the caller via router.refresh or revalidatePath
}

export async function updatePaymentStatus(
  sessionPlayerId: string,
  status: PaymentStatus
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('session_players')
    .update({ payment_status: status })
    .eq('id', sessionPlayerId)

  if (error) throw new Error(error.message)

  revalidatePath('/sessions')
}
