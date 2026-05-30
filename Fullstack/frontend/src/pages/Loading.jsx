import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const steps = [
  { label: 'Reading your profile', icon: '👤' },
  { label: 'Analyzing skills & tools', icon: '🔍' },
  { label: 'Matching career vectors', icon: '🧠' },
  { label: 'Generating recommendations', icon: '✨' },
]

export default function Loading() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const hasRun = useRef(false)

  useEffect(() => {
  if (hasRun.current) return
  hasRun.current = true

  const profileData = JSON.parse(localStorage.getItem('profileData') || '{}')

  if (!profileData?.years_code && profileData?.years_code !== 0) {
    navigate('/profile')
    return
  }

    
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 3
      if (p >= 90) { clearInterval(interval); p = 90 }
      setProgress(Math.round(p))
    }, 120)

    
    let s = 0
    const stepInterval = setInterval(() => {
      s++
      if (s >= steps.length) { clearInterval(stepInterval); return }
      setCurrentStep(s)
    }, 800)

    // Hit API
    axios.post('/api/analyze', profileData)
      .then(res => {
        localStorage.setItem('resultData', JSON.stringify(res.data.data))
        clearInterval(interval)
        clearInterval(stepInterval)
        setCurrentStep(steps.length - 1)
        setProgress(100)
        setDone(true)
        setTimeout(() => navigate('/result'), 800)
      })
      .catch(() => {
        clearInterval(interval)
        clearInterval(stepInterval)
        setError('Gagal menghubungi server. Pastikan backend berjalan.')
      })

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center p-6 pl-20 md:pl-6">
        <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">

          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${done ? 'bg-emerald-500 scale-110' : 'bg-blue-600'}`}>
            {done ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-1">
            {done ? 'Analysis Complete!' : 'Analyzing your profile'}
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            {done ? 'Redirecting to your results...' : 'Deep learning model is processing your data'}
          </p>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${done ? 'bg-emerald-500' : 'bg-blue-600'}`}
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-2 text-left mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className={`flex items-center gap-3 text-sm transition-all duration-300
                ${i < currentStep || done ? 'text-emerald-600' : i === currentStep ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all
                  ${i < currentStep || done ? 'bg-emerald-100 text-emerald-600' : i === currentStep ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-300'}`}>
                  {i < currentStep || done ? '✓' : i + 1}
                </div>
                {s.label}
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 mb-4">
              {error}
              <button onClick={() => navigate('/profile')} className="block mt-2 text-red-600 font-medium underline">
                ← Back to profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}