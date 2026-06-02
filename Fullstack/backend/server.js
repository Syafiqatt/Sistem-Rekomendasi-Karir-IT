const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'careermatch_secret_key'

const app = express();
const PORT = process.env.PORT || 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('Users table ready')
  return pool.query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      years_code REAL,
      education_level INTEGER,
      all_skills TEXT,
      tools TEXT,
      databases TEXT,
      top_career TEXT,
      match_score REAL,
      top_recommendations TEXT,
      ai_roadmap TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}).then(() => {
  console.log('DB ready')
}).catch(console.error)

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi' })
  if (password.length < 6) return res.status(400).json({ status: 'error', message: 'Password minimal 6 karakter' })
  try {
    const hashed = await bcrypt.hash(password, 10)
    const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username', [username, hashed])
    const token = jwt.sign({ id: result.rows[0].id, username }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ status: 'success', token, username })
  } catch (e) {
    res.status(400).json({ status: 'error', message: 'Username sudah dipakai' })
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi' })
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (!result.rows.length) return res.status(401).json({ status: 'error', message: 'Username tidak ditemukan' })
    const valid = await bcrypt.compare(password, result.rows[0].password)
    if (!valid) return res.status(401).json({ status: 'error', message: 'Password salah' })
    const token = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ status: 'success', token, username: result.rows[0].username })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ status: 'error', message: 'Token tidak ada' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ status: 'error', message: 'Token tidak valid' })
  }
}

app.post('/api/analyses', authMiddleware, async (req, res) => {
  const payload = req.body

  const yearsCode = parseFloat(payload.years_code)
  const eduLevel = parseInt(payload.education_level)
  if (isNaN(yearsCode) || yearsCode < 0 || yearsCode > 50) {
    return res.status(400).json({ status: 'error', message: 'years_code tidak valid' })
  }
  if (isNaN(eduLevel) || ![0, 1, 2, 3].includes(eduLevel)) {
    return res.status(400).json({ status: 'error', message: 'education_level tidak valid' })
  }

  for (const field of ['all_skills', 'tools', 'databases']) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      payload[field] = 'none'
    }
  }

  try {
    const aiRes = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const parsed = await aiRes.json()

    await pool.query(
      `INSERT INTO analyses (user_id, years_code, education_level, all_skills, tools, databases, top_career, match_score, top_recommendations, ai_roadmap)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        req.user.id,
        yearsCode,
        eduLevel,
        payload.all_skills,
        payload.tools,
        payload.databases,
        parsed.top_recommendations?.[0]?.career || '',
        parsed.top_recommendations?.[0]?.score || 0,
        JSON.stringify(parsed.top_recommendations || []),
        parsed.ai_roadmap || ''
      ]
    )

    res.json({ status: 'success', data: parsed })
  } catch (e) {
    console.error(e)
    const isPythonDown = e.cause?.code === 'ECONNREFUSED' || e.message?.includes('ECONNREFUSED')
    res.status(500).json({
      status: 'error',
      message: isPythonDown
        ? 'AI service tidak bisa dihubungi. Pastikan FastAPI (port 8000) sudah berjalan.'
        : e.message
    })
  }
})


app.get('/api/analyses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    )
    res.json({ status: 'success', data: result.rows })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.get('/api/analyses/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!result.rows.length) return res.status(404).json({ status: 'error', message: 'Not found' })
    res.json({ status: 'success', data: result.rows[0] })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.delete('/api/analyses', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM analyses WHERE user_id = $1', [req.user.id])
    res.json({ status: 'success', message: 'History cleared' })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.patch('/api/user', authMiddleware, async (req, res) => {
  const { username, password } = req.body
  if (!username && !password) return res.status(400).json({ status: 'error', message: 'Minimal isi salah satu field' })
  try {
    if (username) {
      await pool.query('UPDATE users SET username = $1 WHERE id = $2', [username, req.user.id])
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ status: 'error', message: 'Password minimal 6 karakter' })
      const hashed = await bcrypt.hash(password, 10)
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id])
    }
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.user.id])
    const newToken = jwt.sign({ id: result.rows[0].id, username: result.rows[0].username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ status: 'success', token: newToken, username: result.rows[0].username })
  } catch (e) {
    res.status(400).json({ status: 'error', message: 'Username sudah dipakai' })
  }
})

app.get('/api/vocabulary', async (req, res) => {
  try {
    const r = await fetch('http://localhost:8000/vocabulary')
    const data = await r.json()
    res.json({ status: 'success', data })
  } catch (e) {
    const isPythonDown = e.cause?.code === 'ECONNREFUSED'
    res.status(500).json({
      status: 'error',
      message: isPythonDown
        ? 'AI service tidak bisa dihubungi. Pastikan FastAPI (port 8000) sudah berjalan.'
        : e.message
    })
  }
})

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
