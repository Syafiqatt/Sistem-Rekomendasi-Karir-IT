import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const educationLabels = { 
  0: 'Diploma (D3/D4)', 
  1: 'Pascasarjana (S2/S3)', 
  2: 'Sarjana (S1)', 
  3: 'SMA/SMK/Sederajat' 
}

const careerColors = [
  { bg: 'bg-[#2563A9]', text: 'text-[#2563A9]' },
  { bg: 'bg-[#147A63]', text: 'text-[#147A63]' },
  { bg: 'bg-[#5A4BB7]', text: 'text-[#5A4BB7]' },
]

const careerBadgeColors = [
  'bg-blue-50 text-blue-700',
  'bg-emerald-50 text-emerald-700',
  'bg-purple-50 text-purple-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
]

function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [topCareers, setTopCareers] = useState([])
  const [history, setHistory] = useState([])
  const [breakdown, setBreakdown] = useState([
    { label: 'Basic Info', pct: 0, color: 'bg-[#2563A9]', hex: '#2563A9' },
    { label: 'Skills & Tools', pct: 0, color: 'bg-[#147A63]', hex: '#147A63' },
    { label: 'Databases', pct: 0, color: 'bg-[#5A4BB7]', hex: '#5A4BB7' },
  ])
  const [stats, setStats] = useState([
    { label: 'Career Match', value: '—', sub: 'Belum dianalisis', bg: 'bg-[#2563A9]' },
    { label: 'Job Recommendations', value: '—', sub: 'Matched for you', bg: 'bg-[#147A63]' },
    { label: 'Skills Added', value: '—', sub: 'Updated recently', bg: 'bg-[#5A4BB7]' },
    { label: 'Profile Completion', value: '—', sub: 'Nearly complete', bg: 'bg-[#9A5B05]' },
  ])

  const fetchHistory = () => {
  fetch('/api/analyses', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'success') {
        setHistory(data.data)
        if (!localStorage.getItem('profileData') && data.data.length > 0) {
          const latest = data.data[0]
          localStorage.setItem('profileData', JSON.stringify({
            years_code: latest.years_code,
            education_level: latest.education_level,
            all_skills: latest.all_skills,
            tools: latest.tools,
            databases: latest.databases,
          }))
          let topRecs = []
            try {
              topRecs = JSON.parse(latest.top_recommendations || '[]')
            } catch {
              topRecs = [{ career: latest.top_career, score: latest.match_score }]
            }
            localStorage.setItem('resultData', JSON.stringify({
              top_recommendations: topRecs,
              ai_roadmap: latest.ai_roadmap
            }))
          window.location.reload()
        }
      }
    })
    .catch(() => {})
}

  useEffect(() => {
    const profileRaw = localStorage.getItem('profileData')
    const resultRaw = localStorage.getItem('resultData')

    if (profileRaw) {
      const p = JSON.parse(profileRaw)
      setProfile(p)

      const skillCount = (p.all_skills || '').split(' ').filter(Boolean).length
      const toolCount = (p.tools || '').split(' ').filter(Boolean).length
      const dbCount = (p.databases || '').split(' ').filter(Boolean).length
      const totalItems = skillCount + toolCount + dbCount

      const hasBasic = p.years_code !== undefined && p.years_code !== '' && p.education_level !== undefined && p.education_level !== ''
      const hasSkills = skillCount > 0
      const hasTools = toolCount > 0
      const hasDatabases = dbCount > 0

      const newBreakdown = [
        { label: 'Basic Info', pct: hasBasic ? 100 : 0, color: 'bg-[#2563A9]', hex: '#2563A9' },
        { label: 'Skills & Tools', pct: hasSkills && hasTools ? 100 : hasSkills ? 50 : 0, color: 'bg-[#147A63]', hex: '#147A63' },
        { label: 'Databases', pct: hasDatabases ? 100 : 0, color: 'bg-[#5A4BB7]', hex: '#5A4BB7' },
      ]
      setBreakdown(newBreakdown)

      const completedSections = [hasBasic, hasSkills || hasTools, hasDatabases].filter(Boolean).length
      const profilePct = Math.round((completedSections / 3) * 100)

      const result = resultRaw ? JSON.parse(resultRaw) : null
      const topMatch = result?.top_recommendations?.[0]?.score
        ? Math.round(result.top_recommendations[0].score)
        : null

      setStats([
        { label: 'Career Match', value: topMatch ? `${topMatch}%` : '—', sub: topMatch ? 'From latest analysis' : 'Belum dianalisis', bg: 'bg-[#2563A9]' },
        { label: 'Job Recommendations', value: result?.top_recommendations?.length ? String(result.top_recommendations.length) : '—', sub: 'Matched for you', bg: 'bg-[#147A63]' },
        { label: 'Skills Added', value: String(totalItems), sub: 'From your profile', bg: 'bg-[#5A4BB7]' },
        { label: 'Profile Completion', value: `${profilePct}%`, sub: profilePct === 100 ? 'Complete!' : 'Nearly complete', bg: 'bg-[#9A5B05]' },
      ])
    }

    if (resultRaw) {
      const result = JSON.parse(resultRaw)
      if (result?.top_recommendations?.length > 0) {
        const mapped = result.top_recommendations.slice(0, 3).map((rec, i) => ({
          name: rec.career,
          field: 'Technology',
          score: Math.round(rec.score),
          bg: careerColors[i]?.bg || 'bg-[#2563A9]',
          text: careerColors[i]?.text || 'text-[#2563A9]',
        }))
        setTopCareers(mapped)
      }
    }

    fetchHistory()
  }, [])

  const overallPct = breakdown.every(b => b.pct === 0)
    ? 0
    : Math.round(breakdown.reduce((sum, b) => sum + b.pct, 0) / breakdown.length)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 pb-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
            {profile && (
              <p className="text-xs text-gray-400 mt-0.5">
                {educationLabels[String(profile.education_level)] || 'Sarjana (S1)'} · {profile.years_code || 0} yrs exp
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 hidden sm:block">Last analyzed today</span>
            <button onClick={() => navigate('/profile')} className="text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Analysis</button>
            <button onClick={async () => {
              localStorage.removeItem('profileData')
              localStorage.removeItem('resultData')
              await fetch('/api/analyses', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              }).catch(() => {})
              setProfile(null)
              setTopCareers([])
              setHistory([])
              setBreakdown([
                { label: 'Basic Info', pct: 0, color: 'bg-[#2563A9]', hex: '#2563A9' },
                { label: 'Skills & Tools', pct: 0, color: 'bg-[#147A63]', hex: '#147A63' },
                { label: 'Databases', pct: 0, color: 'bg-[#5A4BB7]', hex: '#5A4BB7' },
              ])
              setStats([
                { label: 'Career Match', value: '—', sub: 'Belum dianalisis', bg: 'bg-[#2563A9]' },
                { label: 'Job Recommendations', value: '—', sub: 'Matched for you', bg: 'bg-[#147A63]' },
                { label: 'Skills Added', value: '—', sub: 'Updated recently', bg: 'bg-[#5A4BB7]' },
                { label: 'Profile Completion', value: '—', sub: 'Nearly complete', bg: 'bg-[#9A5B05]' },
              ])
            }} className="text-xs px-3 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50">Clear Data</button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 text-white`}>
              <p className="text-xs text-white/70 uppercase tracking-widest mb-2">{s.label}</p>
              <p className="text-4xl font-bold mb-1">{s.value}</p>
              <p className="text-xs text-white/60">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* TOP CAREERS */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="text-sm font-semibold text-gray-700">Top career matches</p>
              {profile && (
                <button onClick={() => navigate('/result')} className="text-xs text-blue-600 hover:underline">
                  View all →
                </button>
              )}
            </div>

            {!profile ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <p className="text-sm text-gray-400">No Data</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="relative overflow-hidden flex items-center gap-2 px-8 py-2.5 text-sm font-medium rounded-lg border border-blue-400 text-blue-500 hover:text-white transition-colors duration-300 group"
                >
                  <span className="absolute inset-0 w-0 group-hover:w-full bg-blue-600 transition-all duration-300 ease-out z-0" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="8" height="8" rx="1"/>
                    <rect x="14" y="2" width="8" height="8" rx="1"/>
                    <rect x="2" y="14" width="8" height="8" rx="1"/>
                    <rect x="14" y="14" width="8" height="8" rx="1"/>
                  </svg>
                  <span className="relative z-10">Start Analysis</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {topCareers.map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.field}</p>
                      </div>
                      <span className={`text-sm font-bold ${c.text}`}>{c.score}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${c.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PROFILE BREAKDOWN */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-5">Profile breakdown</p>
            <div className="flex justify-center mb-5">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={breakdown[0].hex} strokeWidth="3.5"
                    strokeDasharray={`${breakdown[0].pct} 100`} strokeLinecap="round"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={breakdown[1].hex} strokeWidth="3.5"
                    strokeDasharray={`${breakdown[1].pct * 0.57} 100`} strokeDashoffset="-100" strokeLinecap="round"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={breakdown[2].hex} strokeWidth="3.5"
                    strokeDasharray={`${breakdown[2].pct * 0.44} 100`} strokeDashoffset="-157" strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">
                    {profile ? `${overallPct}%` : '—'}
                  </span>
                  <span className="text-xs text-gray-400">complete</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {breakdown.map((b) => (
                <div key={b.label} className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${b.color}`}></div>
                    <span>{b.label}</span>
                  </div>
                  <span className="font-medium text-gray-500">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT HISTORY */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold text-gray-700">Recent Analysis History</p>
              <span className="text-xs text-gray-400">{history.length} records</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {history.map((h, i) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{h.top_career || '—'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${careerBadgeColors[i % careerBadgeColors.length]}`}>
                        {h.top_career?.split(' ')[0] || 'IT'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 min-w-[3rem] text-right">
                      {Math.round(h.match_score)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Dashboard
