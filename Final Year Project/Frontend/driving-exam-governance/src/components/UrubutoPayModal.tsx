import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Loader2, Smartphone, X } from 'lucide-react'
import { inputClass, labelClass, primaryButtonClass } from '../constants/ui'

type Step = 'phone' | 'processing' | 'success'

type UrubutoPayModalProps = {
  amountLabel: string
  onClose: () => void
  onConfirmed: () => Promise<void>
}

const PHONE_PATTERN = /^(07[2389])\d{7}$/

export const UrubutoPayModal = ({ amountLabel, onClose, onConfirmed }: UrubutoPayModalProps) => {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = phone.trim().replace(/\s+/g, '')
    if (!PHONE_PATTERN.test(trimmed)) {
      setPhoneError('Enter a valid mobile money number, e.g. 0788123456')
      return
    }
    setPhoneError(null)
    setStep('processing')

    window.setTimeout(async () => {
      try {
        await onConfirmed()
        setStep('success')
        window.setTimeout(onClose, 1600)
      } catch {
        setStep('phone')
        setPhoneError('Payment could not be confirmed. Please try again.')
      }
    }, 2600)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1220]/55 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-105 rounded-[20px] border border-[#e6e8f0] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#003da5] font-black text-white">U</span>
            <div>
              <p className="m-0 font-extrabold text-[#161a35]">Urubuto Pay</p>
              <p className="m-0 text-[0.78rem] text-[#6c6f93]">Secure mobile money checkout</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg border-none bg-transparent p-1.5 text-[#6c6f93] hover:bg-[#f6f7ff]">
              <X size={18} />
            </button>
          )}
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="rounded-xl bg-[#f6f7ff] px-4 py-3.5">
              <p className="m-0 text-[0.85rem] text-[#6c6f93]">Amount due</p>
              <p className="m-0 text-xl font-bold text-[#161a35]">{amountLabel}</p>
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
            <button type="submit" className={primaryButtonClass}>
              <span className="flex items-center gap-2">
                <Smartphone size={18} /> Request payment
              </span>
            </button>
          </form>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Loader2 size={40} className="animate-spin text-[#003da5]" />
            <div>
              <p className="m-0 mb-1.5 font-semibold text-[#161a35]">Confirm on your phone</p>
              <p className="m-0 text-[0.9rem] text-[#6c6f93]">
                A payment prompt was sent to <span className="font-semibold">{phone}</span>. Enter your mobile money PIN
                on your phone to approve it.
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={44} className="text-emerald-500" />
            <p className="m-0 font-semibold text-[#161a35]">Payment confirmed</p>
            <p className="m-0 text-[0.9rem] text-[#6c6f93]">Your QR ticket has been unlocked.</p>
          </div>
        )}
      </div>
    </div>
  )
}
