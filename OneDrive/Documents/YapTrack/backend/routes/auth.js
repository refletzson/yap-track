const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../db')

const router = express.Router()

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3–20 characters' })
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' })
  }

  const password_hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, password_hash)

  req.session.userId = Number(result.lastInsertRowid)
  req.session.username = username

  res.status(201).json({ id: Number(result.lastInsertRowid), username })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  req.session.userId = user.id
  req.session.username = user.username

  res.json({ id: user.id, username: user.username })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null })
  }
  res.json({ user: { id: req.session.userId, username: req.session.username } })
})

module.exports = router
module.exports.requireAuth = requireAuth
