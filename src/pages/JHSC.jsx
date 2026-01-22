/**
 * JHSC.jsx
 * Joint Health & Safety Committee Management Page
 *
 * COR Element 8: Joint Health & Safety Committee (5-10% weight)
 * Manages committee composition, meetings, minutes, and recommendations
 *
 * @location src/pages/JHSC.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Users,
  Calendar,
  FileText,
  CheckSquare,
  Plus,
  ChevronRight,
  AlertTriangle,
  Clock,
  UserCheck,
  TrendingUp,
  Award,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ClipboardList
} from 'lucide-react'

import {
  getOrCreateCommittee,
  getCommitteeMembers,
  getMeetings,
  getRecommendations,
  calculateJHSCMetrics,
  MEMBER_ROLES,
  MEETING_STATUS,
  RECOMMENDATION_STATUS,
  RECOMMENDATION_PRIORITY
} from '../lib/firestoreJHSC'

// Import modal components (we'll create these next)
import JHSCMemberModal from '../components/jhsc/JHSCMemberModal'
import JHSCMeetingModal from '../components/jhsc/JHSCMeetingModal'
import JHSCRecommendationModal from '../components/jhsc/JHSCRecommendationModal'

export default function JHSC() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [committee, setCommittee] = useState(null)
  const [members, setMembers] = useState([])
  const [meetings, setMeetings] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [metrics, setMetrics] = useState(null)

  // Modal state
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [meetingModalOpen, setMeetingModalOpen] = useState(false)
  const [recommendationModalOpen, setRecommendationModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const operatorId = user?.uid

  // Load data
  const loadData = useCallback(async () => {
    if (!operatorId) return

    setLoading(true)
    try {
      const [committeeData, membersData, meetingsData, recsData, metricsData] = await Promise.all([
        getOrCreateCommittee(operatorId),
        getCommitteeMembers(operatorId),
        getMeetings(operatorId, { limitCount: 20 }),
        getRecommendations(operatorId, { limitCount: 50 }),
        calculateJHSCMetrics(operatorId)
      ])

      setCommittee(committeeData)
      setMembers(membersData)
      setMeetings(meetingsData)
      setRecommendations(recsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading JHSC data:', error)
    } finally {
      setLoading(false)
    }
  }, [operatorId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Modal handlers
  const handleAddMember = () => {
    setSelectedItem(null)
    setMemberModalOpen(true)
  }

  const handleEditMember = (member) => {
    setSelectedItem(member)
    setMemberModalOpen(true)
  }

  const handleScheduleMeeting = () => {
    setSelectedItem(null)
    setMeetingModalOpen(true)
  }

  const handleViewMeeting = (meeting) => {
    setSelectedItem(meeting)
    setMeetingModalOpen(true)
  }

  const handleAddRecommendation = () => {
    setSelectedItem(null)
    setRecommendationModalOpen(true)
  }

  const handleViewRecommendation = (rec) => {
    setSelectedItem(rec)
    setRecommendationModalOpen(true)
  }

  const handleModalClose = () => {
    setMemberModalOpen(false)
    setMeetingModalOpen(false)
    setRecommendationModalOpen(false)
    setSelectedItem(null)
    loadData() // Refresh data after modal close
  }

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  // Tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'members', name: 'Members', icon: Users, count: members.length },
    { id: 'meetings', name: 'Meetings', icon: Calendar, count: meetings.length },
    { id: 'recommendations', name: 'Recommendations', icon: CheckSquare, count: recommendations.filter(r => r.status === 'open' || r.status === 'in_progress').length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-aeria-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Joint Health & Safety Committee</h1>
          <p className="text-gray-600 mt-1">COR Element 8 - JHSC Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* COR Score Card */}
      {metrics && (
        <div className="bg-gradient-to-r from-aeria-navy to-aeria-blue rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">COR Element 8 Readiness Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold">{metrics.overallScore}%</span>
                <span className="text-white/60 text-sm">of 100%</span>
              </div>
              <p className="text-white/70 text-xs mt-2">
                Minimum 50% required to pass element, 80% overall for COR certification
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto mb-1 text-yellow-300" />
                <p className="text-2xl font-bold">{metrics.meetingsHeld}</p>
                <p className="text-xs text-white/70">Meetings Held</p>
              </div>
              <div className="text-center">
                <CheckSquare className="w-8 h-8 mx-auto mb-1 text-green-300" />
                <p className="text-2xl font-bold">{metrics.implementedRecommendations}</p>
                <p className="text-xs text-white/70">Recs Implemented</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-1 text-orange-300" />
                <p className="text-2xl font-bold">{metrics.overdueRecommendations}</p>
                <p className="text-xs text-white/70">Overdue Items</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-aeria-blue text-aeria-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-aeria-blue/10' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Committee Composition */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-aeria-blue" />
                Committee Composition
              </h3>
              {metrics?.composition && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Members</span>
                    <span className="font-medium">{metrics.composition.totalMembers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Worker Representatives</span>
                    <span className="font-medium">{metrics.composition.workerReps}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Employer Representatives</span>
                    <span className="font-medium">{metrics.composition.employerReps}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Has Co-Chairs</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      metrics.composition.hasCoChairs
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {metrics.composition.hasCoChairs ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Balanced Composition</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      metrics.composition.isBalanced
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {metrics.composition.isBalanced ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Training Compliance</span>
                    <span className="font-medium">{metrics.trainingComplianceRate}%</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => setActiveTab('members')}
                className="mt-4 w-full text-center text-sm text-aeria-blue hover:text-aeria-navy font-medium"
              >
                Manage Members →
              </button>
            </div>

            {/* Meeting Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-aeria-blue" />
                Meeting Compliance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Meetings This Year</span>
                  <span className="font-medium">
                    {metrics?.meetingsHeld || 0} / {metrics?.meetingsRequired || 4}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-aeria-blue h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, metrics?.meetingComplianceRate || 0)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Minutes Completion Rate</span>
                  <span className="font-medium">{metrics?.minutesCompletionRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quorum Achievement</span>
                  <span className="font-medium">{metrics?.quorumRate || 0}%</span>
                </div>
              </div>
              <button
                onClick={handleScheduleMeeting}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>

            {/* Recent Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-aeria-blue" />
                  Open Recommendations
                </h3>
                <button
                  onClick={handleAddRecommendation}
                  className="text-sm text-aeria-blue hover:text-aeria-navy font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
              {recommendations.filter(r => r.status === 'open' || r.status === 'in_progress').length > 0 ? (
                <div className="space-y-3">
                  {recommendations
                    .filter(r => r.status === 'open' || r.status === 'in_progress')
                    .slice(0, 5)
                    .map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => handleViewRecommendation(rec)}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">{rec.recommendationNumber}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${RECOMMENDATION_PRIORITY[rec.priority]?.color || 'bg-gray-100'}`}>
                              {RECOMMENDATION_PRIORITY[rec.priority]?.label || rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mt-1 line-clamp-1">{rec.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${RECOMMENDATION_STATUS[rec.status]?.color || 'bg-gray-100'}`}>
                            {RECOMMENDATION_STATUS[rec.status]?.label || rec.status}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No open recommendations</p>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Committee Members</h3>
              <button
                onClick={handleAddMember}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          MEMBER_ROLES[member.role]?.type === 'worker'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {MEMBER_ROLES[member.role]?.label || member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{member.department || '-'}</td>
                      <td className="px-4 py-3">
                        {member.trainingCompleted ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <UserCheck className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(member.termExpiry)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-1 text-gray-400 hover:text-aeria-blue"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No committee members yet. Add members to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Meetings</h3>
              <button
                onClick={handleScheduleMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meeting #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quorum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minutes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {meetings.map((meeting) => (
                    <tr key={meeting.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{meeting.meetingNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(meeting.scheduledDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{meeting.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {meeting.attendees?.filter(a => a.attended).length || 0} / {meeting.attendees?.length || 0}
                      </td>
                      <td className="px-4 py-3">
                        {meeting.status === 'completed' ? (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            meeting.quorumMet
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {meeting.quorumMet ? 'Yes' : 'No'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {meeting.minutesId ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <FileText className="w-4 h-4" />
                            Complete
                          </span>
                        ) : meeting.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-orange-600 text-sm">
                            <Clock className="w-4 h-4" />
                            Pending
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${MEETING_STATUS[meeting.status]?.color || 'bg-gray-100'}`}>
                          {MEETING_STATUS[meeting.status]?.label || meeting.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewMeeting(meeting)}
                          className="p-1 text-gray-400 hover:text-aeria-blue"
                          title="View/Edit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {meetings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No meetings scheduled. Schedule your first JHSC meeting.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recommendations</h3>
              <button
                onClick={handleAddRecommendation}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Recommendation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rec #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recommendations.map((rec) => {
                    const isOverdue = rec.status !== 'implemented' && rec.status !== 'rejected' &&
                      rec.targetDate && (rec.targetDate?.toDate?.() || new Date(rec.targetDate)) < new Date()

                    return (
                      <tr key={rec.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{rec.recommendationNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {rec.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${RECOMMENDATION_PRIORITY[rec.priority]?.color || 'bg-gray-100'}`}>
                            {RECOMMENDATION_PRIORITY[rec.priority]?.label || rec.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{rec.assignedTo || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {formatDate(rec.targetDate)}
                            {isOverdue && <AlertTriangle className="w-4 h-4 inline ml-1" />}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${RECOMMENDATION_STATUS[rec.status]?.color || 'bg-gray-100'}`}>
                            {RECOMMENDATION_STATUS[rec.status]?.label || rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleViewRecommendation(rec)}
                            className="p-1 text-gray-400 hover:text-aeria-blue"
                            title="View/Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {recommendations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No recommendations yet. Add recommendations from meetings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {memberModalOpen && (
        <JHSCMemberModal
          isOpen={memberModalOpen}
          onClose={handleModalClose}
          member={selectedItem}
          operatorId={operatorId}
          committeeId={committee?.id}
        />
      )}

      {meetingModalOpen && (
        <JHSCMeetingModal
          isOpen={meetingModalOpen}
          onClose={handleModalClose}
          meeting={selectedItem}
          operatorId={operatorId}
          committeeId={committee?.id}
          members={members}
        />
      )}

      {recommendationModalOpen && (
        <JHSCRecommendationModal
          isOpen={recommendationModalOpen}
          onClose={handleModalClose}
          recommendation={selectedItem}
          operatorId={operatorId}
          meetings={meetings}
        />
      )}
    </div>
  )
}
