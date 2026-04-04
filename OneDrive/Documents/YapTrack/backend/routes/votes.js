const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

async function resolveVotes(prefireId) {
  const result = await query('SELECT vote FROM votes WHERE prefire_id = $1', [prefireId])
  const votes = result.rows
  const total = votes.length
  if (total < 3) return

  const legitCount = votes.filter(v => v.vote === 'legit').length
  const bogusCount = total - legitCount

  const newStatus = legitCount > bogusCount ? 'confirmed' : 'denied'
  await query("UPDATE prefires SET status=$1, updated_at=NOW() WHERE id=$2", [newStatus, prefireId])
}

// POST /api/votes/:prefireId
router.post('/:prefireId', requireAuth, async (req, res) => {
  const prefireId = Number(req.params.prefireId)
  const { vote } = req.body

  if (!['legit', 'bogus'].includes(vote)) {
    return res.status(400).json({ error: "Vote must be 'legit' or 'bogus'" })
  }

  try {
    const pfRes = await query('SELECT * FROM prefires WHERE id = $1', [prefireId])
    const prefire = pfRes.rows[0]
    if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
    if (prefire.status !== 'hit') return res.status(400).json({ error: "Can only vote on deployed prefires" })
    if (prefire.caller_id === req.session.userId) return res.status(403).json({ error: "You can't vote on your own prefire" })
    if (prefire.target_user_id && prefire.target_user_id === req.session.userId) {
      return res.status(403).json({ error: "You can't vote on a prefire targeting you" })
    }

    await query(
      'INSERT INTO votes (prefire_id, voter_id, vote) VALUES ($1, $2, $3)',
      [prefireId, req.session.userId, vote]
    )

    await resolveVotes(prefireId)

    const updated = await query(
      `SELECT p.*,
        COALESCE(SUM(CASE WHEN v.vote='legit' THEN 1 ELSE 0 END), 0)::int AS legit_count,
        COALESCE(SUM(CASE WHEN v.vote='bogus' THEN 1 ELSE 0 END), 0)::int AS bogus_count
       FROM prefires p
       LEFT JOIN votes v ON v.prefire_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [prefireId]
    )
    res.json(updated.rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'You already voted on this prefire' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
