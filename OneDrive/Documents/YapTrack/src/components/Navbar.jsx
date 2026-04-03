import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiZap, FiLogOut, FiPlusCircle } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? 'text-accent' : 'text-muted hover:text-white'
    }`

  return (
    <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <NavLink to={user ? '/home' : '/login'} className="flex items-center gap-2 shrink-0">
          <FiZap className="text-accent" size={20} />
          <span className="text-xl font-black tracking-tight text-white">
            Yap<span className="text-accent">Track</span>
          </span>
        </NavLink>

        {user ? (
          <>
            {/* Nav links */}
            <div className="flex items-center gap-5">
              <NavLink to="/home" className={linkClass}>Home</NavLink>
              <NavLink to="/all-prefires" className={linkClass}>All Prefires</NavLink>
              <NavLink to="/my-prefires" className={linkClass}>Mine</NavLink>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <NavLink
                to="/submit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-accent text-black hover:bg-accent/90 transition-colors"
              >
                <FiPlusCircle size={14} />
                Prefire
              </NavLink>
              <span className="text-sm text-muted hidden sm:block">@{user.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-muted hover:text-denied transition-colors"
                title="Logout"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink
              to="/register"
              className="px-3 py-1.5 rounded-lg text-sm font-bold bg-accent text-black hover:bg-accent/90 transition-colors"
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
