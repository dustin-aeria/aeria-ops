/**
 * Notification Bell Component
 * Shows notification count and dropdown panel
 *
 * @location src/components/NotificationBell.jsx
 */

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  AtSign,
  UserPlus,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  ClipboardCheck,
  X,
  Check,
  Trash2,
  MoreVertical,
  Archive
} from 'lucide-react'
import {
  NOTIFICATION_TYPES,
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification
} from '../lib/firestoreNotifications'
import { useAuth } from '../contexts/AuthContext'

const TYPE_ICONS = {
  mention: AtSign,
  assignment: UserPlus,
  deadline: Clock,
  approval: CheckCircle,
  update: RefreshCw,
  alert: AlertTriangle,
  training: GraduationCap,
  inspection: ClipboardCheck,
  system: Bell
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const panelRef = useRef(null)

  // Subscribe to notifications
  useEffect(() => {
    if (!user?.uid) return

    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data)
    })

    return () => unsubscribe()
  }, [user?.uid])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
        setMenuOpen(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.isRead).length

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

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead(user.uid)
  }

  const handleArchive = async (e, notificationId) => {
    e.stopPropagation()
    await archiveNotification(notificationId)
    setMenuOpen(null)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-aeria-blue hover:text-aeria-navy"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system
                  const Icon = TYPE_ICONS[notification.type] || Bell

                  const content = (
                    <div
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full flex-shrink-0 ${typeConfig.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <div className="relative ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuOpen(menuOpen === notification.id ? null : notification.id)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {menuOpen === notification.id && (
                                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  {!notification.isRead && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.id)
                                        setMenuOpen(null)
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Check className="w-4 h-4" />
                                      Mark read
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleArchive(e, notification.id)}
                                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Archive className="w-4 h-4" />
                                    Archive
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  )

                  return notification.link ? (
                    <Link key={notification.id} to={notification.link}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
