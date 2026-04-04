const express = require('express')
const db = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

const PREFIRE_SELECT = `
  SELECT p.*,
    CAST(COALESCE(SUM(CASE WHEN v.vote='legit' THEN 1 ELSE 0 END), 0) AS INTEGER) as legit_count,
    CAST(COALESCE(SUM(CASE WHEN v.vote='bogus' THEN 1 ELSE 0 END), 0) AS INTEGER) as bogus_count
  FROM prefires p
  LEFT JOIN votes v ON v.prefire_id = p.id
`

// GET /api/prefires/mine — must be before /:id
router.get('/mine', requireAuth, (req, res) => {
  const prefires = db.prepare(`
    ${PREFIRE_SELECT}
    WHERE p.caller_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(req.session.userId)
  res.json(prefires)
})

// GET /api/prefires — pending prefires are private (only visible to their creator)
router.get('/', (req, res) => {
  const { status, user, page = 1 } = req.query
  const offset = (Number(page) - 1) * 20
  const conditions = []
  const params = []

  // Never show other people's pending prefires
  const callerId = req.session.userId || -1
  conditions.push("(p.status != 'pending' OR p.caller_id = ?)")
  params.push(callerId)

  if (status) {
    conditions.push("p.status = ?")
    params.push(status)
  }
  if (user) {
    conditions.push("(LOWER(p.caller_name) = LOWER(?) OR LOWER(p.target_name) = LOWER(?))")
    params.push(user, user)
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  const prefires = db.prepare(`
    ${PREFIRE_SELECT}
    ${where}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 20 OFFSET ?
  `).all(...params, offset)

  res.json(prefires)
})

// POST /api/prefires
router.post('/', requireAuth, (req, res) => {
  const { target_name, description } = req.body

  if (!target_name || !description) {
    return res.status(400).json({ error: 'Target name and description are required' })
  }
  if (target_name.trim().toLowerCase() === req.session.username.toLowerCase()) {
    return res.status(400).json({ error: "You can't prefire yourself" })
  }

  // Auto-link target if they have an account
  const targetUser = db.prepare('SELECT id FROM users WHERE username = ?').get(target_name.trim())
  const target_user_id = targetUser ? targetUser.id : null

  const result = db.prepare(`
    INSERT INTO prefires (caller_id, caller_name, target_name, target_user_id, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.session.userId, req.session.username, target_name.trim(), target_user_id, description.trim())

  const prefire = db.prepare(`
    ${PREFIRE_SELECT}
    WHERE p.id = ?
    GROUP BY p.id
  `).get(Number(result.lastInsertRowid))

  res.status(201).json(prefire)
})

// PATCH /api/prefires/:id/hit
router.patch('/:id/hit', requireAuth, (req, res) => {
  const prefire = db.prepare('SELECT * FROM prefires WHERE id = ?').get(Number(req.params.id))
  if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
  if (prefire.caller_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' })
  if (prefire.status !== 'pending') return res.status(400).json({ error: 'Can only mark pending prefires as hit' })

  db.prepare("UPDATE prefires SET status='hit', updated_at=datetime('now') WHERE id=?").run(prefire.id)

  const updated = db.prepare(`
    ${PREFIRE_SELECT}
    WHERE p.id = ?
    GROUP BY p.id
  `).get(prefire.id)

  res.json(updated)
})

// PATCH /api/prefires/:id/deny
router.patch('/:id/deny', requireAuth, (req, res) => {
  const prefire = db.prepare('SELECT * FROM prefires WHERE id = ?').get(Number(req.params.id))
  if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
  if (prefire.caller_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' })
  if (prefire.status !== 'pending') return res.status(400).json({ error: 'Can only deny pending prefires' })

  db.prepare("UPDATE prefires SET status='denied', updated_at=datetime('now') WHERE id=?").run(prefire.id)

  const updated = db.prepare(`
    ${PREFIRE_SELECT}
    WHERE p.id = ?
    GROUP BY p.id
  `).get(prefire.id)

  res.json(updated)
})

module.exports = router
