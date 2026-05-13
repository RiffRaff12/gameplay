export type PaymentStatus = 'paid' | 'pending' | 'free' | 'cancelled'

export type SessionPlayer = {
  id: string
  session_id: string
  player_id: string
  payment_status: PaymentStatus
  created_at: string
  player: { name: string; phone_number: string }
}
