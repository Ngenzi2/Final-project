import { apiFetch } from './client'

export type Notification = {
    id: number
    title: string
    message: string
    isRead: boolean
    createdAt: string
}

export const getNotifications = () => apiFetch<Notification[]>('/api/notifications')

export const markNotificationAsRead = (id: number) =>
    apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' })
