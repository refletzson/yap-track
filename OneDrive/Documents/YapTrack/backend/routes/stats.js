const express = require('express')
const db = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

// GET /api/stats/leaderboard
router.get('/leaderboard', (req, res) => {
  const rows = db.prepare(`
    SELECT u.id, u.username,
      CAST(COUNT(p.id) AS INTEGER) as kills,
      CAST(COUNT(CASE WHEN p2.status = 'confirmed' THEN 1 END) AS INTEGER) as total_submitted
    FROM users u
    LEFT JOIN prefires p ON p.caller_id = u.id AND p.status = 'confirmed'
    LEFT JOIN prefires p2 ON p2.caller_id = u.id
    GROUP BY u.id
    ORDER BY kills DESC
    LIMIT 20
  `).all()

  // Compute hit rate
  const leaderboard = rows.map(row => ({
    ...row,
    hit_rate: row.total_submitted > 0
      ? Math.round((row.kills / row.total_submitted) * 100)
      : 0
  }))

  res.json(leaderboard)
})

// GET /api/stats/me
router.get('/me', requireAuth, (req, res) => {
  const { userId, username } = req.session

  const { kills } = db.prepare(`
    SELECT CAST(COUNT(*) AS INTEGER) as kills FROM prefires
    WHERE caller_id = ? AND status = 'confirmed'
  `).get(userId)

  const { deaths } = db.prepare(`
    SELECT CAST(COUNT(*) AS INTEGER) as deaths FROM prefires
    WHERE status = 'confirmed'
      AND (
        target_user_id = ?
        OR (target_user_id IS NULL AND LOWER(target_name) = LOWER(?))
      )
  `).get(userId, username)

  let ratio
  if (kills === 0 && deaths === 0) ratio = null
  else if (deaths === 0) ratio = 'perfect'
  else ratio = (kills / deaths).toFixed(2)

  res.json({ kills, deaths, ratio })
})

module.exports = router
