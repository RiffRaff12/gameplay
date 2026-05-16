import Link from "next/link"
import { signOut } from "@/lib/auth/actions"
import { getUpcomingSessions } from "@/lib/dashboard/queries"
import { createSession } from "@/lib/sessions/actions"
import { SportType } from "@/config/sport-templates"
import NewSessionModal from "@/app/_components/NewSessionModal"

type CreateState = { success: boolean; error?: string } | null

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default async function Home() {
  const sessions = await getUpcomingSessions()

  async function handleCreate(
    _prevState: CreateState,
    formData: FormData,
  ): Promise<CreateState> {
    "use server"
    try {
      const sport_type = formData.get("sport_type") as SportType
      const date = formData.get("date") as string
      const start_time = formData.get("start_time") as string
      const end_time = formData.get("end_time") as string
      const capacity = parseInt(formData.get("capacity") as string, 10)
      const price_per_pax = parseFloat(formData.get("price_per_pax") as string)
      await createSession({ sport_type, date, start_time, end_time, capacity, price_per_pax })
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Failed to create session." }
    }
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gameplay</h1>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2">
            <Link
              href="/players"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Players
            </Link>
            <Link
              href="/sessions"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Past Sessions
            </Link>
          </nav>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        <NewSessionModal action={handleCreate} />
      </div>

      {sessions.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">No upcoming sessions.</p>
          <NewSessionModal action={handleCreate} />
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/sessions/${session.id}`}
                className="block rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 uppercase">
                      {session.sport_type}
                    </span>
                    <span className="font-medium">{formatDate(session.date)}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {session.spots_remaining} spot{session.spots_remaining !== 1 ? "s" : ""} left
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {session.headcount} / {session.capacity} players
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
