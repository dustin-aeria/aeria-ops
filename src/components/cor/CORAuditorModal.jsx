/**
 * CORAuditorModal.jsx
 * Modal for managing COR auditors
 */

import { useState, useEffect } from 'react'
import { X, Save, Users } from 'lucide-react'
import {
  registerAuditor,
  updateAuditor,
  AUDITOR_TYPE,
  AUDITOR_STATUS
} from '../../lib/firestoreCORAudit'

export default function CORAuditorModal({
  isOpen,
  onClose,
  auditor,
  operatorId
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    auditorType: 'internal',
    certificationNumber: '',
    certifiedDate: '',
    trainingHours: 14,
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!auditor

  useEffect(() => {
    if (auditor) {
      setFormData({
        name: auditor.name || '',
        email: auditor.email || '',
        auditorType: auditor.auditorType || 'internal',
        certificationNumber: auditor.certificationNumber || '',
        certifiedDate: auditor.certifiedDate
          ? (auditor.certifiedDate.toDate?.() || new Date(auditor.certifiedDate)).toISOString().split('T')[0]
          : '',
        trainingHours: auditor.trainingHours || 14,
        notes: auditor.notes || ''
      })
    }
  }, [auditor])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))

    // Update training hours minimum when type changes
    if (name === 'auditorType') {
      const minHours = AUDITOR_TYPE[value]?.trainingHours || 14
      setFormData(prev => ({
        ...prev,
        trainingHours: Math.max(prev.trainingHours, minHours)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate minimum training hours
      const minHours = AUDITOR_TYPE[formData.auditorType]?.trainingHours || 14
      if (formData.trainingHours < minHours) {
        setError(`${formData.auditorType} auditors require minimum ${minHours} hours training`)
        setSaving(false)
        return
      }

      const auditorData = {
        ...formData,
        operatorId,
        certifiedDate: formData.certifiedDate ? new Date(formData.certifiedDate) : null
      }

      if (isEditing) {
        await updateAuditor(auditor.id, auditorData)
      } else {
        await registerAuditor(auditorData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving auditor:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm('Deactivate this auditor?')) return

    setSaving(true)
    try {
      await updateAuditor(auditor.id, { status: 'inactive' })
      onClose()
    } catch (err) {
      console.error('Error deactivating auditor:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Edit Auditor' : 'Register Auditor'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {isEditing && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`px-2 py-1 text-xs rounded-full ${AUDITOR_STATUS[auditor.calculatedStatus]?.color}`}>
                {AUDITOR_STATUS[auditor.calculatedStatus]?.label}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auditor Type *</label>
            <select
              name="auditorType"
              value={formData.auditorType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            >
              {Object.entries(AUDITOR_TYPE).map(([key, type]) => (
                <option key={key} value={key}>
                  {type.label} (min {type.trainingHours}h training)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification Number</label>
              <input
                type="text"
                name="certificationNumber"
                value={formData.certificationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certified Date</label>
              <input
                type="date"
                name="certifiedDate"
                value={formData.certifiedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Hours *
              <span className="font-normal text-gray-500 ml-1">
                (min {AUDITOR_TYPE[formData.auditorType]?.trainingHours}h)
              </span>
            </label>
            <input
              type="number"
              name="trainingHours"
              value={formData.trainingHours}
              onChange={handleChange}
              min={AUDITOR_TYPE[formData.auditorType]?.trainingHours || 14}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Training details, certifications, etc."
            />
          </div>

          {isEditing && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p><strong>Audits Completed:</strong> {auditor.auditsCompleted || 0}</p>
              <p className="mt-1 text-xs">
                Auditors must complete minimum 2 audits every 3 years to maintain certification
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing && auditor.status === 'active' ? (
              <button
                type="button"
                onClick={handleDeactivate}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Deactivate
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Register'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
