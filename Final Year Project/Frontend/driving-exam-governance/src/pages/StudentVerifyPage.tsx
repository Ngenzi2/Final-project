import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { verifyStudentEmail } from '../api/students'
import { ApiError } from '../api/client'
import innesLogo from '../assets/innes-logo.png'

type StudentVerifyPageProps = {
  token: string
  onContinue: () => void
}

const StudentVerifyPage = ({ token, onContinue }: StudentVerifyPageProps) => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    let cancelled = false
    verifyStudentEmail(token)
      .then((result) => {
        if (cancelled) return
        setStatus(result.verified ? 'success' : 'error')
        setMessage(result.message)
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setMessage(err instanceof ApiError ? err.message : 'This verification link is invalid or has expired.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="grid h-screen w-full place-items-center bg-white p-6">
      <div className="grid w-full max-w-sm justify-items-center gap-5 rounded-2xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-8 text-center shadow-[0_25px_70px_rgba(15,23,42,0.1)]">
        <img src={innesLogo} alt="INNES Driving School" className="h-16 w-auto object-contain" />

        {status === 'checking' && <Loader2 size={36} className="animate-spin text-brand-navy" strokeWidth={2} />}
        {status === 'success' && <CheckCircle2 size={36} className="text-emerald-500" strokeWidth={2} />}
        {status === 'error' && <XCircle size={36} className="text-red-500" strokeWidth={2} />}

        <div>
          <h1 className="m-0 mb-2 text-xl font-semibold text-[#14243a]">
            {status === 'checking' ? 'Verifying email' : status === 'success' ? 'Email verified' : 'Verification failed'}
          </h1>
          <p className="m-0 text-[0.92rem] text-[#4b507a]">{message}</p>
        </div>

        {status !== 'checking' && (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-full border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d]"
          >
            Continue to sign in
          </button>
        )}
      </div>
    </div>
  )
}

export default StudentVerifyPage
