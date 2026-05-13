'use client'

import { useState } from 'react'
import type { SessionPlayer } from '@/lib/session-players/types'
import { computeSummary, buildChaseMessage } from '@/lib/session-players/summary'

type Props = {
  roster: SessionPlayer[]
  pricePerPax: number
}

export default function SessionSummaryPanel({ roster, pricePerPax }: Props) {
  const [copied, setCopied] = useState(false)
  const summary = computeSummary(roster, pricePerPax)
  const hasPending = roster.some(sp => sp.payment_status === 'pending')

  async function handleCopy() {
    const message = buildChaseMessage(roster, pricePerPax)
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Summary
      </h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Total Players</dt>
          <dd className="font-medium">{summary.totalPlayers}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Expected Revenue</dt>
          <dd className="font-medium">RM {summary.expectedRevenue.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Collected</dt>
          <dd className="font-medium text-green-600">RM {summary.collected.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Outstanding</dt>
          <dd className="font-medium text-red-600">RM {summary.outstanding.toFixed(2)}</dd>
        </div>
      </dl>
      {hasPending && (
        <div className="mt-4">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? 'Copied!' : 'Copy chase message'}
          </button>
        </div>
      )}
    </div>
  )
}
