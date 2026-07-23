import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { buildActivityFeed } from '../utils/activity'
import type { User } from '../types'
import { panelClass, sectionHeaderTextClass, sectionHeaderTitleClass } from '../constants/ui'

const StudentNotificationsPage = ({ user }: { user: User }) => {
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations({
    studentId: user.studentId ?? undefined,
  })

  const loading = studentsLoading || registrationsLoading
  const error = studentsError || registrationsError

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const ownStudent = students.find((s) => s.id === user.studentId)
  const activity = buildActivityFeed({ students: ownStudent ? [ownStudent] : [], registrations }, 20)

  return (
    <section className="grid gap-5.5">
      <div className={panelClass}>
        <h2 className={sectionHeaderTitleClass}>Notifications</h2>
        <p className={sectionHeaderTextClass}>Updates about your registration, payment, and examination.</p>
      </div>
      <ActivityTimeline items={activity} />
    </section>
  )
}

export default StudentNotificationsPage
