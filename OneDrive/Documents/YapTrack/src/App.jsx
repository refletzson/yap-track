import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import SubmitPrefire from './pages/SubmitPrefire'
import MyPrefires from './pages/MyPrefires'
import AllPrefires from './pages/AllPrefires'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted text-lg">Loading...</div>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/submit" element={<ProtectedRoute><SubmitPrefire /></ProtectedRoute>} />
          <Route path="/my-prefires" element={<ProtectedRoute><MyPrefires /></ProtectedRoute>} />
          <Route path="/all-prefires" element={<ProtectedRoute><AllPrefires /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
