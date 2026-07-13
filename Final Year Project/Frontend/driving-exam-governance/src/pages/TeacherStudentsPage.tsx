import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, GraduationCap, Search, UploadCloud, UserPlus, Users } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { ExamType, TrainingStatus } from '../types'
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
} from '../constants/ui'

const statusFilters: { value: 'ALL' | TrainingStatus; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'READY_FOR_EXAM', label: 'Ready for exam' },
  { value: 'IN_TRAINING', label: 'In training' },
]

const TeacherStudentsPage = () => {
  const { students, loading, error, register, setTrainingStatus } = useStudents()

  const [form, setForm] = useState({ name: '', nationalId: '', email: '', password: '', examType: 'CAR' as ExamType })
  const [photo, setPhoto] = useState<File | null>(null)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrainingStatus>('ALL')

  const readyStudents = students.filter((student) => student.trainingStatus === 'READY_FOR_EXAM')

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
  ]

  const handleRegisterStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')
    setFormSuccess('')
    if (!form.name.trim() || !form.nationalId.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Fill in name, national ID, email, and password before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const registered = await register(form, photo)
      setFormSuccess(
        `"${registered.name}" was registered successfully. Status: pending company approval — they can sign in once the company approves and they verify their email.`,
      )
      setForm({ name: '', nationalId: '', email: '', password: '', examType: 'CAR' })
      setPhoto(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
      } else {
        setFormError('Could not reach the server. Confirm the backend is running, then try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${panelClass} grid gap-5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Students</h2>
        <p className={sectionHeaderTextClass}>Register students and track their training progress.</p>
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
          <p className={itemMetaClass}>
            The student's account stays inactive until your company approves the registration and the student verifies
            their email.
          </p>
          {formError && <ErrorState message={formError} />}
          {formSuccess && (
            <p className="m-0 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
              <span>{formSuccess}</span>
            </p>
          )}
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}>
            {submitting ? 'Registering...' : 'Register student'}
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
                    {student.approvalStatus === 'PENDING' && (
                      <span className={pillPendingClass}>Awaiting company approval</span>
                    )}
                    {student.approvalStatus === 'REJECTED' && <span className={pillNeutralClass}>Rejected by company</span>}
                    {student.approvalStatus === 'APPROVED' && !student.emailVerified && (
                      <span className={pillPendingClass}>Awaiting email verification</span>
                    )}
                    <span className={student.trainingStatus === 'READY_FOR_EXAM' ? pillApprovedClass : pillPendingClass}>
                      {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                    </span>
                    <button
                      type="button"
                      disabled={student.approvalStatus !== 'APPROVED'}
                      title={student.approvalStatus !== 'APPROVED' ? 'The company must approve this student first.' : undefined}
                      onClick={() =>
                        setTrainingStatus(student.id, student.trainingStatus === 'READY_FOR_EXAM' ? 'IN_TRAINING' : 'READY_FOR_EXAM')
                      }
                      className={`${smallButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
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
  )
}

export default TeacherStudentsPage
