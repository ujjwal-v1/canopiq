import { useNavigate } from 'react-router-dom'
import type { Plant } from '../types'

interface Props { plant: Plant }

export default function PlantCard({ plant }: Props) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/plants/${plant.id}`)}
      className="w-full text-left rounded-2xl p-4 border transition-all hover:border-[var(--green)] hover:bg-[var(--surface2)] active:scale-[0.98] animate-fade-up"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-base" style={{ color: 'var(--accent)' }}>{plant.name}</p>
          {plant.species && (
            <p className="text-xs mt-0.5 italic" style={{ color: 'var(--muted)' }}>{plant.species}</p>
          )}
        </div>
        <span className="text-xl">🪴</span>
      </div>
      <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
        Added {new Date(plant.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </button>
  )
}
