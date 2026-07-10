export type TrendPoint = { label: string; value: number }

const getLastSixMonths = () => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, index) => {
    const offset = 5 - index
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59)
    return { label: start.toLocaleDateString('en-US', { month: 'short' }), end }
  })
}

export const buildRegistrationTrend = (dates: string[]): TrendPoint[] => {
  const parsedDates = dates.map((value) => new Date(value))
  return getLastSixMonths().map((month) => ({
    label: month.label,
    value: parsedDates.filter((date) => date <= month.end).length,
  }))
}
