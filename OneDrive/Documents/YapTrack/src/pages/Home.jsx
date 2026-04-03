import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiAward, FiActivity } from 'react-icons/fi'
import PrefireCard from '../components/PrefireCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats/leaderboard', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/prefires?page=1', { credentials: 'include' }).then(r => r.json())
    ]).then(([lb, prefires]) => {
      setLeaderboard(lb)
      setRecent(prefires.slice(0, 10))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black">Home</h1>
        <p className="text-muted mt-1">Leaderboard & recent activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FiAward className="text-accent" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Leaderboard</h2>
          </div>
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">No data yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">#</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">User</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Kills</th>
                    <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-b border-border/50 last:border-0 ${entry.id === user?.id ? 'bg-accent/5' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`font-black text-base ${i === 0 ? 'text-accent' : i === 1 ? 'text-white/60' : i === 2 ? 'text-hit/80' : 'text-muted'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${i === 0 ? 'text-accent' : 'text-white'}`}>
                          {entry.username}
                          {entry.id === user?.id && <span className="text-xs text-muted ml-1">(you)</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-accent">{entry.kills}</td>
                      <td className="px-4 py-3 text-right text-muted">{entry.hit_rate}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-accent" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Recent Activity</h2>
          </div>
          {recent.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-6 text-center text-muted text-sm">
              No prefires yet. Be the first to call someone out.
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(prefire => (
                <PrefireCard
                  key={prefire.id}
                  prefire={prefire}
                  currentUser={user}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
