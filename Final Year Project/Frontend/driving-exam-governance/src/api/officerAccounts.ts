import { apiFetch } from './client'

export type OfficerAccount = {
  id: number
  name: string
  email: string
  enabled: boolean
  createdAt: string
}

export type OfficerCreateInput = {
  name: string
  email: string
}

export type OfficerCreated = {
  id: number
  name: string
  email: string
  temporaryPassword: string
}

export const listOfficerAccounts = () => apiFetch<OfficerAccount[]>('/api/users/officers')

export const createOfficerAccount = (input: OfficerCreateInput) =>
  apiFetch<OfficerCreated>('/api/users/officers', { method: 'POST', body: input })

export const setOfficerAccountActive = (id: number, active: boolean) =>
  apiFetch<OfficerAccount>(`/api/users/officers/${id}/active`, { method: 'PATCH', body: { active } })

export const deleteOfficerAccount = (id: number) =>
  apiFetch<void>(`/api/users/officers/${id}`, { method: 'DELETE' })
