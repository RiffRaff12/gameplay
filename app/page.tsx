import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { getDashboardSessions } from "@/lib/dashboard/queries";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const sessions = await getDashboardSessions();

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
              Sessions
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

      <h2 className="text-lg font-semibold mb-4">Last 4 weeks</h2>

      {sessions.length === 0 ? (
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            No sessions in the last 4 weeks. Create one to get started.
          </p>
          <Link
            href="/sessions/new"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            New Session
          </Link>
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
                  {session.pending_count > 0 ? (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {session.pending_count} outstanding
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Settled
                    </span>
                  )}
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
  );
}
