/**
 * JHSCRecommendationModal.jsx
 * Modal for viewing/managing JHSC recommendations
 */

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  CheckSquare,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Clock,
  FileCheck
} from 'lucide-react'
import {
  createRecommendation,
  updateRecommendation,
  recordManagementResponse,
  markRecommendationImplemented,
  verifyRecommendation,
  RECOMMENDATION_STATUS,
  RECOMMENDATION_PRIORITY
} from '../../lib/firestoreJHSC'

export default function JHSCRecommendationModal({
  isOpen,
  onClose,
  recommendation,
  organizationId,
  meetings = []
}) {
  const [formData, setFormData] = useState({
    description: '',
    rationale: '',
    priority: 'medium',
    assignedTo: '',
    meetingId: ''
  })
  const [responseData, setResponseData] = useState({
    response: '',
    accepted: true
  })
  const [implementationData, setImplementationData] = useState({
    notes: '',
    implementedBy: ''
  })
  const [verificationData, setVerificationData] = useState({
    verificationNotes: '',
    verifiedBy: '',
    effective: true
  })
  const [activeSection, setActiveSection] = useState('details')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!recommendation

  useEffect(() => {
    if (recommendation) {
      setFormData({
        description: recommendation.description || '',
        rationale: recommendation.rationale || '',
        priority: recommendation.priority || 'medium',
        assignedTo: recommendation.assignedTo || '',
        meetingId: recommendation.meetingId || ''
      })

      if (recommendation.managementResponse) {
        setResponseData({
          response: recommendation.managementResponse,
          accepted: recommendation.status !== 'rejected'
        })
      }

      if (recommendation.implementationNotes) {
        setImplementationData({
          notes: recommendation.implementationNotes,
          implementedBy: recommendation.implementedBy || ''
        })
      }

      if (recommendation.verificationNotes) {
        setVerificationData({
          verificationNotes: recommendation.verificationNotes,
          verifiedBy: recommendation.verifiedBy || '',
          effective: recommendation.verificationEffective !== false
        })
      }
    }
  }, [recommendation])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreate = async () => {
    setError(null)
    setSaving(true)

    try {
      await createRecommendation({
        ...formData,
        organizationId
      })
      onClose()
    } catch (err) {
      console.error('Error creating recommendation:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    setError(null)
    setSaving(true)

    try {
      await updateRecommendation(recommendation.id, formData)
      onClose()
    } catch (err) {
      console.error('Error updating recommendation:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRecordResponse = async () => {
    setError(null)
    setSaving(true)

    try {
      await recordManagementResponse(recommendation.id, {
        response: responseData.response,
        respondedBy: 'Current User', // In real app, get from auth context
        accepted: responseData.accepted
      })
      onClose()
    } catch (err) {
      console.error('Error recording response:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkImplemented = async () => {
    setError(null)
    setSaving(true)

    try {
      await markRecommendationImplemented(recommendation.id, {
        notes: implementationData.notes,
        implementedBy: implementationData.implementedBy || 'Current User'
      })
      onClose()
    } catch (err) {
      console.error('Error marking implemented:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    setError(null)
    setSaving(true)

    try {
      await verifyRecommendation(recommendation.id, {
        verificationNotes: verificationData.verificationNotes,
        verifiedBy: verificationData.verifiedBy || 'Current User',
        effective: verificationData.effective
      })
      onClose()
    } catch (err) {
      console.error('Error verifying recommendation:', err)
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

  // Determine what actions are available based on status
  const canRespond = isEditing && recommendation.status === 'open'
  const canImplement = isEditing && recommendation.status === 'in_progress'
  const canVerify = isEditing && recommendation.status === 'implemented'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-aeria-blue" />
              {isEditing ? recommendation.recommendationNumber : 'New Recommendation'}
            </h2>
            {isEditing && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${RECOMMENDATION_STATUS[recommendation.status]?.color || 'bg-gray-100'}`}>
                  {RECOMMENDATION_STATUS[recommendation.status]?.label || recommendation.status}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${RECOMMENDATION_PRIORITY[recommendation.priority]?.color || 'bg-gray-100'}`}>
                  {RECOMMENDATION_PRIORITY[recommendation.priority]?.label || recommendation.priority}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs (for editing) */}
        {isEditing && (
          <div className="border-b border-gray-200 px-4">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveSection('details')}
                className={`py-3 border-b-2 text-sm font-medium ${
                  activeSection === 'details'
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveSection('response')}
                className={`py-3 border-b-2 text-sm font-medium flex items-center gap-1 ${
                  activeSection === 'response'
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Response
                {recommendation.managementResponse && <CheckCircle className="w-3 h-3 text-green-500" />}
              </button>
              <button
                onClick={() => setActiveSection('implementation')}
                className={`py-3 border-b-2 text-sm font-medium flex items-center gap-1 ${
                  activeSection === 'implementation'
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Implementation
                {recommendation.status === 'implemented' && <CheckCircle className="w-3 h-3 text-green-500" />}
              </button>
              <button
                onClick={() => setActiveSection('verification')}
                className={`py-3 border-b-2 text-sm font-medium flex items-center gap-1 ${
                  activeSection === 'verification'
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Verification
                {recommendation.verifiedDate && <CheckCircle className="w-3 h-3 text-green-500" />}
              </button>
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Details Section */}
          {activeSection === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isEditing && recommendation.status !== 'open'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="What is being recommended?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rationale
                </label>
                <textarea
                  name="rationale"
                  value={formData.rationale}
                  onChange={handleChange}
                  disabled={isEditing && recommendation.status !== 'open'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="Why is this recommendation being made?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isEditing && recommendation.status !== 'open'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="critical">Critical (7 days)</option>
                    <option value="high">High (14 days)</option>
                    <option value="medium">Medium (30 days)</option>
                    <option value="low">Low (60 days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    disabled={isEditing && recommendation.status !== 'open'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                    placeholder="Person or department"
                  />
                </div>
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Meeting (optional)
                  </label>
                  <select
                    name="meetingId"
                    value={formData.meetingId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  >
                    <option value="">No meeting linked</option>
                    {meetings.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.meetingNumber} - {formatDate(m.scheduledDate)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isEditing && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">{formatDate(recommendation.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Date:</span>
                      <span className={`${
                        recommendation.targetDate &&
                        (recommendation.targetDate?.toDate?.() || new Date(recommendation.targetDate)) < new Date() &&
                        recommendation.status !== 'implemented'
                          ? 'text-red-600 font-medium'
                          : 'text-gray-900'
                      }`}>
                        {formatDate(recommendation.targetDate)}
                      </span>
                    </div>
                    {recommendation.responseDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Date:</span>
                        <span className="text-gray-900">{formatDate(recommendation.responseDate)}</span>
                      </div>
                    )}
                    {recommendation.implementedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Implemented:</span>
                        <span className="text-gray-900">{formatDate(recommendation.implementedDate)}</span>
                      </div>
                    )}
                    {recommendation.verifiedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Verified:</span>
                        <span className="text-gray-900">{formatDate(recommendation.verifiedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Management Response Section */}
          {activeSection === 'response' && (
            <div className="space-y-4">
              {recommendation.managementResponse ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Management Response</h4>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{recommendation.managementResponse}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Responded by {recommendation.respondedBy} on {formatDate(recommendation.responseDate)}
                  </p>
                </div>
              ) : canRespond ? (
                <>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      COR requires management response within 21 days
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Management Response *
                    </label>
                    <textarea
                      value={responseData.response}
                      onChange={(e) => setResponseData(prev => ({ ...prev, response: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Enter management response to this recommendation..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="accepted"
                        checked={responseData.accepted}
                        onChange={() => setResponseData(prev => ({ ...prev, accepted: true }))}
                        className="text-aeria-blue"
                      />
                      <span className="text-sm text-gray-700">Accept & Proceed with Implementation</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="accepted"
                        checked={!responseData.accepted}
                        onChange={() => setResponseData(prev => ({ ...prev, accepted: false }))}
                        className="text-red-500"
                      />
                      <span className="text-sm text-gray-700">Reject Recommendation</span>
                    </label>
                  </div>

                  <button
                    onClick={handleRecordResponse}
                    disabled={saving || !responseData.response}
                    className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {saving ? 'Recording...' : 'Record Response'}
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Management response not yet recorded.
                </p>
              )}
            </div>
          )}

          {/* Implementation Section */}
          {activeSection === 'implementation' && (
            <div className="space-y-4">
              {recommendation.implementationNotes ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Implementation Notes</h4>
                  <p className="text-sm text-green-800 whitespace-pre-wrap">{recommendation.implementationNotes}</p>
                  <p className="text-xs text-green-600 mt-2">
                    Implemented by {recommendation.implementedBy} on {formatDate(recommendation.implementedDate)}
                  </p>
                </div>
              ) : canImplement ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Implementation Notes *
                    </label>
                    <textarea
                      value={implementationData.notes}
                      onChange={(e) => setImplementationData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Describe how the recommendation was implemented..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Implemented By
                    </label>
                    <input
                      type="text"
                      value={implementationData.implementedBy}
                      onChange={(e) => setImplementationData(prev => ({ ...prev, implementedBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Name of person who implemented"
                    />
                  </div>

                  <button
                    onClick={handleMarkImplemented}
                    disabled={saving || !implementationData.notes}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Mark as Implemented'}
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {recommendation.status === 'open'
                    ? 'Awaiting management response before implementation.'
                    : 'Implementation details will be recorded here.'}
                </p>
              )}
            </div>
          )}

          {/* Verification Section */}
          {activeSection === 'verification' && (
            <div className="space-y-4">
              {recommendation.verifiedDate ? (
                <div className={`p-4 rounded-lg ${recommendation.verificationEffective ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className={`text-sm font-medium mb-2 ${recommendation.verificationEffective ? 'text-green-900' : 'text-red-900'}`}>
                    Verification: {recommendation.verificationEffective ? 'Effective' : 'Ineffective'}
                  </h4>
                  <p className={`text-sm whitespace-pre-wrap ${recommendation.verificationEffective ? 'text-green-800' : 'text-red-800'}`}>
                    {recommendation.verificationNotes}
                  </p>
                  <p className={`text-xs mt-2 ${recommendation.verificationEffective ? 'text-green-600' : 'text-red-600'}`}>
                    Verified by {recommendation.verifiedBy} on {formatDate(recommendation.verifiedDate)}
                  </p>
                </div>
              ) : canVerify ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Notes *
                    </label>
                    <textarea
                      value={verificationData.verificationNotes}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, verificationNotes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Describe verification activities and findings..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verified By
                    </label>
                    <input
                      type="text"
                      value={verificationData.verifiedBy}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, verifiedBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Name of verifier"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="effective"
                        checked={verificationData.effective}
                        onChange={() => setVerificationData(prev => ({ ...prev, effective: true }))}
                        className="text-green-500"
                      />
                      <span className="text-sm text-gray-700">Verified Effective</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="effective"
                        checked={!verificationData.effective}
                        onChange={() => setVerificationData(prev => ({ ...prev, effective: false }))}
                        className="text-red-500"
                      />
                      <span className="text-sm text-gray-700">Verified Ineffective</span>
                    </label>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={saving || !verificationData.verificationNotes}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Complete Verification'}
                  </button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Verification is available after implementation.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>

          {!isEditing && (
            <button
              onClick={handleCreate}
              disabled={saving || !formData.description}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Recommendation'}
            </button>
          )}

          {isEditing && activeSection === 'details' && recommendation.status === 'open' && (
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
