import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'

{/* Normalisasi untuk input user, guna mempersingkat inputan (ex: visual studio code > vscode) */}
const TOOL_ALIASES = {
  'vscode': 'visual studio code',
  'vs code': 'visual studio code',
  'visual studio code': 'visual studio code',
  'intellij': 'intellij idea',
  'intellij idea': 'intellij idea',
  'jupyter': 'jupyter notebook',
  'jupyter notebook': 'jupyter notebook',
  'colab': 'google colab',
  'google colab': 'google colab',
  'powerbi': 'power bi',
  'power bi': 'power bi',
  'burpsuite': 'burp suite',
  'burp suite': 'burp suite',
  'spark': 'apache spark',
  'apache spark': 'apache spark',
  'android': 'android studio',
  'pycharm': 'pycharm',
  'vim': 'vim',
  'neovim': 'neovim',
  'postman': 'postman',
  'figma': 'figma',
  'blender': 'blender',
  'unity': 'unity',
  'godot': 'godot',
  'tableau': 'tableau',
  'jira': 'jira',
  'wireshark': 'wireshark',
  'metasploit': 'metasploit',
  'selenium': 'selenium',
  'git': 'git',
  'xcode': 'xcode',
}

function TagInput({ label, field, values, onToggle, suggestions, color = 'blue', placeholder, inputRef, aliases = {} }) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  const colors = {
    blue: { tag: 'bg-blue-600 text-white', suggestion: 'hover:bg-blue-50 hover:text-blue-600', count: 'bg-blue-50 text-blue-600' },
    green: { tag: 'bg-emerald-600 text-white', suggestion: 'hover:bg-emerald-50 hover:text-emerald-600', count: 'bg-emerald-50 text-emerald-600' },
    purple: { tag: 'bg-purple-600 text-white', suggestion: 'hover:bg-purple-50 hover:text-purple-600', count: 'bg-purple-50 text-purple-600' },
  }
  const c = colors[color]

  const addTag = (val) => {
    let clean = val.trim().toLowerCase()
    if (aliases[clean]) clean = aliases[clean]
    if (clean && !values.includes(clean)) onToggle(field, clean)
    setInput('')
  }

  useImperativeHandle(inputRef, () => ({
    flush: () => { if (input.trim()) addTag(input) },
    getInput: () => input
  }))

  const filtered = input.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)).slice(0, 8)
    : []

  const handleChange = (e) => {
    const val = e.target.value
    const lastChar = val[val.length - 1]
    if (lastChar === ' ' || lastChar === ',') {
      const word = val.slice(0, -1).trim()
      if (!word) { setInput(''); return }
      const lower = word.toLowerCase()
      const resolved = aliases[lower] || lower
      const inVocab = suggestions.some(s => s.toLowerCase() === resolved)
      const isAlias = !!aliases[lower]
      if (inVocab || isAlias) {
        addTag(word)
      } else {
        setInput(val)
      }
    } else {
      setInput(val)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
    if (e.key === 'Backspace' && !input && values.length > 0) onToggle(field, values[values.length - 1])
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</label>
        {values.length > 0 && <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.count}`}>{values.length} added</span>}
      </div>
      <div className="border border-gray-200 rounded-xl px-3 py-2 bg-white min-h-[52px] flex flex-wrap gap-1.5 items-center focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition">
        {values.map(v => (
          <span key={v} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${c.tag}`}>
            {v}
            <button onClick={() => onToggle(field, v)} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
          </span>
        ))}
        <input
          type="text" value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={values.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[120px] text-sm text-gray-800 outline-none bg-transparent py-1"
        />
      </div>
      {focused && filtered.length > 0 && (
        <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10 relative">
          {filtered.map(s => (
            <button key={s} onMouseDown={() => addTag(s)} className={`w-full text-left px-4 py-2 text-sm text-gray-700 transition-colors ${c.suggestion}`}>
              {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-1.5">Ketik lalu spasi/Enter/koma untuk tambah. Backspace untuk hapus.</p>
    </div>
  )
}

let cachedVocab = null

async function fetchVocab() {
  if (cachedVocab) return cachedVocab
  const r = await fetch('/api/vocabulary')
  const data = await r.json()
  const keys = Object.keys(data)
  cachedVocab = {
    skills: data['text_vectorization_3'] || [],
    tools: data['text_vectorization_4'] || [],
    databases: data['text_vectorization_5'] || [],
  }
  return cachedVocab
}

const SkillSelector = forwardRef(function SkillSelector({ form, onToggle }, ref) {
  const [vocab, setVocab] = useState({ skills: [], tools: [], databases: [] })
  const skillRef = useRef(null)
  const toolRef = useRef(null)

  useImperativeHandle(ref, () => ({
    flush: () => {
      skillRef.current?.flush()
      toolRef.current?.flush()
    },
    hasInput: () => form.all_skills.length > 0 || skillRef.current?.getInput()?.trim().length > 0
  }))

  useEffect(() => {
    fetchVocab().then(setVocab).catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <TagInput label="Programming Skills" field="all_skills" values={form.all_skills} onToggle={onToggle} suggestions={vocab.skills} color="blue" placeholder="e.g. python, javascript, react..." inputRef={skillRef} />
      <div className="border-t border-gray-100 pt-5">
        <TagInput label="Tools & Platforms" field="tools" values={form.tools} onToggle={onToggle} suggestions={vocab.tools} color="green" placeholder="e.g. vscode, intellij, jupyter..." inputRef={toolRef} aliases={TOOL_ALIASES} />
      </div>
    </div>
  )
})

export default SkillSelector

export function DatabaseSelector({ form, onToggle }) {
  const [vocab, setVocab] = useState([])
  const dbRef = useRef(null)

  useEffect(() => {
    fetchVocab().then(v => setVocab(v.databases)).catch(() => {})
  }, [])

  return (
    <TagInput label="Databases" field="databases" values={form.databases} onToggle={onToggle} suggestions={vocab} color="purple" placeholder="e.g. postgresql, mongodb, redis..." inputRef={dbRef} />
  )
}