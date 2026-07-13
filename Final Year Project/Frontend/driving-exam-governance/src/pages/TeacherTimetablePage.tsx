import { useState } from 'react'
import type { FormEvent } from 'react'
import { Clock3, Trash2 } from 'lucide-react'
import { useTeachers } from '../hooks/useTeachers'
import { ApiError } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import type { User, WeekDay } from '../types'
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
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const weekDayByJsIndex: (WeekDay | null)[] = [null, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const todayWeekDay: WeekDay | null = weekDayByJsIndex[new Date().getDay()]

const TeacherTimetablePage = ({ user }: { user: User }) => {
  const { teachers, addTimetableSlot, removeTimetableSlot } = useTeachers()

  const [timetableForm, setTimetableForm] = useState({ day: 'MON' as WeekDay, startTime: '', endTime: '', activity: '' })
  const [timetableError, setTimetableError] = useState('')

  const myTeacher = teachers.find((teacher) => teacher.id === user.teacherId)

  const handleAddTimetableSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTimetableError('')
    if (!user.teacherId || !timetableForm.startTime || !timetableForm.endTime || !timetableForm.activity.trim()) return
    try {
      await addTimetableSlot(user.teacherId, {
        day: timetableForm.day,
        startTime: timetableForm.startTime,
        endTime: timetableForm.endTime,
        activity: timetableForm.activity.trim(),
      })
      setTimetableForm({ day: 'MON', startTime: '', endTime: '', activity: '' })
    } catch (err) {
      setTimetableError(err instanceof ApiError ? err.message : 'Failed to add timetable slot.')
    }
  }

  return (
    <div className={`${panelClass} grid gap-5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>My weekly timetable</h2>
        <p className={sectionHeaderTextClass}>Plan your teaching sessions across the week.</p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2.5">
          <span className={iconBadgeClass}>
            <Clock3 size={18} strokeWidth={2} />
          </span>
          <h3 className="m-0 text-[#141a39]">Add a slot</h3>
        </div>
        <form onSubmit={handleAddTimetableSlot} className="grid grid-cols-4 gap-2.5 max-[640px]:grid-cols-1">
          <label className={labelClass}>
            Day
            <select
              className={inputClass}
              value={timetableForm.day}
              onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value as WeekDay })}
            >
              {weekDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Start
            <input type="time" className={inputClass} value={timetableForm.startTime} onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })} />
          </label>
          <label className={labelClass}>
            End
            <input type="time" className={inputClass} value={timetableForm.endTime} onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })} />
          </label>
          <label className={labelClass}>
            Activity
            <input className={inputClass} value={timetableForm.activity} onChange={(e) => setTimetableForm({ ...timetableForm, activity: e.target.value })} placeholder="Theory" />
          </label>
          {timetableError && <ErrorState message={timetableError} />}
          <button type="submit" className={`${primaryButtonClass} col-span-4 max-[640px]:col-span-1`}>
            Add slot
          </button>
        </form>

        <div className={listCardClass}>
          {!myTeacher || myTeacher.timetable.length === 0 ? (
            <p>No timetable slots added yet.</p>
          ) : (
            weekDays
              .filter((day) => myTeacher.timetable.some((slot) => slot.day === day))
              .map((day) => (
                <div key={day} className="grid gap-2">
                  <p className={`m-0 text-[0.8rem] font-bold uppercase tracking-wide ${day === todayWeekDay ? 'text-brand-orange-strong' : 'text-[#6c6f93]'}`}>
                    {day}
                    {day === todayWeekDay ? ' · Today' : ''}
                  </p>
                  {myTeacher.timetable
                    .filter((slot) => slot.day === day)
                    .map((slot) => (
                      <div key={slot.id} className={listItemClass}>
                        <div>
                          <p className={itemTitleClass}>
                            {slot.startTime}–{slot.endTime}
                          </p>
                          <p className={itemMetaClass}>{slot.activity}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => user.teacherId && removeTimetableSlot(user.teacherId, slot.id)}
                          aria-label="Remove slot"
                          className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[#f2f3f8] text-[#6c6f93] hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherTimetablePage
