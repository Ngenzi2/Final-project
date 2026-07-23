import { apiFetch } from './client'
import type { QrScanLog } from '../types'

export const listQrScanLogs = () => apiFetch<QrScanLog[]>('/api/qr/scan-logs')
