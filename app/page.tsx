import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Gameplay</h1>
      <p className="text-sm text-gray-500">Signed in as {user?.email}</p>
      <nav className="flex flex-col items-center gap-2 w-full max-w-xs">
        <Link
          href="/players"
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
        >
          Players
        </Link>
        <Link
          href="/sessions"
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
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
    </main>
  );
}
