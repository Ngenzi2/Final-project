import { useState, useCallback } from 'react'
import * as officersApi from '../api/officers'

export const useOfficerScan = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const scan = useCallback(async (qrCode: string) => {
        setLoading(true)
        setError('')
        try {
            return await officersApi.scanQrCode(qrCode)
        } finally {
            setLoading(false)
        }
    }, [])

    const allowEntry = useCallback(async (registrationId: number) => {
        setLoading(true)
        setError('')
        try {
            await officersApi.markAttended(registrationId)
        } finally {
            setLoading(false)
        }
    }, [])

    return { loading, error, scan, allowEntry }
}

export const useOfficerAttendance = (date: string) => {
    const [records, setRecords] = useState<officersApi.OfficerAttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        try {
            const data = await officersApi.getAttendance(date)
            setRecords(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch attendance')
        } finally {
            setLoading(false)
        }
    }, [date])

    return { records, loading, error, refetch: fetchRecords }
}
