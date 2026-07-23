import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, Mail, KeyRound, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import * as authApi from './api/auth'
import { ApiError, setToken } from './api/client'
import type { User as AppUser } from './types'
import innesLogo from './assets/innes-logo.png'

type LoginPageProps = {
  onLogin: (user: AppUser) => void
}

const REMEMBERED_EMAIL_KEY = 'examgov-remembered-email'

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)))
  const [submitting, setSubmitting] = useState(false)

  // Identity state
  const [identifiedRole, setIdentifiedRole] = useState<string | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [forgotPasswordStep, setForgotPasswordStep] = useState<0 | 1 | 2>(0)

  const handleIdentify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Validation Error', { description: 'Enter your email address to continue.' })
      return
    }

    setSubmitting(true)
    try {
      const { role } = await authApi.identifyUser(email.trim())
      setIdentifiedRole(role)

      // Auto-send OTP if student
      if (role === 'STUDENT') {
        const promise = authApi.sendStudentOtp(email.trim())
        toast.promise(promise, {
          loading: 'Sending OTP...',
          success: 'OTP sent to your email successfully.',
          error: 'Failed to send OTP.'
        })
        await promise
      }

      setStep(2)
    } catch (err) {
      toast.error('Identification failed', { description: err instanceof ApiError ? err.message : 'Account not found.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleStandardLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password.trim()) {
      toast.error('Validation Error', { description: 'Enter your password to continue.' })
      return
    }

    setSubmitting(true)
    try {
      const { token, user } = await authApi.login(email.trim(), password)

      setToken(token)
      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }
      toast.success('Login Successful', { description: `Welcome back, ${user.name}` })
      onLogin(user)
    } catch (err) {
      toast.error('Login Failed', { description: 'Wrong password. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!otpCode.trim()) {
      toast.error('Validation Error', { description: 'Enter the OTP to verify.' })
      return
    }

    setSubmitting(true)
    try {
      const { token, user } = await authApi.verifyStudentOtp(email.trim(), otpCode.trim())
      setToken(token)
      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }
      toast.success('Login Successful', { description: `Welcome back, ${user.name}` })
      onLogin(user)
    } catch (err) {
      toast.error('Login Failed', { description: err instanceof ApiError ? err.message : 'Invalid or expired OTP.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Validation Error', { description: 'Enter your email address.' })
      return
    }

    setSubmitting(true)
    try {
      const promise = authApi.sendForgotPasswordOtp(email.trim())
      toast.promise(promise, {
        loading: 'Sending reset code...',
        success: 'Reset code sent to your email.',
        error: 'Failed to send reset code.'
      })
      await promise
      setForgotPasswordStep(2)
    } catch {
      // toast handles the error visually
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!otpCode.trim() || !password.trim()) {
      toast.error('Validation Error', { description: 'Enter both the reset code and new password.' })
      return
    }

    setSubmitting(true)
    try {
      const promise = authApi.resetPassword(email.trim(), otpCode.trim(), password)
      toast.promise(promise, {
        loading: 'Resetting password...',
        success: 'Password reset successfully! Please sign in with your new password.',
        error: (err) => err instanceof ApiError ? err.message : 'Failed to reset password.'
      })
      await promise
      setForgotPasswordStep(0)
      setStep(1)
      setPassword('')
      setOtpCode('')
    } catch {
      // errors handled by toast
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid h-screen w-full place-items-center bg-white p-6">
      <div className="grid w-full max-w-sm gap-6 rounded-2xl border border-[#E5EAF2] border-t-8 border-t-brand-navy bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.1)]">
        <div className="grid justify-items-center gap-2 mb-2">
          <img src={innesLogo} alt="INNES Driving School" className="h-[4.5rem] w-auto object-contain mb-3" />
          <h1 className="m-0 text-xl font-bold text-[#1F2937]">{forgotPasswordStep > 0 ? 'Reset Password' : 'Sign in'}</h1>
          <p className="m-0 text-[0.875rem] text-[#6B7280] text-center">
            {forgotPasswordStep > 0 ? (forgotPasswordStep === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password') : step === 1 ? 'Enter your email to continue' : identifiedRole === 'STUDENT' ? 'Enter verification code' : `Welcome back, ${identifiedRole?.toLowerCase() || ''}`}
          </p>
        </div>

        {forgotPasswordStep === 0 && step === 1 && (
          <form className="grid gap-5" onSubmit={handleIdentify}>
            <label className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF2] bg-[#f8f9fc] px-4 py-3 focus-within:border-brand-navy focus-within:bg-white transition-colors">
              <Mail size={18} strokeWidth={2} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                autoFocus
                className="flex-1 border-none bg-transparent text-[#1F2937] text-[0.95rem] outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-80 transition-colors shadow-sm"
            >
              {submitting ? 'Identifying...' : 'Continue'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {forgotPasswordStep === 0 && step === 2 && identifiedRole !== 'STUDENT' && (
          <form className="grid gap-5" onSubmit={handleStandardLogin}>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setPassword('')
              }}
              className="w-fit flex items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-3 py-1.5 text-[0.8rem] text-slate-500 hover:bg-[#f8f9fc] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="truncate max-w-[200px]">{email}</span>
            </button>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF2] bg-[#f8f9fc] px-4 py-3 focus-within:border-brand-navy focus-within:bg-white transition-colors">
              <Lock size={18} strokeWidth={2} className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                autoFocus
                className="flex-1 border-none bg-transparent text-[#1F2937] text-[0.95rem] outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="border-none bg-transparent p-0 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 text-[0.82rem] text-[#6B7280]">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="accent-brand-orange-strong"
                />
                Remember me
              </label>
              <button
                type="button"
                className="border-none bg-transparent p-0 text-[0.82rem] text-brand-navy hover:underline cursor-pointer"
                onClick={() => setForgotPasswordStep(1)}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-80 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
        )}

        {forgotPasswordStep === 0 && step === 2 && identifiedRole === 'STUDENT' && (
          <form className="grid gap-5" onSubmit={handleVerifyOtp}>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtpCode('')
              }}
              className="w-fit flex items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-3 py-1.5 text-[0.8rem] text-slate-500 hover:bg-[#f8f9fc] hover:text-[#1F2937] transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="truncate max-w-[200px]">{email}</span>
            </button>


            <label className="flex items-center gap-2.5 rounded-xl border border-brand-navy/30 bg-blue-50/50 px-4 py-3.5 shadow-sm transition-all focus-within:border-brand-navy focus-within:bg-white focus-within:shadow-md">
              <KeyRound size={20} strokeWidth={2} className="text-brand-navy" />
              <input
                type="text"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                placeholder="OTP Code"
                maxLength={6}
                autoFocus
                className="flex-1 border-none bg-transparent text-xl font-bold tracking-[0.25em] text-slate-800 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-80 transition-colors shadow-sm"
            >
              {submitting ? 'Verifying...' : 'Verify'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {forgotPasswordStep === 1 && (
          <form className="grid gap-5" onSubmit={handleRequestReset}>
            <button
              type="button"
              onClick={() => {
                setForgotPasswordStep(0)
                setStep(1)
              }}
              className="w-fit flex items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-3 py-1.5 text-[0.8rem] text-slate-500 hover:bg-[#f8f9fc] hover:text-[#1F2937] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to login</span>
            </button>

            <label className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF2] bg-[#f8f9fc] px-4 py-3 focus-within:border-brand-navy focus-within:bg-white transition-colors">
              <Mail size={18} strokeWidth={2} className="text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                autoFocus
                className="flex-1 border-none bg-transparent text-[#1F2937] text-[0.95rem] outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-80 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send reset code'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {forgotPasswordStep === 2 && (
          <form className="grid gap-5" onSubmit={handleResetPassword}>
            <button
              type="button"
              onClick={() => setForgotPasswordStep(1)}
              className="w-fit flex items-center gap-1.5 rounded-full border border-[#E5EAF2] bg-white px-3 py-1.5 text-[0.8rem] text-slate-500 hover:bg-[#f8f9fc] hover:text-[#1F2937] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span className="truncate max-w-[200px]">{email}</span>
            </button>

            <label className="flex items-center gap-2.5 rounded-xl border border-brand-navy/30 bg-blue-50/50 px-4 py-3.5 shadow-sm transition-all focus-within:border-brand-navy focus-within:bg-white focus-within:shadow-md">
              <KeyRound size={20} strokeWidth={2} className="text-brand-navy" />
              <input
                type="text"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                placeholder="6-digit reset code"
                maxLength={6}
                autoFocus
                className="flex-1 border-none bg-transparent text-xl font-bold tracking-[0.25em] text-slate-800 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
              />
            </label>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#E5EAF2] bg-[#f8f9fc] px-4 py-3 focus-within:border-brand-navy focus-within:bg-white transition-colors">
              <Lock size={18} strokeWidth={2} className="text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                className="flex-1 border-none bg-transparent text-[#1F2937] text-[0.95rem] outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="border-none bg-transparent p-0 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-80 transition-colors shadow-sm cursor-pointer"
            >
              {submitting ? 'Resetting...' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage
