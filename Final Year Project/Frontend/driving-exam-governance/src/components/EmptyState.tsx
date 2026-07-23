import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
    icon: LucideIcon
    title: string
    description?: string
    tone?: 'neutral' | 'good' | 'danger'
    className?: string
}

const toneClasses = {
    neutral: { bg: 'bg-slate-100', text: 'text-slate-400' },
    good: { bg: 'bg-emerald-50', text: 'text-emerald-400' },
    danger: { bg: 'bg-red-50', text: 'text-red-400' },
}

export const EmptyState = ({ icon: Icon, title, description, tone = 'neutral', className = '' }: EmptyStateProps) => {
    const { bg, text } = toneClasses[tone]
    return (
        <div className={`animate-fade-in flex flex-col items-center gap-3 py-10 text-center ${className}`}>
            <span className={`grid h-16 w-16 place-items-center rounded-full ${bg} ${text}`}>
                <Icon size={30} strokeWidth={1.75} className="opacity-70" />
            </span>
            <div className="flex flex-col gap-1">
                <p className="m-0 font-semibold text-slate-500">{title}</p>
                {description && <p className="m-0 text-sm text-slate-400">{description}</p>}
            </div>
        </div>
    )
}
