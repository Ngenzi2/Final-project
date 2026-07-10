import { useFetch } from './useFetch'
import * as teachersApi from '../api/teachers'
import type { TeacherCreateInput, TimetableSlotInput } from '../api/teachers'

export function useTeachers() {
  const { data, loading, error, refetch } = useFetch(teachersApi.listTeachers, [])

  const create = async (input: TeacherCreateInput) => {
    await teachersApi.createTeacher(input)
    await refetch()
  }

  const addTimetableSlot = async (teacherId: number, input: TimetableSlotInput) => {
    await teachersApi.addTimetableSlot(teacherId, input)
    await refetch()
  }

  const removeTimetableSlot = async (teacherId: number, slotId: number) => {
    await teachersApi.removeTimetableSlot(teacherId, slotId)
    await refetch()
  }

  return { teachers: data ?? [], loading, error, refetch, create, addTimetableSlot, removeTimetableSlot }
}
