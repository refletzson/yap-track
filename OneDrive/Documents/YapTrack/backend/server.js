const express = require('express')
const session = require('express-session')
const cors = require('cors')

// Initialize DB on startup
require('./db')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use(session({
  secret: 'yaptrack-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/prefires', require('./routes/prefires'))
app.use('/api/votes', require('./routes/votes'))
app.use('/api/stats', require('./routes/stats'))

const PORT = 3001
app.listen(PORT, () => console.log(`YapTrack backend running on http://localhost:${PORT}`))
