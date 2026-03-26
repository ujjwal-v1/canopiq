import { Outlet, NavLink, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <NavLink to="/" className="flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="font-display text-xl leading-tight" style={{ color: 'var(--accent)' }}>Canopiq</h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>plant health monitor</p>
          </div>
        </NavLink>
        <button
          onClick={() => navigate('/plants/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'var(--soft)', color: 'var(--text)' }}
        >
          ＋ New Plant
        </button>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
