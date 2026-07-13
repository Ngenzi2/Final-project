import { useMemo, useState } from 'react'
import { Building2, ChevronDown, ChevronRight, GraduationCap, Search, Users, Wallet } from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  formatCurrency,
  itemMetaClass,
  itemTitleClass,
  panelClass,
  paymentSplit,
  pillApprovedClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const perPayment = paymentSplit.site + paymentSplit.school

const DirectoryPage = () => {
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const [search, setSearch] = useState('')
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set())
  const [expandedTeachers, setExpandedTeachers] = useState<Set<number>>(new Set())

  const loading = companiesLoading || teachersLoading || studentsLoading || registrationsLoading
  const error = companiesError || teachersError || studentsError || registrationsError

  const toggleCompany = (id: number) => {
    setExpandedCompanies((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTeacher = (id: number) => {
    setExpandedTeachers((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const needle = search.trim().toLowerCase()

  const paidRegistrations = useMemo(() => registrations.filter((registration) => registration.paid), [registrations])

  const totals = {
    paidCount: paidRegistrations.length,
    collected: paidRegistrations.length * perPayment,
    siteShare: paidRegistrations.length * paymentSplit.site,
    schoolShare: paidRegistrations.length * paymentSplit.school,
  }

  const hierarchy = useMemo(() => {
    return companies
      .map((company) => {
        const companyPaid = paidRegistrations.filter((registration) => registration.companyId === company.id)

        const companyTeachers = teachers
          .filter((teacher) => teacher.companyId === company.id)
          .map((teacher) => {
            const teacherStudents = students
              .filter((student) => student.teacherId === teacher.id)
              .map((student) => ({
                student,
                paidCount: paidRegistrations.filter((registration) => registration.studentId === student.id).length,
              }))
            const teacherPaid = paidRegistrations.filter((registration) => registration.teacherId === teacher.id)

            return { teacher, teacherStudents, teacherPaidCount: teacherPaid.length }
          })

        return {
          company,
          companyTeachers,
          companyPaidCount: companyPaid.length,
          companyRevenue: companyPaid.length * paymentSplit.school,
          companySiteShare: companyPaid.length * paymentSplit.site,
        }
      })
      .filter(({ company, companyTeachers }) => {
        if (!needle) return true
        if (company.name.toLowerCase().includes(needle)) return true
        return companyTeachers.some(
          ({ teacher, teacherStudents }) =>
            teacher.name.toLowerCase().includes(needle) ||
            teacherStudents.some(
              ({ student }) => student.name.toLowerCase().includes(needle) || student.nationalId.toLowerCase().includes(needle),
            ),
        )
      })
  }, [companies, teachers, students, paidRegistrations, needle])

  if (loading) return <LoadingState label="Loading directory..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className={`${panelClass} grid gap-5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>System directory</h2>
        <p className={sectionHeaderTextClass}>
          Every company, its teachers, and each teacher's students — plus who has paid and where that money goes.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <div className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: '#0ea5e91f', color: '#0ea5e9' }}>
            <Wallet size={16} strokeWidth={2} />
          </span>
          <span className="text-[0.82rem] text-[#6c6f93]">Total collected ({totals.paidCount} paid)</span>
          <strong className="text-[1.15rem] text-[#161a35]">{formatCurrency(totals.collected)}</strong>
        </div>
        <div className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: '#12385b1f', color: '#12385b' }}>
            <Wallet size={16} strokeWidth={2} />
          </span>
          <span className="text-[0.82rem] text-[#6c6f93]">Exam site share ({formatCurrency(paymentSplit.site)} each)</span>
          <strong className="text-[1.15rem] text-[#161a35]">{formatCurrency(totals.siteShare)}</strong>
        </div>
        <div className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: '#10b9811f', color: '#10b981' }}>
            <Wallet size={16} strokeWidth={2} />
          </span>
          <span className="text-[0.82rem] text-[#6c6f93]">Companies' share ({formatCurrency(paymentSplit.school)} each)</span>
          <strong className="text-[1.15rem] text-[#161a35]">{formatCurrency(totals.schoolShare)}</strong>
        </div>
      </div>
      <p className={itemMetaClass}>
        Each paid registration is {formatCurrency(perPayment)}: {formatCurrency(paymentSplit.site)} stays with the exam site and{' '}
        {formatCurrency(paymentSplit.school)} goes to the student's driving company.
      </p>

      <label className="flex items-center gap-2.5 rounded-2xl border border-[#d7d8e5] bg-white px-3.5 py-2.5">
        <Search size={16} strokeWidth={2} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company, teacher, student name, or national ID"
          className="flex-1 border-none bg-transparent text-[#23263b] outline-none placeholder:text-slate-400"
        />
      </label>

      {hierarchy.length === 0 ? (
        <p className={itemMetaClass}>No companies match your search.</p>
      ) : (
        <div className="grid gap-3.5">
          {hierarchy.map(({ company, companyTeachers, companyPaidCount, companyRevenue, companySiteShare }) => {
            const companyExpanded = expandedCompanies.has(company.id)
            const totalStudents = companyTeachers.reduce((sum, entry) => sum + entry.teacherStudents.length, 0)

            return (
              <div key={company.id} className="rounded-2xl border border-[#e6e8f0] bg-white">
                <button
                  type="button"
                  onClick={() => toggleCompany(company.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4.5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center text-[#6c6f93]">
                      {companyExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-navy/10 text-brand-navy">
                      <Building2 size={18} strokeWidth={2} />
                    </span>
                    <div>
                      <p className={itemTitleClass}>{company.name}</p>
                      <p className={itemMetaClass}>
                        {company.district || 'No district'} · {companyTeachers.length} teacher
                        {companyTeachers.length === 1 ? '' : 's'} · {totalStudents} student{totalStudents === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="grid justify-items-end gap-0.5 rounded-xl bg-[#10b981]/10 px-3 py-2">
                      <span className="text-[0.75rem] font-semibold text-[#0f7a5c]">Company received</span>
                      <strong className="text-[0.95rem] text-[#0f7a5c]">{formatCurrency(companyRevenue)}</strong>
                    </div>
                    <div className="grid justify-items-end gap-0.5 rounded-xl bg-brand-navy/10 px-3 py-2 max-[640px]:hidden">
                      <span className="text-[0.75rem] font-semibold text-brand-navy">Site received</span>
                      <strong className="text-[0.95rem] text-brand-navy">{formatCurrency(companySiteShare)}</strong>
                    </div>
                    <span className={company.approved ? pillApprovedClass : pillPendingClass}>
                      {company.approved ? 'Approved' : 'Pending approval'}
                    </span>
                  </div>
                </button>

                {companyExpanded && (
                  <div className="grid gap-2.5 border-t border-[#eceef4] px-4.5 py-3.5 pl-14 max-[640px]:pl-4.5">
                    <p className={itemMetaClass}>
                      {companyPaidCount} paid registration{companyPaidCount === 1 ? '' : 's'} from this company's students ={' '}
                      {formatCurrency(companyRevenue)} to the company + {formatCurrency(companySiteShare)} to the exam site.
                    </p>
                    {companyTeachers.length === 0 ? (
                      <p className={itemMetaClass}>No teachers registered yet.</p>
                    ) : (
                      companyTeachers.map(({ teacher, teacherStudents, teacherPaidCount }) => {
                        const teacherExpanded = expandedTeachers.has(teacher.id)
                        const readyCount = teacherStudents.filter(({ student }) => student.trainingStatus === 'READY_FOR_EXAM').length

                        return (
                          <div key={teacher.id} className="rounded-xl border border-[#eceef4] bg-[#fbfcff]">
                            <button
                              type="button"
                              onClick={() => toggleTeacher(teacher.id)}
                              className="flex w-full flex-wrap items-center justify-between gap-3 px-3.5 py-3 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <span className="grid h-5 w-5 shrink-0 place-items-center text-[#6c6f93]">
                                  {teacherExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-orange-tint text-brand-orange-strong">
                                  <GraduationCap size={16} strokeWidth={2} />
                                </span>
                                <div>
                                  <p className={itemTitleClass}>{teacher.name}</p>
                                  <p className={itemMetaClass}>
                                    {teacher.email} · {teacherStudents.length} student{teacherStudents.length === 1 ? '' : 's'} ·{' '}
                                    {readyCount} ready for exam
                                  </p>
                                </div>
                              </div>
                              <span className="text-[0.8rem] font-semibold text-[#0f7a5c]">
                                {teacherPaidCount} paid · {formatCurrency(teacherPaidCount * paymentSplit.school)} earned for company
                              </span>
                            </button>

                            {teacherExpanded && (
                              <div className="grid gap-2 border-t border-[#eceef4] px-3.5 py-3 pl-11 max-[640px]:pl-3.5">
                                {teacherStudents.length === 0 ? (
                                  <p className={itemMetaClass}>No students registered yet.</p>
                                ) : (
                                  teacherStudents.map(({ student, paidCount }) => (
                                    <div
                                      key={student.id}
                                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#eceef4] bg-white px-3.5 py-2.5"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#4f5cff]/10 text-[#2c38b0]">
                                          <Users size={14} strokeWidth={2} />
                                        </span>
                                        <div>
                                          <p className={itemTitleClass}>{student.name}</p>
                                          <p className={itemMetaClass}>
                                            {student.nationalId} · {student.examType}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2.5">
                                        {student.approvalStatus === 'PENDING' && <span className={pillPendingClass}>Pending company approval</span>}
                                        {student.approvalStatus === 'REJECTED' && <span className={pillNeutralClass}>Rejected</span>}
                                        {student.approvalStatus === 'APPROVED' && !student.emailVerified && (
                                          <span className={pillPendingClass}>Awaiting email verification</span>
                                        )}
                                        <span className={student.trainingStatus === 'READY_FOR_EXAM' ? pillApprovedClass : pillNeutralClass}>
                                          {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                                        </span>
                                        {paidCount > 0 ? (
                                          <span className={pillApprovedClass}>
                                            Paid {formatCurrency(paidCount * perPayment)} (site {formatCurrency(paidCount * paymentSplit.site)} ·
                                            company {formatCurrency(paidCount * paymentSplit.school)})
                                          </span>
                                        ) : (
                                          <span className={pillPendingClass}>Not paid</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default DirectoryPage
