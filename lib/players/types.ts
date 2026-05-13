export type SportPreference = 'football' | 'futsal' | 'both'

export type Player = {
  id: string
  name: string
  phone_number: string
  sport_preference: SportPreference
  created_at: string
}

export type PlayerFormData = {
  name: string
  phone_number: string
  sport_preference: SportPreference
}

export type ActionResult =
  | { success: true }
  | { success: false; error: string }
