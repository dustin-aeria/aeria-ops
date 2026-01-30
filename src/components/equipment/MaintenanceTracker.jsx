/**
 * Maintenance Tracker Component
 * Track maintenance schedules and history for equipment
 *
 * @location src/components/equipment/MaintenanceTracker.jsx
 */

import { useState, useEffect } from 'react'
import {
  Wrench,
  Plus,
  Calendar,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  Download,
  Check,
  X,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react'
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUS,
  createMaintenanceRecord,
  getMaintenanceRecords,
  updateMaintenanceRecord,
  completeMaintenanceRecord,
  deleteMaintenanceRecord,
  getEquipmentHealthStatus
} from '../../lib/firestoreMaintenance'
import { useAuth } from '../../contexts/AuthContext'

const TYPE_ICONS = {
  scheduled: Calendar,
  preventive: Shield,
  corrective: Wrench,
  emergency: AlertTriangle,
  inspection: ClipboardCheck,
  calibration: Settings,
  firmware: Download
}

export default function MaintenanceTracker({ equipment, organizationId }) {
  const { user, userProfile } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(null)
  const [expandedRecord, setExpandedRecord] = useState(null)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  // Form state for new record
  const [newRecord, setNewRecord] = useState({
    type: 'scheduled',
    description: '',
    scheduledDate: '',
    notes: ''
  })

  // Completion form state
  const [completionData, setCompletionData] = useState({
    notes: '',
    cost: '',
    parts: ''
  })

  // Load records
  useEffect(() => {
    if (equipment?.id) {
      loadRecords()
    }
  }, [equipment?.id])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const data = await getMaintenanceRecords(equipment.id)
      setRecords(data)
    } catch (err) {
      // Maintenance tracking is optional
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = async () => {
    if (!newRecord.description.trim()) return

    setSaving(true)
    try {
      await createMaintenanceRecord({
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        organizationId,
        type: newRecord.type,
        description: newRecord.description.trim(),
        scheduledDate: newRecord.scheduledDate ? new Date(newRecord.scheduledDate) : null,
        notes: newRecord.notes.trim()
      })

      setShowAddModal(false)
      setNewRecord({
        type: 'scheduled',
        description: '',
        scheduledDate: '',
        notes: ''
      })
      loadRecords()
    } catch (err) {
      alert('Failed to create maintenance record.')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async (record) => {
    setSaving(true)
    try {
      await completeMaintenanceRecord(record.id, {
        completedDate: new Date(),
        performedBy: user?.uid,
        performedByName: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : userProfile?.email || 'Unknown',
        notes: completionData.notes.trim(),
        cost: completionData.cost ? parseFloat(completionData.cost) : null,
        parts: completionData.parts.split(',').map(p => p.trim()).filter(Boolean)
      })

      setShowCompleteModal(null)
      setCompletionData({ notes: '', cost: '', parts: '' })
      loadRecords()
    } catch (err) {
      alert('Failed to complete maintenance record.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return

    try {
      await deleteMaintenanceRecord(recordId)
      loadRecords()
    } catch (err) {
      alert('Failed to delete record.')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not scheduled'
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (record) => {
    if (record.status === 'completed' || record.status === 'cancelled') return false
    if (!record.scheduledDate) return false
    const date = record.scheduledDate instanceof Date ? record.scheduledDate : new Date(record.scheduledDate)
    return date < new Date()
  }

  // Get health status
  const healthStatus = getEquipmentHealthStatus(equipment, records)

  // Filter records
  const filteredRecords = records.filter(r => {
    if (filter === 'all') return true
    if (filter === 'pending') return r.status !== 'completed' && r.status !== 'cancelled'
    if (filter === 'completed') return r.status === 'completed'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Health Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-aeria-navy" />
            Maintenance
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${healthStatus.color}`}>
            {healthStatus.label}
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Schedule Maintenance
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">
            {records.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length}
          </p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-red-600">
            {records.filter(r => isOverdue(r)).length}
          </p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-600">
            {records.filter(r => r.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full ${
              filter === f
                ? 'bg-aeria-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Wrench className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No maintenance records</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-aeria-blue hover:underline text-sm"
          >
            Schedule first maintenance
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map((record) => {
            const typeConfig = MAINTENANCE_TYPES[record.type] || MAINTENANCE_TYPES.scheduled
            const statusConfig = MAINTENANCE_STATUS[record.status] || MAINTENANCE_STATUS.scheduled
            const Icon = TYPE_ICONS[record.type] || Wrench
            const overdue = isOverdue(record)

            return (
              <div
                key={record.id}
                className={`border rounded-lg overflow-hidden ${
                  overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(record.scheduledDate)}
                          </span>
                          {overdue && (
                            <span className="text-xs text-red-600 font-medium">Overdue</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {record.status !== 'completed' && record.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setShowCompleteModal(record)
                            setCompletionData({ notes: '', cost: '', parts: '' })
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Mark Complete"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedRecord(
                          expandedRecord === record.id ? null : record.id
                        )}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      >
                        {expandedRecord === record.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecord === record.id && (
                  <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50">
                    {record.notes && (
                      <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                    )}
                    {record.status === 'completed' && (
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-500">
                          <span className="font-medium">Completed:</span> {formatDate(record.completedDate)}
                        </p>
                        {record.performedByName && (
                          <p className="text-gray-500">
                            <span className="font-medium">By:</span> {record.performedByName}
                          </p>
                        )}
                        {record.cost && (
                          <p className="text-gray-500">
                            <span className="font-medium">Cost:</span> ${record.cost.toFixed(2)}
                          </p>
                        )}
                        {record.parts && record.parts.length > 0 && (
                          <p className="text-gray-500">
                            <span className="font-medium">Parts:</span> {record.parts.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Maintenance</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                >
                  {Object.entries(MAINTENANCE_TYPES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  placeholder="e.g., Battery replacement"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={newRecord.scheduledDate}
                  onChange={(e) => setNewRecord({ ...newRecord, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.description.trim() || saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCompleteModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Maintenance</h3>
            <p className="text-sm text-gray-600 mb-4">{showCompleteModal.description}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={completionData.cost}
                    onChange={(e) => setCompletionData({ ...completionData, cost: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parts Used (comma-separated)
                </label>
                <input
                  type="text"
                  value={completionData.parts}
                  onChange={(e) => setCompletionData({ ...completionData, parts: e.target.value })}
                  placeholder="e.g., Battery, Propeller set"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  placeholder="Any notes about the maintenance..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCompleteModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleComplete(showCompleteModal)}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
