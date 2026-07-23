import type { Company, ExamRegistration, ExamSlot, Student, Teacher } from '../types'
import { paymentSplit } from '../constants/ui'

export const computeCompanyStats = (companies: Company[]) => ({
  total: companies.length,
  approved: companies.filter((c) => c.approved && !c.suspended).length,
  pending: companies.filter((c) => !c.approved && !c.suspended).length,
  suspended: companies.filter((c) => c.suspended).length,
})

export const computeTeacherStats = (teachers: Teacher[]) => ({
  total: teachers.length,
  active: teachers.filter((t) => t.active).length,
  inactive: teachers.filter((t) => !t.active).length,
})

export const computeStudentStats = (students: Student[]) => ({
  total: students.length,
  approved: students.filter((s) => s.approvalStatus === 'APPROVED').length,
  pending: students.filter((s) => s.approvalStatus === 'PENDING').length,
  rejected: students.filter((s) => s.approvalStatus === 'REJECTED').length,
  readyForExam: students.filter((s) => s.trainingStatus === 'READY_FOR_EXAM').length,
})

export const computeRegistrationStats = (registrations: ExamRegistration[]) => {
  const active = registrations.filter((r) => r.status === 'BOOKED')
  const paid = active.filter((r) => r.paid)
  const awaitingPayment = active.filter((r) => !r.paid)
  const totalRevenue = paid.length * (paymentSplit.site + paymentSplit.school)
  return {
    total: registrations.length,
    active: active.length,
    paid: paid.length,
    awaitingPayment: awaitingPayment.length,
    cancelled: registrations.filter((r) => r.status === 'CANCELLED').length,
    totalRevenue,
    siteRevenue: paid.length * paymentSplit.site,
    schoolRevenue: paid.length * paymentSplit.school,
    passed: registrations.filter((r) => r.result === 'PASSED').length,
    failed: registrations.filter((r) => r.result === 'FAILED').length,
    resultPending: registrations.filter((r) => r.result === 'PENDING').length,
  }
}

export const computeExamSlotStats = (examSlots: ExamSlot[]) => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: examSlots.length,
    upcoming: examSlots.filter((s) => !s.cancelled && s.examDate >= today).length,
    completed: examSlots.filter((s) => !s.cancelled && s.examDate < today).length,
    cancelled: examSlots.filter((s) => s.cancelled).length,
    totalCapacity: examSlots.reduce((sum, s) => sum + s.capacity, 0),
    totalBooked: examSlots.reduce((sum, s) => sum + s.bookedCount, 0),
  }
}
