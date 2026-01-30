/**
 * JHSCMeetingModal.jsx
 * Modal for scheduling/managing JHSC meetings and minutes
 */

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import {
  scheduleMeeting,
  updateMeeting,
  completeMeeting,
  cancelMeeting,
  createMinutes,
  updateMinutes,
  getMinutesForMeeting,
  createRecommendation,
  MEETING_STATUS
} from '../../lib/firestoreJHSC'

export default function JHSCMeetingModal({
  isOpen,
  onClose,
  meeting,
  organizationId,
  committeeId,
  members = []
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [formData, setFormData] = useState({
    scheduledDate: new Date().toISOString().split('T')[0],
    location: '',
    agenda: '',
    attendees: []
  })
  const [minutes, setMinutes] = useState({
    discussionItems: [],
    oldBusinessItems: [],
    newBusinessItems: [],
    safetyWalkthroughNotes: '',
    incidentsReviewed: [],
    nextMeetingDate: ''
  })
  const [newRecommendations, setNewRecommendations] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!meeting
  const isCompleted = meeting?.status === 'completed'

  useEffect(() => {
    if (meeting) {
      setFormData({
        scheduledDate: meeting.scheduledDate
          ? (meeting.scheduledDate.toDate?.() || new Date(meeting.scheduledDate)).toISOString().split('T')[0]
          : '',
        location: meeting.location || '',
        agenda: meeting.agenda || '',
        attendees: meeting.attendees || members.map(m => ({
          memberId: m.id,
          name: m.name,
          role: m.role,
          attended: false
        }))
      })

      // Load minutes if meeting is completed
      if (meeting.minutesId) {
        loadMinutes(meeting.id)
      }
    } else {
      // For new meetings, pre-populate attendees from members
      setFormData(prev => ({
        ...prev,
        attendees: members.map(m => ({
          memberId: m.id,
          name: m.name,
          role: m.role,
          attended: false
        }))
      }))
    }
  }, [meeting, members])

  const loadMinutes = async (meetingId) => {
    try {
      const existingMinutes = await getMinutesForMeeting(meetingId)
      if (existingMinutes) {
        setMinutes({
          id: existingMinutes.id,
          discussionItems: existingMinutes.discussionItems || [],
          oldBusinessItems: existingMinutes.oldBusinessItems || [],
          newBusinessItems: existingMinutes.newBusinessItems || [],
          safetyWalkthroughNotes: existingMinutes.safetyWalkthroughNotes || '',
          incidentsReviewed: existingMinutes.incidentsReviewed || [],
          nextMeetingDate: existingMinutes.nextMeetingDate
            ? (existingMinutes.nextMeetingDate.toDate?.() || new Date(existingMinutes.nextMeetingDate)).toISOString().split('T')[0]
            : ''
        })
      }
    } catch (err) {
      console.error('Error loading minutes:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAttendanceToggle = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((a, i) =>
        i === index ? { ...a, attended: !a.attended } : a
      )
    }))
  }

  const handleMinutesChange = (field, value) => {
    setMinutes(prev => ({ ...prev, [field]: value }))
  }

  const addDiscussionItem = () => {
    setMinutes(prev => ({
      ...prev,
      discussionItems: [...prev.discussionItems, { topic: '', discussion: '', outcome: '' }]
    }))
  }

  const updateDiscussionItem = (index, field, value) => {
    setMinutes(prev => ({
      ...prev,
      discussionItems: prev.discussionItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeDiscussionItem = (index) => {
    setMinutes(prev => ({
      ...prev,
      discussionItems: prev.discussionItems.filter((_, i) => i !== index)
    }))
  }

  const addNewBusinessItem = () => {
    setMinutes(prev => ({
      ...prev,
      newBusinessItems: [...prev.newBusinessItems, { item: '', assignedTo: '', dueDate: '' }]
    }))
  }

  const updateNewBusinessItem = (index, field, value) => {
    setMinutes(prev => ({
      ...prev,
      newBusinessItems: prev.newBusinessItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeNewBusinessItem = (index) => {
    setMinutes(prev => ({
      ...prev,
      newBusinessItems: prev.newBusinessItems.filter((_, i) => i !== index)
    }))
  }

  const addRecommendation = () => {
    setNewRecommendations(prev => [...prev, {
      description: '',
      rationale: '',
      priority: 'medium',
      assignedTo: ''
    }])
  }

  const updateRecommendation = (index, field, value) => {
    setNewRecommendations(prev =>
      prev.map((rec, i) => i === index ? { ...rec, [field]: value } : rec)
    )
  }

  const removeRecommendation = (index) => {
    setNewRecommendations(prev => prev.filter((_, i) => i !== index))
  }

  const handleSchedule = async () => {
    setError(null)
    setSaving(true)

    try {
      const meetingData = {
        organizationId,
        committeeId,
        scheduledDate: new Date(formData.scheduledDate),
        location: formData.location,
        agenda: formData.agenda,
        attendees: formData.attendees
      }

      if (isEditing) {
        await updateMeeting(meeting.id, meetingData)
      } else {
        await scheduleMeeting(meetingData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving meeting:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteMeeting = async () => {
    setError(null)
    setSaving(true)

    try {
      const attendedCount = formData.attendees.filter(a => a.attended).length
      const quorumMet = attendedCount >= Math.ceil(members.length / 2)

      await completeMeeting(meeting.id, {
        attendees: formData.attendees,
        actualDate: new Date(formData.scheduledDate),
        quorumMet
      })

      // Create minutes
      const minutesData = {
        meetingId: meeting.id,
        organizationId,
        ...minutes,
        nextMeetingDate: minutes.nextMeetingDate ? new Date(minutes.nextMeetingDate) : null
      }
      await createMinutes(minutesData)

      // Create recommendations
      for (const rec of newRecommendations) {
        if (rec.description) {
          await createRecommendation({
            ...rec,
            organizationId,
            meetingId: meeting.id
          })
        }
      }

      onClose()
    } catch (err) {
      console.error('Error completing meeting:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelMeeting = async () => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return

    setSaving(true)
    try {
      await cancelMeeting(meeting.id, 'Cancelled by user')
      onClose()
    } catch (err) {
      console.error('Error cancelling meeting:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'details', name: 'Meeting Details', icon: Calendar },
    { id: 'attendance', name: 'Attendance', icon: Users },
    ...(isEditing ? [
      { id: 'minutes', name: 'Minutes', icon: FileText },
      { id: 'recommendations', name: 'Recommendations', icon: CheckCircle }
    ] : [])
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-aeria-blue" />
              {isEditing ? `Meeting ${meeting.meetingNumber}` : 'Schedule Meeting'}
            </h2>
            {isEditing && (
              <span className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${MEETING_STATUS[meeting.status]?.color || 'bg-gray-100'}`}>
                {MEETING_STATUS[meeting.status]?.label || meeting.status}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  disabled={isCompleted}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isCompleted}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="e.g., Main Office Conference Room"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agenda
                </label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleChange}
                  disabled={isCompleted}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="Meeting agenda items..."
                />
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Mark attendance for committee members. Quorum requires at least {Math.ceil(members.length / 2)} members present.
              </p>

              <div className="space-y-2">
                {formData.attendees.map((attendee, index) => (
                  <div
                    key={attendee.memberId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      attendee.attended ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{attendee.name}</p>
                      <p className="text-sm text-gray-500">{attendee.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttendanceToggle(index)}
                      disabled={isCompleted}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        attendee.attended
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50`}
                    >
                      {attendee.attended ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Present
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Absent
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Attendance:</strong> {formData.attendees.filter(a => a.attended).length} / {formData.attendees.length} members
                  {formData.attendees.filter(a => a.attended).length >= Math.ceil(members.length / 2)
                    ? ' - Quorum met'
                    : ' - Quorum not met'}
                </p>
              </div>
            </div>
          )}

          {/* Minutes Tab */}
          {activeTab === 'minutes' && (
            <div className="space-y-6">
              {/* Discussion Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discussion Items
                  </label>
                  <button
                    type="button"
                    onClick={addDiscussionItem}
                    disabled={isCompleted}
                    className="text-sm text-aeria-blue hover:text-aeria-navy font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {minutes.discussionItems.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <input
                          type="text"
                          value={item.topic}
                          onChange={(e) => updateDiscussionItem(index, 'topic', e.target.value)}
                          disabled={isCompleted}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Topic"
                        />
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => removeDiscussionItem(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <textarea
                        value={item.discussion}
                        onChange={(e) => updateDiscussionItem(index, 'discussion', e.target.value)}
                        disabled={isCompleted}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Discussion notes..."
                        rows={2}
                      />
                      <input
                        type="text"
                        value={item.outcome}
                        onChange={(e) => updateDiscussionItem(index, 'outcome', e.target.value)}
                        disabled={isCompleted}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Outcome/Decision"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Walkthrough */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety Walkthrough Notes
                </label>
                <textarea
                  value={minutes.safetyWalkthroughNotes}
                  onChange={(e) => handleMinutesChange('safetyWalkthroughNotes', e.target.value)}
                  disabled={isCompleted}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                  placeholder="Notes from workplace safety walkthrough..."
                />
              </div>

              {/* New Business Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Action Items
                  </label>
                  <button
                    type="button"
                    onClick={addNewBusinessItem}
                    disabled={isCompleted}
                    className="text-sm text-aeria-blue hover:text-aeria-navy font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Action
                  </button>
                </div>
                <div className="space-y-2">
                  {minutes.newBusinessItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateNewBusinessItem(index, 'item', e.target.value)}
                        disabled={isCompleted}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Action item"
                      />
                      <input
                        type="text"
                        value={item.assignedTo}
                        onChange={(e) => updateNewBusinessItem(index, 'assignedTo', e.target.value)}
                        disabled={isCompleted}
                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Assigned to"
                      />
                      <input
                        type="date"
                        value={item.dueDate}
                        onChange={(e) => updateNewBusinessItem(index, 'dueDate', e.target.value)}
                        disabled={isCompleted}
                        className="w-36 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => removeNewBusinessItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Meeting Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Meeting Date
                </label>
                <input
                  type="date"
                  value={minutes.nextMeetingDate}
                  onChange={(e) => handleMinutesChange('nextMeetingDate', e.target.value)}
                  disabled={isCompleted}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && !isCompleted && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Add any safety recommendations from this meeting. These will be tracked for management response and implementation.
              </p>

              <button
                type="button"
                onClick={addRecommendation}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-aeria-blue hover:text-aeria-blue transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Recommendation
              </button>

              <div className="space-y-4">
                {newRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Recommendation {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeRecommendation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description *</label>
                      <textarea
                        value={rec.description}
                        onChange={(e) => updateRecommendation(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="What is being recommended?"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Rationale</label>
                      <textarea
                        value={rec.rationale}
                        onChange={(e) => updateRecommendation(index, 'rationale', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Why is this recommendation being made?"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Priority</label>
                        <select
                          value={rec.priority}
                          onChange={(e) => updateRecommendation(index, 'priority', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
                        <input
                          type="text"
                          value={rec.assignedTo}
                          onChange={(e) => updateRecommendation(index, 'assignedTo', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Person/Department"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && isCompleted && (
            <div className="text-center py-8 text-gray-500">
              <p>View recommendations in the Recommendations tab on the main JHSC page.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50">
          {isEditing && meeting.status === 'scheduled' ? (
            <button
              type="button"
              onClick={handleCancelMeeting}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Cancel Meeting
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>

            {!isCompleted && (
              <>
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : isEditing ? 'Update' : 'Schedule'}
                </button>

                {isEditing && meeting.status === 'scheduled' && (
                  <button
                    type="button"
                    onClick={handleCompleteMeeting}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Meeting
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
