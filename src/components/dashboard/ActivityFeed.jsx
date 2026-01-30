/**
 * Activity Feed Widget
 * Shows recent activity across the organization
 *
 * @location src/components/dashboard/ActivityFeed.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  MessageSquare,
  FileText,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  Plus,
  Edit,
  RefreshCw,
  UserPlus,
  Upload,
  CheckCircle,
  FolderKanban,
  ArrowRight,
  Clock
} from 'lucide-react'
import { getRecentOrganizationActivity, ACTIVITY_TYPES, COMMENT_TYPES } from '../../lib/firestoreComments'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'

const ACTIVITY_ICONS = {
  created: Plus,
  updated: Edit,
  status_change: RefreshCw,
  assigned: UserPlus,
  commented: MessageSquare,
  uploaded: Upload,
  completed: CheckCircle
}

const COMMENT_ICONS = {
  comment: MessageSquare,
  note: FileText,
  question: HelpCircle,
  action: CheckSquare,
  issue: AlertCircle
}

export default function ActivityFeed({ limit = 10 }) {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivity = async () => {
      if (!organizationId) return

      setLoading(true)
      try {
        const data = await getRecentOrganizationActivity(organizationId, limit)
        setActivities(data)
      } catch (err) {
        // Activity feed is optional, fail silently
      } finally {
        setLoading(false)
      }
    }

    loadActivity()
  }, [organizationId, limit])

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getEntityLink = (activity) => {
    switch (activity.entityType) {
      case 'project':
        return `/projects/${activity.entityId}`
      case 'incident':
        return `/incidents/${activity.entityId}`
      case 'capa':
        return `/capas/${activity.entityId}`
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-aeria-navy" />
            Recent Activity
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-48 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-aeria-navy" />
          Recent Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Activity will appear here as you work on projects</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || RefreshCw
            const link = getEntityLink(activity)

            const content = (
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-1.5 bg-gray-100 rounded-full flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.actorName}</span>
                    {' '}
                    <span className="text-gray-500">{activity.description}</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
                {link && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </div>
            )

            return link ? (
              <Link key={activity.id} to={link}>
                {content}
              </Link>
            ) : (
              <div key={activity.id}>{content}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
