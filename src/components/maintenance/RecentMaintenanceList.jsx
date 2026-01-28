/**
 * RecentMaintenanceList.jsx
 * List of recent maintenance activity
 *
 * @location src/components/maintenance/RecentMaintenanceList.jsx
 */

import { Link } from 'react-router-dom'
import {
  CheckCircle,
  Clock,
  Wrench,
  FileText,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

function formatDate(date) {
  if (!date) return 'Unknown'
  const d = date?.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

export default function RecentMaintenanceList({
  records = [],
  title = 'Recent Maintenance',
  emptyMessage = 'No recent maintenance activity',
  showViewAll = true,
  maxItems = 5
}) {
  const displayRecords = records.slice(0, maxItems)

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
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
          <Clock className="w-5 h-5 text-gray-400" />
          {title}
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {displayRecords.map((record) => {
          const hasForm = record.formSubmissionId
          const Icon = hasForm ? FileText : Wrench

          return (
            <Link
              key={record.id}
              to={`/maintenance/records/${record.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.itemName || 'Unknown Item'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                      <span>{record.scheduleName || record.description || 'Maintenance'}</span>
                      {record.completedByName && (
                        <>
                          <span>-</span>
                          <span>{record.completedByName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.serviceDate || record.completedDate)}
                      </span>
                      {hasForm && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Form
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

      {showViewAll && records.length > maxItems && (
        <Link
          to="/maintenance/records"
          className="block px-6 py-3 text-center text-sm font-medium text-aeria-navy hover:bg-gray-50 border-t border-gray-100"
        >
          View all maintenance history
        </Link>
      )}
    </div>
  )
}
