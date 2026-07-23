import { Building2, CheckCircle2, GraduationCap, QrCode, Wallet } from 'lucide-react'
import type { ActivityItem } from '../components/ActivityTimeline'
import type { Company, ExamRegistration, QrScanLog, Student, Teacher } from '../types'

const timeAgo = (isoOrDate: string) => {
  const date = new Date(isoOrDate)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export type ActivityFeedInput = {
  companies?: Company[]
  teachers?: Teacher[]
  students?: Student[]
  registrations?: ExamRegistration[]
  scanLogs?: QrScanLog[]
}

export const buildActivityFeed = (input: ActivityFeedInput, limit = 12): ActivityItem[] => {
  const items: (ActivityItem & { sortKey: number })[] = []

  for (const company of input.companies ?? []) {
    items.push({
      id: `company-registered-${company.id}`,
      icon: Building2,
      title: `${company.name} registered`,
      description: 'New driving company registration',
      timestamp: timeAgo(company.registrationDate),
      sortKey: new Date(company.registrationDate).getTime(),
    })
    if (company.approvalDate) {
      items.push({
        id: `company-approved-${company.id}`,
        icon: CheckCircle2,
        title: `${company.name} approved`,
        description: 'Company approved by the examination authority',
        timestamp: timeAgo(company.approvalDate),
        sortKey: new Date(company.approvalDate).getTime(),
      })
    }
    if (company.suspensionDate) {
      items.push({
        id: `company-suspended-${company.id}-${company.suspensionDate}`,
        icon: Building2,
        title: `${company.name} suspended`,
        description: 'Company suspended by the examination authority',
        timestamp: timeAgo(company.suspensionDate),
        sortKey: new Date(company.suspensionDate).getTime(),
      })
    }
  }

  for (const teacher of input.teachers ?? []) {
    items.push({
      id: `teacher-registered-${teacher.id}`,
      icon: GraduationCap,
      title: `${teacher.name} joined as a teacher`,
      timestamp: timeAgo(teacher.registeredAt),
      sortKey: new Date(teacher.registeredAt).getTime(),
    })
  }

  for (const student of input.students ?? []) {
    items.push({
      id: `student-registered-${student.id}`,
      icon: GraduationCap,
      title: `${student.name} registered`,
      description: 'New student registration',
      timestamp: timeAgo(student.registeredAt),
      sortKey: new Date(student.registeredAt).getTime(),
    })
  }

  for (const registration of input.registrations ?? []) {
    if (registration.paid && registration.paymentDate) {
      items.push({
        id: `payment-${registration.id}`,
        icon: Wallet,
        title: `${registration.studentName} completed payment`,
        description: registration.examSlotName,
        timestamp: timeAgo(registration.paymentDate),
        sortKey: new Date(registration.paymentDate).getTime(),
      })
    }
  }

  for (const log of input.scanLogs ?? []) {
    items.push({
      id: `scan-${log.id}`,
      icon: QrCode,
      title: log.studentName ? `${log.studentName} scanned at exam site` : 'QR code scanned',
      description: log.eligible ? 'Eligible' : log.reason ?? 'Not eligible',
      timestamp: timeAgo(log.scannedAt),
      sortKey: new Date(log.scannedAt).getTime(),
    })
  }

  return items
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, limit)
    .map((item): ActivityItem => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      timestamp: item.timestamp,
      description: item.description,
    }))
}
