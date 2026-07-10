import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const CompanyStudentsPage = () => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const loading = studentsLoading || registrationsLoading
  const error = studentsError || registrationsError

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Students</h2>
        <p className={sectionHeaderTextClass}>Student registrations and exam eligibility.</p>
      </div>
      <div className={listCardClass}>
        {students.length === 0 ? (
          <p>No students registered under your teachers yet.</p>
        ) : (
          students.map((student) => {
            const studentRegistrations = registrations.filter((r) => r.studentId === student.id)
            const hasPaidBooking = studentRegistrations.some((r) => r.paid)
            const eligible = hasPaidBooking && student.trainingStatus === 'READY_FOR_EXAM'
            return (
              <div key={student.id} className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>{student.name}</p>
                  <p className={itemMetaClass}>
                    {student.examType} · {studentRegistrations.length === 0 ? 'Not booked' : hasPaidBooking ? 'Paid' : 'Payment pending'} ·{' '}
                    {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                  </p>
                </div>
                <span className={eligible ? pillApprovedClass : pillPendingClass}>{eligible ? 'Eligible' : 'Not yet eligible'}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CompanyStudentsPage
