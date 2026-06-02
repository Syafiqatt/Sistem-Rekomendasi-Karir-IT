import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import axios from 'axios'

export default function Settings() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: localStorage.getItem('username') || '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setError(''); setSuccess('')
    if (form.password && form.password !== form.confirmPassword) {
      setError('Password tidak cocok'); return
    }
    const payload = {}
    if (form.username !== localStorage.getItem('username')) payload.username = form.username
    if (form.password) payload.password = form.password
    if (!Object.keys(payload).length) { setError('Tidak ada perubahan'); return }

    setLoading(true)
    try {
      const res = await axios.patch('/api/user', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      setSuccess('Profil berhasil diupdate')
      setForm(f => ({ ...f, password: '', confirmPassword: '' }))
    } catch (e) {
      setError(e.response?.data?.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Kelola informasi akun kamu</p>
        </div>

        <div className="max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Username</label>
              <input type="text" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition" />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Ganti Password</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Password Baru</label>
                  <input type="password" placeholder="Minimal 6 karakter" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Konfirmasi Password</label>
                  <input type="password" placeholder="Ulangi password baru" value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            {success && <p className="text-emerald-600 text-xs">{success}</p>}

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button onClick={handleSave} disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button onClick={() => navigate('/')}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                Batal
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}