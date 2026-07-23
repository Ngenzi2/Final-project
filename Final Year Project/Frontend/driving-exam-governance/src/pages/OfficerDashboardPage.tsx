import { useEffect } from 'react'
import { Users, ScanLine, AlertTriangle, CalendarCheck2, ShieldAlert, LineChart, TrendingUp, PieChart, MapPin, ShieldCheck } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useQrScanLogs } from '../hooks/useQrScanLogs'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { useExamSlots } from '../hooks/useExamSlots'
import { useCompanies } from '../hooks/useCompanies'
import { useOfficerAttendance } from '../hooks/useOfficer'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
    detectDuplicateNationalIds,
    detectRepeatedQrAttempts,
    detectUnauthorizedAttempts,
    detectSuspiciousPayments,
    analyzeCapacity,
    buildDailyRevenue,
    projectNextPeriod,
    groupStudentsByCompany,
} from '../utils/analytics'
import { computeRegistrationStats, computeExamSlotStats } from '../utils/stats'
import { downloadCsv } from '../utils/csvExport'
import { cardClass, formatCurrency, iconBadgeClass, panelClass, sectionHeaderTextClass, sectionHeaderTitleClass, todayIso } from '../constants/ui'

const isSameDay = (iso: string, reference: Date) => {
    const d = new Date(iso)
    return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth() && d.getDate() === reference.getDate()
}

const OfficerDashboardPage = () => {
    const today = todayIso()
    const { students, loading: studentsLoading, error: studentsError } = useStudents()
    const { scanLogs, loading: scanLogsLoading, error: scanLogsError } = useQrScanLogs()
    const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
    const { examSlots, loading: examSlotsLoading, error: examSlotsError } = useExamSlots()
    const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
    const {
        records: attendanceRecords,
        loading: attendanceLoading,
        error: attendanceError,
        refetch: refetchAttendance,
    } = useOfficerAttendance(today)

    useEffect(() => {
        refetchAttendance()
    }, [refetchAttendance])

    const loading = studentsLoading || scanLogsLoading || registrationsLoading || examSlotsLoading || companiesLoading || attendanceLoading
    const error = studentsError || scanLogsError || registrationsError || examSlotsError || companiesError || attendanceError

    if (loading) return <LoadingState label="Loading officer dashboard..." />
    if (error) return <ErrorState message={error} />

    const now = new Date()
    const scansToday = scanLogs.filter((log) => isSameDay(log.scannedAt, now))
    const verifiedToday = attendanceRecords.filter((r) => r.attended).length
    const invalidToday = scansToday.filter((log) => !log.eligible).length
    const attendanceRate = attendanceRecords.length ? Math.round((verifiedToday / attendanceRecords.length) * 100) : 0

    const stats = [
        { label: 'Verified Today', value: verifiedToday, icon: Users, color: '#0B3B6E' },
        { label: 'Total QR Scans Today', value: scansToday.length, icon: ScanLine, color: '#3b82f6' },
        { label: 'Invalid Attempts Today', value: invalidToday, icon: AlertTriangle, color: '#ef4444' },
        { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: CalendarCheck2, color: '#10b981' },
    ]

    const duplicateIds = detectDuplicateNationalIds(students)
    const suspiciousPayments = detectSuspiciousPayments(registrations)
    const repeatedQr = detectRepeatedQrAttempts(scanLogs)
    const unauthorized = detectUnauthorizedAttempts(scanLogs)

    const fraudAlerts = [
        ...duplicateIds.map((f) => ({
            type: 'Duplicate National ID',
            details: `National ID ${f.nationalId} is shared by ${f.students.length} students: ${f.students.map((s) => s.name).join(', ')}.`,
            severity: 'High' as const,
        })),
        ...suspiciousPayments.map((r) => ({
            type: 'Suspicious Payment',
            details: `Registration #${r.id} (${r.studentName}) is marked paid but has no recorded payment date.`,
            severity: 'Critical' as const,
        })),
        ...repeatedQr.map((f) => ({
            type: 'Multiple QR Attempts',
            details: `QR code ${f.qrCode} was scanned ${f.attempts} times (${f.ineligibleAttempts} ineligible attempts).`,
            severity: 'Medium' as const,
        })),
        ...unauthorized.map((log) => ({
            type: 'Unauthorized Access',
            details: `Scan of "${log.qrCode}" by ${log.scannedByName} matched no registration on record.`,
            severity: 'Critical' as const,
        })),
    ]

    const todaysSlots = examSlots.filter((s) => s.examDate === today && !s.cancelled)
    const totalCapacityToday = todaysSlots.reduce((sum, s) => sum + s.capacity, 0)
    const totalBookedToday = todaysSlots.reduce((sum, s) => sum + s.bookedCount, 0)
    const capacityRemainingPct = totalCapacityToday
        ? Math.round(((totalCapacityToday - totalBookedToday) / totalCapacityToday) * 100)
        : 0
    const eligiblePaidToday = attendanceRecords.filter((r) => r.paid).length
    const nearFullSlots = analyzeCapacity(todaysSlots)

    const dailyRevenue = buildDailyRevenue(registrations)
    const projectedRevenue = projectNextPeriod(dailyRevenue)

    const registrationStats = computeRegistrationStats(registrations)
    const examSlotStats = computeExamSlotStats(examSlots)
    const studentsPerCompany = groupStudentsByCompany(students, companies)

    const exportRevenue = () =>
        downloadCsv('revenue-report', ['Metric', 'Value'], [
            ['Total revenue', registrationStats.totalRevenue],
            ['Exam site share', registrationStats.siteRevenue],
            ['Driving company share', registrationStats.schoolRevenue],
            ['Projected next-day revenue', projectedRevenue],
        ])

    const exportCompanyPerformance = () =>
        downloadCsv(
            'company-performance-report',
            ['Company', 'Students'],
            studentsPerCompany.map((row) => [row.name, row.value]),
        )

    const exportExamStats = () =>
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

    return (
        <div className={`${panelClass} grid gap-6`}>
            <div>
                <h2 className={sectionHeaderTitleClass}>Officer Dashboard</h2>
                <p className={sectionHeaderTextClass}>Monitor live examination verification, AI fraud detection, and attendance analytics.</p>
            </div>

            {/* Top Statistics */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-2 rounded-2xl border border-[#E5EAF2] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={20} />
                        </span>
                        <span className="mt-1 text-[0.85rem] font-semibold text-[#6B7280]">{stat.label}</span>
                        <strong className="text-3xl font-bold text-[#1F2937]">{stat.value}</strong>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fraud Detection Panel */}
                <div className={`${cardClass} border-l-4 border-red-500`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className={iconBadgeClass}><ShieldAlert size={18} className="text-red-600" /></span>
                            <h3 className="m-0 text-lg font-bold text-[#1F2937]">AI Fraud Detection</h3>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" /> Live analyzing
                        </span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {fraudAlerts.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100 p-4 text-emerald-700">
                                <ShieldCheck size={18} />
                                <span className="text-sm font-semibold">No anomalies detected across current registrations and scans.</span>
                            </div>
                        ) : (
                            fraudAlerts.map((alert, i) => (
                                <div key={i} className="flex flex-col gap-1 rounded-xl bg-orange-50/50 border border-orange-100 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-orange-900 text-sm">{alert.type}</span>
                                        <span className={`text-[0.65rem] font-bold uppercase px-2 py-0.5 border rounded-full ${alert.severity === 'High' || alert.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p className="m-0 text-xs text-orange-800/80">{alert.details}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Predictive Analytics */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={iconBadgeClass}><LineChart size={18} className="text-emerald-600" /></span>
                        <h3 className="m-0 text-lg font-bold text-[#1F2937]">Predictive Analytics</h3>
                    </div>
                    <div className="grid grid-rows-3 gap-3">
                        <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Users size={16} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">Expected Attendance Today</span>
                            </div>
                            <strong className="text-brand-navy">
                                {eligiblePaidToday} / {totalBookedToday || attendanceRecords.length}
                            </strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <TrendingUp size={16} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">Revenue Prediction (Next Day)</span>
                            </div>
                            <strong className="text-emerald-600">{formatCurrency(projectedRevenue)}</strong>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">
                                    Site Capacity Remaining
                                    {nearFullSlots.length > 0 && (
                                        <span className="block text-[0.7rem] font-medium text-red-500">{nearFullSlots.length} slot(s) near full</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${capacityRemainingPct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-500">{capacityRemainingPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Reports Hub */}
            <div className={cardClass}>
                <div className="flex items-center mb-5 gap-2">
                    <span className={iconBadgeClass}><PieChart size={18} className="text-brand-orange-strong" /></span>
                    <h3 className="m-0 text-lg font-bold text-[#1F2937]">Smart Reports Generation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={exportRevenue}
                        className="flex flex-col items-start gap-2 p-4 bg-slate-50 border border-slate-200 hover:border-brand-navy hover:bg-[#e6f6ff] transition-all rounded-xl text-left cursor-pointer"
                    >
                        <h4 className="m-0 font-bold text-slate-800">Revenue Prediction</h4>
                        <p className="m-0 text-xs text-slate-500">Download real revenue totals and next-day projection as CSV.</p>
                    </button>
                    <button
                        onClick={exportCompanyPerformance}
                        className="flex flex-col items-start gap-2 p-4 bg-slate-50 border border-slate-200 hover:border-brand-navy hover:bg-[#e6f6ff] transition-all rounded-xl text-left cursor-pointer"
                    >
                        <h4 className="m-0 font-bold text-slate-800">Company Performance</h4>
                        <p className="m-0 text-xs text-slate-500">Rank driving schools by registered student volume.</p>
                    </button>
                    <button
                        onClick={exportExamStats}
                        className="flex flex-col items-start gap-2 p-4 bg-slate-50 border border-slate-200 hover:border-brand-navy hover:bg-[#e6f6ff] transition-all rounded-xl text-left cursor-pointer"
                    >
                        <h4 className="m-0 font-bold text-slate-800">Aggregate Statistics</h4>
                        <p className="m-0 text-xs text-slate-500">Downloadable CSV summarizing local governance capacities.</p>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default OfficerDashboardPage
