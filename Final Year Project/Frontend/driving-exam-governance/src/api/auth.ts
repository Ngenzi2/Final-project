import { apiFetch } from './client'
import type { User } from '../types'

export type LoginResponse = {
  token: string
  user: User
}

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: { email, password } })

export const fetchMe = () => apiFetch<User>('/api/auth/me')
