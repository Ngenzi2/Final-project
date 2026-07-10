import { useFetch } from './useFetch'
import * as registrationsApi from '../api/examRegistrations'
import * as examSlotsApi from '../api/examSlots'

export function useExamRegistrations(params: { studentId?: number; teacherId?: number } = {}) {
  const { data, loading, error, refetch } = useFetch(
    () => registrationsApi.listRegistrations(params),
    [params.studentId, params.teacherId],
  )

  const book = async (studentId: number, examSlotId: number) => {
    await registrationsApi.bookStudent(studentId, examSlotId)
    await refetch()
  }

  const markPaid = async (id: number) => {
    await registrationsApi.markPaid(id)
    await refetch()
  }

  const cancel = async (id: number) => {
    await registrationsApi.cancelRegistration(id)
    await refetch()
  }

  return { registrations: data ?? [], loading, error, refetch, book, markPaid, cancel }
}

export function useSlotRegistrations(slotId: number | null) {
  const { data, loading, error, refetch } = useFetch(
    () => (slotId != null ? examSlotsApi.getSlotRegistrations(slotId) : Promise.resolve([])),
    [slotId],
  )

  const markPaid = async (id: number) => {
    await registrationsApi.markPaid(id)
    await refetch()
  }

  return { registrations: data ?? [], loading, error, refetch, markPaid }
}
