import type { DiaryEntry } from '../types'
import HealthBadge from './HealthBadge'

interface Props { entry: DiaryEntry }

export default function DiaryEntryCard({ entry }: Props) {
  const date = new Date(entry.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="rounded-2xl border overflow-hidden animate-fade-up"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderLeft: '3px solid var(--soft)' }}
    >
      {/* Top: image + meta */}
      <div className="flex gap-3 p-4">
        {entry.image_url && (
          <img
            src={entry.image_url}
            alt="plant"
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <HealthBadge status={entry.health_status} />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{date}</span>
          </div>
          {entry.diary_note && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>{entry.diary_note}</p>
          )}
        </div>
      </div>

      {/* Details (collapsible feel via simple expansion) */}
      <details className="group">
        <summary
          className="px-4 pb-3 text-xs cursor-pointer select-none"
          style={{ color: 'var(--muted)' }}
        >
          View full diagnosis ↓
        </summary>
        <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Condition</p>
            <p className="text-sm leading-relaxed">{entry.overall_condition}</p>
          </div>
          {entry.deficiencies.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Issues</p>
              <div className="flex flex-wrap gap-2">
                {entry.deficiencies.map(d => (
                  <span key={d} className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(212,168,67,0.1)', color: 'var(--warn)', border: '1px solid rgba(212,168,67,0.25)' }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
          {entry.tips.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Care Tips</p>
              <ol className="space-y-2">
                {entry.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                      style={{ background: 'var(--soft)', color: 'var(--text)' }}>
                      {i + 1}
                    </span>
                    <span style={{ color: 'var(--text)' }}>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </details>
    </div>
  )
}
