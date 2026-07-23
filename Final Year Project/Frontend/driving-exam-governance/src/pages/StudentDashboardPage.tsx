import { CalendarDays, CheckCircle2, Clock, MapPin, QrCode, UserCheck } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { User } from '../types'
import {
  cardClass,
  itemMetaClass,
  itemTitleClass,
  panelClass,
  pillApprovedClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const StudentDashboardPage = ({ user }: { user: User }) => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations({
    studentId: user.studentId ?? undefined,
  })

  const loading = studentsLoading || companiesLoading || teachersLoading || registrationsLoading
  const error = studentsError || companiesError || teachersError || registrationsError

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const student = students.find((s) => s.id === user.studentId)
  const company = companies.find((c) => c.id === student?.companyId)
  const teacher = teachers.find((t) => t.id === student?.teacherId)
  const activeRegistration = registrations.find((r) => r.status === 'BOOKED')

  return (
    <section className="grid gap-5.5">
      <div className={panelClass}>
        <h2 className={sectionHeaderTitleClass}>Welcome, {user.name}</h2>
        <p className={sectionHeaderTextClass}>
          Driving company: <strong>{company?.name ?? '—'}</strong> · Teacher: <strong>{teacher?.name ?? '—'}</strong>
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <div className={cardClass}>
          <h3 className="m-0 flex items-center gap-2 text-[#1F2937]">
            <UserCheck size={18} /> Registration status
          </h3>
          <span
            className={
              student?.approvalStatus === 'APPROVED'
                ? pillApprovedClass
                : student?.approvalStatus === 'REJECTED'
                  ? pillNeutralClass
                  : pillPendingClass
            }
          >
            {student?.approvalStatus === 'APPROVED' ? 'Approved' : student?.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
          </span>
        </div>

        <div className={cardClass}>
          <h3 className="m-0 flex items-center gap-2 text-[#1F2937]">
            <CheckCircle2 size={18} /> Payment status
          </h3>
          <span className={activeRegistration?.paid ? pillApprovedClass : pillPendingClass}>
            {activeRegistration?.paid ? 'Completed' : activeRegistration ? 'Pending' : 'Not booked'}
          </span>
        </div>

        <div className={cardClass}>
          <h3 className="m-0 flex items-center gap-2 text-[#1F2937]">
            <QrCode size={18} /> QR code status
          </h3>
          <span className={activeRegistration?.paid ? pillApprovedClass : pillNeutralClass}>
            {activeRegistration?.paid ? 'Generated' : 'Not generated'}
          </span>
        </div>

        <div className={cardClass}>
          <h3 className="m-0 flex items-center gap-2 text-[#1F2937]">
            <CalendarDays size={18} /> Examination information
          </h3>
          {activeRegistration ? (
            <div className="grid gap-1">
              <p className={itemMetaClass}>
                <Clock size={14} /> {activeRegistration.examSlotDate} · {activeRegistration.examSlotStartTime}
              </p>
              <p className={itemMetaClass}>
                <MapPin size={14} /> {activeRegistration.examSlotName}
              </p>
            </div>
          ) : (
            <p className={itemMetaClass}>No examination booked yet.</p>
          )}
        </div>
      </div>

      {student && (
        <div className={cardClass}>
          <h3 className="m-0 text-[#1F2937]">Your details</h3>
          <p className={itemTitleClass}>{student.name}</p>
          <p className={itemMetaClass}>National ID: {student.nationalId}</p>
          <p className={itemMetaClass}>Exam type: {student.examType}</p>
        </div>
      )}
    </section>
  )
}

export default StudentDashboardPage
