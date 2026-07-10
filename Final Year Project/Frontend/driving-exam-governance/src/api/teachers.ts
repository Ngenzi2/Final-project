import { apiFetch } from './client'
import type { Teacher, WeekDay } from '../types'

export type TeacherCreateInput = {
  name: string
  email: string
  password: string
}

export type TimetableSlotInput = {
  day: WeekDay
  startTime: string
  endTime: string
  activity: string
}

export const listTeachers = () => apiFetch<Teacher[]>('/api/teachers')

export const createTeacher = (input: TeacherCreateInput) =>
  apiFetch<Teacher>('/api/teachers', { method: 'POST', body: input })

export const addTimetableSlot = (teacherId: number, input: TimetableSlotInput) =>
  apiFetch<Teacher>(`/api/teachers/${teacherId}/timetable`, { method: 'POST', body: input })

export const removeTimetableSlot = (teacherId: number, slotId: number) =>
  apiFetch<Teacher>(`/api/teachers/${teacherId}/timetable/${slotId}`, { method: 'DELETE' })
