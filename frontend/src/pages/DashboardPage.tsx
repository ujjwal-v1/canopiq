import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlantStore } from '../store/plantStore'
import PlantCard from '../components/PlantCard'

export default function DashboardPage() {
  const { plants, fetchPlants } = usePlantStore()
  const navigate = useNavigate()

  useEffect(() => { fetchPlants() }, [fetchPlants])

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h2 className="font-display text-3xl leading-snug" style={{ color: 'var(--accent)' }}>
          Your Garden
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Track, diagnose, and care for every plant.
        </p>
      </div>

      {plants.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-5xl mb-4">🌱</p>
          <p className="font-medium mb-1" style={{ color: 'var(--accent)' }}>No plants yet</p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Add your first plant to start monitoring
          </p>
          <button
            onClick={() => navigate('/plants/new')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--soft)', color: 'var(--text)' }}
          >
            ＋ Add Plant
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plants.map(p => <PlantCard key={p.id} plant={p} />)}
          <button
            onClick={() => navigate('/plants/new')}
            className="rounded-2xl border-2 border-dashed p-4 text-sm font-medium transition-all hover:border-[var(--green)] hover:bg-[var(--surface)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ＋ Add another plant
          </button>
        </div>
      )}
    </div>
  )
}
