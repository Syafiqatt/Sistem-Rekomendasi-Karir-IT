const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query(`
  CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    years_code REAL,
    education_level INTEGER,
    all_skills TEXT,
    tools TEXT,
    databases TEXT,
    top_career TEXT,
    match_score REAL,
    ai_roadmap TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => console.log('DB ready')).catch(console.error);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CareerDL API is running!' });
});

app.post('/api/analyze', async (req, res) => {
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
      `INSERT INTO analyses (years_code, education_level, all_skills, tools, databases, top_career, match_score, ai_roadmap)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        yearsCode,
        eduLevel,
        payload.all_skills,
        payload.tools,
        payload.databases,
        parsed.top_recommendations?.[0]?.career || '',
        parsed.top_recommendations?.[0]?.score || 0,
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

app.get('/api/history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM analyses ORDER BY created_at DESC LIMIT 10')
    res.json({ status: 'success', data: result.rows })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.get('/api/history/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM analyses WHERE id = $1', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ status: 'error', message: 'Not found' })
    res.json({ status: 'success', data: result.rows[0] })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.delete('/api/history', async (req, res) => {
  try {
    await pool.query('DELETE FROM analyses')
    res.json({ status: 'success', message: 'History cleared' })
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message })
  }
})

app.get('/api/vocabulary', async (req, res) => {
  try {
    const r = await fetch('http://localhost:8000/vocabulary')
    const data = await r.json()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})