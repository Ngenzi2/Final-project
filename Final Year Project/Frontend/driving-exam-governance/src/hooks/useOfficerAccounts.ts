import { useFetch } from './useFetch'
import * as officerAccountsApi from '../api/officerAccounts'
import type { OfficerCreateInput } from '../api/officerAccounts'

export function useOfficerAccounts() {
  const { data, loading, error, refetch } = useFetch(officerAccountsApi.listOfficerAccounts, [])

  const create = async (input: OfficerCreateInput) => {
    const created = await officerAccountsApi.createOfficerAccount(input)
    await refetch()
    return created
  }

  const setActive = async (id: number, active: boolean) => {
    await officerAccountsApi.setOfficerAccountActive(id, active)
    await refetch()
  }

  const remove = async (id: number) => {
    await officerAccountsApi.deleteOfficerAccount(id)
    await refetch()
  }

  return { officers: data ?? [], loading, error, refetch, create, setActive, remove }
}
