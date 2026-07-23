import type { ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'
import { chartCardClass } from '../constants/ui'

export type ChartCardProps = {
  title: string
  subtitle?: string
  height?: number
  children: ReactElement
}

export const ChartCard = ({ title, subtitle, height = 220, children }: ChartCardProps) => {
  return (
    <div className={chartCardClass}>
      <div className="flex items-center justify-between gap-3 font-bold text-[#5e7184]">
        <span>{title}</span>
        {subtitle && <strong className="text-brand-orange-strong">{subtitle}</strong>}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
