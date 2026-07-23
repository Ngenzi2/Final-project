import { useEffect, useMemo, useState } from 'react'
import { Search, UserCheck, ShieldCheck, ShieldX, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useOfficerAttendance, useOfficerScan } from '../hooks/useOfficer'
import { TableShell } from '../components/TableShell'
import {
    inputClass,
    panelClass,
    pillDangerClass,
    pillGoodClass,
    pillPendingClass,
    sectionHeaderTextClass,
    sectionHeaderTitleClass,
    td,
    todayIso,
} from '../constants/ui'

type StatusFilter = 'all' | 'verified' | 'pending'

const StudentVerificationPage = () => {
    const [date] = useState(todayIso())
    const { records, loading, error, refetch } = useOfficerAttendance(date)
    const { allowEntry, loading: verifying } = useOfficerScan()
    const [query, setQuery] = useState('')
    const [status, setStatus] = useState<StatusFilter>('all')
    const [busyId, setBusyId] = useState<number | null>(null)

    useEffect(() => {
        refetch()
    }, [refetch])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return records.filter((r) => {
            const matchesQuery =
                !q ||
                r.studentName.toLowerCase().includes(q) ||
                r.nationalId?.toLowerCase().includes(q) ||
                r.qrCode?.toLowerCase().includes(q) ||
                r.companyName.toLowerCase().includes(q)
            const matchesStatus =
                status === 'all' || (status === 'verified' ? r.attended : !r.attended)
            return matchesQuery && matchesStatus
        })
    }, [records, query, status])

    const handleVerify = async (registrationId: number) => {
        setBusyId(registrationId)
        const promise = allowEntry(registrationId)
        toast.promise(promise, {
            loading: 'Recording attendance...',
            success: () => {
                refetch()
                return 'Student verified and marked present.'
            },
            error: 'Failed to verify student.',
        })
        try {
            await promise
        } finally {
            setBusyId(null)
        }
    }

    const filters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: `All (${records.length})` },
        { key: 'verified', label: `Verified (${records.filter((r) => r.attended).length})` },
        { key: 'pending', label: `Pending (${records.filter((r) => !r.attended).length})` },
    ]

    return (
        <div className={`${panelClass} flex flex-col gap-6`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={sectionHeaderTitleClass}>Student Verification</h2>
                    <p className={sectionHeaderTextClass}>
                        Backup verification for when the QR scanner camera is unavailable — look up a student by name,
                        national ID, or their QR verification code, and confirm eligibility manually.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by student name, national ID, QR verification code, or driving school..."
                        className={`${inputClass} pl-10`}
                    />
                </div>
                <div className="flex gap-2 shrink-0">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setStatus(f.key)}
                            className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                                status === f.key
                                    ? 'bg-brand-navy text-white'
                                    : 'bg-[#f6f7ff] text-[#6B7280] hover:bg-[#eceeff]'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading student records...</div>
            ) : error ? (
                <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl">{error}</div>
            ) : (
                <TableShell
                    headers={['Student', 'National ID', 'Company', 'Teacher', 'Payment', 'Status', 'Action']}
                    isEmpty={filtered.length === 0}
                    emptyMessage="No students match your search."
                >
                    {filtered.map((r) => (
                        <tr key={r.registrationId}>
                            <td className={`${td} font-semibold`}>
                                {r.studentName}
                                <span className="block font-mono text-[0.7rem] font-normal tracking-wide text-slate-400">{r.qrCode}</span>
                            </td>
                            <td className={td}>{r.nationalId || '—'}</td>
                            <td className={td}>{r.companyName}</td>
                            <td className={td}>{r.teacherName}</td>
                            <td className={td}>
                                {r.paid ? (
                                    <span className={pillGoodClass}>Paid</span>
                                ) : (
                                    <span className={pillDangerClass}>Unpaid</span>
                                )}
                            </td>
                            <td className={td}>
                                {r.attended ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                        <ShieldCheck size={14} /> Verified
                                        {r.verificationTime && (
                                            <span className="flex items-center gap-1 text-[0.7rem] text-slate-400 font-medium">
                                                <Clock size={11} />
                                                {new Date(r.verificationTime).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        )}
                                    </span>
                                ) : r.paid ? (
                                    <span className={pillPendingClass}>Awaiting entry</span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                                        <ShieldX size={14} /> Ineligible
                                    </span>
                                )}
                            </td>
                            <td className={td}>
                                {r.attended ? (
                                    <span className="text-xs font-semibold text-slate-400">by {r.officerName || '—'}</span>
                                ) : (
                                    <button
                                        onClick={() => handleVerify(r.registrationId)}
                                        disabled={!r.paid || (verifying && busyId === r.registrationId)}
                                        className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-orange-strong disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        <UserCheck size={14} /> Verify Entry
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </TableShell>
            )}
        </div>
    )
}

export default StudentVerificationPage
