import { useState } from 'react'
import type { FormEvent } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, Clock, GraduationCap, QrCode, Search, UploadCloud, UserPlus, Users, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { Modal } from '../components/Modal'
import { buildMonthlyRegistrations } from '../utils/analytics'
import { chartAxisColor, chartGridColor, chartPrimary, statusGood, statusWarning } from '../constants/chartColors'
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
  const { students, loading, error, register, setTrainingStatus, remove } = useStudents()
  const { registrations } = useExamRegistrations()

  const [form, setForm] = useState({ name: '', nationalId: '', email: '', examType: 'CAR' as ExamType })
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<{ id: number, name: string } | null>(null)

  const [studentSearch, setStudentSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TrainingStatus>('ALL')

  const filteredStudents = students.filter((student) => {
    const matchesStatus = statusFilter === 'ALL' || student.trainingStatus === statusFilter
    const haystack = `${student.name} ${student.nationalId} ${student.email}`.toLowerCase()
    const matchesSearch = haystack.includes(studentSearch.trim().toLowerCase())
    return matchesStatus && matchesSearch
  })

  const paidStudentIds = new Set(
    registrations.filter((r) => r.status === 'BOOKED' && r.paid).map((r) => r.studentId),
  )
  const pendingApproval = students.filter((s) => s.approvalStatus === 'PENDING').length
  const approved = students.filter((s) => s.approvalStatus === 'APPROVED').length
  const registrationTrend = buildMonthlyRegistrations(students.map((s) => s.registeredAt))
  const bookedStudentIds = new Set(registrations.filter((r) => r.status === 'BOOKED').map((r) => r.studentId))
  const completionRate = [
    { name: 'Paid', value: paidStudentIds.size, color: statusGood },
    { name: 'Awaiting payment', value: Math.max(0, bookedStudentIds.size - paidStudentIds.size), color: statusWarning },
  ]

  const handleRegisterStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim() || !form.nationalId.trim() || !form.email.trim()) {
      toast.error('Validation Error', { description: 'Fill in name, national ID, and email before submitting.' })
      return
    }
    setSubmitting(true)

    const promise = register(form, photo)
    toast.promise(promise, {
      loading: 'Registering student...',
      success: `"${form.name}" registered successfully.`,
      error: 'Failed to register student.'
    })

    try {
      await promise
      setForm({ name: '', nationalId: '', email: '', examType: 'CAR' })
      setPhoto(null)
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
        <StatCard icon={Users} label="Total students" value={students.length} color="#0B3B6E" />
        <StatCard icon={Clock} label="Pending approval" value={pendingApproval} color="#F59E0B" />
        <StatCard icon={CheckCircle2} label="Approved students" value={approved} color="#22C55E" />
        <StatCard icon={GraduationCap} label="Paid students" value={paidStudentIds.size} color="#4f5cff" />
        <StatCard icon={QrCode} label="QR generated" value={paidStudentIds.size} color="#0ea5e9" />
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Students registered per month">
          <BarChart data={registrationTrend}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="New students" fill={chartPrimary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Payment completion rate" height={200}>
          <PieChart>
            <Pie data={completionRate} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
              {completionRate.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-2.5">
          <span className={iconBadgeClass}>
            <UserPlus size={18} strokeWidth={2} />
          </span>
          <h3 className="m-0 text-[#1F2937]">Register a student</h3>
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
          <button type="submit" disabled={submitting} className={`${primaryButtonClass} mt-2 disabled:cursor-not-allowed disabled:opacity-60`}>
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
            <h3 className="m-0 text-[#1F2937]">Your students</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold ${statusFilter === filter.value ? 'bg-brand-navy text-white' : 'bg-[#f2f3f8] text-[#6B7280] hover:bg-[#E5EAF2]'
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2.5 rounded-2xl border border-[#E5EAF2] bg-white px-3.5 py-2.5">
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
                    <button
                      type="button"
                      title="Delete student"
                      onClick={() => setStudentToDelete({ id: student.id, name: student.name })}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c2410c] text-white shadow-sm transition-colors hover:bg-[#9a3412]"
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

      <Modal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        title="Delete Student Registration"
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 text-slate-600">
            Are you sure you want to completely delete <strong>{studentToDelete?.name}</strong>'s registration? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={() => setStudentToDelete(null)}
              className="px-4 py-2 border-none font-medium text-[0.9rem] rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                const id = studentToDelete!.id
                setStudentToDelete(null)
                toast.promise(remove(id), { loading: 'Deleting...', success: 'Student successfully deleted', error: 'Could not delete student' })
              }}
              className="px-4 py-2 border-none font-medium text-[0.9rem] rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
            >
              Yes, delete student
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TeacherStudentsPage
