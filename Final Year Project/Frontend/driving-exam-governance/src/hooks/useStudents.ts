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
    const created = await studentsApi.registerStudent(input, photo)
    await refetch()
    return created
  }

  const setTrainingStatus = async (studentId: number, trainingStatus: TrainingStatus) => {
    await studentsApi.setTrainingStatus(studentId, trainingStatus)
    await refetch()
  }

  const approve = async (studentId: number) => {
    await studentsApi.approveStudent(studentId)
    await refetch()
  }

  const reject = async (studentId: number) => {
    await studentsApi.rejectStudent(studentId)
    await refetch()
  }

  const remove = async (studentId: number) => {
    await studentsApi.deleteStudent(studentId)
    await refetch()
  }

  return { students: data ?? [], loading, error, refetch, register, setTrainingStatus, approve, reject, remove }
}
