import { useState } from 'react'

export default function VoteButtons({ prefireId, legitCount, bogusCount, canVote, onVoted }) {
  const [loading, setLoading] = useState(false)
  const [voted, setVoted] = useState(false)

  async function castVote(vote) {
    if (loading || voted) return
    setLoading(true)
    try {
      const res = await fetch(`/api/votes/${prefireId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vote })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to vote')
        return
      }
      setVoted(true)
      onVoted && onVoted(data)
    } finally {
      setLoading(false)
    }
  }

  if (!canVote) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-confirmed font-semibold">
          <span>✅</span> {legitCount} Legit
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1.5 text-denied font-semibold">
          <span>❌</span> {bogusCount} Bogus
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => castVote('legit')}
        disabled={loading || voted}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-confirmed/10 text-confirmed border border-confirmed/30 hover:bg-confirmed/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ✅ Legit ({legitCount})
      </button>
      <button
        onClick={() => castVote('bogus')}
        disabled={loading || voted}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-denied/10 text-denied border border-denied/30 hover:bg-denied/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ❌ Bogus ({bogusCount})
      </button>
      {voted && <span className="text-xs text-muted">Vote cast!</span>}
    </div>
  )
}
