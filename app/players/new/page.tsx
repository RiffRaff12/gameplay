import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createPlayer } from "@/lib/players/actions"

export default async function NewPlayerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  async function handleCreate(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const phone_number = formData.get("phone_number") as string
    const sport_preference = formData.get("sport_preference") as
      | "football"
      | "futsal"
      | "both"

    const result = await createPlayer({ name, phone_number, sport_preference })
    if (result.success) {
      redirect("/players")
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Add Player</h1>

      <form action={handleCreate} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="phone_number">
            Phone number <span className="text-gray-400">(60XXXXXXXXX)</span>
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="text"
            required
            pattern="60[0-9]{8,10}"
            placeholder="601XXXXXXXX"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="sport_preference">
            Sport preference
          </label>
          <select
            id="sport_preference"
            name="sport_preference"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="football">Football</option>
            <option value="futsal">Futsal</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Save
          </button>
          <Link
            href="/players"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}
