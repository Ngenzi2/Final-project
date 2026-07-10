import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, CheckCircle2, MapPin, ScanLine, UserRound, XCircle } from 'lucide-react'
import * as qrApi from '../api/qr'
import { ApiError } from '../api/client'
import type { QrVerifyResult } from '../types'
import {
  inputClass,
  itemMetaClass,
  labelClass,
  panelClass,
  pillApprovedClass,
  pillPendingClass,
  primaryButtonClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const VerifyQrPage = () => {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<QrVerifyResult | null>(null)
  const [notFound, setNotFound] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setSearching(true)
    setResult(null)
    setNotFound(null)
    try {
      const verifyResult = await qrApi.verifyQr(trimmed)
      setResult(verifyResult)
    } catch (err) {
      setNotFound(err instanceof ApiError ? err.message : "This QR code doesn't match any issued ticket.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Verify QR code</h2>
        <p className={sectionHeaderTextClass}>
          Scan or enter a student's QR code on exam day to confirm their identity, payment, and eligibility.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mb-5.5 flex items-end gap-3 max-[640px]:flex-col max-[640px]:items-stretch">
        <label className={`${labelClass} flex-1`}>
          QR code
          <input
            autoFocus
            className={inputClass}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste or scan QR-XXXXX-XXXXXX"
          />
        </label>
        <button type="submit" disabled={searching} className={primaryButtonClass}>
          <span className="flex items-center gap-2">
            <ScanLine size={18} /> {searching ? 'Checking...' : 'Verify'}
          </span>
        </button>
      </form>

      {notFound && (
        <div className="flex items-center gap-3.5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <XCircle size={28} className="shrink-0 text-red-500" />
          <div>
            <p className="m-0 mb-1.5 font-semibold text-[#161a35]">No match found</p>
            <p className={itemMetaClass}>{notFound}</p>
          </div>
        </div>
      )}

      {result && (
        <div className={`grid gap-5 rounded-2xl border p-5 ${result.eligible ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
          <div className="flex flex-wrap items-center gap-4.5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#eef1f8] text-[#5a6178]">
              <UserRound size={32} strokeWidth={2} />
            </span>
            <div className="flex-1">
              <p className="m-0 text-xl font-bold text-[#161a35]">{result.registration.studentName}</p>
              <p className={itemMetaClass}>
                <span>{result.registration.studentExamType}</span>
              </p>
              <p className={itemMetaClass}>
                <span>{result.registration.companyName}</span>
                <span>Teacher: {result.registration.teacherName}</span>
              </p>
            </div>
            <span
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-bold ${
                result.eligible ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'
              }`}
            >
              {result.eligible ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {result.eligible ? 'Cleared for exam' : 'Not cleared'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3.5 max-[940px]:grid-cols-1">
            <div className="rounded-xl bg-white px-4 py-3.5">
              <p className={itemMetaClass}>Payment</p>
              <span className={result.registration.paid ? pillApprovedClass : pillPendingClass}>
                {result.registration.paid ? 'Paid' : 'Not paid'}
              </span>
            </div>
            <div className="rounded-xl bg-white px-4 py-3.5">
              <p className={itemMetaClass}>Training</p>
              <span className={result.trainingStatus === 'READY_FOR_EXAM' ? pillApprovedClass : pillPendingClass}>
                {result.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
              </span>
            </div>
            <div className="rounded-xl bg-white px-4 py-3.5">
              <p className={itemMetaClass}>Exam site</p>
              <p className="m-0 flex items-center gap-1.5 font-semibold text-[#161a35]">
                <MapPin size={14} /> {result.registration.examSlotName}
              </p>
              <p className={itemMetaClass}>
                <CalendarDays size={14} /> {result.registration.examSlotDate} · {result.registration.examSlotStartTime}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerifyQrPage
