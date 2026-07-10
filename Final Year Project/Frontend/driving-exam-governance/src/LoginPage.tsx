import { useState } from 'react'
import type { FormEvent } from 'react'
import { User, Lock } from 'lucide-react'
import * as authApi from './api/auth'
import { ApiError, setToken } from './api/client'
import type { User as AppUser } from './types'
import innesLogo from './assets/innes-logo.png'

type LoginPageProps = {
  onLogin: (user: AppUser) => void
}

const REMEMBERED_EMAIL_KEY = 'examgov-remembered-email'

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY)))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice('')
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Enter both username and password to continue.')
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
      onLogin(user)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid username or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid h-screen w-full place-items-center bg-white p-6">
      <div className="grid w-full max-w-sm gap-5 rounded-2xl border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.1)]">
        <div className="grid justify-items-center gap-3">
          <img src={innesLogo} alt="INNES Driving School" className="h-20 w-auto object-contain" />
          <h1 className="m-0 text-2xl font-semibold text-[#14243a]">Sign in</h1>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="flex items-center gap-2.5 rounded-lg border border-[#e6e8f0] bg-[#f8f9fc] px-3.5 py-2.5">
            <User size={16} strokeWidth={2} className="text-slate-400" />
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="flex-1 border-none bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="flex items-center gap-2.5 rounded-lg border border-[#e6e8f0] bg-[#f8f9fc] px-3.5 py-2.5">
            <Lock size={16} strokeWidth={2} className="text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="flex-1 border-none bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          {error && <p className="m-0 -mt-2 text-center text-sm text-red-600">{error}</p>}
          {notice && <p className="m-0 -mt-2 text-center text-sm text-brand-orange-strong">{notice}</p>}

          <div className="flex items-center justify-between gap-3 text-[0.82rem] text-[#4b507a]">
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
              className="border-none bg-transparent p-0 text-[0.82rem] text-brand-navy hover:underline"
              onClick={() => setNotice('Contact your system administrator to reset your password.')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border-none bg-brand-navy py-3 font-semibold text-white hover:bg-[#0f1b2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="m-0 text-center text-[0.85rem] text-[#4b507a]">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="border-none bg-transparent p-0 text-[0.85rem] font-semibold text-brand-navy hover:underline"
            onClick={() => setNotice('Accounts are provisioned by the examination authority — contact them for access.')}
          >
            Register now
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
