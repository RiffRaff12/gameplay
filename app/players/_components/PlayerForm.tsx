'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import type { ActionResult, SportPreference } from '@/lib/players/types'

type Action = (
  prevState: ActionResult | null,
  formData: FormData,
) => Promise<ActionResult | null>

type Props = {
  action: Action
  submitLabel: string
  defaultValues?: {
    name?: string
    phone_number?: string
    sport_preference?: SportPreference
  }
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}

export default function PlayerForm({ action, submitLabel, defaultValues }: Props) {
  const [state, formAction] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
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
          defaultValue={defaultValues?.phone_number}
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
          defaultValue={defaultValues?.sport_preference ?? 'football'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="football">Football</option>
          <option value="futsal">Futsal</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="flex gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/players"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
