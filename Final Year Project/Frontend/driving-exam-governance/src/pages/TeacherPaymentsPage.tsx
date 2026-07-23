import { CheckCircle2, Clock } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { TableShell } from '../components/TableShell'
import {
  itemMetaClass,
  itemTitleClass,
  pillApprovedClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  td,
} from '../constants/ui'

const TeacherPaymentsPage = () => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const loading = studentsLoading || registrationsLoading
  const error = studentsError || registrationsError

  if (loading) return <LoadingState label="Loading payment status..." />
  if (error) return <ErrorState message={error} />

  const registrationByStudent = new Map(registrations.filter((r) => r.status === 'BOOKED').map((r) => [r.studentId, r]))
  const paidCount = students.filter((s) => registrationByStudent.get(s.id)?.paid).length
  const pendingCount = students.filter((s) => registrationByStudent.has(s.id) && !registrationByStudent.get(s.id)?.paid).length

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Payment status</h2>
        <p className={sectionHeaderTextClass}>Payment progress for the students you teach.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <StatCard icon={CheckCircle2} label="Paid students" value={paidCount} color="#22C55E" />
        <StatCard icon={Clock} label="Pending payments" value={pendingCount} color="#F59E0B" />
      </div>

      <TableShell
        headers={['Student', 'National ID', 'Training status', 'Payment status']}
        isEmpty={students.length === 0}
        emptyMessage="No students registered yet."
      >
        {students.map((student) => {
          const registration = registrationByStudent.get(student.id)
          return (
            <tr key={student.id}>
              <td className={td}>
                <p className={itemTitleClass}>{student.name}</p>
                <p className={itemMetaClass}>{student.email}</p>
              </td>
              <td className={td}>{student.nationalId}</td>
              <td className={td}>
                <span className={student.trainingStatus === 'READY_FOR_EXAM' ? pillApprovedClass : pillNeutralClass}>
                  {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                </span>
              </td>
              <td className={td}>
                <span className={registration?.paid ? pillApprovedClass : pillPendingClass}>
                  {registration?.paid ? 'Paid' : registration ? 'Awaiting payment' : 'Not booked'}
                </span>
              </td>
            </tr>
          )
        })}
      </TableShell>
    </section>
  )
}

export default TeacherPaymentsPage
