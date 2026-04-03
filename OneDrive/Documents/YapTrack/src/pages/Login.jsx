import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiZap } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <FiZap className="text-accent mx-auto mb-3" size={32} />
          <h1 className="text-3xl font-black">Welcome back.</h1>
          <p className="text-muted mt-1 text-sm">Log in to track your prefires</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="your_username"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-surface-2 border border-border rounded-lg text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
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
              className="w-full py-2.5 bg-accent text-black font-black rounded-lg hover:bg-accent/90 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          No account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
