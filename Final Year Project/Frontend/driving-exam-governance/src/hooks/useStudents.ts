import { useFetch } from './useFetch'
import * as studentsApi from '../api/students'
import type { StudentCreateInput, StudentListParams } from '../api/students'
import type { TrainingStatus } from '../types'

export function useStudents(params: StudentListParams = {}) {
  const { data, loading, error, refetch } = useFetch(
    () => studentsApi.listStudents(params),
    [params.companyId, params.teacherId, params.search],
  )

  const register = async (input: StudentCreateInput, photo?: File | null) => {
    await studentsApi.registerStudent(input, photo)
    await refetch()
  }

  const setTrainingStatus = async (studentId: number, trainingStatus: TrainingStatus) => {
    await studentsApi.setTrainingStatus(studentId, trainingStatus)
    await refetch()
  }

  return { students: data ?? [], loading, error, refetch, register, setTrainingStatus }
}
