import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Building2,
  MapPin,
  GraduationCap,
  Users,
  ScanLine,
  Wallet,
  QrCode,
  Clock3,
} from 'lucide-react'
import type { Page, Role } from '../types'

export const pageAccess: Record<Role, Page[]> = {
  AUTHORITY: ['overview', 'companies', 'examSites', 'verifyQr'],
  COMPANY: ['companyOverview', 'companyTeachers', 'companyStudents'],
  TEACHER: ['teacher'],
  STUDENT: ['studentPayment', 'studentQrTicket', 'studentTimetable'],
}

export const pageLabels: Record<Page, string> = {
  overview: 'Dashboard',
  companies: 'Companies',
  examSites: 'Exam Sites',
  verifyQr: 'Verify QR',
  companyOverview: 'Overview',
  companyTeachers: 'Teachers',
  companyStudents: 'Students',
  teacher: 'Teachers',
  studentPayment: 'Payment',
  studentQrTicket: 'QR Ticket',
  studentTimetable: 'Timetable',
}

export const pageIcons: Record<Page, LucideIcon> = {
  overview: LayoutDashboard,
  companies: Building2,
  examSites: MapPin,
  verifyQr: ScanLine,
  companyOverview: LayoutDashboard,
  companyTeachers: GraduationCap,
  companyStudents: Users,
  teacher: GraduationCap,
  studentPayment: Wallet,
  studentQrTicket: QrCode,
  studentTimetable: Clock3,
}
