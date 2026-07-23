import type { Company, ExamRegistration, ExamSlot, QrScanLog, Student, Teacher } from '../types'
import { paymentSplit } from '../constants/ui'
import { statusCritical, statusGood, statusWarning } from '../constants/chartColors'

export type NamedValue = { name: string; value: number }
export type ColoredNamedValue = NamedValue & { color: string }

export const groupStudentsByCompany = (students: Student[], companies: Company[]): NamedValue[] => {
  const nameById = new Map(companies.map((c) => [c.id, c.name]))
  const counts = new Map<number, number>()
  for (const c of companies) counts.set(c.id, 0)
  for (const student of students) {
    counts.set(student.companyId, counts.get(student.companyId)! + 1)
  }
  return Array.from(counts.entries())
    .map(([companyId, value]) => ({ name: nameById.get(companyId) ?? `Company #${companyId}`, value }))
    .sort((a, b) => b.value - a.value)
}

export const groupTeachersByCompany = (teachers: Teacher[], companies: Company[]): NamedValue[] => {
  const nameById = new Map(companies.map((c) => [c.id, c.name]))
  const counts = new Map<number, number>()
  for (const c of companies) counts.set(c.id, 0)
  for (const teacher of teachers) {
    counts.set(teacher.companyId, counts.get(teacher.companyId)! + 1)
  }
  return Array.from(counts.entries())
    .map(([companyId, value]) => ({ name: nameById.get(companyId) ?? `Company #${companyId}`, value }))
    .sort((a, b) => b.value - a.value)
}

export const groupStudentsByTeacher = (students: Student[], teachers: Teacher[]): NamedValue[] => {
  const nameById = new Map(teachers.map((t) => [t.id, t.name]))
  const counts = new Map<number, number>()
  for (const t of teachers) counts.set(t.id, 0)
  for (const student of students) {
    counts.set(student.teacherId, counts.get(student.teacherId)! + 1)
  }
  return Array.from(counts.entries())
    .map(([teacherId, value]) => ({ name: nameById.get(teacherId) ?? `Teacher #${teacherId}`, value }))
    .sort((a, b) => b.value - a.value)
}

const getLastNMonths = (n: number) => {
  const now = new Date()
  return Array.from({ length: n }, (_, index) => {
    const offset = n - 1 - index
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59)
    return { label: start.toLocaleDateString('en-US', { month: 'short' }), start, end }
  })
}

export const buildMonthlyRevenue = (registrations: ExamRegistration[]): NamedValue[] => {
  const months = getLastNMonths(6)
  const perPayment = paymentSplit.site + paymentSplit.school
  return months.map((month) => {
    const value = registrations.filter((r) => {
      if (!r.paid || !r.paymentDate) return false
      const date = new Date(r.paymentDate)
      return date >= month.start && date <= month.end
    }).length * perPayment
    return { name: month.label, value }
  })
}

export const buildMonthlyRegistrations = (dateStrings: string[]): NamedValue[] => {
  const months = getLastNMonths(6)
  const dates = dateStrings.map((d) => new Date(d))
  return months.map((month) => ({
    name: month.label,
    value: dates.filter((date) => date >= month.start && date <= month.end).length,
  }))
}

const getLastNDays = (n: number) => {
  const now = new Date()
  return Array.from({ length: n }, (_, index) => {
    const offset = n - 1 - index
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
    const label = day.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return { label, day }
  })
}

export const buildDailyRevenue = (registrations: ExamRegistration[], days = 7): NamedValue[] => {
  const range = getLastNDays(days)
  const perPayment = paymentSplit.site + paymentSplit.school
  return range.map(({ label, day }) => {
    const value = registrations.filter((r) => {
      if (!r.paid || !r.paymentDate) return false
      const paymentDate = new Date(r.paymentDate)
      return (
        paymentDate.getFullYear() === day.getFullYear() &&
        paymentDate.getMonth() === day.getMonth() &&
        paymentDate.getDate() === day.getDate()
      )
    }).length * perPayment
    return { name: label, value }
  })
}

export const buildDailyQrScans = (scanLogs: QrScanLog[], days = 7): NamedValue[] => {
  const range = getLastNDays(days)
  return range.map(({ label, day }) => {
    const value = scanLogs.filter((log) => {
      const scannedAt = new Date(log.scannedAt)
      return (
        scannedAt.getFullYear() === day.getFullYear() &&
        scannedAt.getMonth() === day.getMonth() &&
        scannedAt.getDate() === day.getDate()
      )
    }).length
    return { name: label, value }
  })
}

export const paymentStatusDistribution = (registrations: ExamRegistration[]): ColoredNamedValue[] => {
  const active = registrations.filter((r) => r.status === 'BOOKED')
  const paid = active.filter((r) => r.paid).length
  const awaiting = active.length - paid
  return [
    { name: 'Paid', value: paid, color: statusGood },
    { name: 'Awaiting payment', value: awaiting, color: statusWarning },
  ]
}

export const attendanceDistribution = (scanLogs: QrScanLog[]): ColoredNamedValue[] => {
  const eligible = scanLogs.filter((log) => log.eligible).length
  const ineligible = scanLogs.length - eligible
  return [
    { name: 'Eligible', value: eligible, color: statusGood },
    { name: 'Not eligible', value: ineligible, color: statusCritical },
  ]
}

export const examResultDistribution = (registrations: ExamRegistration[]): ColoredNamedValue[] => [
  { name: 'Passed', value: registrations.filter((r) => r.result === 'PASSED').length, color: statusGood },
  { name: 'Failed', value: registrations.filter((r) => r.result === 'FAILED').length, color: statusCritical },
  { name: 'Pending', value: registrations.filter((r) => r.result === 'PENDING').length, color: statusWarning },
]

// --- Rule-based "AI" analytics: real reducers over real data, no external model ---

export type DuplicateNationalIdFlag = { nationalId: string; students: Student[] }

export const detectDuplicateNationalIds = (students: Student[]): DuplicateNationalIdFlag[] => {
  const byId = new Map<string, Student[]>()
  for (const student of students) {
    const key = student.nationalId.trim()
    byId.set(key, [...(byId.get(key) ?? []), student])
  }
  return Array.from(byId.entries())
    .filter(([, group]) => group.length > 1)
    .map(([nationalId, group]) => ({ nationalId, students: group }))
}

export type RepeatedQrAttempt = { qrCode: string, attempts: number, ineligibleAttempts: number }

export const detectRepeatedQrAttempts = (scanLogs: QrScanLog[], threshold = 3): RepeatedQrAttempt[] => {
  const byCode = new Map<string, QrScanLog[]>()
  for (const log of scanLogs) {
    byCode.set(log.qrCode, [...(byCode.get(log.qrCode) ?? []), log])
  }
  return Array.from(byCode.entries())
    .filter(([, logs]) => logs.length >= threshold)
    .map(([qrCode, logs]) => ({
      qrCode,
      attempts: logs.length,
      ineligibleAttempts: logs.filter((l) => !l.eligible).length,
    }))
    .sort((a, b) => b.attempts - a.attempts)
}

export const detectUnauthorizedAttempts = (scanLogs: QrScanLog[]) =>
  scanLogs.filter((log) => !log.eligible && log.reason === 'No matching registration')

export const detectSuspiciousPayments = (registrations: ExamRegistration[]) =>
  registrations.filter((r) => r.paid && !r.paymentDate)

export type CapacityFlag = { examSlot: ExamSlot; utilization: number }

export const analyzeCapacity = (examSlots: ExamSlot[], nearFullThreshold = 0.9): CapacityFlag[] =>
  examSlots
    .filter((slot) => !slot.cancelled && slot.capacity > 0)
    .map((slot) => ({ examSlot: slot, utilization: slot.bookedCount / slot.capacity }))
    .filter((flag) => flag.utilization >= nearFullThreshold)
    .sort((a, b) => b.utilization - a.utilization)

// Simple linear extrapolation over the last N monthly buckets — a real, explainable
// projection (not a black-box model), consistent with the "rule-based analytics" scope.
export const projectNextPeriod = (series: NamedValue[]): number => {
  if (series.length < 2) return series[0]?.value ?? 0
  const n = series.length
  const xs = series.map((_, i) => i)
  const ys = series.map((point) => point.value)
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  const numerator = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0)
  const denominator = xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0)
  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = meanY - slope * meanX
  const projected = slope * n + intercept
  return Math.max(0, Math.round(projected))
}
