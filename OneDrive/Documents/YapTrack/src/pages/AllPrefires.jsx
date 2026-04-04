import { useState, useEffect, useCallback } from 'react'
import { FiFilter } from 'react-icons/fi'
import PrefireCard from '../components/PrefireCard'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api'

const FILTERS = ['all', 'pending', 'hit', 'confirmed', 'denied']

export default function AllPrefires() {
  const { user } = useAuth()
  const [prefires, setPrefires] = useState([])
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPrefires = useCallback((currentFilter, currentPage, append = false) => {
    const params = new URLSearchParams({ page: currentPage })
    if (currentFilter !== 'all') params.set('status', currentFilter)

    const setter = append ? setLoadingMore : setLoading
    setter(true)

    apiFetch(`/api/prefires?${params}`)
      .then(r => r.json())
      .then(data => {
        if (append) {
          setPrefires(prev => [...prev, ...data])
        } else {
          setPrefires(data)
        }
        setHasMore(data.length === 20)
        setter(false)
      })
  }, [])

  useEffect(() => {
    setPage(1)
    fetchPrefires(filter, 1, false)
  }, [filter, fetchPrefires])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPrefires(filter, nextPage, true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-black">All Prefires</h1>
        <p className="text-muted mt-1">The full record — vote on hits, see what landed</p>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FiFilter className="text-muted" size={14} />
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
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted py-8 text-center">Loading...</div>
      ) : prefires.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-muted text-sm">
          No prefires found.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {prefires.map(prefire => (
              <PrefireCard key={prefire.id} prefire={prefire} currentUser={user} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-surface border border-border text-sm font-bold text-white hover:border-accent/50 hover:text-accent disabled:opacity-50 rounded-xl transition-colors"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
