import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts'
import { CheckCircle2, Clock, Landmark, Receipt, Wallet, XCircle } from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { TableShell } from '../components/TableShell'
import { chartPrimary, statusCritical, statusGood, statusWarning } from '../constants/chartColors'
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

const PaymentManagementPage = () => {
  const { payments, loading, error } = usePayments()

  if (loading) return <LoadingState label="Loading payments..." />
  if (error) return <ErrorState message={error} />

  const paid = payments.filter((p) => p.status === 'PAID')
  const pending = payments.filter((p) => p.status === 'PENDING')
  const failed = payments.filter((p) => p.status === 'FAILED')
  const cancelled = payments.filter((p) => p.status === 'CANCELLED')

  const totalRevenue = paid.reduce((sum, p) => sum + p.amount, 0)
  const siteRevenue = paid.reduce((sum, p) => sum + p.siteShare, 0)
  const companyRevenue = paid.reduce((sum, p) => sum + p.companyShare, 0)
  const paidStudents = new Set(paid.map((p) => p.studentId)).size

  const revenueDistribution = [
    { name: 'Exam site share', value: siteRevenue, color: chartPrimary },
    { name: 'Driving company share', value: companyRevenue, color: statusWarning },
  ]

  return (
    <section className="grid gap-5.5">
      <div>
        <h2 className={sectionHeaderTitleClass}>Payment management</h2>
        <p className={sectionHeaderTextClass}>
          Live UrubutoPay transactions, revenue distribution, and analytics across all examination fees.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <StatCard icon={Wallet} label="Total revenue collected" value={formatCurrency(totalRevenue)} color="#0B3B6E" highlighted />
        <StatCard icon={CheckCircle2} label="Total paid students" value={paidStudents} color="#22C55E" />
        <StatCard icon={Receipt} label="Total transactions" value={payments.length} color="#4f5cff" />
        <StatCard icon={Clock} label="Pending payments" value={pending.length} color="#F59E0B" />
        <StatCard icon={XCircle} label="Failed / cancelled" value={failed.length + cancelled.length} color="#EF4444" />
      </div>

      <div className="grid grid-cols-2 gap-3.5 max-[940px]:grid-cols-1">
        <ChartCard title="Revenue distribution" height={220}>
          <PieChart>
            <Pie data={revenueDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
              {revenueDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ChartCard>

        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[#1F2937]">Payment analytics</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={CheckCircle2} label="Paid" value={paid.length} color={statusGood} />
            <StatCard icon={Clock} label="Pending" value={pending.length} color={statusWarning} />
            <StatCard icon={XCircle} label="Failed" value={failed.length} color={statusCritical} />
            <StatCard icon={Landmark} label="Cancelled" value={cancelled.length} color="#6B7280" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="m-0 mb-3 text-[#1F2937]">Transactions</h3>
        <TableShell
          headers={['Student', 'Company', 'Amount', 'Reference', 'Method', 'Date', 'Status']}
          isEmpty={payments.length === 0}
          emptyMessage="No transactions yet."
        >
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className={td}>
                <p className={itemTitleClass}>{payment.studentName}</p>
              </td>
              <td className={td}>{payment.companyName}</td>
              <td className={td}>{formatCurrency(payment.amount)}</td>
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

export default PaymentManagementPage
