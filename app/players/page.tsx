import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getPlayers, searchPlayers, deletePlayer } from "@/lib/players/actions"
import type { Player } from "@/lib/players/types"

function sportLabel(s: string) {
  if (s === "football") return "Football"
  if (s === "futsal") return "Futsal"
  return "Both"
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const query = params.q ?? ""
  const players: Player[] = query ? await searchPlayers(query) : await getPlayers()

  async function handleDelete(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    await deletePlayer(id)
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Players</h1>
        <Link
          href="/players/new"
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add player
        </Link>
      </div>

      <form method="GET" className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </form>

      {players.length === 0 ? (
        <p className="text-center text-sm text-gray-500">
          {query ? `No players matching "${query}"` : "No players yet. Add one!"}
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <p className="font-medium">{player.name}</p>
                <p className="text-sm text-gray-500">
                  {player.phone_number} &middot; {sportLabel(player.sport_preference)}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/players/${player.id}/edit`}
                  className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Edit
                </Link>
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={player.id} />
                  <button
                    type="submit"
                    className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          &larr; Home
        </Link>
      </div>
    </main>
  )
}
