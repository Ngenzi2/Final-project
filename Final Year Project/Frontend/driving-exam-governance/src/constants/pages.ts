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
  CalendarCheck,
  ListTree,
} from 'lucide-react'
import type { Page, Role } from '../types'

export const pageAccess: Record<Role, Page[]> = {
  AUTHORITY: ['overview', 'companies', 'directory', 'examSites', 'verifyQr'],
  COMPANY: ['companyOverview', 'companyTeachers', 'companyStudents'],
  TEACHER: ['teacherStudents', 'teacherTimetable', 'teacherExams'],
  STUDENT: ['studentPayment', 'studentQrTicket', 'studentTimetable'],
}

export const pageLabels: Record<Page, string> = {
  overview: 'Dashboard',
  companies: 'Companies',
  directory: 'Directory',
  examSites: 'Exam Sites',
  verifyQr: 'Verify QR',
  companyOverview: 'Overview',
  companyTeachers: 'Teachers',
  companyStudents: 'Students',
  teacherStudents: 'Students',
  teacherTimetable: 'Timetable',
  teacherExams: 'Exams',
  studentPayment: 'Payment',
  studentQrTicket: 'QR Ticket',
  studentTimetable: 'Timetable',
}

export const pageIcons: Record<Page, LucideIcon> = {
  overview: LayoutDashboard,
  companies: Building2,
  directory: ListTree,
  examSites: MapPin,
  verifyQr: ScanLine,
  companyOverview: LayoutDashboard,
  companyTeachers: GraduationCap,
  companyStudents: Users,
  teacherStudents: Users,
  teacherTimetable: Clock3,
  teacherExams: CalendarCheck,
  studentPayment: Wallet,
  studentQrTicket: QrCode,
  studentTimetable: Clock3,
}
