import { notFound, redirect } from 'next/navigation'
import { getSession, updateSession } from '@/lib/sessions/actions'
import { SportType } from '@/config/sport-templates'
import SessionForm from '../../_components/SessionForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditSessionPage({ params }: Props) {
  const { id } = await params

  let session
  try {
    session = await getSession(id)
  } catch {
    notFound()
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    const sport_type = formData.get('sport_type') as SportType
    const date = formData.get('date') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const capacity = parseInt(formData.get('capacity') as string, 10)
    const price_per_pax = parseFloat(formData.get('price_per_pax') as string)

    await updateSession(id, { sport_type, date, start_time, end_time, capacity, price_per_pax })
    redirect(`/sessions/${id}`)
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Session</h1>
      <SessionForm action={handleUpdate} submitLabel="Save Changes" defaultValues={session} />
    </main>
  )
}
