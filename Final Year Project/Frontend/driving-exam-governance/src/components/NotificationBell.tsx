import { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '../api/notifications'
import type { Notification } from '../api/notifications'

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        getNotifications().then(setNotifications).catch(console.error)

        const clickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', clickOutside)
        return () => document.removeEventListener('mousedown', clickOutside)
    }, [])

    const unreadCount = notifications.filter((n) => !n.isRead).length

    const handleRead = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await markNotificationAsRead(id)
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
        } catch (err) {
            console.error('Failed to mark read', err)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-slate-500 hover:bg-slate-50 hover:text-brand-navy shadow-sm border border-[#E5EAF2] transition-colors"
            >
                <Bell size={18} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-brand-orange shadow-[0_0_0_2px_#fff]" />
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#e2e8f0] z-50">
                    <div className="border-b border-[#e2e8f0] bg-slate-50/80 px-4 py-3">
                        <h3 className="m-0 text-[0.95rem] font-bold text-[#1F2937]">Notifications</h3>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto p-1.5">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-[0.875rem] text-slate-400">No notifications yet.</p>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`relative mb-1 rounded-xl p-3 flex flex-col gap-1 transition-colors ${n.isRead ? 'bg-transparent hover:bg-slate-50' : 'bg-[#e6f6ff]/50 hover:bg-[#e6f6ff]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`m-0 text-[0.85rem] font-semibold ${n.isRead ? 'text-slate-600' : 'text-brand-navy'}`}>
                                            {n.title}
                                        </p>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => handleRead(n.id, e)}
                                                className="shrink-0 rounded text-[0.7rem] font-bold text-brand-orange hover:text-brand-orange-strong bg-transparent border-none p-0 cursor-pointer"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                    <p className="m-0 text-[0.8rem] text-slate-500 leading-snug">{n.message}</p>
                                    <span className="mt-1 text-[0.65rem] font-medium text-slate-400 uppercase tracking-widest">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
