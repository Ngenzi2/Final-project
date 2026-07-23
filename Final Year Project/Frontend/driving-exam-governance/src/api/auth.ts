import { apiFetch } from './client'
import type { User } from '../types'

export type LoginResponse = {
  token: string
  user: User
}

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } })

export const sendStudentOtp = (email: string) =>
  apiFetch<void>('/api/auth/student/send-otp', { method: 'POST', body: { email } })

export const verifyStudentOtp = (email: string, otp: string) =>
  apiFetch<LoginResponse>('/api/auth/student/verify-otp', { method: 'POST', body: { email, otp } })

export const identifyUser = (email: string) =>
  apiFetch<{ role: string }>('/api/auth/identify', { method: 'POST', body: { email } })

export const fetchMe = () => apiFetch<User>('/api/auth/me')

export const sendForgotPasswordOtp = (email: string) =>
  apiFetch<void>('/api/auth/forgot-password', { method: 'POST', body: { email } })

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  apiFetch<void>('/api/auth/reset-password', { method: 'POST', body: { email, otp, newPassword } })
