import { apiFetch } from './client'
import type { ExamType, Student, TrainingStatus } from '../types'

export type StudentCreateInput = {
  name: string
  nationalId: string
  email: string
  password: string
  examType: ExamType
}

export type StudentListParams = {
  companyId?: number
  teacherId?: number
  search?: string
}

export const listStudents = (params: StudentListParams = {}) => {
  const query = new URLSearchParams()
  if (params.companyId != null) query.set('companyId', String(params.companyId))
  if (params.teacherId != null) query.set('teacherId', String(params.teacherId))
  if (params.search) query.set('search', params.search)
  const qs = query.toString()
  return apiFetch<Student[]>(`/api/students${qs ? `?${qs}` : ''}`)
}

export const registerStudent = (input: StudentCreateInput, photo?: File | null) => {
  const formData = new FormData()
  formData.append('data', new Blob([JSON.stringify(input)], { type: 'application/json' }))
  if (photo) formData.append('photo', photo)

  return apiFetch<Student>('/api/students', { method: 'POST', body: formData })
}

export const setTrainingStatus = (studentId: number, trainingStatus: TrainingStatus) =>
  apiFetch<Student>(`/api/students/${studentId}/training-status`, {
    method: 'PATCH',
    body: { trainingStatus },
  })
