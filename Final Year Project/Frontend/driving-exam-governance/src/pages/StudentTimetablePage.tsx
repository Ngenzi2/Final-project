import { Clock3 } from 'lucide-react'
import { useTeachers } from '../hooks/useTeachers'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  iconBadgeClass,
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillNeutralClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const StudentTimetablePage = () => {
  const { teachers, loading, error } = useTeachers()
  const myTeacher = teachers[0]

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Timetable</h2>
        <p className={sectionHeaderTextClass}>Your teacher's weekly lesson schedule.</p>
      </div>
      <div className="flex flex-col gap-4.5">
        {!myTeacher ? (
          <p>No teacher assigned yet.</p>
        ) : myTeacher.timetable.length === 0 ? (
          <p>{myTeacher.name} hasn't published a timetable yet.</p>
        ) : (
          <div className={listCardClass}>
            {myTeacher.timetable.map((slot) => (
              <div key={slot.id} className={listItemClass}>
                <div className="flex items-center gap-3.5">
                  <span className={iconBadgeClass}>
                    <Clock3 size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <p className={itemTitleClass}>
                      {slot.day} · {slot.startTime}–{slot.endTime}
                    </p>
                    <p className={itemMetaClass}>with {myTeacher.name}</p>
                  </div>
                </div>
                <span className={pillNeutralClass}>{slot.activity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentTimetablePage
