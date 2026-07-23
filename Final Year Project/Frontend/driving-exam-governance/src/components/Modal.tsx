import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    const [shouldRender, setShouldRender] = useState(isOpen)

    useEffect(() => {
        if (isOpen) setShouldRender(true)
    }, [isOpen])

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false)
    }

    if (!shouldRender) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'bg-slate-900/40 backdrop-blur-sm opacity-100' : 'opacity-0'}`}
            onClick={onClose}
            onTransitionEnd={handleAnimationEnd}
        >
            <div
                className={`relative w-full max-w-md rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-800 m-0">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
