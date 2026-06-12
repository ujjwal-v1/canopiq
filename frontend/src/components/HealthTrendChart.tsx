import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { DiaryEntry } from '../types'

const scoreMap: Record<string, number> = { Good: 3, Fair: 2, Poor: 1 }
const labelMap: Record<number, string> = { 3: 'Good', 2: 'Fair', 1: 'Poor' }

export default function HealthTrendChart({ entries }: { entries: DiaryEntry[] }) {
  if (entries.length < 2) return null

  const data = entries
    .slice(0, 10)
    .reverse()
    .map(e => ({
      date: new Date(e.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      score: scoreMap[e.health_status] ?? 0,
    }))

  const latest = data[data.length - 1].score
  const color = latest >= 2.5 ? '#4ade80' : latest >= 1.5 ? '#facc15' : '#f87171'

  return (
    <div className="mb-6 p-4 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Health Trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 3]}
            ticks={[1, 2, 3]}
            tickFormatter={v => labelMap[v] ?? ''}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [labelMap[Number(value)] ?? value, 'Health']}
            contentStyle={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--muted)' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
