import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiZap } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function SubmitPrefire() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [targetName, setTargetName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!targetName.trim()) return setError('Who are you prefiring?')
    if (!description.trim()) return setError('Describe the prefire')

    setLoading(true)
    try {
      const res = await fetch('/api/prefires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_name: targetName.trim(), description: description.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit')
        return
      }
      navigate('/my-prefires')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-black">Drop a Prefire</h1>
          <p className="text-muted mt-1">Call your shot. The community will decide if you're right.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Caller (read-only) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Calling From
              </label>
              <div className="px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-accent font-bold">
                {user?.username}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Prefiring
              </label>
              <input
                type="text"
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="Who are you calling out?"
              />
              <p className="text-xs text-muted mt-1">
                If they have a YapTrack account, their K/D will update automatically.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                The Prefire
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="What exactly are you predicting? Be specific."
              />
            </div>

            {error && (
              <div className="text-denied text-sm font-medium bg-denied/10 border border-denied/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-black font-black rounded-lg hover:bg-accent/90 disabled:opacity-60 transition-colors text-base"
            >
              <FiZap size={18} />
              {loading ? 'Submitting...' : 'Drop the Prefire'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
