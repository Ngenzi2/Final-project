import { useFetch } from './useFetch'
import * as qrScanLogsApi from '../api/qrScanLogs'

export function useQrScanLogs(enabled = true) {
  const { data, loading, error, refetch } = useFetch(
    () => (enabled ? qrScanLogsApi.listQrScanLogs() : Promise.resolve([])),
    [enabled],
  )

  return { scanLogs: data ?? [], loading, error, refetch }
}
