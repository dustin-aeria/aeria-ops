/**
 * InviteMemberModal.jsx
 * Modal for inviting new members to the organization
 *
 * @location src/components/settings/InviteMemberModal.jsx
 */

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { inviteMember, ORGANIZATION_ROLES } from '../../lib/firestoreOrganizations'
import {
  X,
  UserPlus,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react'

const AVAILABLE_ROLES = [
  { value: 'management', label: 'Management', description: 'Can create, edit, delete, and approve content' },
  { value: 'operator', label: 'Operator', description: 'Can view and edit content, report incidents' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to all data' }
]

export default function InviteMemberModal({ isOpen, onClose, onSuccess, organizationId }) {
  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('management')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !role || !organizationId) return

    setSending(true)
    setError(null)

    try {
      await inviteMember(organizationId, email, role, user?.uid)
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err) {
      console.error('Error inviting member:', err)
      setError(err.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      setEmail('')
      setRole('management')
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <UserPlus className="w-5 h-5 text-aeria-navy" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={sending}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Success State */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invitation Sent</h3>
                <p className="text-sm text-gray-500">
                  An invitation has been sent to {email}
                </p>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="colleague@example.com"
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_ROLES.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          role === r.value
                            ? 'border-aeria-navy bg-aeria-sky/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={role === r.value}
                          onChange={(e) => setRole(e.target.value)}
                          className="mt-1"
                          disabled={sending}
                        />
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {r.label}
                          </p>
                          <p className="text-sm text-gray-500">{r.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500">
                  The invited user will receive an email with instructions to join your organization.
                  If they already have an account, the invitation will be linked automatically.
                </p>
              </>
            )}
          </form>

          {/* Footer */}
          {!success && (
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!email || sending}
                className="btn-primary flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
