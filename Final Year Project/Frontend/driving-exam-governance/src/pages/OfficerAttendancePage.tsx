import { useEffect, useState } from 'react'
import { CalendarCheck2, Clock, CheckCircle2, XCircle, UserCheck2 } from 'lucide-react'
import { useOfficerAttendance } from '../hooks/useOfficer'
import { SkeletonListRow } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { glassPanelClass, sectionHeaderTextClass, sectionHeaderTitleClass } from '../constants/ui'

const OfficerAttendancePage = () => {
    const [date] = useState(new Date().toISOString().split('T')[0])
    const { records, loading, error, refetch } = useOfficerAttendance(date)

    useEffect(() => {
        refetch()
    }, [refetch])

    const present = records.filter(r => r.attended)
    const absent = records.filter(r => !r.attended)

    return (
        <div className={`${glassPanelClass} flex flex-col gap-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={sectionHeaderTitleClass}>Attendance Management</h2>
                    <p className={sectionHeaderTextClass}>Track real-time examination attendance for all registered students.</p>
                </div>
                <div className="flex items-center gap-2 bg-[#F6F8FC]/80 backdrop-blur-sm px-4 py-2 border border-slate-200/70 rounded-xl whitespace-nowrap shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    <CalendarCheck2 size={16} className="text-brand-orange-strong" />
                    <span className="font-bold text-[#1F2937]">{date}</span>
                </div>
            </div>

            {error ? (
                <ErrorState message={error} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Present Column */}
                    <div className="bg-white/95 text-left rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                        <div className="bg-emerald-50/60 p-4 border-b border-emerald-100/70 flex items-center justify-between">
                            <h3 className="m-0 text-emerald-800 font-bold flex items-center gap-2 tracking-tight">
                                <CheckCircle2 size={18} /> Present Students
                            </h3>
                            <span className="bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">{loading ? '—' : present.length}</span>
                        </div>
                        <div className="divide-y divide-emerald-50">
                            {loading ? (
                                <div className="flex flex-col gap-3 p-4">
                                    <SkeletonListRow />
                                    <SkeletonListRow />
                                    <SkeletonListRow />
                                </div>
                            ) : present.length === 0 ? (
                                <EmptyState
                                    icon={UserCheck2}
                                    tone="good"
                                    title="No students verified yet"
                                    description="Verified students will appear here in real time as officers scan them in."
                                />
                            ) : (
                                present.map((student, i) => (
                                    <div
                                        key={i}
                                        className="animate-slide-up flex justify-between items-center p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-emerald-50/40 hover:shadow-[0_8px_20px_rgba(16,185,129,0.08)] active:scale-[0.99]"
                                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                                    >
                                        <div>
                                            <strong className="block text-slate-800">{student.studentName}</strong>
                                            <span className="text-xs text-slate-500">{student.companyName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                <Clock size={12} /> {new Date(student.verificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="block mt-1 text-[0.65rem] text-slate-400 capitalize">by {student.officerName}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Absent Column */}
                    <div className="bg-white/95 text-left rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
                        <div className="bg-red-50/60 p-4 border-b border-red-100/70 flex items-center justify-between">
                            <h3 className="m-0 text-red-800 font-bold flex items-center gap-2 tracking-tight">
                                <XCircle size={18} /> Pending / Absent
                            </h3>
                            <span className="bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded text-xs">{loading ? '—' : absent.length}</span>
                        </div>
                        <div className="divide-y divide-red-50">
                            {loading ? (
                                <div className="flex flex-col gap-3 p-4">
                                    <SkeletonListRow />
                                    <SkeletonListRow />
                                    <SkeletonListRow />
                                </div>
                            ) : absent.length === 0 ? (
                                <EmptyState
                                    icon={CheckCircle2}
                                    tone="good"
                                    title="All students have attended"
                                    description="Every registered student for today has been successfully verified."
                                />
                            ) : (
                                absent.map((student, i) => (
                                    <div
                                        key={i}
                                        className="animate-slide-up flex justify-between items-center p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-50/30 hover:shadow-[0_8px_20px_rgba(239,68,68,0.06)] active:scale-[0.99]"
                                        style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                                    >
                                        <div>
                                            <strong className="block text-slate-800">{student.studentName}</strong>
                                            <span className="text-xs text-slate-500">{student.companyName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[0.7rem] uppercase tracking-widest font-bold text-slate-400">UNVERIFIED</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OfficerAttendancePage
