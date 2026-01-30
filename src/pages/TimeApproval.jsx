/**
 * TimeApproval.jsx
 * Manager interface for approving/rejecting timesheets
 *
 * @location src/pages/TimeApproval.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  ClipboardCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Filter,
  Search,
  CheckSquare,
  AlertCircle,
  Send
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getPendingTimesheets,
  getTimesheetWithEntries,
  getTimesheetsByStatus,
  approveTimesheet,
  rejectTimesheet,
  getWeekStart,
  getWeekEnd,
  formatDateString,
  TASK_TYPES
} from '../lib/firestoreTimeTracking'
import { logger } from '../lib/logger'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import Modal from '../components/Modal'

/**
 * Format hours for display
 */
function formatHours(hours) {
  if (!hours) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

/**
 * Format week range for display
 */
function formatWeekRange(weekStartDate) {
  if (!weekStartDate) return ''
  const start = weekStartDate.toDate ? weekStartDate.toDate() : new Date(weekStartDate)
  const end = getWeekEnd(start)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export default function TimeApproval() {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timesheets, setTimesheets] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [expandedData, setExpandedData] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Filter state
  const [statusFilter, setStatusFilter] = useState('submitted')
  const [searchQuery, setSearchQuery] = useState('')

  // Action state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingTimesheet, setRejectingTimesheet] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([])
  const [showBulkApproveConfirm, setShowBulkApproveConfirm] = useState(false)

  // Load timesheets
  useEffect(() => {
    loadTimesheets()
  }, [statusFilter])

  const loadTimesheets = async () => {
    try {
      setLoading(true)
      let data
      if (statusFilter === 'submitted') {
        data = await getPendingTimesheets()
      } else {
        data = await getTimesheetsByStatus(statusFilter, { limit: 50 })
      }
      setTimesheets(data)
      setSelectedIds([])
    } catch (err) {
      logger.error('Failed to load timesheets:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle expanded view
  const toggleExpanded = async (timesheetId) => {
    if (expandedId === timesheetId) {
      setExpandedId(null)
      setExpandedData(null)
      return
    }

    try {
      setLoadingDetails(true)
      setExpandedId(timesheetId)
      const data = await getTimesheetWithEntries(timesheetId)
      setExpandedData(data)
    } catch (err) {
      logger.error('Failed to load timesheet details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Approve single timesheet
  const handleApprove = async (timesheet) => {
    try {
      setProcessing(true)
      const approverName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`
        : user.email

      await approveTimesheet(timesheet.id, user.uid, approverName)
      logger.info('Timesheet approved:', timesheet.id)
      loadTimesheets()
      if (expandedId === timesheet.id) {
        setExpandedId(null)
        setExpandedData(null)
      }
    } catch (err) {
      logger.error('Failed to approve timesheet:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Open reject modal
  const handleOpenReject = (timesheet) => {
    setRejectingTimesheet(timesheet)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  // Reject timesheet
  const handleReject = async () => {
    if (!rejectingTimesheet || !rejectionReason.trim()) return

    try {
      setProcessing(true)
      await rejectTimesheet(rejectingTimesheet.id, user.uid, rejectionReason.trim())
      logger.info('Timesheet rejected:', rejectingTimesheet.id)
      setShowRejectModal(false)
      setRejectingTimesheet(null)
      setRejectionReason('')
      loadTimesheets()
      if (expandedId === rejectingTimesheet.id) {
        setExpandedId(null)
        setExpandedData(null)
      }
    } catch (err) {
      logger.error('Failed to reject timesheet:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  // Select all
  const selectAll = () => {
    if (selectedIds.length === filteredTimesheets.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredTimesheets.map(t => t.id))
    }
  }

  // Bulk approve
  const handleBulkApprove = async () => {
    try {
      setProcessing(true)
      const approverName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`
        : user.email

      for (const id of selectedIds) {
        await approveTimesheet(id, user.uid, approverName)
      }

      logger.info('Bulk approved timesheets:', selectedIds.length)
      setShowBulkApproveConfirm(false)
      setSelectedIds([])
      loadTimesheets()
    } catch (err) {
      logger.error('Failed to bulk approve:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Filter timesheets
  const filteredTimesheets = useMemo(() => {
    if (!searchQuery) return timesheets
    const query = searchQuery.toLowerCase()
    return timesheets.filter(t =>
      t.operatorName?.toLowerCase().includes(query)
    )
  }, [timesheets, searchQuery])

  // Stats
  const stats = useMemo(() => {
    return {
      pending: timesheets.filter(t => t.status === 'submitted').length,
      totalHours: filteredTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0),
      totalBillable: filteredTimesheets.reduce((sum, t) => sum + (t.billableHours || 0), 0)
    }
  }, [timesheets, filteredTimesheets])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-aeria-navy" />
            Time Approval
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve team timesheets
          </p>
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && statusFilter === 'submitted' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedIds.length} selected
            </span>
            <Button
              onClick={() => setShowBulkApproveConfirm(true)}
              disabled={processing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Selected
            </Button>
          </div>
        )}
      </div>

      {/* Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Status Filter */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Filter by Status</div>
          <div className="flex flex-wrap gap-2">
            {['submitted', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? status === 'submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-2">Search</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Total Hours</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatHours(stats.totalHours)}
          </div>
          <div className="text-sm text-green-600">
            {formatHours(stats.totalBillable)} billable
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-gray-500 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-blue-600">
            {statusFilter === 'submitted' ? filteredTimesheets.length : stats.pending}
          </div>
          <div className="text-sm text-gray-500">timesheets</div>
        </Card>
      </div>

      {/* Timesheets List */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      ) : filteredTimesheets.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'submitted' ? 'No pending timesheets' : `No ${statusFilter} timesheets`}
          </h3>
          <p className="text-gray-500">
            {statusFilter === 'submitted'
              ? 'All timesheets have been reviewed.'
              : `There are no ${statusFilter} timesheets to display.`}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-4">
            {statusFilter === 'submitted' && (
              <button
                onClick={selectAll}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <CheckSquare
                  className={`w-5 h-5 ${
                    selectedIds.length === filteredTimesheets.length
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            )}
            <div className="flex-1 grid grid-cols-5 gap-4 text-sm font-medium text-gray-500">
              <div>Operator</div>
              <div>Week</div>
              <div>Hours</div>
              <div>Submitted</div>
              <div>Actions</div>
            </div>
          </div>

          {/* Timesheet Rows */}
          <div className="divide-y divide-gray-200">
            {filteredTimesheets.map(timesheet => (
              <div key={timesheet.id}>
                {/* Main Row */}
                <div
                  className={`px-4 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                    expandedId === timesheet.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {statusFilter === 'submitted' && (
                    <button
                      onClick={() => toggleSelect(timesheet.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <CheckSquare
                        className={`w-5 h-5 ${
                          selectedIds.includes(timesheet.id)
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  )}

                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    {/* Operator */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {timesheet.operatorName || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {/* Week */}
                    <div className="text-sm text-gray-600">
                      {formatWeekRange(timesheet.weekStartDate)}
                    </div>

                    {/* Hours */}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formatHours(timesheet.totalHours)}
                      </div>
                      {timesheet.billableHours > 0 && (
                        <div className="text-xs text-green-600">
                          {formatHours(timesheet.billableHours)} billable
                        </div>
                      )}
                    </div>

                    {/* Submitted */}
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(timesheet.submittedAt)}
                      {timesheet.submissionNotes && (
                        <div className="flex items-center gap-1 text-blue-600 mt-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-xs">Has notes</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {statusFilter === 'submitted' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(timesheet)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenReject(timesheet)}
                            disabled={processing}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {statusFilter === 'approved' && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {statusFilter === 'rejected' && (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                      <button
                        onClick={() => toggleExpanded(timesheet.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedId === timesheet.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === timesheet.id && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                    {loadingDetails ? (
                      <div className="text-center py-4 text-gray-500">
                        Loading details...
                      </div>
                    ) : expandedData ? (
                      <div className="space-y-4">
                        {/* Submission Notes */}
                        {expandedData.submissionNotes && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
                              <MessageSquare className="w-4 h-4" />
                              Notes from {expandedData.operatorName}
                            </div>
                            <div className="text-sm text-blue-700">
                              {expandedData.submissionNotes}
                            </div>
                          </div>
                        )}

                        {/* Rejection Reason (if rejected) */}
                        {expandedData.rejectionReason && (
                          <div className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-1">
                              <AlertCircle className="w-4 h-4" />
                              Rejection Reason
                            </div>
                            <div className="text-sm text-red-700">
                              {expandedData.rejectionReason}
                            </div>
                          </div>
                        )}

                        {/* Entries Table */}
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Time Entries ({expandedData.entries?.length || 0})
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Project</th>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Task</th>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Hours</th>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Billable</th>
                                  <th className="px-3 py-2 text-left text-gray-500 font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {expandedData.entries?.map(entry => (
                                  <tr key={entry.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-gray-600">
                                      {formatDate(entry.date)}
                                    </td>
                                    <td className="px-3 py-2 font-medium text-gray-900">
                                      {entry.projectName || 'No project'}
                                    </td>
                                    <td className="px-3 py-2">
                                      <Badge size="sm" className={TASK_TYPES[entry.taskType]?.color}>
                                        {TASK_TYPES[entry.taskType]?.label || entry.taskType}
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-2 font-medium text-gray-900">
                                      {formatHours(entry.totalHours)}
                                    </td>
                                    <td className="px-3 py-2">
                                      {entry.billable ? (
                                        <span className="text-green-600">
                                          ${entry.billingAmount?.toFixed(2) || '0.00'}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                                      {entry.description || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-gray-500">Total:</span>{' '}
                              <span className="font-semibold">{formatHours(expandedData.totalHours)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Billable:</span>{' '}
                              <span className="font-semibold text-green-600">
                                {formatHours(expandedData.billableHours)}
                              </span>
                            </div>
                          </div>

                          {statusFilter === 'submitted' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleOpenReject(timesheet)}
                                disabled={processing}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(timesheet)}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => !processing && setShowRejectModal(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Timesheet</h3>
              <p className="text-sm text-gray-500">
                {rejectingTimesheet?.operatorName}'s timesheet for{' '}
                {formatWeekRange(rejectingTimesheet?.weekStartDate)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Please explain why this timesheet is being rejected..."
              disabled={processing}
            />
            <p className="text-xs text-gray-500 mt-1">
              This feedback will be visible to the employee.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Timesheet
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Approve Confirmation */}
      <Modal
        isOpen={showBulkApproveConfirm}
        onClose={() => !processing && setShowBulkApproveConfirm(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Approve {selectedIds.length} Timesheets</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to approve the selected timesheets?
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600">
              This will approve {selectedIds.length} timesheet{selectedIds.length !== 1 ? 's' : ''} totaling{' '}
              <span className="font-semibold">
                {formatHours(
                  filteredTimesheets
                    .filter(t => selectedIds.includes(t.id))
                    .reduce((sum, t) => sum + (t.totalHours || 0), 0)
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowBulkApproveConfirm(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
