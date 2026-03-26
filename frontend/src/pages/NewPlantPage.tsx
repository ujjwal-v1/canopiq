import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlantStore } from '../store/plantStore'

export default function NewPlantPage() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const { createPlant } = usePlantStore()
  const navigate = useNavigate()

  const submit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const plant = await createPlant(name.trim())
      navigate(`/plants/${plant.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm mb-6 flex items-center gap-1"
        style={{ color: 'var(--muted)' }}>
        ← Back
      </button>

      <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--accent)' }}>New Plant</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Give your plant a name to start its diary.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            Plant Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. Balcony Basil, Window Monstera…"
            maxLength={60}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            autoFocus
          />
        </div>

        <button
          onClick={submit}
          disabled={!name.trim() || saving}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--soft)', color: 'var(--text)' }}
        >
          {saving ? 'Creating…' : 'Create Plant →'}
        </button>
      </div>
    </div>
  )
}
