import { useMemo, useState } from 'react'
import { useTeachers } from '../hooks/useTeachers'
import { useCompanies } from '../hooks/useCompanies'
import { useStudents } from '../hooks/useStudents'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { TableShell } from '../components/TableShell'
import { Modal } from '../components/Modal'
import type { Teacher } from '../types'
import {
  itemMetaClass,
  itemTitleClass,
  pillApprovedClass,
  pillNeutralClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
  td,
} from '../constants/ui'

const TeacherMonitoringPage = () => {
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const [viewing, setViewing] = useState<Teacher | null>(null)

  const loading = teachersLoading || companiesLoading || studentsLoading
  const error = teachersError || companiesError || studentsError

  const companyNameById = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies])
  const studentCountByTeacher = useMemo(() => {
    const counts = new Map<number, number>()
    for (const student of students) {
      counts.set(student.teacherId, (counts.get(student.teacherId) ?? 0) + 1)
    }
    return counts
  }, [students])

  if (loading) return <LoadingState label="Loading teachers..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Teacher monitoring</h2>
        <p className={sectionHeaderTextClass}>Every teacher registered across all driving companies.</p>
      </div>

      <TableShell
        headers={['Teacher Name', 'Driving Company', 'License Number', '# Students', 'Status', 'Actions']}
        isEmpty={teachers.length === 0}
        emptyMessage="No teachers registered yet."
      >
        {teachers.map((teacher) => (
          <tr key={teacher.id}>
            <td className={td}>
              <p className={itemTitleClass}>{teacher.name}</p>
              <p className={itemMetaClass}>{teacher.email}</p>
            </td>
            <td className={td}>{companyNameById.get(teacher.companyId) ?? `Company #${teacher.companyId}`}</td>
            <td className={td}>{teacher.licenseNumber ?? '—'}</td>
            <td className={td}>{studentCountByTeacher.get(teacher.id) ?? 0}</td>
            <td className={td}>
              <span className={teacher.active ? pillApprovedClass : pillNeutralClass}>
                {teacher.active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className={td}>
              <button type="button" onClick={() => setViewing(teacher)} className={smallButtonClass}>
                View
              </button>
            </td>
          </tr>
        ))}
      </TableShell>

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Teacher details">
        {viewing && (
          <div className="grid gap-3">
            <div>
              <p className={itemTitleClass}>{viewing.name}</p>
              <p className={itemMetaClass}>{viewing.email}</p>
            </div>
            <p className={itemMetaClass}>
              Company: {companyNameById.get(viewing.companyId) ?? `#${viewing.companyId}`}
            </p>
            <p className={itemMetaClass}>License number: {viewing.licenseNumber ?? 'Not provided'}</p>
            <p className={itemMetaClass}>Registered: {viewing.registeredAt}</p>
            <p className={itemMetaClass}>Students assigned: {studentCountByTeacher.get(viewing.id) ?? 0}</p>
            <p className={itemMetaClass}>Weekly timetable slots: {viewing.timetable.length}</p>
          </div>
        )}
      </Modal>
    </section>
  )
}

export default TeacherMonitoringPage
