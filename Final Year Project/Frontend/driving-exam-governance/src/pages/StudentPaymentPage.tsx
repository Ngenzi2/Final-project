import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { User } from '../types'
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
  smallButtonClass,
} from '../constants/ui'

const StudentPaymentPage = ({ user }: { user: User }) => {
  const { registrations, loading, error, markPaid } = useExamRegistrations({ studentId: user.studentId ?? undefined })

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Payment</h2>
        <p className={sectionHeaderTextClass}>Pay your examination fee to unlock your QR ticket.</p>
      </div>
      <div className={listCardClass}>
        {registrations.length === 0 ? (
          <p>You haven't been booked onto an exam slot yet — ask your teacher to book you once you're ready.</p>
        ) : (
          registrations.map((registration) => (
            <div key={registration.id} className={`${listItemClass} flex-wrap`}>
              <div>
                <p className={itemTitleClass}>
                  {registration.examSlotName} · {registration.examSlotDate} {registration.examSlotStartTime}
                </p>
                <p className={itemMetaClass}>
                  {registration.studentExamType} - {registration.teacherName} - {registration.companyName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
                  {registration.paid ? 'Paid' : 'Pending payment'}
                </span>
                {!registration.paid && (
                  <button type="button" onClick={() => markPaid(registration.id)} className={smallButtonClass}>
                    Pay 50,000 RWF
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentPaymentPage
