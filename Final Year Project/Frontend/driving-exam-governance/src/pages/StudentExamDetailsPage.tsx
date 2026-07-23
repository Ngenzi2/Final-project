import { CalendarDays, Clock3, MapPin } from 'lucide-react'
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
  pillDangerClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const StudentExamDetailsPage = ({ user }: { user: User }) => {
  const { registrations, loading, error } = useExamRegistrations({ studentId: user.studentId ?? undefined })

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const activeRegistrations = registrations.filter((r) => r.status === 'BOOKED')

  return (
    <section className="grid gap-5.5">
      <div className={panelClass}>
        <h2 className={sectionHeaderTitleClass}>Examination details</h2>
        <p className={sectionHeaderTextClass}>Your upcoming and past examination appointments.</p>
      </div>

      {activeRegistrations.length === 0 ? (
        <div className={cardClass}>
          <p>You have no examination booked yet. Ask your teacher to book you onto an exam slot once you're ready.</p>
        </div>
      ) : (
        activeRegistrations.map((registration) => (
          <div key={registration.id} className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <p className={itemTitleClass}>{registration.examSlotName}</p>
              <span
                className={
                  registration.result === 'PASSED'
                    ? pillApprovedClass
                    : registration.result === 'FAILED'
                      ? pillDangerClass
                      : pillNeutralClass
                }
              >
                {registration.result === 'PENDING' ? 'Result pending' : registration.result === 'PASSED' ? 'Passed' : 'Failed'}
              </span>
            </div>
            <p className={itemMetaClass}>
              <MapPin size={14} /> {registration.examSlotLocation}
            </p>
            <p className={itemMetaClass}>
              <CalendarDays size={14} /> {registration.examSlotDate}
            </p>
            <p className={itemMetaClass}>
              <Clock3 size={14} /> {registration.examSlotStartTime}
            </p>
            <p className={itemMetaClass}>Exam type: {registration.studentExamType}</p>
            <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
              {registration.paid ? 'Payment completed' : 'Payment pending'}
            </span>
          </div>
        ))
      )}
    </section>
  )
}

export default StudentExamDetailsPage
