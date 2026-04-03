const { DatabaseSync } = require('node:sqlite')
const path = require('path')

const db = new DatabaseSync(path.join(__dirname, 'yaptrack.db'))

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS prefires (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_id INTEGER NOT NULL REFERENCES users(id),
    caller_name TEXT NOT NULL,
    target_name TEXT NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending','hit','confirmed','denied')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prefire_id INTEGER NOT NULL REFERENCES prefires(id),
    voter_id INTEGER NOT NULL REFERENCES users(id),
    vote TEXT NOT NULL CHECK(vote IN ('legit','bogus')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(prefire_id, voter_id)
  )
`)

module.exports = db
