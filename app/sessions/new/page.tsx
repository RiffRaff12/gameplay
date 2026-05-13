import { redirect } from 'next/navigation'
import { createSession } from '@/lib/sessions/actions'
import { SportType } from '@/config/sport-templates'
import SessionForm from '../_components/SessionForm'

export default function NewSessionPage() {
  async function handleCreate(formData: FormData) {
    'use server'
    const sport_type = formData.get('sport_type') as SportType
    const date = formData.get('date') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const capacity = parseInt(formData.get('capacity') as string, 10)
    const price_per_pax = parseFloat(formData.get('price_per_pax') as string)

    const session = await createSession({ sport_type, date, start_time, end_time, capacity, price_per_pax })
    redirect(`/sessions/${session.id}`)
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Session</h1>
      <SessionForm action={handleCreate} submitLabel="Create Session" />
    </main>
  )
}
