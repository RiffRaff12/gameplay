import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updatePlayer } from "@/lib/players/actions"
import PlayerForm from "@/app/players/_components/PlayerForm"
import type { Player } from "@/lib/players/types"
import type { ActionResult } from "@/lib/players/types"

async function getPlayer(id: string): Promise<Player | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("players")
    .select("id, name, phone_number, sport_preference, created_at")
    .eq("id", id)
    .single()
  return (data as Player) ?? null
}

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { id } = await params
  const player = await getPlayer(id)
  if (!player) notFound()

  async function handleUpdate(
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

    const result = await updatePlayer(id, { name, phone_number, sport_preference })
    if (result.success) redirect("/players")
    return result
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Edit Player</h1>
      <PlayerForm
        action={handleUpdate}
        submitLabel="Save"
        defaultValues={{
          name: player.name,
          phone_number: player.phone_number,
          sport_preference: player.sport_preference,
        }}
      />
    </main>
  )
}
