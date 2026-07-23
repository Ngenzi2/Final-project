import { useState } from 'react'
import type { FormEvent } from 'react'
import { Clock3, Power, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '../components/Modal'
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
  pillApprovedClass,
  pillNeutralClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CompanyTeachersPage = () => {
  const { teachers, loading, error, create, addTimetableSlot, removeTimetableSlot, deleteTeacher, setActive } = useTeachers()
  const [form, setForm] = useState({ name: '', email: '', password: '', licenseNumber: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [timetableForm, setTimetableForm] = useState<{
    teacherId: string
    day: WeekDay
    startTime: string
    endTime: string
    activity: string
  }>({ teacherId: '', day: 'MON', startTime: '', endTime: '', activity: '' })

  const [deleteModal, setDeleteModal] = useState<{ id: number, name: string } | null>(null)

  const handleCreateTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return

    const promise = create({
      name: form.name,
      email: form.email,
      password: form.password,
      licenseNumber: form.licenseNumber.trim() || undefined,
    })
    toast.promise(promise, {
      loading: 'Registering teacher...',
      success: 'Teacher registered successfully.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to register teacher.'),
    })

    try {
      await promise
      setForm({ name: '', email: '', password: '', licenseNumber: '' })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to register teacher.')
    }
  }

  const handleDeleteTeacher = async () => {
    if (!deleteModal) return
    const promise = deleteTeacher(deleteModal.id)
    toast.promise(promise, {
      loading: `Deleting ${deleteModal.name}...`,
      success: `Teacher ${deleteModal.name} deleted successfully.`,
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to delete teacher.'),
    })

    try {
      await promise
      setDeleteModal(null)
    } catch {
      // toast.promise already surfaced the error above
    }
  }

  const handleToggleActive = (teacherId: number, active: boolean) => {
    const promise = setActive(teacherId, !active)
    toast.promise(promise, {
      loading: active ? 'Disabling teacher...' : 'Enabling teacher...',
      success: active ? 'Teacher disabled.' : 'Teacher enabled.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to update teacher status.'),
    })
  }

  const handleAddSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!timetableForm.teacherId || !timetableForm.startTime || !timetableForm.endTime || !timetableForm.activity.trim()) return
    const promise = addTimetableSlot(Number(timetableForm.teacherId), {
      day: timetableForm.day,
      startTime: timetableForm.startTime,
      endTime: timetableForm.endTime,
      activity: timetableForm.activity.trim(),
    })

    toast.promise(promise, {
      loading: 'Adding timetable slot...',
      success: 'Slot added to timetable.',
      error: 'Failed to add timetable slot.'
    })

    try {
      await promise
      setTimetableForm({ ...timetableForm, startTime: '', endTime: '', activity: '' })
    } catch {
      // toast.promise already surfaced the error above
    }
  }

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Teachers</h2>
        <p className={sectionHeaderTextClass}>Register teachers and set their weekly lesson timetable.</p>
      </div>
      <div className="mb-5.5 grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <div className="flex flex-col gap-4.5">
          <h3 className="m-0 text-[#1F2937]">Register a teacher</h3>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent p-0 cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </label>
            <label className={labelClass}>
              License number <span className="text-[#6B7280]">(optional)</span>
              <input
                className={inputClass}
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="DL-RW-2024-00000"
              />
            </label>
            {formError && <ErrorState message={formError} />}
            <button type="submit" className={primaryButtonClass}>
              Register teacher
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-4.5">
          <h3 className="m-0 text-[#1F2937]">Your teachers</h3>
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
                  <div key={teacher.id} className={`${listItemClass} flex items-center justify-between`}>
                    <div>
                      <p className={itemTitleClass}>{teacher.name}</p>
                      <p className={itemMetaClass}>
                        <span>{teacher.email}</span>
                        {teacher.licenseNumber && <span>License: {teacher.licenseNumber}</span>}
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} /> {teacher.timetable.length} weekly slot{teacher.timetable.length === 1 ? '' : 's'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={teacher.active ? pillApprovedClass : pillNeutralClass}>
                        {teacher.active ? 'Active' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(teacher.id, teacher.active)}
                        title={teacher.active ? 'Disable teacher' : 'Enable teacher'}
                        className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none transition-colors ${teacher.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ id: teacher.id, name: teacher.name })}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4.5">
        <h3 className="m-0 text-[#1F2937]">Weekly timetable</h3>
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
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-[#f2f3f8] text-[#6B7280] hover:bg-[#E5EAF2]"
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

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Teacher"
      >
        <div className="grid gap-5">
          <p className="m-0 text-[#6B7280]">
            Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This will permanently remove them and clear their timetable.
          </p>
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setDeleteModal(null)}
              className="rounded-full bg-slate-100 px-5 py-2.5 text-[0.95rem] font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteTeacher}
              className="rounded-full bg-red-600 px-5 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-red-700"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CompanyTeachersPage
