import { useMemo } from 'react'
import { Building2, Clock, GraduationCap, QrCode, Users } from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { TrendLineChart } from '../components/TrendLineChart'
import { buildRegistrationTrend } from '../utils/trend'
import {
  cardClass,
  chartCardClass,
  formatCurrency,
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  paymentSplit,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
} from '../constants/ui'

const OverviewPage = () => {
  const { companies, loading: companiesLoading, error: companiesError, approve } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const loading = companiesLoading || teachersLoading || studentsLoading || registrationsLoading
  const error = companiesError || teachersError || studentsError || registrationsError

  const pendingCompanies = companies.filter((company) => !company.approved)
  const approvedCompanies = companies.filter((company) => company.approved)
  const paidCount = registrations.filter((registration) => registration.paid).length

  const dashboardStats = {
    approvedCompanies: approvedCompanies.length,
    pendingCompanies: pendingCompanies.length,
    teachers: teachers.length,
    students: students.length,
    paidCount,
    totalCollected: paidCount * (paymentSplit.site + paymentSplit.school),
    siteRevenue: paidCount * paymentSplit.site,
    schoolRevenue: paidCount * paymentSplit.school,
  }

  const registrationTrend = useMemo(
    () =>
      buildRegistrationTrend([
        ...companies.map((company) => company.registrationDate),
        ...teachers.map((teacher) => teacher.registeredAt),
        ...students.map((student) => student.registeredAt),
      ]),
    [companies, teachers, students],
  )

  const trendFirstValue = registrationTrend[0]?.value ?? 0
  const trendLastValue = registrationTrend[registrationTrend.length - 1]?.value ?? 0
  const trendDeltaLabel =
    trendFirstValue === 0
      ? trendLastValue > 0
        ? `+${trendLastValue}`
        : '—'
      : `${trendLastValue >= trendFirstValue ? '+' : ''}${Math.round(((trendLastValue - trendFirstValue) / trendFirstValue) * 100)}%`

  if (loading) return <LoadingState label="Loading dashboard..." />
  if (error) return <ErrorState message={error} />

  return (
    <section className={`${panelClass} grid gap-3.5 overflow-hidden`}>
      <div>
        <div className="mb-3.5">
          <h2 className={sectionHeaderTitleClass}>Dashboard overview</h2>
          <p className={sectionHeaderTextClass}>
            Live status for authority approvals, training structure, payment split, and QR eligibility.
          </p>
        </div>

        <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
          {[
            { label: 'Approved companies', value: dashboardStats.approvedCompanies, icon: Building2, color: '#10b981' },
            { label: 'Pending approvals', value: dashboardStats.pendingCompanies, icon: Clock, color: '#f59e0b' },
            { label: 'Active teachers', value: dashboardStats.teachers, icon: Users, color: '#12385b' },
            { label: 'Registered students', value: dashboardStats.students, icon: GraduationCap, color: '#4f5cff' },
            { label: 'QR tickets issued', value: dashboardStats.paidCount, icon: QrCode, color: '#0ea5e9' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="grid gap-1.5 rounded-xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-3.5"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${metric.color}1f`, color: metric.color }}
              >
                <metric.icon size={16} strokeWidth={2} />
              </span>
              <span className="text-[0.82rem] text-[#6c6f93]">{metric.label}</span>
              <strong className="text-[1.15rem] text-[#161a35]">{metric.value}</strong>
            </div>
          ))}
        </div>

        <div className="mb-3.5 grid grid-cols-[1.4fr_1fr] gap-3.5 max-[940px]:grid-cols-1">
          <div className={`${chartCardClass} min-h-40`}>
            <div className="flex items-center justify-between gap-3 font-bold text-[#5e7184]">
              <span>Registration trend</span>
              <strong className="text-brand-orange-strong">{trendDeltaLabel}</strong>
            </div>
            <TrendLineChart data={registrationTrend} />
          </div>
          <div className={`${chartCardClass} min-h-40`}>
            <div className="flex items-center justify-between gap-3 font-bold text-[#5e7184]">
              <span>Payment status</span>
              <strong className="text-brand-orange-strong">
                {dashboardStats.paidCount}/{registrations.length}
              </strong>
            </div>
            <div className="donut-chart relative m-auto grid h-24 w-24 place-items-center rounded-full">
              <span className="relative z-1 text-lg font-extrabold text-[#14243a]">{dashboardStats.paidCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
          <div className={cardClass}>
            <h3 className="m-0 text-[#141a39]">Approval queue</h3>
            <div className={listCardClass}>
              {pendingCompanies.length === 0 ? (
                <p>All driving companies are approved.</p>
              ) : (
                pendingCompanies.map((company) => (
                  <div key={company.id} className={listItemClass}>
                    <div>
                      <p className={itemTitleClass}>{company.name}</p>
                      <p className={itemMetaClass}>Waiting for authority approval</p>
                    </div>
                    <button type="button" onClick={() => approve(company.id)} className={smallButtonClass}>
                      Approve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className={cardClass}>
            <h3 className="m-0 text-[#141a39]">Payment distribution</h3>
            <div className="flex items-center justify-between gap-4 border-b border-[#e8ebf4] py-2.5 text-[#4b507a]">
              <span>Examination site</span>
              <strong className="text-[#141a39]">{formatCurrency(dashboardStats.siteRevenue)}</strong>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#e8ebf4] py-2.5 text-[#4b507a]">
              <span>Driving schools</span>
              <strong className="text-[#141a39]">{formatCurrency(dashboardStats.schoolRevenue)}</strong>
            </div>
            <p className={itemMetaClass}>
              Each paid registration contributes {formatCurrency(paymentSplit.site)} to the exam site and{' '}
              {formatCurrency(paymentSplit.school)} to the driving school.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="m-0 text-[#141a39]">QR verification status</h3>
            <div className="grid gap-1 rounded-2xl bg-brand-orange-tint p-4">
              <strong className="text-3xl leading-none text-brand-orange-strong">{dashboardStats.paidCount}</strong>
              <span className="font-bold text-[#92400e]">eligible bookings</span>
            </div>
            <p className={itemMetaClass}>
              Paid registrations receive QR tickets that verify identity, company, assigned teacher, and exam eligibility.
            </p>
          </div>
          <div className={cardClass}>
            <h3 className="m-0 text-[#141a39]">System hierarchy</h3>
            <ol className="m-0 grid list-none gap-2 pl-0 text-[#4b507a]">
              <li>Authority approves companies and schedules exam dates/times.</li>
              <li>Companies register and manage multiple teachers.</li>
              <li>Teachers train students and book them onto an exam slot.</li>
              <li>Students pay and use QR tickets for verification.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OverviewPage
