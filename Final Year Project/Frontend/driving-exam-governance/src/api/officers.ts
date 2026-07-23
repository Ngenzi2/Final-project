import { apiFetch } from './client'

export type OfficerScanResponse = {
    studentName: string
    companyName: string
    teacherName: string
    paid: boolean
    eligible: boolean
    reason: string
    registrationId: number
    attended: boolean
}

export type OfficerAttendanceRecord = {
    registrationId: number
    studentName: string
    nationalId: string
    qrCode: string
    companyName: string
    teacherName: string
    paid: boolean
    attended: boolean
    verificationTime: string
    officerName: string
}

export const scanQrCode = (qrCode: string): Promise<OfficerScanResponse> => {
    return apiFetch('/api/officer/scan', {
        method: 'POST',
        body: { qrCode }
    })
}

export const markAttended = (registrationId: number): Promise<{ message: string }> => {
    return apiFetch(`/api/officer/verify/${registrationId}`, {
        method: 'POST'
    })
}

export const getAttendance = (date: string): Promise<OfficerAttendanceRecord[]> => {
    return apiFetch(`/api/officer/attendance?date=${encodeURIComponent(date)}`)
}
