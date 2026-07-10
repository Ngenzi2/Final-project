import { useState } from 'react'
import type { FormEvent } from 'react'
import { Clock3, X } from 'lucide-react'
import { useTeachers } from '../hooks/useTeachers'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { WeekDay } from '../types'
import {
  formGridClass,
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

const CompanyTeachersPage = () => {
  const { teachers, loading, error, create, addTimetableSlot, removeTimetableSlot } = useTeachers()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [timetableForm, setTimetableForm] = useState<{
    teacherId: string
    day: WeekDay
    startTime: string
    endTime: string
    activity: string
  }>({ teacherId: '', day: 'MON', startTime: '', endTime: '', activity: '' })

  const handleCreateTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return
    try {
      await create(form)
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to register teacher.')
    }
  }

  const handleAddSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!timetableForm.teacherId || !timetableForm.startTime || !timetableForm.endTime || !timetableForm.activity.trim()) return
    await addTimetableSlot(Number(timetableForm.teacherId), {
      day: timetableForm.day,
      startTime: timetableForm.startTime,
      endTime: timetableForm.endTime,
      activity: timetableForm.activity.trim(),
    })
    setTimetableForm({ ...timetableForm, startTime: '', endTime: '', activity: '' })
  }

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Teachers</h2>
        <p className={sectionHeaderTextClass}>Register teachers and set their weekly lesson timetable.</p>
      </div>
      <div className="mb-5.5 grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <div className="flex flex-col gap-4.5">
          <h3 className="m-0 text-[#141a39]">Register a teacher</h3>
          <form onSubmit={handleCreateTeacher} className={formGridClass}>
            <label className={labelClass}>
              Teacher name
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter teacher name" />
            </label>
            <label className={labelClass}>
              Email address
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="teacher@example.com"
              />
            </label>
            <label className={labelClass}>
              Login password
              <input
                type="password"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            {formError && <ErrorState message={formError} />}
            <button type="submit" className={primaryButtonClass}>
              Register teacher
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-4.5">
          <h3 className="m-0 text-[#141a39]">Your teachers</h3>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <div className={listCardClass}>
              {teachers.length === 0 ? (
                <p>No teachers registered yet.</p>
              ) : (
                teachers.map((teacher) => (
                  <div key={teacher.id} className={listItemClass}>
                    <div>
                      <p className={itemTitleClass}>{teacher.name}</p>
                      <p className={itemMetaClass}>
                        <span>{teacher.email}</span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} /> {teacher.timetable.length} weekly slot{teacher.timetable.length === 1 ? '' : 's'}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4.5">
        <h3 className="m-0 text-[#141a39]">Weekly timetable</h3>
        <p className={itemMetaClass}>Add lesson slots so students can see when their teacher is available.</p>
        <form onSubmit={handleAddSlot} className="grid grid-cols-5 gap-3 max-[940px]:grid-cols-1">
          <label className={labelClass}>
            Teacher
            <select className={inputClass} value={timetableForm.teacherId} onChange={(e) => setTimetableForm({ ...timetableForm, teacherId: e.target.value })}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Day
            <select className={inputClass} value={timetableForm.day} onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value as WeekDay })}>
              {weekDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Start time
            <input type="time" className={inputClass} value={timetableForm.startTime} onChange={(e) => setTimetableForm({ ...timetableForm, startTime: e.target.value })} />
          </label>
          <label className={labelClass}>
            End time
            <input type="time" className={inputClass} value={timetableForm.endTime} onChange={(e) => setTimetableForm({ ...timetableForm, endTime: e.target.value })} />
          </label>
          <label className={labelClass}>
            Activity
            <input className={inputClass} value={timetableForm.activity} onChange={(e) => setTimetableForm({ ...timetableForm, activity: e.target.value })} placeholder="Theory / Practical" />
          </label>
          <button type="submit" className={`${primaryButtonClass} col-span-5 max-[940px]:col-span-1`} disabled={teachers.length === 0}>
            Add slot
          </button>
        </form>

        <div className={`${listCardClass} mt-2`}>
          {teachers.every((teacher) => teacher.timetable.length === 0) ? (
            <p>No timetable slots added yet.</p>
          ) : (
            teachers
              .filter((teacher) => teacher.timetable.length > 0)
              .map((teacher) => (
                <div key={teacher.id} className="grid gap-2.5">
                  <p className={itemTitleClass}>{teacher.name}</p>
                  {teacher.timetable.map((slot) => (
                    <div key={slot.id} className={listItemClass}>
                      <div className="flex items-center gap-3.5">
                        <span className={iconBadgeClass}>
                          <Clock3 size={18} strokeWidth={2} />
                        </span>
                        <div>
                          <p className={itemTitleClass}>
                            {slot.day} · {slot.startTime}–{slot.endTime}
                          </p>
                          <p className={itemMetaClass}>{slot.activity}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimetableSlot(teacher.id, slot.id)}
                        aria-label="Remove slot"
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[#f2f3f8] text-[#6c6f93] hover:bg-[#e6e8f0]"
                      >
                        <X size={16} />
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

export default CompanyTeachersPage
