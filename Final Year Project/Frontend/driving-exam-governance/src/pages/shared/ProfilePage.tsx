import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { useCompanies } from '../../hooks/useCompanies'
import { useTeachers } from '../../hooks/useTeachers'
import { useStudents } from '../../hooks/useStudents'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { ApiError } from '../../api/client'
import type { User } from '../../types'
import {
  cardClass,
  formGridClass,
  inputClass,
  itemMetaClass,
  itemTitleClass,
  labelClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillPendingClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../../constants/ui'

const roleLabels: Record<User['role'], string> = {
  AUTHORITY: 'Examination Authority',
  COMPANY: 'Driving Company',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  EXAM_OFFICER: 'Examination Officer',
}

const AccountCard = ({ user }: { user: User }) => (
  <div className={cardClass}>
    <h3 className="m-0 text-[#1F2937]">Account</h3>
    <div className={listCardClass}>
      <div className={listItemClass}>
        <div>
          <p className={itemTitleClass}>{user.name}</p>
          <p className={itemMetaClass}>{user.email}</p>
        </div>
        <span className={pillApprovedClass}>{roleLabels[user.role]}</span>
      </div>
    </div>
  </div>
)

const CompanyProfileSection = ({ user }: { user: User }) => {
  const { companies, loading, error, update } = useCompanies()
  const company = companies.find((c) => c.id === user.companyId)
  const [form, setForm] = useState({ email: '', phone: '', address: '', district: '' })
  const [initialized, setInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  if (company && !initialized) {
    setForm({ email: company.email, phone: company.phone, address: company.address, district: company.district })
    setInitialized(true)
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!company) return <p>No company profile found for this account.</p>

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    const promise = update(company.id, form)
    toast.promise(promise, {
      loading: 'Saving company profile...',
      success: 'Company profile updated.',
      error: (err) => (err instanceof ApiError ? err.message : 'Failed to update company profile.'),
    })
    try {
      await promise
    } catch {
      // toast.promise already surfaced the error above
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cardClass}>
      <h3 className="m-0 text-[#1F2937]">Company profile</h3>
      <div className={listItemClass}>
        <div>
          <p className={itemTitleClass}>{company.name}</p>
          <p className={itemMetaClass}>{company.registrationNumber}</p>
        </div>
        <span className={company.approved ? pillApprovedClass : pillPendingClass}>
          {company.approved ? 'Approved' : 'Pending approval'}
        </span>
      </div>
      <form onSubmit={handleSubmit} className={formGridClass}>
        <label className={labelClass}>
          Contact email
          <input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className={labelClass}>
          Phone
          <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className={labelClass}>
          District
          <input className={inputClass} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
        </label>
        <label className={labelClass}>
          Address
          <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

const TeacherProfileSection = ({ user }: { user: User }) => {
  const { teachers, loading, error } = useTeachers()
  const teacher = teachers.find((t) => t.id === user.teacherId)

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!teacher) return <p>No teacher record found for this account.</p>

  return (
    <div className={cardClass}>
      <h3 className="m-0 text-[#1F2937]">Teacher record</h3>
      <div className={listCardClass}>
        <div className={listItemClass}>
          <div>
            <p className={itemTitleClass}>{teacher.name}</p>
            <p className={itemMetaClass}>{teacher.email}</p>
          </div>
        </div>
        <p className={itemMetaClass}>License number: {teacher.licenseNumber ?? 'Not provided'}</p>
        <p className={itemMetaClass}>Registered: {teacher.registeredAt}</p>
        <p className={itemMetaClass}>Weekly timetable slots: {teacher.timetable.length}</p>
      </div>
    </div>
  )
}

const StudentProfileSection = ({ user }: { user: User }) => {
  const { students, loading, error } = useStudents()
  const student = students.find((s) => s.id === user.studentId)

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!student) return <p>No student record found for this account.</p>

  return (
    <div className={cardClass}>
      <h3 className="m-0 text-[#1F2937]">Student record</h3>
      <div className={listCardClass}>
        <div className={listItemClass}>
          <div>
            <p className={itemTitleClass}>{student.name}</p>
            <p className={itemMetaClass}>{student.email}</p>
          </div>
        </div>
        <p className={itemMetaClass}>National ID: {student.nationalId}</p>
        <p className={itemMetaClass}>Exam type: {student.examType}</p>
        <p className={itemMetaClass}>Registered: {student.registeredAt}</p>
      </div>
    </div>
  )
}

export const ProfilePage = ({ user }: { user: User }) => {
  return (
    <section className={`${panelClass} grid gap-5.5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Profile</h2>
        <p className={sectionHeaderTextClass}>Your account details.</p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <AccountCard user={user} />
        {user.role === 'COMPANY' && <CompanyProfileSection user={user} />}
        {user.role === 'TEACHER' && <TeacherProfileSection user={user} />}
        {user.role === 'STUDENT' && <StudentProfileSection user={user} />}
      </div>
    </section>
  )
}

export default ProfilePage
