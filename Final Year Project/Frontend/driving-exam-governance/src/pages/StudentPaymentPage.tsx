import { useState } from 'react'
import { Building2, CalendarClock, Landmark, ShieldCheck, Wallet } from 'lucide-react'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { usePaymentConfig } from '../hooks/usePayments'
import { EmptyState } from '../components/EmptyState'
import { SkeletonListRow, SkeletonStatCard } from '../components/Skeleton'
import { ErrorState } from '../components/ErrorState'
import { UrubutoPayCheckoutModal } from '../components/UrubutoPayCheckoutModal'
import type { User } from '../types'
import {
  formatCurrency,
  glassCardClass,
  glassPanelClass,
  itemMetaClass,
  itemTitleClass,
  pillApprovedClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
} from '../constants/ui'

const StudentPaymentPage = ({ user }: { user: User }) => {
  const { registrations, loading, error, refetch } = useExamRegistrations({ studentId: user.studentId ?? undefined })
  const { config, loading: configLoading } = usePaymentConfig()
  const [payingId, setPayingId] = useState<number | null>(null)

  const closeModal = () => {
    setPayingId(null)
    refetch()
  }

  if (error) return <ErrorState message={error} />

  const isLoading = loading || configLoading
  const totalAmount = config?.totalAmount ?? 0
  const siteShare = config?.siteShare ?? 0
  const companyShare = config?.companyShare ?? 0

  return (
    <div className={`${glassPanelClass} animate-fade-in`}>
      <div className="mb-5.5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className={sectionHeaderTitleClass}>Payment</h2>
          <p className={sectionHeaderTextClass}>Pay your examination fee to unlock your QR ticket.</p>
        </div>
        {config?.testMode && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 shadow-[0_2px_8px_rgba(217,119,6,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <ShieldCheck size={14} /> Sandbox / Test Payment
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mb-5.5 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
      ) : (
        <div className={`${glassCardClass} mb-5.5 !flex-row flex-wrap items-center gap-6 !p-5`}>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-navy/10 text-brand-navy">
            <Wallet size={22} />
          </span>
          <div className="flex-1 min-w-40">
            <p className={itemMetaClass}>Driving Examination Fee{config?.testMode ? ' (Testing Mode)' : ''}</p>
            <p className="m-0 text-2xl font-bold tracking-tight text-[#1F2937]">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
            <Landmark size={16} className="text-slate-400" />
            <span className="text-sm text-[#6B7280]">Examination site</span>
            <strong className="text-[#1F2937]">{formatCurrency(siteShare)}</strong>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5">
            <Building2 size={16} className="text-slate-400" />
            <span className="text-sm text-[#6B7280]">Driving company</span>
            <strong className="text-[#1F2937]">{formatCurrency(companyShare)}</strong>
          </div>
        </div>
      )}

      <div className="grid gap-3.5">
        {isLoading ? (
          <>
            <SkeletonListRow />
            <SkeletonListRow />
          </>
        ) : registrations.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No examination booked yet"
            description="Ask your teacher to book you onto an exam slot once you're ready for exam."
          />
        ) : (
          registrations.map((registration, i) => (
            <div
              key={registration.id}
              className="animate-slide-up flex flex-wrap items-center justify-between gap-4.5 rounded-2xl bg-white px-4.5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                <p className={itemTitleClass}>{user.name}</p>
                <p className={itemMetaClass}>
                  <span>Driving Company: {registration.companyName}</span>
                  <span>Teacher: {registration.teacherName}</span>
                </p>
                <p className={itemMetaClass}>
                  {registration.examSlotName} · {registration.examSlotDate} {registration.examSlotStartTime}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={registration.paid ? pillApprovedClass : pillPendingClass}>
                  {registration.paid ? 'Paid' : 'Pending payment'}
                </span>
                {!registration.paid && (
                  <button
                    type="button"
                    onClick={() => setPayingId(registration.id)}
                    className={`${smallButtonClass} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(180,83,9,0.25)] active:scale-[0.96]`}
                  >
                    Pay {formatCurrency(totalAmount)}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {payingId !== null && (
        <UrubutoPayCheckoutModal
          registrationId={payingId}
          totalAmountLabel={formatCurrency(totalAmount)}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default StudentPaymentPage
