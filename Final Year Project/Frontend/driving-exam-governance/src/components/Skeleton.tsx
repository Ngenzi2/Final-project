type SkeletonProps = {
    className?: string
}

const shimmerClass =
    'animate-shimmer rounded-lg bg-[linear-gradient(110deg,#eef1f8_8%,#f8f9fd_18%,#eef1f8_33%)] bg-[length:200%_100%]'

export const Skeleton = ({ className = '' }: SkeletonProps) => <div className={`${shimmerClass} ${className}`} />

export const SkeletonListRow = () => (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E5EAF2] bg-white px-4.5 py-4">
        <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
    </div>
)

export const SkeletonList = ({ rows = 4 }: { rows?: number }) => (
    <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, i) => (
            <SkeletonListRow key={i} />
        ))}
    </div>
)

export const SkeletonStatCard = () => (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E5EAF2] bg-white p-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
    </div>
)

export const SkeletonTableRow = ({ columns }: { columns: number }) => (
    <tr>
        {Array.from({ length: columns }, (_, i) => (
            <td key={i} className="border-b border-[#f0f1f8] px-4 py-3">
                <Skeleton className="h-4 w-full max-w-32" />
            </td>
        ))}
    </tr>
)
