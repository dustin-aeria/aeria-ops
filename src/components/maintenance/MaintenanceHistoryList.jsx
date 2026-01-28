/**
 * MaintenanceHistoryList.jsx
 * Display maintenance history for an item
 *
 * @location src/components/maintenance/MaintenanceHistoryList.jsx
 */

import { useState, useEffect } from 'react'
import {
  Clock,
  Wrench,
  User,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  Calendar,
  Gauge,
  RotateCcw
} from 'lucide-react'
import { getMaintenanceHistory } from '../../lib/firestoreMaintenance'

const serviceTypeConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  unscheduled: { label: 'Unscheduled', color: 'bg-gray-100 text-gray-700' },
  inspection: { label: 'Inspection', color: 'bg-purple-100 text-purple-700' },
  repair: { label: 'Repair', color: 'bg-amber-100 text-amber-700' }
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown'

  // Handle Firestore timestamp
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDateTime(timestamp) {
  if (!timestamp) return 'Unknown'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function MaintenanceHistoryList({ item }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    loadHistory()
  }, [item])

  const loadHistory = async () => {
    if (!item?.id) return

    setLoading(true)
    try {
      const history = await getMaintenanceHistory(item.id, item.itemType)
      setRecords(history)
    } catch (err) {
      console.error('Failed to load maintenance history:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (recordId) => {
    setExpanded(prev => ({ ...prev, [recordId]: !prev[recordId] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-aeria-navy" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>

      {records.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No maintenance records yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Records will appear here after logging maintenance
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => {
            const isExpanded = expanded[record.id]
            const typeConfig = serviceTypeConfig[record.serviceType] || serviceTypeConfig.scheduled
            const completedTasks = record.tasksCompleted?.filter(t => t.completed).length || 0
            const totalTasks = record.tasksCompleted?.length || 0

            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(record.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          {formatDate(record.serviceDate)}
                        </span>
                        {record.scheduleName && (
                          <span className="text-gray-600">- {record.scheduleName}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {record.completedByName || 'Unknown'}
                        </span>
                        {record.totalCost > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${record.totalCost.toFixed(2)}
                          </span>
                        )}
                        {totalTasks > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {completedTasks}/{totalTasks} tasks
                          </span>
                        )}
                        {record.formSubmissionId && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <FileText className="w-4 h-4" />
                            Form attached
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    {/* Meter readings at service */}
                    {(record.hoursAtService || record.cyclesAtService) && (
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="text-gray-500">At service:</span>
                        {record.hoursAtService && (
                          <span className="flex items-center gap-1">
                            <Gauge className="w-4 h-4 text-gray-400" />
                            {record.hoursAtService} hrs
                          </span>
                        )}
                        {record.cyclesAtService && (
                          <span className="flex items-center gap-1">
                            <RotateCcw className="w-4 h-4 text-gray-400" />
                            {record.cyclesAtService} cycles
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tasks */}
                    {record.tasksCompleted?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 uppercase mb-2">Tasks Completed</p>
                        <div className="space-y-1">
                          {record.tasksCompleted.map((task, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 text-sm ${
                                task.completed ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              <CheckCircle className={`w-4 h-4 mt-0.5 ${
                                task.completed ? 'text-green-500' : 'text-gray-300'
                              }`} />
                              <div>
                                <span>{task.name}</span>
                                {task.notes && (
                                  <p className="text-xs text-gray-500">{task.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parts Used */}
                    {record.partsUsed?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 uppercase mb-2">Parts Used</p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {record.partsUsed.map((part, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{part.name}</span>
                                {part.partNumber && (
                                  <span className="text-gray-500 ml-2">#{part.partNumber}</span>
                                )}
                                <span className="text-gray-500 ml-2">x{part.quantity}</span>
                              </div>
                              {part.cost > 0 && (
                                <span className="text-gray-600">${(part.cost * part.quantity).toFixed(2)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cost Breakdown */}
                    {(record.laborCost > 0 || record.partsCost > 0) && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 uppercase mb-2">Costs</p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                          {record.laborHours > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Labor ({record.laborHours} hrs)</span>
                              <span>${record.laborCost?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}
                          {record.partsCost > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Parts</span>
                              <span>${record.partsCost.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-gray-200 font-medium">
                            <span>Total</span>
                            <span>${record.totalCost?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes & Findings */}
                    {(record.notes || record.findings) && (
                      <div className="mt-4 space-y-3">
                        {record.notes && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                        {record.findings && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Findings</p>
                            <p className="text-sm text-gray-700">{record.findings}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      Logged {formatDateTime(record.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
