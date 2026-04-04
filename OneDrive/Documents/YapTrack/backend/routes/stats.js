const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

// GET /api/stats/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.username,
        COUNT(p.id)::int AS kills,
        COUNT(p2.id)::int AS total_submitted
      FROM users u
      LEFT JOIN prefires p ON p.caller_id = u.id AND p.status = 'confirmed'
      LEFT JOIN prefires p2 ON p2.caller_id = u.id
      GROUP BY u.id
      ORDER BY kills DESC
      LIMIT 20
    `)
    const leaderboard = result.rows.map(row => ({
      ...row,
      hit_rate: row.total_submitted > 0 ? Math.round((row.kills / row.total_submitted) * 100) : 0
    }))
    res.json(leaderboard)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/stats/me
router.get('/me', requireAuth, async (req, res) => {
  const { userId, username } = req.session
  try {
    const killsRes = await query(
      `SELECT COUNT(*)::int AS kills FROM prefires WHERE caller_id = $1 AND status = 'confirmed'`,
      [userId]
    )
    const deathsRes = await query(
      `SELECT COUNT(*)::int AS deaths FROM prefires
       WHERE status = 'confirmed'
         AND (target_user_id = $1 OR (target_user_id IS NULL AND LOWER(target_name) = LOWER($2)))`,
      [userId, username]
    )

    const kills = killsRes.rows[0].kills
    const deaths = deathsRes.rows[0].deaths
    let ratio
    if (kills === 0 && deaths === 0) ratio = null
    else if (deaths === 0) ratio = 'perfect'
    else ratio = (kills / deaths).toFixed(2)

    res.json({ kills, deaths, ratio })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
