const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function query(text, params) {
  const res = await pool.query(text, params)
  return res
}

async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS prefires (
      id SERIAL PRIMARY KEY,
      caller_id INTEGER NOT NULL REFERENCES users(id),
      caller_name TEXT NOT NULL,
      target_name TEXT NOT NULL,
      target_user_id INTEGER REFERENCES users(id),
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','hit','confirmed','denied')),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      prefire_id INTEGER NOT NULL REFERENCES prefires(id),
      voter_id INTEGER NOT NULL REFERENCES users(id),
      vote TEXT NOT NULL CHECK(vote IN ('legit','bogus')),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(prefire_id, voter_id)
    )
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    )
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire)
  `)

  console.log('Database ready')
}

init().catch(err => {
  console.error('Database init failed:', err)
  process.exit(1)
})

module.exports = { query, pool }
