import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiPlusCircle } from 'react-icons/fi'
import KDStatCard from '../components/KDStatCard'
import PrefireCard from '../components/PrefireCard'
import { useAuth } from '../context/AuthContext'

const FILTERS = ['all', 'pending', 'hit', 'confirmed', 'denied']

export default function MyPrefires() {
  const { user } = useAuth()
  const [prefires, setPrefires] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/prefires/mine', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/stats/me', { credentials: 'include' }).then(r => r.json())
    ]).then(([p, s]) => {
      setPrefires(p)
      setStats(s)
      setLoading(false)
    })
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = filter === 'all' ? prefires : prefires.filter(p => p.status === filter)

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? prefires.length : prefires.filter(p => p.status === f).length
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-black">My Prefires</h1>
          <p className="text-muted mt-1">Your calls, your record</p>
        </div>
        <Link
          to="/submit"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-accent text-black hover:bg-accent/90 transition-colors"
        >
          <FiPlusCircle size={14} />
          New Prefire
        </Link>
      </div>

      {/* K/D Stat Card */}
      {stats && <KDStatCard kills={stats.kills} deaths={stats.deaths} ratio={stats.ratio} />}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-accent text-black'
                : 'bg-surface border border-border text-muted hover:text-white'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Prefire List */}
      {loading ? (
        <div className="text-muted py-8 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-muted text-sm">
            {filter === 'all' ? (
              <>No prefires yet. <Link to="/submit" className="text-accent hover:underline">Drop your first one.</Link></>
            ) : (
              `No ${filter} prefires.`
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(prefire => (
            <PrefireCard
              key={prefire.id}
              prefire={prefire}
              currentUser={user}
              onUpdate={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  )
}
