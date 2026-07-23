import { useState } from 'react'
import { CalendarDays, CalendarCheck, Clock3, MapPin, Users, X, Trash2, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../components/Modal'
import { StatCard } from '../components/StatCard'
import { AddExamSlotForm } from '../components/AddExamSlotForm'
import { DataTable } from '../components/DataTable'
import type { DataTableColumn } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { SkeletonListRow, SkeletonStatCard } from '../components/Skeleton'
import { useExamSlots } from '../hooks/useExamSlots'
import { useSlotRegistrations } from '../hooks/useExamRegistrations'
import { ApiError } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import { computeExamSlotStats } from '../utils/stats'
import type { ExamRegistration } from '../types'
import {
  glassCardClass,
  glassPanelClass,
  iconBadgeClass,
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  pillApprovedClass,
  pillDangerClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
  subpanelClass,
  tactileRowClass,
  todayIso,
} from '../constants/ui'

const ExamSlotsPage = () => {
  const { examSlots, loading, error, create, cancel } = useExamSlots()
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null)
  const [cancelModal, setCancelModal] = useState<{ id: number, name: string } | null>(null)

  const {
    registrations,
    loading: rosterLoading,
    error: rosterError,
    markPaid,
    setResult,
  } = useSlotRegistrations(selectedSlotId)

  const examSlotStats = computeExamSlotStats(examSlots)

  const selectedSlot = examSlots.find((slot) => slot.id === selectedSlotId) ?? null

  const groupedByDate = new Map<string, typeof examSlots>()
  for (const slot of examSlots) {
    const existing = groupedByDate.get(slot.examDate) ?? []
    existing.push(slot)
    groupedByDate.set(slot.examDate, existing)
  }
  const sortedDates = [...groupedByDate.keys()].sort()

  const handleCancelSlot = async () => {
    if (!cancelModal) return
    const promise = cancel(cancelModal.id)

    toast.promise(promise, {
      loading: `Cancelling ${cancelModal.name}...`,
      success: `Examination ${cancelModal.name} cancelled successfully.`,
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to cancel examination.'),
    })

    try {
      await promise
      setCancelModal(null)
      if (selectedSlotId === cancelModal.id) setSelectedSlotId(null)
    } catch {
      // toast.promise already surfaced the error above
    }
  }

  const handleMarkPaid = async (registrationId: number) => {
    const promise = markPaid(registrationId)
    toast.promise(promise, {
      loading: 'Marking payment successful...',
      success: 'Payment verified and QR generated!',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to mark payment.'),
    })
  }

  const handleSetResult = async (registrationId: number, result: 'PASSED' | 'FAILED') => {
    const promise = setResult(registrationId, result)
    toast.promise(promise, {
      loading: 'Recording result...',
      success: `Result recorded as ${result === 'PASSED' ? 'Passed' : 'Failed'}.`,
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to record result.'),
    })
  }

  const rosterColumns: DataTableColumn<ExamRegistration>[] = [
    { key: 'student', header: 'Student', render: (r) => r.studentName, sortValue: (r) => r.studentName },
    { key: 'company', header: 'Company', render: (r) => r.companyName, sortValue: (r) => r.companyName },
    { key: 'teacher', header: 'Teacher', render: (r) => r.teacherName, sortValue: (r) => r.teacherName },
    { key: 'examType', header: 'Exam type', render: (r) => r.studentExamType, sortValue: (r) => r.studentExamType },
    {
      key: 'payment',
      header: 'Payment status',
      sortValue: (r) => (r.paid ? 1 : 0),
      render: (r) => <span className={r.paid ? pillApprovedClass : pillPendingClass}>{r.paid ? 'Paid' : 'Not paid'}</span>,
    },
    {
      key: 'result',
      header: 'Result',
      sortValue: (r) => r.result,
      render: (r) => (
        <span className={r.result === 'PASSED' ? pillApprovedClass : r.result === 'FAILED' ? pillDangerClass : pillNeutralClass}>
          {r.result === 'PENDING' ? 'Awaiting result' : r.result === 'PASSED' ? 'Passed' : 'Failed'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          {!r.paid && (
            <button
              type="button"
              onClick={() => handleMarkPaid(r.id)}
              className={`${smallButtonClass} transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]`}
            >
              Mark paid
            </button>
          )}
          {r.paid && r.result === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={() => handleSetResult(r.id, 'PASSED')}
                className={`${smallButtonClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]`}
              >
                Pass
              </button>
              <button
                type="button"
                onClick={() => handleSetResult(r.id, 'FAILED')}
                className={`${smallButtonClass} bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]`}
              >
                Fail
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <section className={`${glassPanelClass} grid gap-6`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Examination management</h2>
        <p className={sectionHeaderTextClass}>
          Create exam dates with a time and location. Click a date to see everyone registered, their payment status, and record results.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard icon={CalendarDays} label="Upcoming exams" value={examSlotStats.upcoming} color="#0B3B6E" highlighted />
            <StatCard icon={CalendarCheck} label="Completed exams" value={examSlotStats.completed} color="#6B7280" />
            <StatCard icon={Users} label="Total candidates booked" value={examSlotStats.totalBooked} color="#4f5cff" />
            <StatCard icon={MapPin} label="Total capacity" value={examSlotStats.totalCapacity} color="#0ea5e9" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <div className={subpanelClass}>
          <h3 className="m-0 tracking-tight text-[#1F2937]">Schedule an examination slot</h3>
          <AddExamSlotForm onCreate={create} />
        </div>

        <div className={subpanelClass}>
          <h3 className="m-0 tracking-tight text-[#1F2937]">Scheduled dates</h3>
          {loading ? (
            <div className="flex flex-col gap-3">
              <SkeletonListRow />
              <SkeletonListRow />
              <SkeletonListRow />
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : sortedDates.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No examination slots scheduled yet" description="Schedule your first exam date using the form on the left." />
          ) : (
            <div className={listCardClass}>
              {sortedDates.map((date) => {
                const slotsForDate = groupedByDate.get(date) ?? []
                const isUpcoming = date >= todayIso()
                return (
                  <div key={date} className="grid gap-2">
                    <p className={itemMetaClass}>
                      <span className="flex items-center gap-1.5 font-bold text-[#1F2937]">
                        <CalendarDays size={14} /> {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={isUpcoming ? pillApprovedClass : pillNeutralClass}>{isUpcoming ? 'Upcoming' : 'Completed'}</span>
                    </p>
                    {slotsForDate.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`flex flex-wrap items-center justify-between gap-4.5 rounded-2xl bg-white px-4.5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] w-full text-left ${tactileRowClass} ${selectedSlotId === slot.id ? 'ring-2 ring-brand-orange' : ''}`}
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
                        {slot.cancelled ? (
                          <span className={pillDangerClass}>Cancelled</span>
                        ) : (
                          <span className={slot.bookedCount >= slot.capacity ? pillPendingClass : pillNeutralClass}>
                            {slot.bookedCount}/{slot.capacity} booked
                          </span>
                        )}
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
        <div className={`${glassCardClass} animate-slide-up`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="m-0 tracking-tight text-[#1F2937]">
                {selectedSlot.name} · {new Date(selectedSlot.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
                {selectedSlot.startTime}
              </h3>
              <p className={itemMetaClass}>
                {selectedSlot.location} · {selectedSlot.bookedCount}/{selectedSlot.capacity} booked
                {selectedSlot.cancelled && <span className={pillDangerClass}>Cancelled</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!selectedSlot.cancelled && (
                <button
                  type="button"
                  onClick={() => setCancelModal({ id: selectedSlot.id, name: selectedSlot.name })}
                  className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[0.8rem] text-red-600 hover:bg-red-100 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96]"
                >
                  <Trash2 size={14} /> Cancel slot
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedSlotId(null)}
                aria-label="Close roster"
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[#f2f3f8] text-[#6B7280] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E5EAF2] active:scale-[0.9]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {rosterError ? (
            <ErrorState message={rosterError} />
          ) : (
            <DataTable
              columns={rosterColumns}
              data={registrations}
              rowKey={(r) => r.id}
              loading={rosterLoading}
              emptyIcon={GraduationCap}
              emptyTitle="No students registered to this date yet"
              emptyDescription="Once students book this exam slot, their roster will appear here."
            />
          )}
        </div>
      )}

      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Examination Slot"
      >
        <div className="grid gap-5">
          <p className="m-0 text-[#6B7280]">
            Are you sure you want to cancel the examination slot <strong>{cancelModal?.name}</strong>? This action will notify all booked students and cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setCancelModal(null)}
              className="rounded-full bg-slate-100 px-5 py-2.5 text-[0.95rem] font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:-translate-y-0.5 active:scale-[0.96]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCancelSlot}
              className="rounded-full bg-red-600 px-5 py-2.5 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 active:scale-[0.96]"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default ExamSlotsPage
