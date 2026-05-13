'use client'

import { useState, useRef, useEffect } from 'react'
import { updatePaymentStatus } from '@/lib/session-players/actions'
import type { PaymentStatus } from '@/lib/session-players/types'

type Props = {
  sessionPlayerId: string
  currentStatus: PaymentStatus
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; badgeClass: string; btnClass: string }> = {
  paid: {
    label: 'Paid',
    badgeClass: 'bg-green-100 text-green-800',
    btnClass: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    btnClass: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  free: {
    label: 'Free',
    badgeClass: 'bg-blue-100 text-blue-800',
    btnClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-gray-100 text-gray-500',
    btnClass: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  },
}

const ALL_STATUSES: PaymentStatus[] = ['paid', 'pending', 'free', 'cancelled']

export default function StatusPicker({ sessionPlayerId, currentStatus }: Props) {
  const [status, setStatus] = useState<PaymentStatus>(currentStatus)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSelect(next: PaymentStatus) {
    if (next === status) {
      setOpen(false)
      return
    }

    const prev = status
    setStatus(next)
    setOpen(false)

    try {
      await updatePaymentStatus(sessionPlayerId, next)
    } catch {
      setStatus(prev)
    }
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer ${cfg.badgeClass}`}
      >
        {cfg.label}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleSelect(s)}
              className={`rounded-full px-3 py-0.5 text-xs font-medium text-left whitespace-nowrap ${STATUS_CONFIG[s].btnClass}`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
