import { useFetch } from './useFetch'
import * as examSlotsApi from '../api/examSlots'
import type { ExamSlotInput } from '../api/examSlots'

export function useExamSlots() {
  const { data, loading, error, refetch } = useFetch(() => examSlotsApi.listExamSlots(), [])

  const create = async (input: ExamSlotInput) => {
    await examSlotsApi.createExamSlot(input)
    await refetch()
  }

  const cancel = async (id: number) => {
    await examSlotsApi.cancelExamSlot(id)
    await refetch()
  }

  return { examSlots: data ?? [], loading, error, refetch, create, cancel }
}
