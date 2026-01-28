/**
 * GroundItemModal.jsx
 * Modal for grounding or returning an item to service
 *
 * @location src/components/maintenance/GroundItemModal.jsx
 */

import { useState } from 'react'
import {
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  XOctagon,
  Shield
} from 'lucide-react'
import { groundItem, ungroundItem } from '../../lib/firestoreMaintenance'
import { useAuth } from '../../contexts/AuthContext'

const GROUNDING_REASONS = [
  { value: 'maintenance', label: 'Scheduled Maintenance' },
  { value: 'damage', label: 'Damage / Defect' },
  { value: 'inspection', label: 'Inspection Required' },
  { value: 'safety', label: 'Safety Concern' },
  { value: 'regulatory', label: 'Regulatory Issue' },
  { value: 'other', label: 'Other' }
]

export default function GroundItemModal({ isOpen, onClose, item, onSuccess }) {
  const { user, userProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // For grounding
  const [reasonCategory, setReasonCategory] = useState('maintenance')
  const [reasonDetails, setReasonDetails] = useState('')

  // For ungrounding
  const [clearanceNotes, setClearanceNotes] = useState('')

  const isGrounded = item?.isGrounded

  const handleGround = async () => {
    if (!reasonDetails.trim()) {
      setError('Please provide details for the grounding reason')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const fullReason = `${GROUNDING_REASONS.find(r => r.value === reasonCategory)?.label}: ${reasonDetails}`
      await groundItem(item.id, item.itemType, fullReason, user?.uid)

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to ground item:', err)
      setError('Failed to ground item. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUnground = async () => {
    setSaving(true)
    setError(null)

    try {
      await ungroundItem(item.id, item.itemType, user?.uid, clearanceNotes)

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to return to service:', err)
      setError('Failed to return item to service. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const itemName = item?.name || item?.nickname || 'Item'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isGrounded ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {isGrounded ? (
              <Shield className="w-6 h-6 text-green-600" />
            ) : (
              <XOctagon className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isGrounded ? 'Return to Service' : 'Ground Item'}
              </h2>
              <p className="text-sm text-gray-500">{itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isGrounded ? (
            // Return to Service Form
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Currently Grounded</p>
                    <p className="text-sm text-amber-700 mt-1">{item.groundedReason}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clearance Notes
                </label>
                <textarea
                  value={clearanceNotes}
                  onChange={(e) => setClearanceNotes(e.target.value)}
                  placeholder="Describe corrective actions taken, inspection results, etc."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">
                    By returning this item to service, you confirm it is safe for operation.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Ground Item Form
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700">
                    Grounding this item will mark it as unavailable for operation until cleared.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  {GROUNDING_REASONS.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details *
                </label>
                <textarea
                  value={reasonDetails}
                  onChange={(e) => {
                    setReasonDetails(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Describe the issue or reason for grounding..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    error ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500">
            By: {userProfile?.displayName || user?.email}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              disabled={saving}
            >
              Cancel
            </button>
            {isGrounded ? (
              <button
                onClick={handleUnground}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Return to Service
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleGround}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XOctagon className="w-4 h-4" />
                    Ground Item
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
