import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CAREERS = [
  'Software Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Cloud Architect',
  'AI Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
]

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const [careerIdx, setCareerIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = CAREERS[careerIdx]
    let timeout
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx + 1)); setCharIdx(c => c + 1) }, 60)
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => { setDisplayed(current.slice(0, charIdx - 1)); setCharIdx(c => c - 1) }, 30)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setCareerIdx(i => (i + 1) % CAREERS.length)
    }
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, careerIdx])

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError('Username dan password wajib diisi'); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`/api/${mode}`, form)
      
      if (mode === 'register') {
          localStorage.removeItem('profileData')
          localStorage.removeItem('resultData')
          setMode('login')
          setForm({ username: form.username, password: '' })
        }else {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('username', res.data.username)
        navigate('/')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* PANEL KIRI */}
      <div className="hidden md:flex md:w-[45%] lg:w-[55%] bg-[#0d1117] flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">CareerMatch</span>
          <span className="text-[10px] font-mono text-white/20">v2.4.1</span>
        </div>

        {/* Branding & Typing Animation */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-400 font-medium tracking-wide">AI-Powered</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-[1.2] mb-3">
            Jadilah seorang
          </h2>
          <div className="text-3xl lg:text-4xl font-black text-blue-400 leading-[1.2] mb-3 min-h-[48px] flex items-center">
            {displayed}
            <span className="inline-block w-[3px] h-8 bg-blue-400 ml-1 animate-pulse rounded-full" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-[1.2] mb-5">
            yang kamu mau.
          </h2>
          <p className="text-white/35 text-xs lg:text-sm leading-relaxed max-w-sm">
            Sistem rekomendasi karir berbasis deep learning yang menganalisis skill, tools, dan pengalaman kamu secara personal.
          </p>
        </div>

        {/* Fitur Utama */}
        <div className="flex flex-col gap-3 relative">
          {[
            { emoji: '🎯', text: 'Rekomendasi personal berbasis AI' },
            { emoji: '📊', text: 'Analisis multi-input mendalam' },
            { emoji: '🛣️', text: 'Career roadmap otomatis' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm flex-shrink-0">{f.emoji}</div>
              <span className="text-xs text-white/35">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL KANAN */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] px-8">
        <div className="w-full max-w-[360px]">

          {/* Logo khusus tampilan Mobile */}
          <div className="flex items-center gap-2 mb-10 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-sm">CareerMatch</span>
          </div>

          <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
            {mode === 'login' ? 'Selamat datang 👋' : 'Buat akun baru ✨'}
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            {mode === 'login' ? 'Masuk untuk melanjutkan analisis karir kamu' : 'Daftar gratis dan mulai analisis karir'}
          </p>

          {/* FIELDS */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Username</label>
              <input type="text" placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 transition" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
              <input type="password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 transition" />
            </div>
          </div>

          {error && (
            <div className="mt-4 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-500 text-xs">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25">
            {loading ? 'Loading...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-5">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-blue-600 hover:text-blue-700 font-bold transition">
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}