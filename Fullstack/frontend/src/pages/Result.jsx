import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ReactMarkdown from 'react-markdown'

const educationLabels = {
  0: 'Diploma (D3/D4)', 1: 'Pascasarjana (S2/S3)', 2: 'Sarjana (S1)', 3: 'SMA/SMK/Sederajat'
}

function RoadmapModal({ roadmap, career }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Career Roadmap</p>
            <p className="text-xs text-gray-400">AI-generated learning path for {career}</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-950 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition">
          View Roadmap
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Career Roadmap</p>
                  <p className="text-xs text-gray-400">{career} · ✦ Gemini</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 flex-1">
              <ReactMarkdown
                components={{
                  h2: ({children}) => (
                    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
                      <div className="w-1 h-5 bg-blue-600 rounded-full flex-shrink-0" />
                      <h2 className="text-sm font-bold text-gray-900">{children}</h2>
                    </div>
                  ),
                  h3: ({children}) => (
                    <div className="flex items-center gap-2 mt-5 mb-2">
                      <div className="w-1 h-4 bg-blue-400 rounded-full flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
                    </div>
                  ),
                  strong: ({children}) => <span className="font-semibold text-gray-900">{children}</span>,
                  p: ({children}) => <p className="text-sm text-gray-500 leading-relaxed mb-3">{children}</p>,
                  ul: ({children}) => <ul className="flex flex-col gap-2 mb-4">{children}</ul>,
                  ol: ({children}) => <ol className="flex flex-col gap-2 mb-4">{children}</ol>,
                  li: ({children}) => (
                    <li className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                      <span className="text-sm text-gray-600 leading-relaxed">{children}</span>
                    </li>
                  ),
                  hr: () => <div className="border-t border-gray-100 my-4" />,
                }}
              >
                {roadmap}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Result() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selected, setSelected] = useState(null)
  const [aiRoadmap, setAiRoadmap] = useState(null)

  useEffect(() => {
    let p = null
    try { p = JSON.parse(localStorage.getItem('profileData') || 'null') } catch (_) {}
    if (p && typeof p === 'object') setProfile(p)

    let resultData = null
    try { resultData = JSON.parse(localStorage.getItem('resultData') || 'null') } catch (_) {}
    if (!resultData?.top_recommendations?.length) { navigate('/profile'); return }

    if (resultData?.ai_roadmap &&
        !resultData.ai_roadmap.startsWith('Gagal') &&
        !resultData.ai_roadmap.startsWith('Fitur Roadmap')) {
      setAiRoadmap(resultData.ai_roadmap)
    }

    const recs = resultData.top_recommendations.map((rec, idx) => ({ id: idx, career: rec.career, score: rec.score }))
    setRecommendations(recs)
    setSelected(recs[0])
  }, [])

  if (!selected) return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat hasil...</p>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 pb-24 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Results Analysis</h1>
            <p className="text-xs text-gray-400">Detailed career mapping based on your latest assessment</p>
          </div>
          <button onClick={() => navigate('/profile')}
            className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            + New Analysis
          </button>
        </div>

        {/* PROFILE SUMMARY BAR */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your Profile:</p>
            {profile.years_code > 0 && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-medium">{profile.years_code} yrs exp</span>
            )}
            {educationLabels[String(profile.education_level)] && (
              <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-lg font-medium">{educationLabels[String(profile.education_level)]}</span>
            )}
            {(profile.all_skills || '').split(' ').filter(Boolean).slice(0, 5).map(s => (
              <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-lg capitalize">{s}</span>
            ))}
            {(profile.all_skills || '').split(' ').filter(Boolean).length > 5 && (
              <span className="bg-gray-100 text-gray-400 text-xs px-2.5 py-1 rounded-lg">+{(profile.all_skills || '').split(' ').filter(Boolean).length - 5} more</span>
            )}
            <button onClick={() => navigate('/profile')} className="ml-auto text-xs text-blue-600 hover:underline">Edit Profile →</button>
          </div>
        )}

        {/* DISCLAIMER */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚠️</span>
          <p className="text-xs text-amber-700">Match score dihasilkan model deep learning berdasarkan profil kamu.</p>
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
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Best Match · {selected.score}%
            </span>
            <h2 className="text-3xl font-bold text-blue-600 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {selected.career}
            </h2>
            <p className="text-xs text-gray-400 mb-5">Rekomendasi Model AI</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Match Score</p>
                <p className="text-2xl font-bold text-gray-800">{selected.score}%</p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${selected.score}%` }} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Skills Input Kamu</p>
                <div className="flex flex-wrap gap-1">
                  {profile && (profile.all_skills || '').split(' ').filter(Boolean).slice(0, 4).map(s => (
                    <span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded capitalize">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-4">Perbandingan Top 3</p>
            <div className="flex flex-col gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-xs font-semibold ${rec.id === selected.id ? 'text-blue-600' : 'text-gray-700'}`}>{rec.career}</p>
                    <span className={`text-xs font-bold ${rec.id === selected.id ? 'text-blue-600' : 'text-gray-500'}`}>{rec.score}%</span>
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
                className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE DATA */}
        {profile && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">Data Profil yang Dianalisis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Skills', items: (profile.all_skills || '').split(' ').filter(Boolean), color: 'bg-blue-50 text-blue-700' },
                { label: 'Tools', items: (profile.tools || '').split(' ').filter(Boolean), color: 'bg-purple-50 text-purple-700' },
                { label: 'Databases', items: (profile.databases || '').split(' ').filter(s => s && s.toLowerCase() !== 'none'), color: 'bg-green-50 text-green-700' },
              ].map(({ label, items, color }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.length > 0
                      ? items.map(s => <span key={s} className={`${color} text-xs px-2 py-1 rounded capitalize`}>{s}</span>)
                      : <span className="text-xs text-gray-400">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROADMAP MODAL */}
        {aiRoadmap && <RoadmapModal roadmap={aiRoadmap} career={selected.career} />}

        <div className="h-6" />
      </main>
    </div>
  )
}
