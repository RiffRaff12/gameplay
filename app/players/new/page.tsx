import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createPlayer } from "@/lib/players/actions"
import PlayerForm from "@/app/players/_components/PlayerForm"
import type { ActionResult } from "@/lib/players/types"

export default async function NewPlayerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  async function handleCreate(
    _prevState: ActionResult | null,
    formData: FormData,
  ): Promise<ActionResult | null> {
    "use server"
    const name = formData.get("name") as string
    const phone_number = formData.get("phone_number") as string
    const sport_preference = formData.get("sport_preference") as
      | "football"
      | "futsal"
      | "both"

    const result = await createPlayer({ name, phone_number, sport_preference })
    if (result.success) redirect("/players")
    return result
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Add Player</h1>
      <PlayerForm action={handleCreate} submitLabel="Save" />
    </main>
  )
}
