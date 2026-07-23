import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react'
import { SkeletonTableRow } from './Skeleton'
import { EmptyState } from './EmptyState'
import { tableWrapClass, th, td } from '../constants/ui'

export type DataTableColumn<T> = {
    key: string
    header: string
    render: (row: T) => ReactNode
    sortValue?: (row: T) => string | number
    className?: string
}

type SortState = { key: string; direction: 'asc' | 'desc' } | null

type DataTableProps<T> = {
    columns: DataTableColumn<T>[]
    data: T[]
    rowKey: (row: T) => string | number
    loading?: boolean
    emptyIcon?: LucideIcon
    emptyTitle?: string
    emptyDescription?: string
}

export function DataTable<T>({
    columns,
    data,
    rowKey,
    loading = false,
    emptyIcon = Inbox,
    emptyTitle = 'Nothing to show yet.',
    emptyDescription,
}: DataTableProps<T>) {
    const [sort, setSort] = useState<SortState>(null)

    const sorted = useMemo(() => {
        if (!sort) return data
        const column = columns.find((c) => c.key === sort.key)
        if (!column?.sortValue) return data
        const copy = [...data]
        copy.sort((a, b) => {
            const av = column.sortValue!(a)
            const bv = column.sortValue!(b)
            if (av < bv) return sort.direction === 'asc' ? -1 : 1
            if (av > bv) return sort.direction === 'asc' ? 1 : -1
            return 0
        })
        return copy
    }, [data, sort, columns])

    const toggleSort = (key: string) => {
        setSort((prev) => {
            if (!prev || prev.key !== key) return { key, direction: 'asc' }
            if (prev.direction === 'asc') return { key, direction: 'desc' }
            return null
        })
    }

    return (
        <div className={tableWrapClass}>
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={th}>
                                {column.sortValue ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleSort(column.key)}
                                        className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-bold text-inherit"
                                    >
                                        {column.header}
                                        {sort?.key === column.key ? (
                                            sort.direction === 'asc' ? (
                                                <ArrowUp size={13} />
                                            ) : (
                                                <ArrowDown size={13} />
                                            )
                                        ) : (
                                            <ArrowUpDown size={13} className="opacity-30" />
                                        )}
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 4 }, (_, i) => <SkeletonTableRow key={i} columns={columns.length} />)
                    ) : sorted.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length}>
                                <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                            </td>
                        </tr>
                    ) : (
                        sorted.map((row, i) => (
                            <tr
                                key={rowKey(row)}
                                className="animate-slide-up transition-colors hover:bg-[#f8fafc]"
                                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className={`${td} ${column.className ?? ''}`}>
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
