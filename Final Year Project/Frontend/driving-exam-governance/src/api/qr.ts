import { apiFetch } from './client'
import type { QrVerifyResult } from '../types'

export const verifyQr = (code: string) =>
  apiFetch<QrVerifyResult>(`/api/qr/verify?code=${encodeURIComponent(code)}`)
