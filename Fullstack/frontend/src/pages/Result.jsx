import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ReactMarkdown from 'react-markdown'

const educationLabels = { 
  0: 'Diploma (D3/D4)', 
  1: 'Pascasarjana (S2/S3)', 
  2: 'Sarjana (S1)', 
  3: 'SMA/SMK/Sederajat' 
}

export default function Result() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selected, setSelected] = useState(null)
  const [aiRoadmap, setAiRoadmap] = useState(null)

  useEffect(() => {
    let p = null
    try {
      const raw = localStorage.getItem('profileData')
      p = raw ? JSON.parse(raw) : null
    } catch (_) { p = null }
    if (p && typeof p === 'object') setProfile(p)

    let resultData = null
    try {
      const resultRaw = localStorage.getItem('resultData')
      resultData = resultRaw ? JSON.parse(resultRaw) : null
    } catch (_) { resultData = null }

    if (!resultData?.top_recommendations?.length) {
      navigate('/profile')
      return
    }

    if (resultData?.ai_roadmap &&
        !resultData.ai_roadmap.startsWith('Gagal') &&
        !resultData.ai_roadmap.startsWith('Fitur Roadmap')) {
      setAiRoadmap(resultData.ai_roadmap)
    }

    if (resultData?.top_recommendations?.length > 0) {
      const recs = resultData.top_recommendations.map((rec, idx) => {
        return {
          id: idx,
          career: rec.career,
          score: rec.score,
        }
      })
      setRecommendations(recs)
      setSelected(recs[0])
    }
  }, [])

  if (!selected) return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 50%, #f0f7ff 100%)' }}>
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat hasil...</p>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f0ff 50%, #f0f7ff 100%)' }}>
      <Sidebar />

      <main className="flex-1 p-6 pl-20 md:pl-6 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Results Analysis</h1>
            <p className="text-xs text-gray-400">Detailed career mapping based on your latest assessment</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 hidden sm:block">Last analyzed today</span>
          <button onClick={() => navigate('/profile')}
            className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            + New Analysis
          </button>
        </div>
        </div>

        {/* PROFILE SUMMARY BAR */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Profile:</p>
            {profile.years_code > 0 && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                {profile.years_code} yrs exp
              </span>
            )}
            {educationLabels[String(profile.education_level)] && (
              <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                {educationLabels[String(profile.education_level)]}
              </span>
            )}
            {(profile.all_skills || '').split(' ').filter(Boolean).slice(0, 5).map(s => (
              <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg capitalize">{s}</span>
            ))}
            {(profile.all_skills || '').split(' ').filter(Boolean).length > 5 && (
              <span className="bg-gray-100 text-gray-400 text-xs px-2.5 py-1 rounded-lg">
                +{(profile.all_skills || '').split(' ').filter(Boolean).length - 5} more
              </span>
            )}
            <button onClick={() => navigate('/profile')}
              className="ml-auto text-xs text-blue-600 hover:underline">
              Edit Profile →
            </button>
          </div>
        )}

        {/* DISCLAIMER */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚠️</span>
          <p className="text-xs text-amber-700">
            Match score dihasilkan model deep learning berdasarkan profil kamu.
          </p>
        </div>

        {/* CAREER TABS */}
        <div className="flex flex-wrap gap-2 mb-5">
          {recommendations.map((rec) => (
            <button key={rec.id} onClick={() => setSelected(rec)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                ${selected.id === rec.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${selected.id === rec.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {rec.score}%
              </span>
              {rec.career}
            </button>
          ))}
        </div>

        {/* HERO CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  Best Match · {selected.score}%
                </span>
                <h2 className="text-3xl font-bold text-blue-600" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selected.career}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Rekomendasi Model AI</p>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Match Score</p>
                <p className="text-2xl font-bold text-gray-800">{selected.score}%</p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${selected.score}%` }} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Skills Input Kamu</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile && (profile.all_skills || '').split(' ').filter(Boolean).slice(0, 4).map(s => (
                    <span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded capitalize">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CAREER COMPARISON */}
          <div className="rounded-2xl p-5 shadow-sm border border-white/40"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
            <p className="text-sm font-semibold text-gray-700 mb-4">Perbandingan Top 3</p>
            <div className="flex flex-col gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-xs font-semibold ${rec.id === selected.id ? 'text-blue-600' : 'text-gray-700'}`}>
                      {rec.career}
                    </p>
                    <span className={`text-xs font-bold ${rec.id === selected.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {rec.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full transition-all duration-500 ${rec.id === selected.id ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: `${rec.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => navigate('/profile')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                Analisis Ulang
              </button>
              <button onClick={() => navigate('/')}
                className="w-full py-2.5 bg-gray-100 text-blue-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE INPUT SUMMARY */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Data Profil yang Dianalisis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(profile.all_skills || '').split(' ').filter(Boolean).map(s => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded capitalize">{s}</span>
                  ))}
                  {!(profile.all_skills || '').trim() && <span className="text-xs text-gray-400">—</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tools</p>
                <div className="flex flex-wrap gap-1">
                  {(profile.tools || '').split(' ').filter(Boolean).map(s => (
                    <span key={s} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded capitalize">{s}</span>
                  ))}
                  {!(profile.tools || '').trim() && <span className="text-xs text-gray-400">—</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Databases</p>
                <div className="flex flex-wrap gap-1">
                  {(profile.databases || '').split(' ').filter(s => s && s.toLowerCase() !== 'none').map(s => (
                    <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded capitalize">{s}</span>
                  ))}
                  {(!(profile.databases || '').trim() || profile.databases?.toLowerCase() === 'none') && 
                    <span className="text-xs text-gray-400">—</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {aiRoadmap && (
          <div className="rounded-2xl p-6 mb-4 border border-white/50"
            style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div>
                <p className="text-base font-semibold text-gray-800">Career Roadmap</p>
                <p className="text-xs text-gray-400 mt-0.5">{selected.career}</p>
              </div>
              <span className="text-xs text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full">✦ Gemini</span>
            </div>

            <ReactMarkdown
              components={{
                h3: ({children}) => (
                  <h3 className="text-sm font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
                ),
                h2: ({children}) => (
                  <h2 className="text-sm font-semibold text-gray-800 mt-6 mb-3">{children}</h2>
                ),
                strong: ({children}) => (
                  <span className="font-semibold text-gray-800">{children}</span>
                ),
                p: ({children}) => (
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{children}</p>
                ),
                ul: ({children}) => (
                  <ul className="flex flex-col gap-2 mb-4 pl-1">{children}</ul>
                ),
                ol: ({children}) => (
                  <ol className="flex flex-col gap-4 mb-4 counter-reset-item">{children}</ol>
                ),
                li: ({children}) => (
                  <li className="text-sm text-gray-600 leading-relaxed pl-4 border-l border-gray-100">
                    {children}
                  </li>
                ),
                hr: () => <div className="border-t border-gray-100 my-5" />,
              }}
            >
              {aiRoadmap}
            </ReactMarkdown>
          </div>
        )}
        <div className="h-6" />
      </main>
    </div>
  )
}