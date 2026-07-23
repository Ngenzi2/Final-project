import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export type StatCardProps = {
  icon: LucideIcon
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  color?: string
  highlighted?: boolean
}

export const StatCard = ({ icon: Icon, label, value, delta, trend = 'flat', color = '#0B3B6E', highlighted = false }: StatCardProps) => {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp

  if (highlighted) {
    const trendColor = trend === 'down' ? '#fca5a5' : '#86efac'
    return (
      <div className="grid gap-2 rounded-2xl bg-gradient-to-br from-brand-navy to-[#0a2540] p-4 shadow-[0_12px_28px_rgba(18,56,91,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(18,56,91,0.4)]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white">
          <Icon size={17} strokeWidth={2} />
        </span>
        <span className="text-[0.82rem] text-white/70">{label}</span>
        <div className="flex items-baseline justify-between gap-2">
          <strong className="text-[1.35rem] tracking-tight text-white">{value}</strong>
          {delta && (
            <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold" style={{ color: trendColor }}>
              <TrendIcon size={13} strokeWidth={2.5} />
              {delta}
            </span>
          )}
        </div>
      </div>
    )
  }

  const trendColor = trend === 'down' ? '#EF4444' : trend === 'up' ? '#22C55E' : '#6B7280'

  return (
    <div className="grid gap-1.5 rounded-2xl border border-[#eef0f6] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="text-[0.82rem] text-[#6B7280]">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <strong className="text-[1.2rem] tracking-tight text-[#1F2937]">{value}</strong>
        {delta && (
          <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold" style={{ color: trendColor }}>
            <TrendIcon size={13} strokeWidth={2.5} />
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
