import { useFetch } from './useFetch'
import * as companiesApi from '../api/companies'
import type { CompanyFiles, CompanyRegisterInput } from '../api/companies'

export function useCompanies() {
  const { data, loading, error, refetch } = useFetch(companiesApi.listCompanies, [])

  const register = async (input: CompanyRegisterInput, files: CompanyFiles) => {
    await companiesApi.registerCompany(input, files)
    await refetch()
  }

  const approve = async (id: number) => {
    await companiesApi.approveCompany(id)
    await refetch()
  }

  return { companies: data ?? [], loading, error, refetch, register, approve }
}
