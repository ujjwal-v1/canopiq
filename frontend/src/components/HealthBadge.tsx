import type { HealthStatus } from '../types'

const config: Record<HealthStatus, { emoji: string; label: string; style: React.CSSProperties }> = {
  Good: { emoji: '🟢', label: 'Good Health',
    style: { background: 'rgba(90,173,90,0.12)', color: 'var(--green)', border: '1px solid rgba(90,173,90,0.3)' } },
  Fair: { emoji: '🟡', label: 'Fair Health',
    style: { background: 'rgba(212,168,67,0.12)', color: 'var(--warn)', border: '1px solid rgba(212,168,67,0.3)' } },
  Poor: { emoji: '🔴', label: 'Poor Health',
    style: { background: 'rgba(192,90,74,0.12)', color: 'var(--danger)', border: '1px solid rgba(192,90,74,0.3)' } },
}

export default function HealthBadge({ status }: { status: HealthStatus }) {
  const c = config[status]
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={c.style}>
      {c.emoji} {c.label}
    </span>
  )
}
