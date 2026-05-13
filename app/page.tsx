import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Gameplay</h1>
      <p className="text-sm text-gray-500">Signed in as {user?.email}</p>
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
