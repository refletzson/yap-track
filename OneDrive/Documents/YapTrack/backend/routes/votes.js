const express = require('express')
const db = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

function resolveVotes(prefireId) {
  const votes = db.prepare('SELECT vote FROM votes WHERE prefire_id = ?').all(prefireId)
  const total = votes.length
  if (total < 3) return // not enough votes yet

  const legitCount = votes.filter(v => v.vote === 'legit').length
  const bogusCount = total - legitCount

  // Ties go to denied — caller must earn the confirm
  if (legitCount > bogusCount) {
    db.prepare("UPDATE prefires SET status='confirmed', updated_at=datetime('now') WHERE id=?").run(prefireId)
  } else {
    db.prepare("UPDATE prefires SET status='denied', updated_at=datetime('now') WHERE id=?").run(prefireId)
  }
}

// POST /api/votes/:prefireId
router.post('/:prefireId', requireAuth, (req, res) => {
  const prefireId = Number(req.params.prefireId)
  const { vote } = req.body

  if (!['legit', 'bogus'].includes(vote)) {
    return res.status(400).json({ error: "Vote must be 'legit' or 'bogus'" })
  }

  const prefire = db.prepare('SELECT * FROM prefires WHERE id = ?').get(prefireId)
  if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
  if (prefire.status !== 'hit') {
    return res.status(400).json({ error: "Can only vote on prefires with status 'hit'" })
  }
  if (prefire.caller_id === req.session.userId) {
    return res.status(403).json({ error: "You can't vote on your own prefire" })
  }
  if (prefire.target_user_id && prefire.target_user_id === req.session.userId) {
    return res.status(403).json({ error: "You can't vote on a prefire targeting you" })
  }

  try {
    db.prepare('INSERT INTO votes (prefire_id, voter_id, vote) VALUES (?, ?, ?)').run(prefireId, req.session.userId, vote)
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'You already voted on this prefire' })
    }
    throw err
  }

  resolveVotes(prefireId)

  const updated = db.prepare(`
    SELECT p.*,
      CAST(COALESCE(SUM(CASE WHEN v.vote='legit' THEN 1 ELSE 0 END), 0) AS INTEGER) as legit_count,
      CAST(COALESCE(SUM(CASE WHEN v.vote='bogus' THEN 1 ELSE 0 END), 0) AS INTEGER) as bogus_count
    FROM prefires p
    LEFT JOIN votes v ON v.prefire_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `).get(prefireId)

  res.json(updated)
})

module.exports = router
