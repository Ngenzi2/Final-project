import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, Loader2, RotateCcw, ShieldCheck, Smartphone, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRegistrationPayment } from '../hooks/usePayments'
import { ApiError } from '../api/client'
import { inputClass, labelClass, primaryButtonClass } from '../constants/ui'

const PHONE_PATTERN = /^07[0-9]{8}$/

type UrubutoPayCheckoutModalProps = {
  registrationId: number
  totalAmountLabel: string
  onClose: () => void
}

export const UrubutoPayCheckoutModal = ({ registrationId, totalAmountLabel, onClose }: UrubutoPayCheckoutModalProps) => {
  const { payment, initiate, cancel } = useRegistrationPayment(registrationId)
  const [channel, setChannel] = useState<'MOMO' | 'AIRTEL_MONEY'>('MOMO')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const previousStatusRef = useRef<string | null>(null)

  useEffect(() => {
    const previous = previousStatusRef.current
    if (payment?.status === 'PAID' && previous !== 'PAID') {
      toast.success('Payment completed successfully!')
      window.setTimeout(() => toast.success('QR code generated.'), 700)
      window.setTimeout(() => toast.success('Email sent successfully.'), 1400)
      window.setTimeout(onClose, 3200)
    }
    if (payment?.status === 'FAILED' && previous !== 'FAILED') {
      toast.error('Payment failed.', { description: payment.failureReason ?? undefined })
    }
    previousStatusRef.current = payment?.status ?? null
  }, [payment?.status, payment?.failureReason, onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPhoneError(null)
    const trimmed = phone.trim().replace(/\s+/g, '')
    if (!PHONE_PATTERN.test(trimmed)) {
      setPhoneError('Enter a valid Rwandan phone number, e.g. 0788123456')
      return
    }
    setSubmitting(true)
    toast.info('Payment initiated...')
    try {
      await initiate({ channelName: channel, phoneNumber: trimmed })
    } catch (err) {
      setPhoneError(err instanceof ApiError ? err.message : 'Failed to initiate payment.')
      toast.error('Payment failed.', { description: err instanceof ApiError ? err.message : undefined })
    } finally {
      setSubmitting(false)
      setRetrying(false)
    }
  }

  const handleCancel = async () => {
    try {
      await cancel()
      toast('Payment cancelled.')
    } catch {
      // best-effort
    }
  }

  const showForm = !payment || retrying
  const isPending = !showForm && payment?.status === 'PENDING'
  const isPaid = !showForm && payment?.status === 'PAID'
  const isFailed = !showForm && (payment?.status === 'FAILED' || payment?.status === 'CANCELLED')

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1220]/60 backdrop-blur-sm px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-105 overflow-hidden rounded-[24px] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.35)] animate-slide-up">
        <div className="relative flex items-center justify-between bg-gradient-to-br from-[#003da5] to-[#0b2a6b] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 font-black text-white backdrop-blur-sm">U</span>
            <div>
              <p className="m-0 font-extrabold tracking-tight text-white">Urubuto Pay</p>
              <p className="m-0 text-[0.78rem] text-white/70">Secure mobile money checkout</p>
            </div>
          </div>
          {!isPending && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-none bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5 active:scale-90"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="p-6">
          {showForm && (
            <div className="grid gap-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f2f3f8] p-1">
                <button
                  type="button"
                  onClick={() => setChannel('MOMO')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.85rem] font-semibold transition-all duration-200 ${
                    channel === 'MOMO' ? 'bg-white text-brand-navy shadow-sm' : 'text-[#6B7280] hover:text-[#6B7280]'
                  }`}
                >
                  <Smartphone size={15} /> MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('AIRTEL_MONEY')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.85rem] font-semibold transition-all duration-200 ${
                    channel === 'AIRTEL_MONEY' ? 'bg-white text-brand-navy shadow-sm' : 'text-[#6B7280] hover:text-[#6B7280]'
                  }`}
                >
                  <Banknote size={15} /> Airtel Money
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="rounded-xl bg-gradient-to-br from-[#f6f7ff] to-[#eef1ff] px-4 py-3.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
                  <p className="m-0 text-[0.85rem] text-[#6B7280]">Amount due</p>
                  <p className="m-0 text-2xl font-bold tracking-tight text-[#1F2937]">{totalAmountLabel}</p>
                </div>
                <label className={labelClass}>
                  Mobile money number
                  <input
                    autoFocus
                    className={inputClass}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="07XXXXXXXX"
                    inputMode="numeric"
                  />
                </label>
                {phoneError && <p className="m-0 text-[0.85rem] font-semibold text-red-600">{phoneError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-[0.95rem] font-semibold text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${primaryButtonClass} flex-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(180,83,9,0.28)] active:translate-y-0 active:scale-[0.98]`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Smartphone size={18} /> {submitting ? 'Requesting...' : 'Pay Now'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center gap-4 py-6 text-center animate-fade-in">
              <div className="relative grid h-16 w-16 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#003da5]/15" />
                <Loader2 size={40} className="relative animate-spin text-[#003da5]" />
              </div>
              <div>
                <p className="m-0 mb-1.5 font-semibold tracking-tight text-[#1F2937]">Confirm on your phone</p>
                <p className="m-0 text-[0.9rem] text-[#6B7280]">
                  A payment prompt was sent to <span className="font-semibold">{payment?.payerPhoneNumber}</span>. Enter your
                  mobile money PIN to approve it. We'll confirm automatically once it clears.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-[0.85rem] font-semibold text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Cancel payment
              </button>
            </div>
          )}

          {isPaid && (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-slide-up">
              <div className="relative grid h-20 w-20 place-items-center">
                <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping" style={{ animationIterationCount: 2 }} />
                <span className="relative grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={36} />
                </span>
              </div>
              <p className="m-0 font-semibold tracking-tight text-[#1F2937]">Payment confirmed</p>
              <p className="m-0 text-[0.9rem] text-[#6B7280]">Your QR ticket has been generated and emailed to you.</p>
              <span className="mt-1 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck size={13} /> Eligible for examination
              </span>
            </div>
          )}

          {isFailed && (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-slide-up">
              {payment?.status === 'CANCELLED' ? (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <XCircle size={32} />
                </span>
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={32} />
                </span>
              )}
              <p className="m-0 font-semibold tracking-tight text-[#1F2937]">
                {payment?.status === 'CANCELLED' ? 'Payment cancelled' : 'Payment failed'}
              </p>
              {payment?.failureReason && <p className="m-0 text-[0.85rem] text-[#6B7280]">{payment.failureReason}</p>}
              <div className="mt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-slate-100 px-5 py-2.5 text-[0.9rem] font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setRetrying(true)}
                  className="flex items-center gap-1.5 rounded-full bg-brand-navy px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-strong active:scale-[0.97]"
                >
                  <RotateCcw size={15} /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
