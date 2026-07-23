import { CheckCircle2, Clock, Wallet } from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { TableShell } from '../components/TableShell'
import {
  formatCurrency,
  itemMetaClass,
  itemTitleClass,
  pillApprovedClass,
  pillDangerClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  td,
} from '../constants/ui'

const statusPill = {
  PAID: pillApprovedClass,
  PENDING: pillPendingClass,
  FAILED: pillDangerClass,
  CANCELLED: pillNeutralClass,
}

const CompanyPaymentsPage = () => {
  const { payments, loading, error } = usePayments()

  if (loading) return <LoadingState label="Loading payments..." />
  if (error) return <ErrorState message={error} />

  const paid = payments.filter((p) => p.status === 'PAID')
  const pending = payments.filter((p) => p.status === 'PENDING')
  const companyRevenue = paid.reduce((sum, p) => sum + p.companyShare, 0)
  const paidStudents = new Set(paid.map((p) => p.studentId)).size

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Payments</h2>
        <p className={sectionHeaderTextClass}>Your company's share of every student's examination fee, paid through UrubutoPay.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <StatCard icon={Wallet} label="Revenue received" value={formatCurrency(companyRevenue)} color="#0B3B6E" highlighted />
        <StatCard icon={CheckCircle2} label="Paid students" value={paidStudents} color="#22C55E" />
        <StatCard icon={Clock} label="Pending payments" value={pending.length} color="#F59E0B" />
      </div>

      <div>
        <h3 className="m-0 mb-3 text-[#1F2937]">Student payment history</h3>
        <TableShell
          headers={['Student', 'Amount received', 'Reference', 'Method', 'Date', 'Status']}
          isEmpty={payments.length === 0}
          emptyMessage="No payments yet."
        >
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className={td}>
                <p className={itemTitleClass}>{payment.studentName}</p>
              </td>
              <td className={td}>{payment.status === 'PAID' ? formatCurrency(payment.companyShare) : '—'}</td>
              <td className={td}>
                <p className={itemMetaClass}>{payment.paymentReference}</p>
              </td>
              <td className={td}>{payment.paymentMethod ?? '—'}</td>
              <td className={td}>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleString() : '—'}</td>
              <td className={td}>
                <span className={statusPill[payment.status]}>{payment.status}</span>
              </td>
            </tr>
          ))}
        </TableShell>
      </div>
    </section>
  )
}

export default CompanyPaymentsPage
