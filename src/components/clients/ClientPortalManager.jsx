/**
 * ClientPortalManager.jsx
 * Component for managing client portal access and users
 *
 * @location src/components/clients/ClientPortalManager.jsx
 */

import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getPortalUsersByClient,
  createPortalUser,
  deletePortalUser,
  createMagicLinkSession,
  updateClientPortalSettings
} from '../../lib/firestorePortal'
import { logger } from '../../lib/logger'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import Modal from '../Modal'

// User status config
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  disabled: { label: 'Disabled', color: 'bg-gray-100 text-gray-700', icon: XCircle }
}

export default function ClientPortalManager({ client, onUpdate }) {
  const { user, userProfile } = useAuth()
  const [portalUsers, setPortalUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showInviteLink, setShowInviteLink] = useState(null)
  const [inviteLink, setInviteLink] = useState('')
  const [processing, setProcessing] = useState(false)

  // New user form
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState('viewer')
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    if (client?.id) {
      loadPortalUsers()
    }
  }, [client?.id])

  const loadPortalUsers = async () => {
    try {
      setLoading(true)
      const users = await getPortalUsersByClient(client.id)
      setPortalUsers(users)
    } catch (err) {
      logger.error('Failed to load portal users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new portal user
  const handleAddUser = async (e) => {
    e.preventDefault()
    setAddError(null)

    if (!newUserEmail.trim()) {
      setAddError('Email is required')
      return
    }

    // Check if user already exists
    if (portalUsers.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      setAddError('A user with this email already exists')
      return
    }

    try {
      setProcessing(true)
      const inviterName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`
        : user.email

      const newUser = await createPortalUser({
        clientId: client.id,
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        invitedBy: inviterName
      })

      // Generate invite link
      const session = await createMagicLinkSession({
        portalUserId: newUser.id,
        clientId: client.id,
        email: newUserEmail,
        type: 'invite'
      })

      const magicLink = `${window.location.origin}/portal/verify?token=${session.token}`
      setInviteLink(magicLink)
      setShowInviteLink(newUser)

      // Reset form
      setNewUserEmail('')
      setNewUserName('')
      setNewUserRole('viewer')
      setShowAddUser(false)

      // Reload users
      loadPortalUsers()

      logger.info('Portal user created:', newUser.id)
    } catch (err) {
      logger.error('Failed to add portal user:', err)
      setAddError('Failed to add user. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Send login link to existing user
  const handleSendLoginLink = async (portalUser) => {
    try {
      setProcessing(true)
      const session = await createMagicLinkSession({
        portalUserId: portalUser.id,
        clientId: client.id,
        email: portalUser.email,
        type: 'login'
      })

      const magicLink = `${window.location.origin}/portal/verify?token=${session.token}`
      setInviteLink(magicLink)
      setShowInviteLink(portalUser)

      logger.info('Login link generated for:', portalUser.email)
    } catch (err) {
      logger.error('Failed to generate login link:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Delete portal user
  const handleDeleteUser = async (portalUser) => {
    if (!confirm(`Remove ${portalUser.email} from portal access?`)) return

    try {
      setProcessing(true)
      await deletePortalUser(portalUser.id)
      loadPortalUsers()
      logger.info('Portal user deleted:', portalUser.id)
    } catch (err) {
      logger.error('Failed to delete portal user:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      logger.info('Link copied to clipboard')
    } catch (err) {
      logger.error('Failed to copy:', err)
    }
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Portal Access</h3>
          <Badge className="bg-blue-100 text-blue-700">
            {portalUsers.length} user{portalUsers.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Button size="sm" onClick={() => setShowAddUser(true)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </div>

      {/* Portal URL */}
      <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-500">Portal URL: </span>
          <code className="text-blue-600">{window.location.origin}/portal</code>
        </div>
        <a
          href="/portal/login"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Open Portal
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : portalUsers.length === 0 ? (
        <Card className="p-6 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            No portal users yet. Add users to give them access.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {portalUsers.map(portalUser => {
            const statusConfig = STATUS_CONFIG[portalUser.status] || STATUS_CONFIG.pending
            const StatusIcon = statusConfig.icon

            return (
              <Card key={portalUser.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {portalUser.name || portalUser.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {portalUser.name && <span>{portalUser.email}</span>}
                        <span>•</span>
                        <span className="capitalize">{portalUser.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>

                    <div className="text-xs text-gray-400">
                      {portalUser.lastLoginAt
                        ? `Last login: ${formatDate(portalUser.lastLoginAt)}`
                        : `Invited: ${formatDate(portalUser.invitedAt)}`}
                    </div>

                    <button
                      onClick={() => handleSendLoginLink(portalUser)}
                      disabled={processing}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Send login link"
                    >
                      <Send className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteUser(portalUser)}
                      disabled={processing}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        onClose={() => !processing && setShowAddUser(false)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Portal User</h3>
              <p className="text-sm text-gray-500">
                Invite someone from {client.name} to access the portal
              </p>
            </div>
          </div>

          {addError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{addError}</span>
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="contact@client.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="viewer">Viewer - Can view projects and documents</option>
                <option value="admin">Admin - Can manage other portal users</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddUser(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Invite Link Modal */}
      <Modal
        isOpen={!!showInviteLink}
        onClose={() => setShowInviteLink(null)}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {showInviteLink?.status === 'pending' ? 'Invite Link Ready' : 'Login Link Ready'}
              </h3>
              <p className="text-sm text-gray-500">
                Send this link to {showInviteLink?.email}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magic Link (expires in 24 hours)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button variant="secondary" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 mb-4">
            <strong>Note:</strong> Share this link securely with the user. They can use it to log in
            without a password. The link expires in 24 hours.
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowInviteLink(null)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
