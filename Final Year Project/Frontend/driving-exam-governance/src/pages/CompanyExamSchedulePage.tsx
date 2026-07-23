import { useMemo } from 'react'
import { useExamSlots } from '../hooks/useExamSlots'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { TableShell } from '../components/TableShell'
import { pillApprovedClass, pillDangerClass, pillNeutralClass, sectionHeaderTextClass, sectionHeaderTitleClass, td, todayIso } from '../constants/ui'

const CompanyExamSchedulePage = () => {
  const { examSlots, loading: slotsLoading, error: slotsError } = useExamSlots()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const loading = slotsLoading || registrationsLoading
  const error = slotsError || registrationsError

  const candidatesBySlot = useMemo(() => {
    const map = new Map<number, number>()
    for (const registration of registrations) {
      if (registration.status !== 'BOOKED') continue
      map.set(registration.examSlotId, (map.get(registration.examSlotId) ?? 0) + 1)
    }
    return map
  }, [registrations])

  if (loading) return <LoadingState label="Loading examination schedule..." />
  if (error) return <ErrorState message={error} />

  const relevantSlots = examSlots
    .filter((slot) => candidatesBySlot.has(slot.id))
    .sort((a, b) => a.examDate.localeCompare(b.examDate))

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Examination schedule</h2>
        <p className={sectionHeaderTextClass}>Exam dates and sites where your students are registered.</p>
      </div>

      <TableShell
        headers={['Exam site', 'Location', 'Date', 'Time', 'Your candidates', 'Status']}
        isEmpty={relevantSlots.length === 0}
        emptyMessage="No exam bookings for your students yet."
      >
        {relevantSlots.map((slot) => (
          <tr key={slot.id}>
            <td className={td}>{slot.name}</td>
            <td className={td}>{slot.location}</td>
            <td className={td}>{slot.examDate}</td>
            <td className={td}>{slot.startTime}</td>
            <td className={td}>{candidatesBySlot.get(slot.id) ?? 0}</td>
            <td className={td}>
              {slot.cancelled ? (
                <span className={pillDangerClass}>Cancelled</span>
              ) : (
                <span className={slot.examDate >= todayIso() ? pillApprovedClass : pillNeutralClass}>
                  {slot.examDate >= todayIso() ? 'Upcoming' : 'Completed'}
                </span>
              )}
            </td>
          </tr>
        ))}
      </TableShell>
    </section>
  )
}

export default CompanyExamSchedulePage
