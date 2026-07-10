import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  CalendarCheck,
  Clock3,
  GraduationCap,
  Search,
  Trash2,
  UploadCloud,
  UserPlus,
  Users,
} from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useExamSlots } from '../hooks/useExamSlots'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { useTeachers } from '../hooks/useTeachers'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { ExamType, TrainingStatus, User, WeekDay } from '../types'
import {
  cardClass,
  fileInputClass,
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
  pillPendingClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
  todayIso,
} from '../constants/ui'

const weekDays: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const weekDayByJsIndex: (WeekDay | null)[] = [null, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const todayWeekDay: WeekDay | null = weekDayByJsIndex[new Date().getDay()]

const statusFilters: { value: 'ALL' | TrainingStatus; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'READY_FOR_EXAM', label: 'Ready for exam' },
  { value: 'IN_TRAINING', label: 'In training' },
]

const TeacherPortalPage = ({ user }: { user: User }) => {
  const { students, loading, error, register, setTrainingStatus } = useStudents()
  const { examSlots } = useExamSlots()
  const { registrations, book, cancel } = useExamRegistrations({ teacherId: user.teacherId ?? undefined })
  const { teachers, addTimetableSlot, removeTimetableSlot } = useTeachers()

  const [form, setForm] = useState({ name: '', nationalId: '', email: '', password: '', examType: 'CAR' as ExamType })
  const [photo, setPhoto] = useState<File | null>(null)
  const [formError, setFormError] = useState('')

  const [bookingForm, setBookingForm] = useState({ studentId: '', examSlotId: '' })
  const [bookingError, setBookingError] = useState('')

  const [timetableForm, setTimetableForm] = useState({ day: 'MON' as WeekDay, startTime: '', endTime: '', activity: '' })
  const [timetableError, setTimetableError] = useState('')

  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrainingStatus>('ALL')

  const myTeacher = teachers.find((teacher) => teacher.id === user.teacherId)
  const readyStudents = students.filter((student) => student.trainingStatus === 'READY_FOR_EXAM')
  const upcomingSlots = examSlots.filter((slot) => slot.examDate >= todayIso())
  const activeBookings = registrations.filter((registration) => registration.status === 'BOOKED')

  const filteredStudents = students.filter((student) => {
    const matchesStatus = statusFilter === 'ALL' || student.trainingStatus === statusFilter
    const haystack = `${student.name} ${student.nationalId} ${student.email}`.toLowerCase()
    const matchesSearch = haystack.includes(studentSearch.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = [
    { label: 'Total students', value: students.length, icon: Users, color: '#12385b' },
    { label: 'Ready for exam', value: readyStudents.length, icon: GraduationCap, color: '#10b981' },
    { label: 'In training', value: students.length - readyStudents.length, icon: UserPlus, color: '#f59e0b' },
    { label: 'Active bookings', value: activeBookings.length, icon: CalendarCheck, color: '#4f5cff' },
  ]

  const handleRegisterStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    if (!form.name.trim() || !form.nationalId.trim() || !form.email.trim() || !form.password.trim()) return
    try {
      await register(form, photo)
      setForm({ name: '', nationalId: '', email: '', password: '', examType: 'CAR' })
      setPhoto(null)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to register student.')
    }
  }

  const handleBook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBookingError('')
    if (!bookingForm.studentId || !bookingForm.examSlotId) return
    try {
      await book(Number(bookingForm.studentId), Number(bookingForm.examSlotId))
      setBookingForm({ studentId: '', examSlotId: '' })
    } catch (err) {
      setBookingError(err instanceof ApiError ? err.message : 'Failed to book this student.')
    }
  }

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
        <h2 className={sectionHeaderTitleClass}>Teacher portal</h2>
        <p className={sectionHeaderTextClass}>Register students, manage your timetable, and book them onto an exam.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{ backgroundColor: `${stat.color}1f`, color: stat.color }}
            >
              <stat.icon size={16} strokeWidth={2} />
            </span>
            <span className="text-[0.82rem] text-[#6c6f93]">{stat.label}</span>
            <strong className="text-[1.15rem] text-[#161a35]">{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4.5 max-[940px]:grid-cols-1">
        <div className="grid gap-4.5">
          <div className={cardClass}>
            <div className="flex items-center gap-2.5">
              <span className={iconBadgeClass}>
                <UserPlus size={18} strokeWidth={2} />
              </span>
              <h3 className="m-0 text-[#141a39]">Register a student</h3>
            </div>
            <form onSubmit={handleRegisterStudent} className={formGridClass}>
              <label className={labelClass}>
                Student name
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </label>
              <label className={labelClass}>
                National ID
                <input className={inputClass} value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="National ID" />
              </label>
              <label className={labelClass}>
                Email
                <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" />
              </label>
              <label className={labelClass}>
                Login password
                <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
              <label className={labelClass}>
                Exam type
                <select className={inputClass} value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value as ExamType })}>
                  <option value="CAR">Car</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="TRUCK">Truck</option>
                </select>
              </label>
              <label className={labelClass}>
                Student photo (for identity verification)
                <input type="file" accept="image/*" className={fileInputClass} onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                {photo && (
                  <span className="flex items-center gap-1.5 text-[0.8rem] text-brand-orange-strong">
                    <UploadCloud size={14} /> {photo.name}
                  </span>
                )}
              </label>
              {formError && <ErrorState message={formError} />}
              <button type="submit" className={primaryButtonClass}>
                Register student
              </button>
            </form>
          </div>

          <div className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={iconBadgeClass}>
                  <Users size={18} strokeWidth={2} />
                </span>
                <h3 className="m-0 text-[#141a39]">Your students</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold ${
                      statusFilter === filter.value ? 'bg-brand-navy text-white' : 'bg-[#f2f3f8] text-[#5a6178] hover:bg-[#e6e8f0]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2.5 rounded-2xl border border-[#d7d8e5] bg-white px-3.5 py-2.5">
              <Search size={16} strokeWidth={2} className="text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name, national ID, or email"
                className="flex-1 border-none bg-transparent text-[#23263b] outline-none placeholder:text-slate-400"
              />
            </label>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <div className={listCardClass}>
                {filteredStudents.length === 0 ? (
                  <p>{students.length === 0 ? 'No students registered yet.' : 'No students match your search.'}</p>
                ) : (
                  filteredStudents.map((student) => (
                    <div key={student.id} className={listItemClass}>
                      <div>
                        <p className={itemTitleClass}>{student.name}</p>
                        <p className={itemMetaClass}>
                          {student.nationalId} - {student.examType}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={student.trainingStatus === 'READY_FOR_EXAM' ? pillApprovedClass : pillPendingClass}>
                          {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setTrainingStatus(student.id, student.trainingStatus === 'READY_FOR_EXAM' ? 'IN_TRAINING' : 'READY_FOR_EXAM')
                          }
                          className={smallButtonClass}
                        >
                          Mark {student.trainingStatus === 'READY_FOR_EXAM' ? 'in training' : 'ready for exam'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4.5">
          <div className={cardClass}>
            <div className="flex items-center gap-2.5">
              <span className={iconBadgeClass}>
                <Clock3 size={18} strokeWidth={2} />
              </span>
              <h3 className="m-0 text-[#141a39]">My weekly timetable</h3>
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

          <div className={cardClass}>
            <div className="flex items-center gap-2.5">
              <span className={iconBadgeClass}>
                <CalendarCheck size={18} strokeWidth={2} />
              </span>
              <h3 className="m-0 text-[#141a39]">Book a student for an exam</h3>
            </div>
            <p className={itemMetaClass}>Only students marked "ready for exam" can be booked onto an upcoming slot.</p>
            <form onSubmit={handleBook} className="grid gap-2.5">
              <label className={labelClass}>
                Student
                <select className={inputClass} value={bookingForm.studentId} onChange={(e) => setBookingForm({ ...bookingForm, studentId: e.target.value })}>
                  <option value="">Select a ready student</option>
                  {readyStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Exam slot
                <select className={inputClass} value={bookingForm.examSlotId} onChange={(e) => setBookingForm({ ...bookingForm, examSlotId: e.target.value })}>
                  <option value="">Select a slot</option>
                  {upcomingSlots.map((slot) => (
                    <option key={slot.id} value={slot.id} disabled={slot.bookedCount >= slot.capacity}>
                      {slot.name} · {slot.examDate} {slot.startTime} ({slot.bookedCount}/{slot.capacity})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={primaryButtonClass} disabled={readyStudents.length === 0}>
                Book student
              </button>
            </form>
            {bookingError && <ErrorState message={bookingError} />}

            <div className={`${listCardClass} mt-2`}>
              {registrations.length === 0 ? (
                <p>No exam bookings yet.</p>
              ) : (
                registrations.map((registration) => (
                  <div key={registration.id} className={listItemClass}>
                    <div>
                      <p className={itemTitleClass}>{registration.studentName}</p>
                      <p className={itemMetaClass}>
                        {registration.examSlotName} · {registration.examSlotDate} {registration.examSlotStartTime}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {registration.status === 'CANCELLED' ? (
                        <span className={pillNeutralClass}>Cancelled</span>
                      ) : (
                        <>
                          <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
                            {registration.paid ? 'Paid' : 'Not paid'}
                          </span>
                          <button
                            type="button"
                            onClick={() => cancel(registration.id)}
                            className="cursor-pointer rounded-xl border border-[#e6e8f0] bg-white px-3 py-2 text-[0.82rem] font-semibold text-[#6c6f93] hover:border-red-200 hover:text-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherPortalPage
