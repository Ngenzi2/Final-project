import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, LineChart, Area, AreaChart, Pie, PieChart, Cell, Legend } from 'recharts'
import { Building2, CheckCircle2, GraduationCap, QrCode, Users, Wallet } from 'lucide-react'
import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { useExamSlots } from '../hooks/useExamSlots'
import { useQrScanLogs } from '../hooks/useQrScanLogs'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { computeCompanyStats, computeExamSlotStats, computeRegistrationStats } from '../utils/stats'
import { attendanceDistribution, buildDailyQrScans, buildMonthlyRevenue, groupStudentsByCompany, groupTeachersByCompany, paymentStatusDistribution } from '../utils/analytics'
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
  sectionHeaderTextClass,
  smallButtonClass,
} from '../constants/ui'

const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const OverviewPage = ({ user }: { user: User }) => {
  const { companies, loading: companiesLoading, error: companiesError, approve } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
  const { examSlots, loading: examSlotsLoading, error: examSlotsError } = useExamSlots()
  const { scanLogs, loading: scanLogsLoading, error: scanLogsError } = useQrScanLogs()

  const loading = companiesLoading || teachersLoading || studentsLoading || registrationsLoading || examSlotsLoading || scanLogsLoading
  const error = companiesError || teachersError || studentsError || registrationsError || examSlotsError || scanLogsError

  if (loading) return <LoadingState label="Loading dashboard..." />
  if (error) return <ErrorState message={error} />

  const companyStats = computeCompanyStats(companies)
  const registrationStats = computeRegistrationStats(registrations)
  const examSlotStats = computeExamSlotStats(examSlots)
  const pendingCompanies = companies.filter((company) => !company.approved && !company.suspended)

  const studentsPerCompany = groupStudentsByCompany(students, companies)
  const teachersPerCompany = groupTeachersByCompany(teachers, companies)
  const monthlyRevenue = buildMonthlyRevenue(registrations)
  const paymentDistribution = paymentStatusDistribution(registrations)
  const attendance = attendanceDistribution(scanLogs)
  const dailyQrScans = buildDailyQrScans(scanLogs)
  const activity = buildActivityFeed({ companies, teachers, students, registrations, scanLogs })

  return (
    <section className="grid gap-5.5">
      <div className={`${panelClass} flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start`}>
        <div>
          <h2 className="m-0 text-[1.8rem] text-[#1F2937]">Welcome, {user.name}</h2>
          <p className={sectionHeaderTextClass}>{today()}</p>
        </div>
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E5EAF2] bg-white px-3.5 py-2.5 font-bold text-[#6B7280]">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
          <span>System operational</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <StatCard icon={Building2} label="Total driving companies" value={companyStats.total} color="#0B3B6E" />
        <StatCard icon={GraduationCap} label="Total teachers" value={teachers.length} color="#4f5cff" />
        <StatCard icon={Users} label="Total registered students" value={students.length} color="#0ea5e9" />
        <StatCard icon={CheckCircle2} label="Total paid students" value={registrationStats.paid} color="#22C55E" />
        <StatCard icon={Wallet} label="Total revenue collected" value={formatCurrency(registrationStats.totalRevenue)} color="#D9780F" highlighted />
        <StatCard icon={QrCode} label="Examinations conducted" value={examSlotStats.completed} color="#EF4444" />
      </div>

      <div className="grid grid-cols-3 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Students per company">
          <BarChart data={studentsPerCompany}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Students" fill={chartPrimary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Teachers per company">
          <BarChart data={teachersPerCompany}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Teachers" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Monthly revenue">
          <LineChart data={monthlyRevenue}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 12, fill: chartAxisColor }} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="value" name="Revenue" stroke={chartPrimary} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Payment status" height={200}>
          <PieChart>
            <Pie data={paymentDistribution} dataKey="value" nameKey="name" innerRadius={0} outerRadius={70} label>
              {paymentDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>
        <ChartCard title="Examination attendance" height={200}>
          <PieChart>
            <Pie data={attendance} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
              {attendance.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>
        <ChartCard title="Daily QR scans" height={200}>
          <AreaChart data={dailyQrScans}>
            <CartesianGrid stroke={chartGridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartAxisColor }} />
            <YAxis tick={{ fontSize: 11, fill: chartAxisColor }} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="value" name="Scans" stroke={chartPrimary} fill={chartPrimary} fillOpacity={0.18} strokeWidth={2} />
          </AreaChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
        <div className={cardClass}>
          <h3 className="m-0 text-[#1F2937]">Approval queue</h3>
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
          <h3 className="m-0 text-[#1F2937]">Recent activity</h3>
          <ActivityTimeline items={activity} />
        </div>
      </div>
    </section>
  )
}

export default OverviewPage
