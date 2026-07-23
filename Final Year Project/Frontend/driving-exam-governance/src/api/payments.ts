import { apiFetch } from './client'
import type { Payment, PaymentConfig } from '../types'

export type InitiatePaymentInput = {
  channelName: 'MOMO' | 'AIRTEL_MONEY'
  phoneNumber: string
}

export const getPaymentConfig = () => apiFetch<PaymentConfig>('/api/payments/config')

export const listPayments = () => apiFetch<Payment[]>('/api/payments')

export const getPaymentForRegistration = (registrationId: number) =>
  apiFetch<Payment | null>(`/api/payments/registrations/${registrationId}`)

export const initiatePayment = (registrationId: number, input: InitiatePaymentInput) =>
  apiFetch<Payment>(`/api/payments/registrations/${registrationId}/initiate`, {
    method: 'POST',
    body: input,
  })

export const cancelPayment = (paymentId: number) =>
  apiFetch<Payment>(`/api/payments/${paymentId}/cancel`, { method: 'POST' })
