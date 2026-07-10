import { useState } from 'react'
import type { PointerEvent } from 'react'
import type { TrendPoint } from '../utils/trend'

export const TrendLineChart = ({ data }: { data: TrendPoint[] }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 320
  const height = 140
  const paddingX = 14
  const paddingTop = 16
  const paddingBottom = 22
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingTop - paddingBottom

  const values = data.map((point) => point.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const valueRange = maxValue - minValue || 1
  const stepX = data.length > 1 ? usableWidth / (data.length - 1) : 0

  const points = data.map((point, index) => ({
    x: paddingX + stepX * index,
    y: paddingTop + (1 - (point.value - minValue) / valueRange) * usableHeight,
  }))

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const gridLineRatios = [0, 0.25, 0.5, 0.75, 1]
  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    const index = data.length > 1 ? Math.round(fraction * (data.length - 1)) : 0
    setHoverIndex(index)
  }

  return (
    <div className="relative" onPointerMove={handlePointerMove} onPointerLeave={() => setHoverIndex(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Registration trend chart" className="min-h-35 w-full">
        {gridLineRatios.map((ratio) => (
          <line
            key={ratio}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingTop + ratio * usableHeight}
            y2={paddingTop + ratio * usableHeight}
            stroke="#e6e8f0"
            strokeWidth={1}
          />
        ))}

        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            x2={hoveredPoint.x}
            y1={paddingTop}
            y2={paddingTop + usableHeight}
            stroke="var(--color-brand-navy)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.35}
          />
        )}

        <path d={linePath} fill="none" stroke="var(--color-brand-navy)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => {
          const isLast = index === points.length - 1
          const isHovered = hoverIndex === index
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={isLast || isHovered ? 5 : 3}
              fill={isLast ? 'var(--color-brand-orange)' : 'var(--color-brand-navy)'}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )
        })}

        {data.map((point, index) => (
          <text key={point.label} x={points[index].x} y={height - 4} textAnchor="middle" fontSize={10} fill="#6c6f93">
            {point.label}
          </text>
        ))}

        {points.length > 0 && (
          <text
            x={points[points.length - 1].x}
            y={points[points.length - 1].y - 10}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill="var(--color-brand-orange-strong)"
          >
            {data[data.length - 1].value}
          </text>
        )}
      </svg>

      {hovered && hoveredPoint && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg bg-brand-navy px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / height) * 100}%` }}
        >
          {hovered.label}: {hovered.value} registered
        </div>
      )}
    </div>
  )
}
