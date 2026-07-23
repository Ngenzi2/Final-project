import { useState } from 'react'
import { Download } from 'lucide-react'
import { useCompanies } from '../../hooks/useCompanies'
import { useTeachers } from '../../hooks/useTeachers'
import { useStudents } from '../../hooks/useStudents'
import { useExamRegistrations } from '../../hooks/useExamRegistrations'
import { useExamSlots } from '../../hooks/useExamSlots'
import { useQrScanLogs } from '../../hooks/useQrScanLogs'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { StatCard } from '../../components/StatCard'
import { computeCompanyStats, computeExamSlotStats, computeRegistrationStats, computeStudentStats, computeTeacherStats } from '../../utils/stats'
import { groupStudentsByCompany } from '../../utils/analytics'
import { downloadCsv } from '../../utils/csvExport'
import {
  cardClass,
  formatCurrency,
  itemMetaClass,
  panelClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../../constants/ui'
import { Wallet, Building2, ClipboardList } from 'lucide-react'

type ReportsScope = 'AUTHORITY' | 'COMPANY' | 'EXAM_OFFICER'

const reportTypes = [
  { id: 'revenue', label: 'Revenue report', icon: Wallet },
  { id: 'company', label: 'Company performance report', icon: Building2 },
  { id: 'examStats', label: 'Examination statistics', icon: ClipboardList },
] as const

type ReportType = (typeof reportTypes)[number]['id']

const scopeTitles: Record<ReportsScope, string> = {
  AUTHORITY: 'Reports & analytics',
  COMPANY: 'Reports',
  EXAM_OFFICER: 'Smart reports',
}

export const ReportsPage = ({ scope }: { scope: ReportsScope }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('revenue')
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
  const { examSlots, loading: examSlotsLoading, error: examSlotsError } = useExamSlots()
  const canSeeScanLogs = scope !== 'COMPANY'
  const scanLogsHook = useQrScanLogs(canSeeScanLogs)
  const scanLogs = canSeeScanLogs ? scanLogsHook.scanLogs : []

  const loading = companiesLoading || teachersLoading || studentsLoading || registrationsLoading || examSlotsLoading || (canSeeScanLogs && scanLogsHook.loading)
  const error = companiesError || teachersError || studentsError || registrationsError || examSlotsError || (canSeeScanLogs ? scanLogsHook.error : null)

  if (loading) return <LoadingState label="Building report..." />
  if (error) return <ErrorState message={error} />

  const companyStats = computeCompanyStats(companies)
  const teacherStats = computeTeacherStats(teachers)
  const studentStats = computeStudentStats(students)
  const registrationStats = computeRegistrationStats(registrations)
  const examSlotStats = computeExamSlotStats(examSlots)
  const studentsPerCompany = groupStudentsByCompany(students, companies)

  const exportReport = () => {
    if (activeReport === 'revenue') {
      downloadCsv('revenue-report', ['Metric', 'Value'], [
        ['Total revenue', registrationStats.totalRevenue],
        ['Exam site share', registrationStats.siteRevenue],
        ['Driving company share', registrationStats.schoolRevenue],
        ['Paid registrations', registrationStats.paid],
        ['Awaiting payment', registrationStats.awaitingPayment],
      ])
    } else if (activeReport === 'company') {
      downloadCsv(
        'company-performance-report',
        ['Company', 'Students'],
        studentsPerCompany.map((row) => [row.name, row.value]),
      )
    } else {
      downloadCsv('examination-statistics', ['Metric', 'Value'], [
        ['Upcoming exams', examSlotStats.upcoming],
        ['Completed exams', examSlotStats.completed],
        ['Cancelled exams', examSlotStats.cancelled],
        ['Total capacity', examSlotStats.totalCapacity],
        ['Total booked', examSlotStats.totalBooked],
        ['Passed', registrationStats.passed],
        ['Failed', registrationStats.failed],
        ['Awaiting result', registrationStats.resultPending],
      ])
    }
  }

  return (
    <section className={`${panelClass} grid gap-5.5`}>
      <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
        <div>
          <h2 className={sectionHeaderTitleClass}>{scopeTitles[scope]}</h2>
          <p className={sectionHeaderTextClass}>Generated from live registration, payment, and examination data.</p>
        </div>
        <button type="button" onClick={exportReport} className={primaryButtonClass}>
          <span className="flex items-center gap-2">
            <Download size={16} /> Export CSV
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold ${
              activeReport === report.id ? 'border-brand-navy bg-brand-navy text-white' : 'border-[#E5EAF2] bg-white text-[#6B7280]'
            }`}
          >
            <report.icon size={16} /> {report.label}
          </button>
        ))}
      </div>

      {activeReport === 'revenue' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <StatCard icon={Wallet} label="Total revenue" value={formatCurrency(registrationStats.totalRevenue)} color="#0B3B6E" highlighted />
          <StatCard icon={Wallet} label="Exam site share" value={formatCurrency(registrationStats.siteRevenue)} color="#D9780F" />
          <StatCard icon={Wallet} label="Driving company share" value={formatCurrency(registrationStats.schoolRevenue)} color="#4f5cff" />
          <StatCard icon={Wallet} label="Paid registrations" value={registrationStats.paid} color="#22C55E" />
        </div>
      )}

      {activeReport === 'company' && (
        <div className={cardClass}>
          <h3 className="m-0 text-[#1F2937]">Students per company</h3>
          <div className="grid gap-2">
            {studentsPerCompany.map((row) => (
              <div key={row.name} className="flex items-center justify-between border-b border-[#E5EAF2] py-2">
                <span className={itemMetaClass}>{row.name}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
          <p className={itemMetaClass}>
            {companyStats.approved} approved · {companyStats.pending} pending · {companyStats.suspended} suspended companies ·{' '}
            {teacherStats.total} teachers total
          </p>
        </div>
      )}

      {activeReport === 'examStats' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <StatCard icon={ClipboardList} label="Upcoming exams" value={examSlotStats.upcoming} color="#0B3B6E" />
          <StatCard icon={ClipboardList} label="Completed exams" value={examSlotStats.completed} color="#6B7280" />
          <StatCard icon={ClipboardList} label="Passed" value={registrationStats.passed} color="#22C55E" />
          <StatCard icon={ClipboardList} label="Failed" value={registrationStats.failed} color="#EF4444" />
          <StatCard icon={ClipboardList} label="Awaiting result" value={registrationStats.resultPending} color="#F59E0B" />
          {canSeeScanLogs && <StatCard icon={ClipboardList} label="Total QR scans" value={scanLogs.length} color="#4f5cff" />}
          <StatCard icon={ClipboardList} label="Students ready for exam" value={studentStats.readyForExam} color="#0ea5e9" />
        </div>
      )}
    </section>
  )
}

export default ReportsPage
