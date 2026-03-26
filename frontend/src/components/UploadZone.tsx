import { useRef, useState } from 'react'

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFile, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handle = (file: File) => {
    if (!file.type.startsWith('image/')) return
    onFile(file)
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f) }}
      className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
      style={{
        background: drag ? 'var(--surface2)' : 'var(--surface)',
        borderColor: drag ? 'var(--green)' : 'var(--border)',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f) }}
      />
      <p className="text-4xl mb-3">📷</p>
      <p className="font-medium text-sm" style={{ color: 'var(--accent)' }}>Take or upload a photo</p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Tap to open camera · or drag & drop</p>
    </div>
  )
}
