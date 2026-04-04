import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiCheck, FiX } from 'react-icons/fi'
import StatusBadge from './StatusBadge'
import VoteButtons from './VoteButtons'
import { apiFetch } from '../api'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr + 'Z').toLocaleDateString()
}

export default function PrefireCard({ prefire: initial, currentUser, onUpdate, compact = false }) {
  const [prefire, setPrefire] = useState(initial)
  const [actionLoading, setActionLoading] = useState(null)

  const isOwnPrefire = currentUser?.id === prefire.caller_id
  const isTarget = prefire.target_user_id && currentUser?.id === prefire.target_user_id
  const canVote = prefire.status === 'hit' && !isOwnPrefire && !isTarget
  const showActions = isOwnPrefire && prefire.status === 'pending'

  async function markHit() {
    setActionLoading('hit')
    try {
      const res = await apiFetch(`/api/prefires/${prefire.id}/hit`, { method: 'PATCH' })
      if (res.ok) {
        const updated = await res.json()
        setPrefire(updated)
        onUpdate && onUpdate()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function markDeny() {
    setActionLoading('deny')
    try {
      const res = await apiFetch(`/api/prefires/${prefire.id}/deny`, { method: 'PATCH' })
      if (res.ok) {
        const updated = await res.json()
        setPrefire(updated)
        onUpdate && onUpdate()
      }
    } finally {
      setActionLoading(null)
    }
  }

  function handleVoted(updated) {
    setPrefire(updated)
    onUpdate && onUpdate()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-white truncate">{prefire.caller_name}</span>
          <FiArrowRight className="text-muted shrink-0" size={14} />
          <span className="font-bold text-accent truncate">{prefire.target_name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={prefire.status} />
          <span className="text-xs text-muted hidden sm:block">{timeAgo(prefire.created_at)}</span>
        </div>
      </div>

      <p className={`text-white/80 mb-3 ${compact ? 'text-sm line-clamp-2' : 'text-sm leading-relaxed'}`}>
        {prefire.description}
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {(prefire.status === 'hit' || prefire.status === 'confirmed' || prefire.status === 'denied') && (
          <VoteButtons
            prefireId={prefire.id}
            legitCount={prefire.legit_count}
            bogusCount={prefire.bogus_count}
            canVote={canVote}
            onVoted={handleVoted}
          />
        )}

        {showActions && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={markHit}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 disabled:opacity-50 transition-colors"
            >
              <FiCheck size={14} />
              {actionLoading === 'hit' ? 'Deploying...' : '🔥 Deploy for Voting'}
            </button>
            <button
              onClick={markDeny}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-denied/10 text-denied border border-denied/30 hover:bg-denied/20 disabled:opacity-50 transition-colors"
            >
              <FiX size={14} />
              {actionLoading === 'deny' ? 'Marking...' : "Didn't Happen"}
            </button>
          </div>
        )}

        <span className="text-xs text-muted sm:hidden ml-auto">{timeAgo(prefire.created_at)}</span>
      </div>
    </motion.div>
  )
}
