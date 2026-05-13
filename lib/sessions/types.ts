import { SportType } from '@/config/sport-templates'

export type Session = {
  id: string
  user_id: string
  sport_type: SportType
  date: string
  start_time: string
  end_time: string
  capacity: number
  price_per_pax: number
  created_at: string
}
