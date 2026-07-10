import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Clock3, MapPin, X } from 'lucide-react'
import { useExamSlots } from '../hooks/useExamSlots'
import { useSlotRegistrations } from '../hooks/useExamRegistrations'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  cardClass,
  formGridClass,
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
  smallButtonClass,
  subpanelClass,
  tableWrapClass,
  td,
  th,
  todayIso,
} from '../constants/ui'

const emptyForm = { name: '', location: '', examDate: '', startTime: '', capacity: '30' }

const ExamSlotsPage = () => {
  const { examSlots, loading, error, create } = useExamSlots()
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)

  const {
    registrations,
    loading: rosterLoading,
    error: rosterError,
    markPaid,
  } = useSlotRegistrations(selectedSlotId)

  const selectedSlot = examSlots.find((slot) => slot.id === selectedSlotId) ?? null

  const groupedByDate = new Map<string, typeof examSlots>()
  for (const slot of examSlots) {
    const existing = groupedByDate.get(slot.examDate) ?? []
    existing.push(slot)
    groupedByDate.set(slot.examDate, existing)
  }
  const sortedDates = [...groupedByDate.keys()].sort()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.location.trim() || !form.examDate || !form.startTime) return
    setSubmitting(true)
    try {
      await create({
        name: form.name.trim(),
        location: form.location.trim(),
        examDate: form.examDate,
        startTime: form.startTime,
        capacity: Number(form.capacity) || 1,
      })
      setForm(emptyForm)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create exam slot.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`${panelClass} grid gap-6`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Examination sites &amp; schedules</h2>
        <p className={sectionHeaderTextClass}>
          Create exam dates with a time and location. Click a date to see everyone registered and their payment status.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <div className={subpanelClass}>
          <h3 className="m-0 text-[#141a39]">Schedule an examination slot</h3>
          <form onSubmit={handleSubmit} className={formGridClass}>
            <label className={labelClass}>
              Site name
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter exam site name" />
            </label>
            <label className={labelClass}>
              Location
              <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>
                Date
                <input type="date" className={inputClass} value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              </label>
              <label className={labelClass}>
                Time
                <input type="time" className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </label>
            </div>
            <label className={labelClass}>
              Capacity
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </label>
            {formError && <ErrorState message={formError} />}
            <button type="submit" disabled={submitting} className={primaryButtonClass}>
              {submitting ? 'Adding...' : 'Add exam slot'}
            </button>
          </form>
        </div>

        <div className={subpanelClass}>
          <h3 className="m-0 text-[#141a39]">Scheduled dates</h3>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : sortedDates.length === 0 ? (
            <p>No examination slots scheduled yet.</p>
          ) : (
            <div className={listCardClass}>
              {sortedDates.map((date) => {
                const slotsForDate = groupedByDate.get(date) ?? []
                const isUpcoming = date >= todayIso()
                return (
                  <div key={date} className="grid gap-2">
                    <p className={itemMetaClass}>
                      <span className="flex items-center gap-1.5 font-bold text-[#141a39]">
                        <CalendarDays size={14} /> {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={isUpcoming ? pillApprovedClass : pillNeutralClass}>{isUpcoming ? 'Upcoming' : 'Completed'}</span>
                    </p>
                    {slotsForDate.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`${listItemClass} w-full text-left ${selectedSlotId === slot.id ? 'border-brand-orange' : ''}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={iconBadgeClass}>
                            <MapPin size={20} strokeWidth={2} />
                          </span>
                          <div>
                            <p className={itemTitleClass}>{slot.name}</p>
                            <p className={itemMetaClass}>
                              <span className="flex items-center gap-1.5">
                                <MapPin size={14} /> {slot.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock3 size={14} /> {slot.startTime}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className={slot.bookedCount >= slot.capacity ? pillPendingClass : pillNeutralClass}>
                          {slot.bookedCount}/{slot.capacity} booked
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedSlot && (
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-[#141a39]">
                {selectedSlot.name} · {new Date(selectedSlot.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
                {selectedSlot.startTime}
              </h3>
              <p className={itemMetaClass}>
                {selectedSlot.location} · {selectedSlot.bookedCount}/{selectedSlot.capacity} booked
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSlotId(null)}
              aria-label="Close roster"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[#f2f3f8] text-[#6c6f93] hover:bg-[#e6e8f0]"
            >
              <X size={16} />
            </button>
          </div>

          {rosterLoading ? (
            <LoadingState label="Loading roster..." />
          ) : rosterError ? (
            <ErrorState message={rosterError} />
          ) : registrations.length === 0 ? (
            <p>No students registered to this date yet.</p>
          ) : (
            <div className={tableWrapClass}>
              <table className="w-full min-w-150 border-collapse text-left">
                <thead>
                  <tr>
                    <th className={th}>Student</th>
                    <th className={th}>Company</th>
                    <th className={th}>Teacher</th>
                    <th className={th}>Exam type</th>
                    <th className={th}>Payment status</th>
                    <th className={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className={td}>{registration.studentName}</td>
                      <td className={td}>{registration.companyName}</td>
                      <td className={td}>{registration.teacherName}</td>
                      <td className={td}>{registration.studentExamType}</td>
                      <td className={td}>
                        <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
                          {registration.paid ? 'Paid' : 'Not paid'}
                        </span>
                      </td>
                      <td className={td}>
                        {!registration.paid && (
                          <button type="button" onClick={() => markPaid(registration.id)} className={smallButtonClass}>
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default ExamSlotsPage
