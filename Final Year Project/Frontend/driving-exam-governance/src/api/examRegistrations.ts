import { apiFetch } from './client'
import type { ExamRegistration } from '../types'

export const bookStudent = (studentId: number, examSlotId: number) =>
  apiFetch<ExamRegistration>('/api/exam-registrations', {
    method: 'POST',
    body: { studentId, examSlotId },
  })

export const listRegistrations = (params: { studentId?: number; teacherId?: number } = {}) => {
  const query = new URLSearchParams()
  if (params.studentId != null) query.set('studentId', String(params.studentId))
  if (params.teacherId != null) query.set('teacherId', String(params.teacherId))
  const qs = query.toString()
  return apiFetch<ExamRegistration[]>(`/api/exam-registrations${qs ? `?${qs}` : ''}`)
}

export const markPaid = (id: number) =>
  apiFetch<ExamRegistration>(`/api/exam-registrations/${id}/pay`, { method: 'PATCH' })

export const cancelRegistration = (id: number) =>
  apiFetch<void>(`/api/exam-registrations/${id}`, { method: 'DELETE' })
