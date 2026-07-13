import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarCheck } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useExamSlots } from '../hooks/useExamSlots'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { ApiError } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import type { User } from '../types'
import {
  cardClass,
  iconBadgeClass,
  inputClass,
  itemMetaClass,
  itemTitleClass,
  labelClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillNeutralClass,
  pillPendingClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  todayIso,
} from '../constants/ui'

const TeacherExamsPage = ({ user }: { user: User }) => {
  const { students } = useStudents()
  const { examSlots } = useExamSlots()
  const { registrations, book, cancel } = useExamRegistrations({ teacherId: user.teacherId ?? undefined })

  const [bookingForm, setBookingForm] = useState({ studentId: '', examSlotId: '' })
  const [bookingError, setBookingError] = useState('')

  const readyStudents = students.filter((student) => student.trainingStatus === 'READY_FOR_EXAM')
  const upcomingSlots = examSlots.filter((slot) => slot.examDate >= todayIso())
  const activeBookings = registrations.filter((registration) => registration.status === 'BOOKED')

  const handleBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingError('')
    if (!bookingForm.studentId || !bookingForm.examSlotId) return
    try {
      await book(Number(bookingForm.studentId), Number(bookingForm.examSlotId))
      setBookingForm({ studentId: '', examSlotId: '' })
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : 'Failed to book this student.')
    }
  }

  return (
    <div className={`${panelClass} grid gap-5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Exam bookings</h2>
        <p className={sectionHeaderTextClass}>Book ready students onto an upcoming exam slot.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <div className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ backgroundColor: '#4f5cff1f', color: '#4f5cff' }}
          >
            <CalendarCheck size={16} strokeWidth={2} />
          </span>
          <span className="text-[0.82rem] text-[#6c6f93]">Active bookings</span>
          <strong className="text-[1.15rem] text-[#161a35]">{activeBookings.length}</strong>
        </div>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2.5">
          <span className={iconBadgeClass}>
            <CalendarCheck size={18} strokeWidth={2} />
          </span>
          <h3 className="m-0 text-[#141a39]">Book a student for an exam</h3>
        </div>
        <p className={itemMetaClass}>Only students marked "ready for exam" can be booked onto an upcoming slot.</p>
        <form onSubmit={handleBook} className="grid gap-2.5">
          <label className={labelClass}>
            Student
            <select className={inputClass} value={bookingForm.studentId} onChange={(e) => setBookingForm({ ...bookingForm, studentId: e.target.value })}>
              <option value="">Select a ready student</option>
              {readyStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Exam slot
            <select className={inputClass} value={bookingForm.examSlotId} onChange={(e) => setBookingForm({ ...bookingForm, examSlotId: e.target.value })}>
              <option value="">Select a slot</option>
              {upcomingSlots.map((slot) => (
                <option key={slot.id} value={slot.id} disabled={slot.bookedCount >= slot.capacity}>
                  {slot.name} · {slot.examDate} {slot.startTime} ({slot.bookedCount}/{slot.capacity})
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={primaryButtonClass} disabled={readyStudents.length === 0}>
            Book student
          </button>
        </form>
        {bookingError && <ErrorState message={bookingError} />}

        <div className={`${listCardClass} mt-2`}>
          {registrations.length === 0 ? (
            <p>No exam bookings yet.</p>
          ) : (
            registrations.map((registration) => (
              <div key={registration.id} className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>{registration.studentName}</p>
                  <p className={itemMetaClass}>
                    {registration.examSlotName} · {registration.examSlotDate} {registration.examSlotStartTime}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {registration.status === 'CANCELLED' ? (
                    <span className={pillNeutralClass}>Cancelled</span>
                  ) : (
                    <>
                      <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
                        {registration.paid ? 'Paid' : 'Not paid'}
                      </span>
                      <button
                        type="button"
                        onClick={() => cancel(registration.id)}
                        className="cursor-pointer rounded-xl border border-[#e6e8f0] bg-white px-3 py-2 text-[0.82rem] font-semibold text-[#6c6f93] hover:border-red-200 hover:text-red-600"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherExamsPage
