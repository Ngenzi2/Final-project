import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2, Clock, GraduationCap, Users, Wallet } from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { computeRegistrationStats, computeStudentStats } from '../utils/stats'
import { buildMonthlyRegistrations, groupStudentsByTeacher, paymentStatusDistribution } from '../utils/analytics'
import { buildActivityFeed } from '../utils/activity'
import { chartAxisColor, chartGridColor, chartPrimary } from '../constants/chartColors'
import type { User } from '../types'
import {
  cardClass,
  formatCurrency,
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  paymentSplit,
  pillApprovedClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const CompanyOverviewPage = ({ user }: { user: User }) => {
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()

  const loading = companiesLoading || teachersLoading || studentsLoading || registrationsLoading
  const error = companiesError || teachersError || studentsError || registrationsError

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const company = companies.find((c) => c.id === user.companyId)
  const studentStats = computeStudentStats(students)
  const registrationStats = computeRegistrationStats(registrations)
  const studentsPerTeacher = groupStudentsByTeacher(students, teachers)
  const paymentDistribution = paymentStatusDistribution(registrations)
  const registrationTrend = buildMonthlyRegistrations(students.map((s) => s.registeredAt))
  const activity = buildActivityFeed({ teachers, students, registrations })

  return (
    <section className="grid gap-5.5">
      <div className={panelClass}>
        <h2 className={sectionHeaderTitleClass}>Company overview</h2>
        <p className={sectionHeaderTextClass}>
          Snapshot of <strong>{company?.name ?? 'your company'}</strong>'s registration status, teachers, and students.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <StatCard icon={GraduationCap} label="Total teachers" value={teachers.length} color="#4f5cff" />
        <StatCard icon={Users} label="Total registered students" value={studentStats.total} color="#0ea5e9" />
        <StatCard icon={CheckCircle2} label="Approved students" value={studentStats.approved} color="#22C55E" />
        <StatCard icon={Clock} label="Pending students" value={studentStats.pending} color="#F59E0B" />
        <StatCard icon={CheckCircle2} label="Paid students" value={registrationStats.paid} color="#0B3B6E" />
        <StatCard
          icon={Wallet}
          label="Total revenue received (30K share)"
          value={formatCurrency(registrationStats.schoolRevenue)}
          color="#D9780F"
          highlighted
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Students per teacher">
          <BarChart data={studentsPerTeacher}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Students" fill={chartPrimary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Student registration trend">
          <BarChart data={registrationTrend}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="New students" fill={chartPrimary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Payment status distribution" height={200}>
          <PieChart>
            <Pie data={paymentDistribution} dataKey="value" nameKey="name" outerRadius={70} label>
              {paymentDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>
        <div className={cardClass}>
          <h3 className="m-0 text-[#1F2937]">Company profile</h3>
          {company ? (
            <div className={listCardClass}>
              <div className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>{company.name}</p>
                  <p className={itemMetaClass}>
                    <span>{company.district || 'No district set'}</span>
                    <span>{company.email}</span>
                  </p>
                </div>
                <span className={company.approved ? pillApprovedClass : pillPendingClass}>
                  {company.approved ? 'Approved' : 'Pending approval'}
                </span>
              </div>
              <div className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>Administrator</p>
                  <p className={itemMetaClass}>
                    <span>{company.admin.fullName || 'Not set'}</span>
                    <span>{company.admin.position || 'No position'}</span>
                  </p>
                </div>
              </div>
              <div className={listItemClass}>
                <p className={itemTitleClass}>Payment split per paid student</p>
                <p className={itemMetaClass}>
                  {formatCurrency(paymentSplit.school)} to your company · {formatCurrency(paymentSplit.site)} to the exam site
                </p>
              </div>
            </div>
          ) : (
            <p>No company profile found for this account.</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="m-0 text-[#1F2937]">Recent activity</h3>
        <ActivityTimeline items={activity} />
      </div>
    </section>
  )
}

export default CompanyOverviewPage
