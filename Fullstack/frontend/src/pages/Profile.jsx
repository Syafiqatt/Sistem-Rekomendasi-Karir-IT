import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SkillSelector, { DatabaseSelector } from '../components/SkillSelector'

const educationOptions = [
  { label: 'SMA / SMK / Sederajat', value: 3 }, 
  { label: 'Diploma (D3 / D4)', value: 0 }, 
  { label: 'Sarjana (S1)', value: 2 }, 
  { label: 'Pascasarjana (S2 / S3)', value: 1 }
]

const steps = ['Basic Info', 'Skills & Tools', 'Databases']
const tips = ['More experience data means more accurate career matching.', "Select all skills you're comfortable with, even beginner-level ones.", 'Database knowledge is highly valued for backend & data roles.']

function Profile() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ years_code: '', education_level: '', all_skills: [], tools: [], databases: [] })
  const skillSelectorRef = useRef(null)

  const toggle = (field, item) => setForm(p => ({
    ...p,
    [field]: p[field].includes(item) ? p[field].filter(i => i !== item) : [...p[field], item]
  }))

  const handleNext = () => {
    if (step === 1) {
      if (!form.years_code) { alert('Isi tahun pengalaman coding dulu!'); return }
      if (parseFloat(form.years_code) < 0 || parseFloat(form.years_code) > 50) { alert('Tahun pengalaman harus antara 0-50!'); return }
      if (form.education_level === '' || form.education_level === undefined) { alert('Pilih jenjang pendidikan dulu!'); return }
      return setStep(step + 1)
    }

    if (step === 2) {
      skillSelectorRef.current?.flush()
      setTimeout(() => {
        if (!skillSelectorRef.current?.hasInput() && form.all_skills.length === 0) {
          alert('Isi minimal 1 skill dulu!')
          return
        }
        setStep(3)
      }, 50)
      return
    }

    localStorage.setItem('profileData', JSON.stringify({
      years_code: parseFloat(form.years_code) || 0,
      education_level: parseInt(form.education_level) || 0,
      all_skills: form.all_skills.join(' '),
      tools: form.tools.join(' '),
      databases: form.databases.join(' '),
    }))
    navigate('/loading')
  }

  const progressItems = [
    { label: 'Basic Info', color: 'bg-blue-600', pct: step > 1 ? 100 : step === 1 ? 50 : 0, status: step > 1 ? '✓ Done' : step === 1 ? 'In progress' : 'Pending' },
    { label: 'Skills & Tools', color: 'bg-emerald-600', pct: step > 2 ? 100 : step === 2 ? 50 : 0, status: step > 2 ? '✓ Done' : step === 2 ? 'In progress' : 'Pending' },
    { label: 'Databases', color: 'bg-purple-600', pct: step === 3 ? 50 : 0, status: step === 3 ? 'In progress' : 'Pending' },
  ]

  const summaryItems = [
    { label: 'Experience', value: `${form.years_code || 0} years` },
    { label: 'Education', value: educationOptions.find(e => e.value === parseInt(form.education_level))?.label || '-' },
    { label: 'Skills', value: `${form.all_skills.length} selected` },
    { label: 'Tools', value: `${form.tools.length} selected` },
    { label: 'Databases', value: `${form.databases.length} selected` },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 pl-20 md:pl-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Build Your Profile</h1>
            <p className="text-xs text-gray-400 mt-0.5">Fill in your details to get personalized career recommendations</p>
          </div>
          <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">Step {step} of {steps.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-7">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'} ${step === i + 1 ? 'ring-4 ring-blue-500/20' : ''}`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap font-medium ${step === i + 1 ? 'text-gray-800' : step > i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 mb-5 rounded-full ${step > i + 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Years of Coding Experience</label>
                  <input type="number" min="0" max="50" placeholder="e.g. 2" value={form.years_code}
                    onChange={e => setForm({ ...form, years_code: e.target.value })}
                    onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Education Level</label>
                  <select value={form.education_level} onChange={e => setForm({ ...form, education_level: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition bg-white">
                    <option value="">Select education level...</option>
                    {educationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && <SkillSelector ref={skillSelectorRef} form={form} onToggle={toggle} />}

            {step === 3 && (
              <div className="flex flex-col gap-6">
                <DatabaseSelector form={form} onToggle={toggle} />
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Summary</p>
                  <div className="flex flex-col gap-2">
                    {summaryItems.map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-medium text-gray-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-100">
              <button onClick={() => setStep(step - 1)} className={`text-sm px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition ${step === 1 ? 'invisible' : ''}`}>← Back</button>
              <button onClick={handleNext} className="text-sm px-7 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium">{step === 3 ? 'Analyze →' : 'Next →'}</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Profile Completion</p>
              <div className="flex flex-col gap-3">
                {progressItems.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${item.status.includes('Done') ? 'text-emerald-600' : item.status === 'In progress' ? 'text-gray-500' : 'text-gray-300'}`}>{item.status}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-3">Summary</p>
              <div className="flex flex-col">
                {summaryItems.map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Pro Tip</p>
                <p className="text-xs text-gray-500 leading-relaxed">{tips[step - 1]}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile