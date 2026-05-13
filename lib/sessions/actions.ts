'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Session } from './types'
import { SportType } from '@/config/sport-templates'

type SessionInput = {
  sport_type: SportType
  date: string
  start_time: string
  end_time: string
  capacity: number
  price_per_pax: number
}

export async function getSessions(): Promise<Session[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Session[]
}

export async function getSession(id: string): Promise<Session> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Session
}

export async function createSession(input: SessionInput): Promise<Session> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/sessions')
  return data as Session
}

export async function updateSession(id: string, input: Partial<SessionInput>): Promise<Session> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/sessions')
  revalidatePath(`/sessions/${id}`)
  revalidatePath(`/sessions/${id}/edit`)
  return data as Session
}

export async function deleteSession(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/sessions')
}
