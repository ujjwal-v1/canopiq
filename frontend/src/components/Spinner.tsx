export default function Spinner({ label = 'Analyzing…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-4 px-1">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--green)',
              animation: `spin 1.2s ${i * 0.2}s infinite`,
              animationName: 'bounce-dot',
            }}
          />
        ))}
      </div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
