const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('./auth')

const router = express.Router()

const PREFIRE_SELECT = `
  SELECT p.*,
    COALESCE(SUM(CASE WHEN v.vote='legit' THEN 1 ELSE 0 END), 0)::int AS legit_count,
    COALESCE(SUM(CASE WHEN v.vote='bogus' THEN 1 ELSE 0 END), 0)::int AS bogus_count
  FROM prefires p
  LEFT JOIN votes v ON v.prefire_id = p.id
`

async function getPrefireWithVotes(id) {
  const res = await query(`${PREFIRE_SELECT} WHERE p.id = $1 GROUP BY p.id`, [id])
  return res.rows[0]
}

// GET /api/prefires/mine — must be before /:id
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `${PREFIRE_SELECT} WHERE p.caller_id = $1 GROUP BY p.id ORDER BY p.created_at DESC`,
      [req.session.userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/prefires
router.get('/', async (req, res) => {
  const { status, user, page = 1 } = req.query
  const offset = (Number(page) - 1) * 20
  const conditions = []
  const params = []
  let p = 1

  // Pending prefires are private — only show caller's own
  const callerId = req.session.userId || -1
  conditions.push(`(p.status != 'pending' OR p.caller_id = $${p++})`)
  params.push(callerId)

  if (status) {
    conditions.push(`p.status = $${p++}`)
    params.push(status)
  }
  if (user) {
    conditions.push(`(LOWER(p.caller_name) = LOWER($${p++}) OR LOWER(p.target_name) = LOWER($${p++}))`)
    params.push(user, user)
  }

  params.push(offset)

  try {
    const result = await query(
      `${PREFIRE_SELECT} WHERE ${conditions.join(' AND ')} GROUP BY p.id ORDER BY p.created_at DESC LIMIT 20 OFFSET $${p}`,
      params
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/prefires
router.post('/', requireAuth, async (req, res) => {
  const { target_name, description } = req.body
  if (!target_name || !description) return res.status(400).json({ error: 'Target name and description are required' })
  if (target_name.trim().toLowerCase() === req.session.username.toLowerCase()) {
    return res.status(400).json({ error: "You can't prefire yourself" })
  }

  try {
    const targetRes = await query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [target_name.trim()])
    const target_user_id = targetRes.rows[0]?.id || null

    const result = await query(
      `INSERT INTO prefires (caller_id, caller_name, target_name, target_user_id, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.session.userId, req.session.username, target_name.trim(), target_user_id, description.trim()]
    )

    const prefire = await getPrefireWithVotes(result.rows[0].id)
    res.status(201).json(prefire)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/prefires/:id/hit
router.patch('/:id/hit', requireAuth, async (req, res) => {
  try {
    const pfRes = await query('SELECT * FROM prefires WHERE id = $1', [req.params.id])
    const prefire = pfRes.rows[0]
    if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
    if (prefire.caller_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' })
    if (prefire.status !== 'pending') return res.status(400).json({ error: 'Can only deploy pending prefires' })

    await query("UPDATE prefires SET status='hit', updated_at=NOW() WHERE id=$1", [prefire.id])
    const updated = await getPrefireWithVotes(prefire.id)
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/prefires/:id/deny
router.patch('/:id/deny', requireAuth, async (req, res) => {
  try {
    const pfRes = await query('SELECT * FROM prefires WHERE id = $1', [req.params.id])
    const prefire = pfRes.rows[0]
    if (!prefire) return res.status(404).json({ error: 'Prefire not found' })
    if (prefire.caller_id !== req.session.userId) return res.status(403).json({ error: 'Forbidden' })
    if (prefire.status !== 'pending') return res.status(400).json({ error: 'Can only mark pending prefires as missed' })

    await query("UPDATE prefires SET status='denied', updated_at=NOW() WHERE id=$1", [prefire.id])
    const updated = await getPrefireWithVotes(prefire.id)
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
