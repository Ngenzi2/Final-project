import type { ReactNode } from 'react'
import { tableWrapClass, th } from '../constants/ui'

export type TableShellProps = {
  headers: string[]
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
}

export const TableShell = ({ headers, children, emptyMessage = 'Nothing to show yet.', isEmpty = false }: TableShellProps) => {
  return (
    <div className={tableWrapClass}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className={th}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-[#6B7280]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  )
}
