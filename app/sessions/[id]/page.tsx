import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/sessions/actions'
import { deleteSession } from '@/lib/sessions/actions'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params

  let session
  try {
    session = await getSession(id)
  } catch {
    notFound()
  }

  async function handleDelete() {
    'use server'
    await deleteSession(id)
    redirect('/sessions')
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Session Detail</h1>
        <div className="flex gap-2">
          <Link
            href={`/sessions/${id}/edit`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 capitalize">
            {session.sport_type}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium">{session.date}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Time</dt>
            <dd className="font-medium">{session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Capacity</dt>
            <dd className="font-medium">{session.capacity} players</dd>
          </div>
          <div>
            <dt className="text-gray-500">Price / Pax</dt>
            <dd className="font-medium">RM {Number(session.price_per_pax).toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* Roster and payments will be added in issues #6 and #7 */}
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        Roster and payment details coming soon (#6 and #7)
      </div>

      <div className="mt-8">
        <Link href="/sessions" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to sessions
        </Link>
      </div>
    </main>
  )
}
