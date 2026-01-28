/**
 * MaintenanceAlertList.jsx
 * List of maintenance alerts (overdue and due soon items)
 *
 * @location src/components/maintenance/MaintenanceAlertList.jsx
 */

import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  Plane,
  Package,
  ChevronRight,
  Wrench
} from 'lucide-react'

const statusConfig = {
  overdue: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    text: 'text-red-700',
    label: 'Overdue',
    labelBg: 'bg-red-100 text-red-700'
  },
  due_soon: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    text: 'text-amber-700',
    label: 'Due Soon',
    labelBg: 'bg-amber-100 text-amber-700'
  }
}

function formatRemaining(item) {
  const scheduleStatuses = Object.values(item.scheduleStatuses || item.maintenanceStatus || {})
  if (!scheduleStatuses.length) return null

  // Find the most urgent
  const mostUrgent = scheduleStatuses.reduce((worst, current) => {
    if (!worst) return current
    if (current.status === 'overdue' && worst.status !== 'overdue') return current
    if (current.remaining !== undefined && worst.remaining !== undefined) {
      return current.remaining < worst.remaining ? current : worst
    }
    return worst
  }, null)

  if (!mostUrgent || mostUrgent.remaining === undefined) return null

  const remaining = mostUrgent.remaining
  if (mostUrgent.nextDueDate) {
    if (remaining === 0) return 'Due today'
    if (remaining < 0) return `${Math.abs(remaining)} days overdue`
    return `${remaining} days remaining`
  }
  if (mostUrgent.nextDueHours) {
    if (remaining <= 0) return `${Math.abs(remaining)} hours overdue`
    return `${remaining} hours remaining`
  }
  if (mostUrgent.nextDueCycles) {
    if (remaining <= 0) return `${Math.abs(remaining)} cycles overdue`
    return `${remaining} cycles remaining`
  }

  return null
}

export default function MaintenanceAlertList({
  items = [],
  title = 'Maintenance Alerts',
  emptyMessage = 'No items requiring attention',
  showViewAll = true,
  maxItems = 5
}) {
  const displayItems = items.slice(0, maxItems)

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {title}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {title}
        </h3>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      <div className="divide-y divide-gray-100">
        {displayItems.map((item) => {
          const status = item.worstStatus || 'due_soon'
          const config = statusConfig[status] || statusConfig.due_soon
          const ItemIcon = item.itemType === 'aircraft' || item.type === 'aircraft' ? Plane : Package
          const remaining = formatRemaining(item)

          return (
            <Link
              key={item.id}
              to={`/maintenance/items/${item.id}`}
              className={`block px-6 py-4 ${config.bg} hover:brightness-95 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/60`}>
                    <ItemIcon className={`w-5 h-5 ${config.icon}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.name || item.nickname}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${config.labelBg}`}>
                        {config.label}
                      </span>
                      {remaining && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {remaining}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          )
        })}
      </div>

      {showViewAll && items.length > maxItems && (
        <Link
          to="/maintenance/items?status=attention"
          className="block px-6 py-3 text-center text-sm font-medium text-aeria-navy hover:bg-gray-50 border-t border-gray-100"
        >
          View all {items.length} items
        </Link>
      )}
    </div>
  )
}
