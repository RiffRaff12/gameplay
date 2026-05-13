'use client'

import { useReducer } from 'react'
import Link from 'next/link'
import { SportType, SPORT_TEMPLATES } from '@/config/sport-templates'
import { getNextSlot } from '@/lib/sessions/utils'
import { Session } from '@/lib/sessions/types'

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type FormState = {
  sport_type: SportType
  date: string
  start_time: string
  end_time: string
  capacity: number
  price_per_pax: number
}

type Action =
  | { type: 'SET_SPORT'; sport: SportType; isNew: boolean }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_START_TIME'; time: string }
  | { type: 'SET_END_TIME'; time: string }
  | { type: 'SET_CAPACITY'; capacity: number }
  | { type: 'SET_PRICE'; price: number }

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_SPORT': {
      if (!action.isNew) {
        // Editing — only update sport type, keep other values
        return { ...state, sport_type: action.sport }
      }
      // New session — pre-fill all defaults from template
      const t = SPORT_TEMPLATES[action.sport]
      return {
        sport_type: action.sport,
        date: formatDate(getNextSlot(action.sport)),
        start_time: t.startTime,
        end_time: t.endTime,
        capacity: t.capacity,
        price_per_pax: t.pricePerPax,
      }
    }
    case 'SET_DATE':
      return { ...state, date: action.date }
    case 'SET_START_TIME':
      return { ...state, start_time: action.time }
    case 'SET_END_TIME':
      return { ...state, end_time: action.time }
    case 'SET_CAPACITY':
      return { ...state, capacity: action.capacity }
    case 'SET_PRICE':
      return { ...state, price_per_pax: action.price }
  }
}

function buildInitialState(defaultValues?: Partial<Session>): FormState {
  if (defaultValues?.sport_type) {
    return {
      sport_type: defaultValues.sport_type,
      date: defaultValues.date ?? '',
      start_time: (defaultValues.start_time ?? '').slice(0, 5),
      end_time: (defaultValues.end_time ?? '').slice(0, 5),
      capacity: defaultValues.capacity ?? 0,
      price_per_pax: defaultValues.price_per_pax ?? 0,
    }
  }
  const sport: SportType = 'futsal'
  const t = SPORT_TEMPLATES[sport]
  return {
    sport_type: sport,
    date: formatDate(getNextSlot(sport)),
    start_time: t.startTime,
    end_time: t.endTime,
    capacity: t.capacity,
    price_per_pax: t.pricePerPax,
  }
}

type Props = {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  defaultValues?: Partial<Session>
}

export default function SessionForm({ action, submitLabel, defaultValues }: Props) {
  const isNew = !defaultValues
  const [state, dispatch] = useReducer(reducer, undefined, () => buildInitialState(defaultValues))

  return (
    <form action={action} className="space-y-4">
      {/* Sport Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sport Type</label>
        <div className="flex gap-3">
          {(['futsal', 'football'] as SportType[]).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sport_type"
                value={s}
                checked={state.sport_type === s}
                onChange={() => dispatch({ type: 'SET_SPORT', sport: s, isNew })}
                className="accent-green-600"
              />
              <span className="capitalize text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={state.date}
          onChange={(e) => dispatch({ type: 'SET_DATE', date: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Start Time */}
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
        <input
          id="start_time"
          name="start_time"
          type="time"
          value={state.start_time}
          onChange={(e) => dispatch({ type: 'SET_START_TIME', time: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* End Time */}
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
        <input
          id="end_time"
          name="end_time"
          type="time"
          value={state.end_time}
          onChange={(e) => dispatch({ type: 'SET_END_TIME', time: e.target.value })}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Capacity */}
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity (players)</label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          value={state.capacity}
          onChange={(e) => dispatch({ type: 'SET_CAPACITY', capacity: parseInt(e.target.value, 10) })}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Price per pax */}
      <div>
        <label htmlFor="price_per_pax" className="block text-sm font-medium text-gray-700 mb-1">Price per Pax (RM)</label>
        <input
          id="price_per_pax"
          name="price_per_pax"
          type="number"
          min={0}
          step="0.01"
          value={state.price_per_pax}
          onChange={(e) => dispatch({ type: 'SET_PRICE', price: parseFloat(e.target.value) })}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {submitLabel}
        </button>
        <Link
          href="/sessions"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
