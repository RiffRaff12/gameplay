'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchPlayers, createPlayer } from '@/lib/players/actions'
import { addPlayerToSession } from '@/lib/session-players/actions'
import type { Player, SportPreference } from '@/lib/players/types'

type Props = {
  sessionId: string
}

export default function AddPlayerForm({ sessionId }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create player form state
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newSport, setNewSport] = useState<SportPreference>('football')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    const players = await searchPlayers(q)
    setResults(players)
    setShowDropdown(true)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSelectPlayer(player: Player) {
    setIsSubmitting(true)
    setError(null)
    const result = await addPlayerToSession(sessionId, player.id)
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Failed to add player.')
      setShowDropdown(false)
      return
    }
    setQuery('')
    setResults([])
    setShowDropdown(false)
    router.refresh()
  }

  async function handleCreateAndAdd(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const createResult = await createPlayer({
      name: newName.trim(),
      phone_number: newPhone.trim(),
      sport_preference: newSport,
    })

    if (!createResult.success) {
      setIsSubmitting(false)
      setError(createResult.error)
      return
    }

    // Find the newly created player by searching for their name
    const found = await searchPlayers(newName.trim())
    const newPlayer = found.find(p => p.phone_number === newPhone.trim())

    if (!newPlayer) {
      setIsSubmitting(false)
      setError('Player created but could not be found to add to session.')
      return
    }

    const addResult = await addPlayerToSession(sessionId, newPlayer.id)
    setIsSubmitting(false)
    if (!addResult.success) {
      setError(addResult.error ?? 'Failed to add player to session.')
      return
    }

    setQuery('')
    setResults([])
    setShowDropdown(false)
    setShowCreateForm(false)
    setNewName('')
    setNewPhone('')
    setNewSport('football')
    router.refresh()
  }

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Add Player</h2>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setError(null)
            setShowCreateForm(false)
          }}
          placeholder="Search player by name…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isSubmitting}
        />

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {results.length > 0 ? (
              <ul>
                {results.map(player => (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectPlayer(player)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex flex-col"
                      disabled={isSubmitting}
                    >
                      <span className="font-medium">{player.name}</span>
                      <span className="text-gray-500 text-xs">{player.phone_number}</span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false)
                      setShowCreateForm(true)
                      setNewName(query)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 font-medium"
                  >
                    + Create new player &ldquo;{query}&rdquo;
                  </button>
                </li>
              </ul>
            ) : (
              <div>
                <p className="px-4 py-2 text-sm text-gray-500">No players found.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false)
                    setShowCreateForm(true)
                    setNewName(query)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 font-medium border-t border-gray-100"
                >
                  + Create new player &ldquo;{query}&rdquo;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateAndAdd} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">New Player</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input
              type="text"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sport Preference</label>
            <select
              value={newSport}
              onChange={e => setNewSport(e.target.value as SportPreference)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              <option value="football">Football</option>
              <option value="futsal">Futsal</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding…' : 'Create & Add'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
