import { SignInButton, SignUpButton } from '@clerk/react'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-6">🌿</span>
      <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--accent)' }}>Canopiq</h1>
      <p className="text-base mb-10" style={{ color: 'var(--muted)' }}>
        Track, diagnose, and care for every plant.
      </p>
      <div className="flex gap-4">
        <SignInButton mode="modal">
          <button
            className="px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-90"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Get started
          </button>
        </SignUpButton>
      </div>
    </div>
  )
}
