import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlantStore } from '../store/plantStore'
import UploadZone from '../components/UploadZone'
import DiaryEntryCard from '../components/DiaryEntryCard'
import HealthBadge from '../components/HealthBadge'
import Spinner from '../components/Spinner'
import type { DiaryEntry } from '../types'

export default function PlantPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plants, diary, loading, error, fetchPlants, setActivePlant, analyze, clearError } = usePlantStore()
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [latestEntry, setLatestEntry] = useState<DiaryEntry | null>(null)
  const fileRef = useRef<File | null>(null)

  useEffect(() => {
    if (plants.length === 0) fetchPlants()
  }, [fetchPlants, plants.length])

  useEffect(() => {
    if (id) setActivePlant(id)
  }, [id, setActivePlant])

  const plant = plants.find(p => p.id === id)

  const handleFile = (file: File) => {
    setPendingFile(file)
    fileRef.current = file
    setPreview(URL.createObjectURL(file))
    setLatestEntry(null)
  }

  const handleAnalyze = async () => {
    if (!id || !pendingFile) return
    try {
      const entry = await analyze(id, pendingFile)
      setLatestEntry(entry)
      setPendingFile(null)
      setPreview(null)
    } catch {
      // error shown via store
    }
  }

  const latestHealth = diary[0]?.health_status

  return (
    <div>
      <button onClick={() => navigate('/')} className="text-sm mb-6 flex items-center gap-1"
        style={{ color: 'var(--muted)' }}>
        ← All Plants
      </button>

      {/* Plant header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl leading-tight" style={{ color: 'var(--accent)' }}>
            {plant?.name ?? '…'}
          </h2>
          {plant?.species && (
            <p className="text-sm italic mt-0.5" style={{ color: 'var(--muted)' }}>{plant.species}</p>
          )}
          {latestHealth && <div className="mt-2"><HealthBadge status={latestHealth} /></div>}
        </div>
        <span className="text-4xl">🪴</span>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          style={{ background: 'rgba(192,90,74,0.12)', color: 'var(--danger)', border: '1px solid rgba(192,90,74,0.25)' }}
        >
          {error}
          <button onClick={clearError} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Upload + Analyze */}
      <div className="mb-8 space-y-3">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full max-h-72 object-cover rounded-2xl" />
            <button
              onClick={() => { setPreview(null); setPendingFile(null) }}
              className="absolute top-3 right-3 text-xs px-3 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'var(--accent)', border: '1px solid var(--border)' }}
            >
              Change
            </button>
          </div>
        ) : (
          <UploadZone onFile={handleFile} disabled={loading} />
        )}

        {pendingFile && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'var(--soft)', color: 'var(--text)' }}
          >
            {loading ? (
              <Spinner label="Reading leaf signals…" />
            ) : (
              <><span>🔬</span> Analyze Plant Health</>
            )}
          </button>
        )}
      </div>

      {/* Latest result inline highlight */}
      {latestEntry && (
        <div
          className="mb-6 p-4 rounded-2xl border animate-fade-up"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Latest Check-in</p>
          <HealthBadge status={latestEntry.health_status} />
          <p className="text-sm mt-2 leading-relaxed">{latestEntry.overall_condition}</p>
        </div>
      )}

      {/* Diary */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl" style={{ color: 'var(--accent)' }}>📓 Diary</h3>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{diary.length} {diary.length === 1 ? 'entry' : 'entries'}</span>
        </div>

        {diary.length === 0 && !loading ? (
          <div
            className="rounded-2xl border py-12 text-center text-sm"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            No diary entries yet. Upload a photo to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {diary.map(e => <DiaryEntryCard key={e.id} entry={e} />)}
          </div>
        )}
      </div>
    </div>
  )
}
