import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/sessions/actions'
import { deleteSession } from '@/lib/sessions/actions'
import { getRoster, removePlayerFromSession } from '@/lib/session-players/actions'
import type { PaymentStatus } from '@/lib/session-players/types'
import AddPlayerForm from './_components/AddPlayerForm'

type Props = {
  params: Promise<{ id: string }>
}

function paymentBadge(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Paid
        </span>
      )
    case 'pending':
      return (
        <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
          Pending
        </span>
      )
    case 'free':
      return (
        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          Free
        </span>
      )
    case 'cancelled':
      return (
        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          Cancelled
        </span>
      )
  }
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params

  let session
  try {
    session = await getSession(id)
  } catch {
    notFound()
  }

  const roster = await getRoster(id)
  const activeCount = roster.filter(sp => sp.payment_status !== 'cancelled').length

  async function handleDelete() {
    'use server'
    await deleteSession(id)
    redirect('/sessions')
  }

  async function handleRemove(formData: FormData) {
    'use server'
    const sessionPlayerId = formData.get('sessionPlayerId') as string
    await removePlayerFromSession(sessionPlayerId)
    redirect(`/sessions/${id}`)
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

      {/* Session info */}
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
            <dd className="font-medium">{session.start_time.slice(0, 5)} &ndash; {session.end_time.slice(0, 5)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Headcount</dt>
            <dd className="font-medium">
              {activeCount} / {session.capacity}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Price / Pax</dt>
            <dd className="font-medium">RM {Number(session.price_per_pax).toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      {/* Roster */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Roster</h2>
        {roster.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6 rounded-lg border border-dashed border-gray-300">
            No players yet. Add one below.
          </p>
        ) : (
          <ul className="space-y-2">
            {roster.map(sp => (
              <li
                key={sp.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{sp.player.name}</span>
                  <span className="text-xs text-gray-500">{sp.player.phone_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  {paymentBadge(sp.payment_status)}
                  <form action={handleRemove}>
                    <input type="hidden" name="sessionPlayerId" value={sp.id} />
                    <button
                      type="submit"
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add player */}
      <AddPlayerForm sessionId={id} />

      <div className="mt-8">
        <Link href="/sessions" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to sessions
        </Link>
      </div>
    </main>
  )
}
