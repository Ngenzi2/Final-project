import type { LucideIcon } from 'lucide-react'
import { itemMetaClass, itemTitleClass, listCardClass, listItemClass } from '../constants/ui'

export type ActivityItem = {
  id: string
  icon: LucideIcon
  title: string
  timestamp: string
  description?: string
}

export const ActivityTimeline = ({ items }: { items: ActivityItem[] }) => {
  if (items.length === 0) {
    return <p className="text-[#6B7280]">No recent activity yet.</p>
  }

  return (
    <div className={`${listCardClass} max-h-105 overflow-y-auto pr-1`}>
      {items.map((item) => (
        <div key={item.id} className={listItemClass}>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-orange-tint text-brand-orange-strong">
              <item.icon size={16} strokeWidth={2} />
            </span>
            <div>
              <p className={itemTitleClass}>{item.title}</p>
              {item.description && <p className={itemMetaClass}>{item.description}</p>}
            </div>
          </div>
          <span className="whitespace-nowrap text-[0.82rem] text-[#6B7280]">{item.timestamp}</span>
        </div>
      ))}
    </div>
  )
}
