import { useFetch } from './useFetch'
import * as companiesApi from '../api/companies'
import type { CompanyFiles, CompanyRegisterInput, CompanyUpdateInput } from '../api/companies'

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

  const suspend = async (id: number) => {
    await companiesApi.suspendCompany(id)
    await refetch()
  }

  const unsuspend = async (id: number) => {
    await companiesApi.unsuspendCompany(id)
    await refetch()
  }

  const update = async (id: number, input: CompanyUpdateInput) => {
    await companiesApi.updateCompany(id, input)
    await refetch()
  }

  const remove = async (id: number) => {
    await companiesApi.deleteCompany(id)
    await refetch()
  }

  return { companies: data ?? [], loading, error, refetch, register, approve, suspend, unsuspend, update, remove }
}
