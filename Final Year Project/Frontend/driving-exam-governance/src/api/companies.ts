import { apiFetch } from './client'
import type { Company } from '../types'

export type CompanyRegisterInput = {
  name: string
  registrationNumber: string
  tin: string
  email: string
  phone: string
  address: string
  district: string
  adminFullName: string
  adminNationalId: string
  adminPhone: string
  adminEmail: string
  adminPosition: string
  adminPassword: string
}

export type CompanyFiles = {
  registrationCertificate?: File
  drivingSchoolLicense?: File
  taxCertificate?: File
  logo?: File
}

export const listCompanies = () => apiFetch<Company[]>('/api/companies')

export const getCompany = (id: number) => apiFetch<Company>(`/api/companies/${id}`)

export const registerCompany = (input: CompanyRegisterInput, files: CompanyFiles) => {
  const formData = new FormData()
  formData.append('data', new Blob([JSON.stringify(input)], { type: 'application/json' }))
  if (files.registrationCertificate) formData.append('registrationCertificate', files.registrationCertificate)
  if (files.drivingSchoolLicense) formData.append('drivingSchoolLicense', files.drivingSchoolLicense)
  if (files.taxCertificate) formData.append('taxCertificate', files.taxCertificate)
  if (files.logo) formData.append('logo', files.logo)

  return apiFetch<Company>('/api/companies', { method: 'POST', body: formData })
}

export const approveCompany = (id: number) =>
  apiFetch<Company>(`/api/companies/${id}/approve`, { method: 'PATCH' })
