/**
 * JHSCMemberModal.jsx
 * Modal for adding/editing JHSC committee members
 */

import { useState, useEffect } from 'react'
import { X, Save, UserPlus, Trash2 } from 'lucide-react'
import {
  addMember,
  updateMember,
  deactivateMember,
  MEMBER_ROLES
} from '../../lib/firestoreJHSC'

export default function JHSCMemberModal({
  isOpen,
  onClose,
  member,
  organizationId,
  committeeId
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'worker_rep',
    department: '',
    appointedDate: new Date().toISOString().split('T')[0],
    termExpiry: '',
    trainingCompleted: false,
    trainingDate: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!member

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        role: member.role || 'worker_rep',
        department: member.department || '',
        appointedDate: member.appointedDate
          ? (member.appointedDate.toDate?.() || new Date(member.appointedDate)).toISOString().split('T')[0]
          : '',
        termExpiry: member.termExpiry
          ? (member.termExpiry.toDate?.() || new Date(member.termExpiry)).toISOString().split('T')[0]
          : '',
        trainingCompleted: member.trainingCompleted || false,
        trainingDate: member.trainingDate
          ? (member.trainingDate.toDate?.() || new Date(member.trainingDate)).toISOString().split('T')[0]
          : ''
      })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const memberData = {
        ...formData,
        organizationId,
        committeeId,
        appointedDate: formData.appointedDate ? new Date(formData.appointedDate) : null,
        termExpiry: formData.termExpiry ? new Date(formData.termExpiry) : null,
        trainingDate: formData.trainingDate ? new Date(formData.trainingDate) : null
      }

      if (isEditing) {
        await updateMember(member.id, memberData)
      } else {
        await addMember(memberData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving member:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this member?')) return

    setSaving(true)
    try {
      await deactivateMember(member.id)
      onClose()
    } catch (err) {
      console.error('Error deactivating member:', err)
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
            <UserPlus className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Edit Member' : 'Add Committee Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Enter member's full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="member@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            >
              {Object.entries(MEMBER_ROLES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              COR requires at least equal worker representatives to employer representatives
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="e.g., Operations, Flight Crew"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointed Date
              </label>
              <input
                type="date"
                name="appointedDate"
                value={formData.appointedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term Expiry
              </label>
              <input
                type="date"
                name="termExpiry"
                value={formData.termExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">JHSC Training</h3>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="trainingCompleted"
                name="trainingCompleted"
                checked={formData.trainingCompleted}
                onChange={handleChange}
                className="w-4 h-4 text-aeria-blue border-gray-300 rounded focus:ring-aeria-blue"
              />
              <label htmlFor="trainingCompleted" className="text-sm text-gray-700">
                JHSC training completed
              </label>
            </div>

            {formData.trainingCompleted && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Completion Date
                </label>
                <input
                  type="date"
                  name="trainingDate"
                  value={formData.trainingDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing && member.status === 'active' ? (
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
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
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
