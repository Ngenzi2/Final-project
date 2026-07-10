import { apiFetch } from './client'
import type { ExamRegistration, ExamSlot } from '../types'

export type ExamSlotInput = {
  name: string
  location: string
  examDate: string
  startTime: string
  capacity: number
}

export const listExamSlots = (from?: string, to?: string) => {
  const query = new URLSearchParams()
  if (from) query.set('from', from)
  if (to) query.set('to', to)
  const qs = query.toString()
  return apiFetch<ExamSlot[]>(`/api/exam-slots${qs ? `?${qs}` : ''}`)
}

export const getExamSlot = (id: number) => apiFetch<ExamSlot>(`/api/exam-slots/${id}`)

export const createExamSlot = (input: ExamSlotInput) =>
  apiFetch<ExamSlot>('/api/exam-slots', { method: 'POST', body: input })

export const getSlotRegistrations = (id: number) =>
  apiFetch<ExamRegistration[]>(`/api/exam-slots/${id}/registrations`)
