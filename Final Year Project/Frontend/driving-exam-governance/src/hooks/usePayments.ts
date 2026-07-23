import { useEffect, useRef } from 'react'
import { useFetch } from './useFetch'
import * as paymentsApi from '../api/payments'
import type { InitiatePaymentInput } from '../api/payments'

export function usePaymentConfig() {
  const { data, loading, error } = useFetch(paymentsApi.getPaymentConfig, [])
  return { config: data, loading, error }
}

export function usePayments() {
  const { data, loading, error, refetch } = useFetch(paymentsApi.listPayments, [])
  return { payments: data ?? [], loading, error, refetch }
}

const POLL_INTERVAL_MS = 4000

export function useRegistrationPayment(registrationId: number | null) {
  const { data, loading, error, refetch, setData } = useFetch(
    () => (registrationId != null ? paymentsApi.getPaymentForRegistration(registrationId) : Promise.resolve(null)),
    [registrationId],
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (data?.status === 'PENDING') {
      intervalRef.current = setInterval(() => {
        refetch()
      }, POLL_INTERVAL_MS)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status])

  const initiate = async (input: InitiatePaymentInput) => {
    if (registrationId == null) return
    const payment = await paymentsApi.initiatePayment(registrationId, input)
    setData(payment)
    return payment
  }

  const cancel = async () => {
    if (!data) return
    const payment = await paymentsApi.cancelPayment(data.id)
    setData(payment)
    return payment
  }

  return { payment: data ?? null, loading, error, refetch, initiate, cancel }
}
