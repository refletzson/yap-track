const express = require('express')
const session = require('express-session')
const cors = require('cors')

// Initialize DB on startup
require('./db')

const app = express()

// Required for secure cookies behind Railway/Vercel proxy
app.set('trust proxy', 1)

const allowedOrigins = [
  'http://localhost:5173',
  /\.vercel\.app$/
]

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )
    cb(null, allowed)
  },
  credentials: true
}))

app.use(express.json())

const isProduction = process.env.NODE_ENV === 'production'

app.use(session({
  secret: process.env.SESSION_SECRET || 'yaptrack-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/prefires', require('./routes/prefires'))
app.use('/api/votes', require('./routes/votes'))
app.use('/api/stats', require('./routes/stats'))

const PORT = 3001
app.listen(PORT, () => console.log(`YapTrack backend running on http://localhost:${PORT}`))
