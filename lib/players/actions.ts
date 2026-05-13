"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Player, PlayerFormData, ActionResult } from "./types"

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("players")
    .select("id, name, phone_number, sport_preference, created_at")
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as Player[]
}

export async function searchPlayers(query: string): Promise<Player[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("players")
    .select("id, name, phone_number, sport_preference, created_at")
    .ilike("name", `%${query}%`)
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? []) as Player[]
}

export async function createPlayer(formData: PlayerFormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase.from("players").insert({
    user_id: user.id,
    name: formData.name.trim(),
    phone_number: formData.phone_number.trim(),
    sport_preference: formData.sport_preference,
  })

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A player with this phone number already exists." }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/players")
  return { success: true }
}

export async function updatePlayer(id: string, formData: PlayerFormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("players")
    .update({
      name: formData.name.trim(),
      phone_number: formData.phone_number.trim(),
      sport_preference: formData.sport_preference,
    })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A player with this phone number already exists." }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/players")
  return { success: true }
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from("players").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/players")
  return { success: true }
}
