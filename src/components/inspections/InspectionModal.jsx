/**
 * InspectionModal.jsx
 * Modal for scheduling, conducting, and viewing inspections
 */

import { useState, useEffect } from 'react'
import { X, Save, Play, CheckCircle2, AlertTriangle, ClipboardCheck, Plus } from 'lucide-react'
import {
  scheduleInspection,
  startInspection,
  updateChecklistItem,
  completeInspection,
  updateInspection,
  cancelInspection,
  getInspection,
  INSPECTION_TYPES,
  INSPECTION_STATUS,
  ITEM_STATUS
} from '../../lib/firestoreInspections'

export default function InspectionModal({
  isOpen,
  onClose,
  inspection,
  templates,
  operatorId,
  onCreateFinding
}) {
  const [formData, setFormData] = useState({
    templateId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    location: '',
    inspectorName: '',
    notes: ''
  })
  const [checklistItems, setChecklistItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [currentInspection, setCurrentInspection] = useState(null)

  const isEditing = !!inspection
  const isScheduled = currentInspection?.status === 'scheduled'
  const isInProgress = currentInspection?.status === 'in_progress'
  const isCompleted = currentInspection?.status === 'completed'

  useEffect(() => {
    if (inspection) {
      setCurrentInspection(inspection)
      setChecklistItems(inspection.checklistItems || [])
      setFormData({
        templateId: inspection.templateId || '',
        scheduledDate: inspection.scheduledDate
          ? (inspection.scheduledDate.toDate?.() || new Date(inspection.scheduledDate)).toISOString().split('T')[0]
          : '',
        location: inspection.location || '',
        inspectorName: inspection.inspectorName || '',
        notes: inspection.completionNotes || ''
      })
    } else {
      setCurrentInspection(null)
      setChecklistItems([])
      setFormData({
        templateId: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        location: '',
        inspectorName: '',
        notes: ''
      })
    }
  }, [inspection])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSchedule = async (e) => {
    e.preventDefault()
    if (!formData.templateId) {
      setError('Please select a template')
      return
    }

    setError(null)
    setSaving(true)

    try {
      await scheduleInspection({
        operatorId,
        templateId: formData.templateId,
        scheduledDate: new Date(formData.scheduledDate),
        location: formData.location,
        inspectorName: formData.inspectorName
      })
      onClose()
    } catch (err) {
      console.error('Error scheduling inspection:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStart = async () => {
    if (!formData.inspectorName) {
      setError('Please enter inspector name')
      return
    }

    setSaving(true)
    try {
      await startInspection(currentInspection.id, {
        inspectorId: operatorId, // Could be actual user ID
        inspectorName: formData.inspectorName
      })
      const updated = await getInspection(currentInspection.id)
      setCurrentInspection(updated)
      setChecklistItems(updated.checklistItems || [])
    } catch (err) {
      console.error('Error starting inspection:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleItemStatusChange = async (itemId, status) => {
    try {
      await updateChecklistItem(currentInspection.id, itemId, { status })
      setChecklistItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, status } : item)
      )
    } catch (err) {
      console.error('Error updating item:', err)
      setError(err.message)
    }
  }

  const handleItemNotesChange = async (itemId, notes) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, notes } : item)
    )
  }

  const handleItemNotesBlur = async (itemId, notes) => {
    try {
      await updateChecklistItem(currentInspection.id, itemId, { notes })
    } catch (err) {
      console.error('Error saving notes:', err)
    }
  }

  const handleComplete = async () => {
    const pendingItems = checklistItems.filter(i => i.status === 'pending')
    if (pendingItems.length > 0) {
      setError(`${pendingItems.length} items still pending. Complete all items before finishing.`)
      return
    }

    setSaving(true)
    try {
      const result = await completeInspection(currentInspection.id, {
        notes: formData.notes
      })

      if (result.unsatisfactoryCount > 0) {
        setError(null)
        // Prompt to create findings for unsatisfactory items
        const createFindings = window.confirm(
          `Inspection completed with ${result.unsatisfactoryCount} unsatisfactory item(s). Would you like to create findings for them?`
        )
        if (createFindings) {
          onCreateFinding(currentInspection)
          return
        }
      }

      onClose()
    } catch (err) {
      console.error('Error completing inspection:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    const reason = window.prompt('Enter reason for cancellation:')
    if (!reason) return

    setSaving(true)
    try {
      await cancelInspection(currentInspection.id, reason)
      onClose()
    } catch (err) {
      console.error('Error cancelling inspection:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateDetails = async () => {
    setSaving(true)
    try {
      await updateInspection(currentInspection.id, {
        scheduledDate: new Date(formData.scheduledDate),
        location: formData.location,
        inspectorName: formData.inspectorName
      })
      onClose()
    } catch (err) {
      console.error('Error updating inspection:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Group checklist items by section
  const groupedItems = checklistItems.reduce((acc, item) => {
    const section = item.section || 'General'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {})

  const satisfactoryCount = checklistItems.filter(i => i.status === 'satisfactory').length
  const unsatisfactoryCount = checklistItems.filter(i => i.status === 'unsatisfactory').length
  const pendingCount = checklistItems.filter(i => i.status === 'pending').length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
            {!isEditing ? 'Schedule Inspection' :
             isCompleted ? `Inspection ${currentInspection?.inspectionNumber}` :
             isInProgress ? 'Conduct Inspection' :
             'Inspection Details'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {/* Status Banner for existing inspections */}
          {isEditing && (
            <div className={`p-3 rounded-lg ${
              isCompleted ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : 'bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{currentInspection?.inspectionNumber}</p>
                  <p className="text-sm text-gray-600">{currentInspection?.templateName}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  INSPECTION_STATUS[currentInspection?.calculatedStatus || currentInspection?.status]?.color
                }`}>
                  {INSPECTION_STATUS[currentInspection?.calculatedStatus || currentInspection?.status]?.label}
                </span>
              </div>
              {isCompleted && currentInspection?.overallResult && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentInspection.overallResult === 'pass' ? 'bg-green-100 text-green-800' :
                    currentInspection.overallResult === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Result: {currentInspection.overallResult.charAt(0).toUpperCase() + currentInspection.overallResult.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Schedule Form (new inspections) */}
          {!isEditing && (
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Template *</label>
                <select
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({INSPECTION_TYPES[t.type]?.label})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                    placeholder="Work site or area"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
                <input
                  type="text"
                  name="inspectorName"
                  value={formData.inspectorName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  placeholder="Name of person conducting inspection"
                />
              </div>
            </form>
          )}

          {/* Edit Details (scheduled inspections) */}
          {isScheduled && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
                <input
                  type="text"
                  name="inspectorName"
                  value={formData.inspectorName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  placeholder="Required to start inspection"
                />
              </div>
            </div>
          )}

          {/* Checklist (in progress or completed) */}
          {(isInProgress || isCompleted) && checklistItems.length > 0 && (
            <div className="space-y-4">
              {/* Progress summary */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{satisfactoryCount} Satisfactory</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">{unsatisfactoryCount} Unsatisfactory</span>
                </div>
                {pendingCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-400" />
                    <span className="text-sm">{pendingCount} Pending</span>
                  </div>
                )}
              </div>

              {/* Checklist by section */}
              {Object.entries(groupedItems).map(([section, items]) => (
                <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                    {section}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map(item => (
                      <div key={item.id} className={`p-3 ${item.isCritical ? 'bg-red-50/30' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {item.item}
                              {item.isCritical && (
                                <span className="ml-2 text-xs text-red-600 font-medium">(Critical)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.expectedCondition}</p>
                          </div>
                          {!isCompleted ? (
                            <div className="flex items-center gap-1">
                              {['satisfactory', 'unsatisfactory', 'na'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => handleItemStatusChange(item.id, status)}
                                  className={`px-2 py-1 text-xs rounded transition-colors ${
                                    item.status === status
                                      ? status === 'satisfactory' ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                                        : status === 'unsatisfactory' ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                        : 'bg-gray-100 text-gray-700 ring-2 ring-gray-500'
                                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                  }`}
                                >
                                  {ITEM_STATUS[status]?.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded ${
                              item.status === 'satisfactory' ? 'bg-green-100 text-green-700'
                                : item.status === 'unsatisfactory' ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {ITEM_STATUS[item.status]?.label}
                            </span>
                          )}
                        </div>
                        {(isInProgress || item.notes) && (
                          <div className="mt-2">
                            {isInProgress ? (
                              <input
                                type="text"
                                placeholder="Add notes..."
                                value={item.notes || ''}
                                onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                                onBlur={(e) => handleItemNotesBlur(item.id, e.target.value)}
                                className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-aeria-blue"
                              />
                            ) : item.notes && (
                              <p className="text-xs text-gray-500 italic">{item.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Completion notes */}
              {(isInProgress || isCompleted) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={isCompleted}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
                    placeholder="General observations, follow-up needed, etc."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          {isScheduled ? (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Cancel Inspection
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCompleted ? 'Close' : 'Cancel'}
            </button>

            {!isEditing && (
              <button
                onClick={handleSchedule}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Scheduling...' : 'Schedule'}
              </button>
            )}

            {isScheduled && (
              <>
                <button
                  onClick={handleUpdateDetails}
                  disabled={saving}
                  className="px-4 py-2 text-aeria-blue hover:bg-aeria-sky rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleStart}
                  disabled={saving || !formData.inspectorName}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Start Inspection
                </button>
              </>
            )}

            {isInProgress && (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? 'Completing...' : 'Complete Inspection'}
              </button>
            )}

            {isCompleted && unsatisfactoryCount > 0 && (
              <button
                onClick={() => onCreateFinding(currentInspection)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Finding
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
