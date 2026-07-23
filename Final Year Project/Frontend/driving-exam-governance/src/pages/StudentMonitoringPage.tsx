import { useMemo, useState } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { TableShell } from '../components/TableShell'
import { inputClass, itemMetaClass, itemTitleClass, pillApprovedClass, pillDangerClass, pillNeutralClass, pillPendingClass, td } from '../constants/ui'
import { sectionHeaderTextClass, sectionHeaderTitleClass } from '../constants/ui'

const StudentMonitoringPage = () => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
  const [search, setSearch] = useState('')

  const loading = studentsLoading || companiesLoading || teachersLoading || registrationsLoading
  const error = studentsError || companiesError || teachersError || registrationsError

  const companyNameById = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies])
  const teacherNameById = useMemo(() => new Map(teachers.map((t) => [t.id, t.name])), [teachers])
  const registrationByStudent = useMemo(() => {
    const map = new Map<number, (typeof registrations)[number]>()
    for (const registration of registrations) {
      if (registration.status === 'BOOKED') map.set(registration.studentId, registration)
    }
    return map
  }, [registrations])

  const filtered = students.filter((student) => {
    const needle = search.trim().toLowerCase()
    if (!needle) return true
    return student.name.toLowerCase().includes(needle) || student.nationalId.toLowerCase().includes(needle)
  })

  if (loading) return <LoadingState label="Loading students..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className="grid gap-5.5">
      <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
        <div>
          <h2 className={sectionHeaderTitleClass}>Student monitoring</h2>
          <p className={sectionHeaderTextClass}>Every registered student across all driving companies.</p>
        </div>
        <input
          className={`${inputClass} max-w-70`}
          placeholder="Search by name or national ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <TableShell
        headers={['Student Name', 'National ID', 'Company', 'Teacher', 'Payment Status', 'QR Status', 'Exam Status']}
        isEmpty={filtered.length === 0}
        emptyMessage="No students match your search."
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
              <td className={td}>{companyNameById.get(student.companyId) ?? `#${student.companyId}`}</td>
              <td className={td}>{teacherNameById.get(student.teacherId) ?? `#${student.teacherId}`}</td>
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
              <td className={td}>
                {registration ? (
                  <span
                    className={
                      registration.result === 'PASSED'
                        ? pillApprovedClass
                        : registration.result === 'FAILED'
                          ? pillDangerClass
                          : pillPendingClass
                    }
                  >
                    {registration.result === 'PENDING' ? 'Awaiting exam' : registration.result === 'PASSED' ? 'Passed' : 'Failed'}
                  </span>
                ) : (
                  <span className={pillNeutralClass}>Not scheduled</span>
                )}
              </td>
            </tr>
          )
        })}
      </TableShell>
    </section>
  )
}

export default StudentMonitoringPage
