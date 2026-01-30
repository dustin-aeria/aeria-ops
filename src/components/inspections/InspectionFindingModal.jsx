/**
 * InspectionFindingModal.jsx
 * Modal for creating and managing inspection findings/deficiencies
 */

import { useState, useEffect } from 'react'
import { X, Save, AlertTriangle, CheckCircle2, Link } from 'lucide-react'
import {
  createFinding,
  updateFinding,
  updateFindingStatus,
  linkFindingToCapa,
  FINDING_STATUS,
  RISK_LEVELS,
  COR_INSPECTION_REQUIREMENTS
} from '../../lib/firestoreInspections'

export default function InspectionFindingModal({
  isOpen,
  onClose,
  finding,
  inspection,
  organizationId
}) {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    hazardCategory: '',
    riskLevel: 'medium',
    correctiveAction: '',
    assignedTo: '',
    dueDate: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!finding
  const isOpen_ = finding?.status === 'open'
  const isInProgress = finding?.status === 'in_progress'
  const isCorrected = finding?.status === 'corrected'
  const isVerified = finding?.status === 'verified'

  useEffect(() => {
    if (finding) {
      setFormData({
        description: finding.description || '',
        location: finding.location || '',
        hazardCategory: finding.hazardCategory || '',
        riskLevel: finding.riskLevel || 'medium',
        correctiveAction: finding.correctiveAction || '',
        assignedTo: finding.assignedTo || '',
        dueDate: finding.dueDate
          ? (finding.dueDate.toDate?.() || new Date(finding.dueDate)).toISOString().split('T')[0]
          : ''
      })
    } else {
      // Default due date based on risk level
      const defaultDays = COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectMedium
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + defaultDays)

      setFormData({
        description: '',
        location: inspection?.location || '',
        hazardCategory: '',
        riskLevel: 'medium',
        correctiveAction: '',
        assignedTo: '',
        dueDate: defaultDate.toISOString().split('T')[0]
      })
    }
  }, [finding, inspection])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Update due date when risk level changes (for new findings)
    if (name === 'riskLevel' && !isEditing) {
      const daysToCorrect = {
        critical: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectCritical,
        high: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectHigh,
        medium: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectMedium,
        low: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectLow
      }
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + daysToCorrect[value])
      setFormData(prev => ({ ...prev, dueDate: newDate.toISOString().split('T')[0] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const findingData = {
        ...formData,
        organizationId,
        inspectionId: inspection?.id,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      }

      if (isEditing) {
        await updateFinding(finding.id, findingData)
      } else {
        await createFinding(findingData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving finding:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    let additionalData = {}

    if (newStatus === 'in_progress') {
      // Just mark as in progress
    } else if (newStatus === 'corrected') {
      const correctedBy = window.prompt('Enter name of person who corrected this:')
      if (!correctedBy) return
      additionalData = { correctedBy }
    } else if (newStatus === 'verified') {
      const verifiedBy = window.prompt('Enter name of person verifying correction:')
      if (!verifiedBy) return
      additionalData = { verifiedBy }
    }

    setSaving(true)
    try {
      await updateFindingStatus(finding.id, newStatus, additionalData)
      onClose()
    } catch (err) {
      console.error('Error updating status:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLinkCapa = async () => {
    const capaId = window.prompt('Enter CAPA ID to link:')
    if (!capaId) return

    setSaving(true)
    try {
      await linkFindingToCapa(finding.id, capaId)
      onClose()
    } catch (err) {
      console.error('Error linking CAPA:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            {isEditing ? `Finding ${finding.findingNumber}` : 'Create Finding'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {/* Status Banner */}
          {isEditing && (
            <div className={`p-3 rounded-lg ${
              isVerified ? 'bg-green-50' : isCorrected ? 'bg-blue-50' : isInProgress ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{finding.findingNumber}</p>
                  <p className="text-sm text-gray-600">From: {finding.inspectionNumber}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${FINDING_STATUS[finding.status]?.color}`}>
                  {FINDING_STATUS[finding.status]?.label}
                </span>
              </div>
              {finding.isOverdue && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  Overdue since {formatDate(finding.dueDate)}
                </p>
              )}
            </div>
          )}

          {/* Inspection Reference (for new findings) */}
          {!isEditing && inspection && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Creating finding for: <span className="font-medium">{inspection.inspectionNumber}</span>
              </p>
            </div>
          )}

          {/* Finding Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isVerified}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
              placeholder="Describe the unsafe condition or deficiency"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={isVerified}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
                placeholder="Where found"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Category</label>
              <input
                type="text"
                name="hazardCategory"
                value={formData.hazardCategory}
                onChange={handleChange}
                disabled={isVerified}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
                placeholder="e.g., Electrical, Fall, Chemical"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level *</label>
              <select
                name="riskLevel"
                value={formData.riskLevel}
                onChange={handleChange}
                required
                disabled={isVerified}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
              >
                {Object.entries(RISK_LEVELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.riskLevel === 'critical' && 'Must be corrected within 24 hours'}
                {formData.riskLevel === 'high' && 'Must be corrected within 7 days'}
                {formData.riskLevel === 'medium' && 'Must be corrected within 30 days'}
                {formData.riskLevel === 'low' && 'Must be corrected within 90 days'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={isVerified}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              disabled={isVerified}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
              placeholder="Person responsible for correction"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Action</label>
            <textarea
              name="correctiveAction"
              value={formData.correctiveAction}
              onChange={handleChange}
              disabled={isVerified}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue disabled:bg-gray-50"
              placeholder="Describe action taken or required to correct"
            />
          </div>

          {/* Status History (for existing findings) */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Status Timeline</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Created:</span> {formatDate(finding.createdAt)}
                </p>
                {finding.correctedDate && (
                  <p className="text-gray-600">
                    <span className="font-medium">Corrected:</span> {formatDate(finding.correctedDate)}
                    {finding.correctedBy && ` by ${finding.correctedBy}`}
                  </p>
                )}
                {finding.verifiedDate && (
                  <p className="text-gray-600">
                    <span className="font-medium">Verified:</span> {formatDate(finding.verifiedDate)}
                    {finding.verifiedBy && ` by ${finding.verifiedBy}`}
                  </p>
                )}
              </div>

              {finding.linkedCapaId && (
                <p className="mt-2 text-sm text-aeria-blue">
                  Linked to CAPA: {finding.linkedCapaId}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing && !isVerified && (
              <div className="flex items-center gap-2">
                {isOpen_ && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('in_progress')}
                    className="px-3 py-1.5 text-sm text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg"
                  >
                    Start Work
                  </button>
                )}
                {(isOpen_ || isInProgress) && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('corrected')}
                    className="px-3 py-1.5 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg"
                  >
                    Mark Corrected
                  </button>
                )}
                {isCorrected && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('verified')}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-100 hover:bg-green-200 rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify
                  </button>
                )}
                {!finding.linkedCapaId && (
                  <button
                    type="button"
                    onClick={handleLinkCapa}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Link className="w-4 h-4" />
                    Link CAPA
                  </button>
                )}
              </div>
            )}
            {!isEditing && <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isVerified ? 'Close' : 'Cancel'}
              </button>
              {!isVerified && (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : isEditing ? 'Update' : 'Create Finding'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
