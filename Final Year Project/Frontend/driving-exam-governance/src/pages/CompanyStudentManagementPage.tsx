import { useMemo, useState } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
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

type FilterTab = 'all' | 'paid' | 'pending' | 'qrGenerated'

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All students' },
  { id: 'paid', label: 'Paid students' },
  { id: 'pending', label: 'Pending payment' },
  { id: 'qrGenerated', label: 'QR generated' },
]

const CompanyStudentManagementPage = () => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
  const [tab, setTab] = useState<FilterTab>('all')

  const loading = studentsLoading || registrationsLoading
  const error = studentsError || registrationsError

  const registrationByStudent = useMemo(() => {
    const map = new Map<number, (typeof registrations)[number]>()
    for (const registration of registrations) {
      if (registration.status === 'BOOKED') map.set(registration.studentId, registration)
    }
    return map
  }, [registrations])

  if (loading) return <LoadingState label="Loading students..." />
  if (error) return <ErrorState message={error} />

  const filtered = students.filter((student) => {
    const registration = registrationByStudent.get(student.id)
    if (tab === 'paid') return !!registration?.paid
    if (tab === 'pending') return !!registration && !registration.paid
    if (tab === 'qrGenerated') return !!registration?.paid
    return true
  })

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Students</h2>
        <p className={sectionHeaderTextClass}>All students registered under your driving company.</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl border px-4 py-2.5 font-semibold ${
              tab === t.id ? 'border-brand-navy bg-brand-navy text-white' : 'border-[#E5EAF2] bg-white text-[#6B7280]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <TableShell
        headers={['Student', 'National ID', 'Exam type', 'Training status', 'Payment', 'QR status']}
        isEmpty={filtered.length === 0}
        emptyMessage="No students match this filter."
      >
        {filtered.map((student) => {
          const registration = registrationByStudent.get(student.id)
          return (
            <tr key={student.id}>
              <td className={td}>
                <p className={itemTitleClass}>{student.name}</p>
                <p className={itemMetaClass}>{student.email}</p>
              </td>
              <td className={td}>{student.nationalId}</td>
              <td className={td}>{student.examType}</td>
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
              <td className={td}>
                <span className={registration?.paid ? pillApprovedClass : pillNeutralClass}>
                  {registration?.paid ? 'Generated' : 'Not generated'}
                </span>
              </td>
            </tr>
          )
        })}
      </TableShell>
    </section>
  )
}

export default CompanyStudentManagementPage
