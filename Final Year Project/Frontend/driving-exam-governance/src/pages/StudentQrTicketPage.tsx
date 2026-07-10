import { useState } from 'react'
import { CalendarDays, MapPin, UserRound } from 'lucide-react'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { useStudents } from '../hooks/useStudents'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { User } from '../types'
import {
  iconBadgeClass,
  itemMetaClass,
  itemTitleClass,
  panelClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
} from '../constants/ui'

const StudentQrTicketPage = ({ user }: { user: User }) => {
  const { registrations, loading, error } = useExamRegistrations({ studentId: user.studentId ?? undefined })
  const { students } = useStudents()
  const [verifiedId, setVerifiedId] = useState<number | null>(null)

  const student = students.find((s) => s.id === user.studentId)
  const paidRegistrations = registrations.filter((registration) => registration.paid)

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>QR ticket</h2>
        <p className={sectionHeaderTextClass}>Your exam appointment and QR code for identity verification on exam day.</p>
      </div>
      <div className="flex flex-col gap-4.5">
        {paidRegistrations.length === 0 ? (
          <p>No paid bookings yet. Complete payment to generate a QR ticket.</p>
        ) : (
          paidRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="grid max-w-125 gap-4 rounded-[20px] border border-[#e5e6ef] border-t-8 border-t-brand-navy bg-white p-5"
            >
              <div className="flex items-center gap-3.5">
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="h-14 w-14 rounded-full border border-[#e5e6ef] object-cover" />
                ) : (
                  <span className={iconBadgeClass}>
                    <UserRound size={22} strokeWidth={2} />
                  </span>
                )}
                <div>
                  <p className={itemTitleClass}>{registration.studentName}</p>
                  <p className={itemMetaClass}>{registration.studentExamType}</p>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-dashed border-[#f2c481] bg-brand-orange/7 py-5.5 text-center font-mono text-[0.95rem] tracking-[0.15em] text-brand-navy">
                {registration.qrCode}
              </div>
              <div className="grid gap-1.5 rounded-xl bg-[#f6f7ff] px-4 py-3.5">
                <p className={itemTitleClass}>Exam appointment</p>
                <p className={itemMetaClass}>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {registration.examSlotName}, {registration.examSlotLocation}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} /> {registration.examSlotDate} · {registration.examSlotStartTime}
                  </span>
                </p>
              </div>
              <button type="button" onClick={() => setVerifiedId(registration.id)} className={smallButtonClass}>
                Verify QR code
              </button>
              {verifiedId === registration.id && (
                <p className="m-0 rounded-lg bg-emerald-500/12 px-3.5 py-2.5 text-center font-bold text-emerald-700">
                  ✓ Verified — cleared for the {registration.studentExamType} exam.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentQrTicketPage
