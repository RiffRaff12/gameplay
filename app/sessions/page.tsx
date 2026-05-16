import Link from 'next/link'
import { getSessions } from '@/lib/sessions/actions'

export default async function SessionsPage() {
  const sessions = await getSessions()

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Past Sessions</h1>
      </div>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500 mt-12">No sessions yet. Create your first one!</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.id}`}
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 capitalize mr-2">
                      {session.sport_type}
                    </span>
                    <span className="font-medium">{session.date}</span>
                  </div>
                  <span className="text-sm text-gray-500">RM {Number(session.price_per_pax).toFixed(2)} / pax</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)} &middot; {session.capacity} players
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to home
        </Link>
      </div>
    </main>
  )
}
