import { CheckCircle2, ScanLine, XCircle } from 'lucide-react'
import { useQrScanLogs } from '../hooks/useQrScanLogs'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { TableShell } from '../components/TableShell'
import VerifyQrPage from './VerifyQrPage'
import { itemMetaClass, itemTitleClass, pillApprovedClass, pillDangerClass, sectionHeaderTextClass, sectionHeaderTitleClass, td } from '../constants/ui'

const isToday = (isoDate: string) => {
  const date = new Date(isoDate)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

const QrVerificationLogsPage = () => {
  const { scanLogs, loading, error, refetch } = useQrScanLogs()

  const scansToday = scanLogs.filter((log) => isToday(log.scannedAt))
  const successfulToday = scansToday.filter((log) => log.eligible)
  const failedToday = scansToday.filter((log) => !log.eligible)

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>QR verification logs</h2>
        <p className={sectionHeaderTextClass}>Every QR scan performed at exam sites, with officer attribution.</p>
      </div>

      {loading ? (
        <LoadingState label="Loading scan logs..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            <StatCard icon={ScanLine} label="Scans today" value={scansToday.length} color="#0B3B6E" />
            <StatCard icon={CheckCircle2} label="Successful verifications" value={successfulToday.length} color="#22C55E" />
            <StatCard icon={XCircle} label="Failed verifications" value={failedToday.length} color="#EF4444" />
          </div>

          <TableShell
            headers={['Student', 'Company', 'Exam site', 'Date & time', 'Officer', 'Result']}
            isEmpty={scanLogs.length === 0}
            emptyMessage="No QR scans recorded yet."
          >
            {scanLogs.map((log) => (
              <tr key={log.id}>
                <td className={td}>
                  <p className={itemTitleClass}>{log.studentName ?? 'Unknown'}</p>
                  <p className={itemMetaClass}>{log.qrCode}</p>
                </td>
                <td className={td}>{log.companyName ?? '—'}</td>
                <td className={td}>{log.examSlotName ?? '—'}</td>
                <td className={td}>{new Date(log.scannedAt).toLocaleString('en-GB')}</td>
                <td className={td}>
                  {log.scannedByName}
                  {log.scannedByDeleted && (
                    <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-semibold text-slate-500">
                      deleted
                    </span>
                  )}
                </td>
                <td className={td}>
                  <span className={log.eligible ? pillApprovedClass : pillDangerClass}>
                    {log.eligible ? 'Verified' : log.reason ?? 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </TableShell>
        </>
      )}

      <VerifyQrPage onVerified={refetch} />
    </section>
  )
}

export default QrVerificationLogsPage
