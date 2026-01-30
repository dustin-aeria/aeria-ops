/**
 * Notification Service
 * In-app notifications and alerts management
 *
 * @location src/lib/notificationService.js
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NOTIFICATION_TYPES = {
  info: {
    label: 'Information',
    icon: 'Info',
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-500'
  },
  success: {
    label: 'Success',
    icon: 'CheckCircle',
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-500'
  },
  warning: {
    label: 'Warning',
    icon: 'AlertTriangle',
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-500'
  },
  error: {
    label: 'Error',
    icon: 'AlertCircle',
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-500'
  },
  reminder: {
    label: 'Reminder',
    icon: 'Bell',
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-500'
  },
  task: {
    label: 'Task',
    icon: 'CheckSquare',
    color: 'bg-indigo-100 text-indigo-700',
    borderColor: 'border-indigo-500'
  },
  mention: {
    label: 'Mention',
    icon: 'AtSign',
    color: 'bg-cyan-100 text-cyan-700',
    borderColor: 'border-cyan-500'
  },
  system: {
    label: 'System',
    icon: 'Settings',
    color: 'bg-gray-100 text-gray-700',
    borderColor: 'border-gray-500'
  }
}

export const NOTIFICATION_CATEGORIES = {
  project: { label: 'Projects', icon: 'FolderKanban' },
  incident: { label: 'Incidents', icon: 'AlertTriangle' },
  capa: { label: 'CAPAs', icon: 'Target' },
  equipment: { label: 'Equipment', icon: 'Package' },
  aircraft: { label: 'Aircraft', icon: 'Plane' },
  maintenance: { label: 'Maintenance', icon: 'Wrench' },
  compliance: { label: 'Compliance', icon: 'Shield' },
  training: { label: 'Training', icon: 'GraduationCap' },
  general: { label: 'General', icon: 'Bell' }
}

// ============================================
// CREATE NOTIFICATIONS
// ============================================

/**
 * Create a notification
 */
export async function createNotification(notificationData) {
  const notification = {
    organizationId: notificationData.organizationId,
    userId: notificationData.userId,
    type: notificationData.type || 'info',
    category: notificationData.category || 'general',
    title: notificationData.title,
    message: notificationData.message,
    entityType: notificationData.entityType || null,
    entityId: notificationData.entityId || null,
    entityName: notificationData.entityName || null,
    link: notificationData.link || null,
    read: false,
    dismissed: false,
    priority: notificationData.priority || 'normal', // low, normal, high, urgent
    expiresAt: notificationData.expiresAt || null,
    actionRequired: notificationData.actionRequired || false,
    actionLabel: notificationData.actionLabel || null,
    createdAt: serverTimestamp(),
    createdBy: notificationData.createdBy || null
  }

  const docRef = await addDoc(collection(db, 'notifications'), notification)
  return { id: docRef.id, ...notification }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(userIds, notificationData) {
  const batch = writeBatch(db)
  const createdIds = []

  userIds.forEach(userId => {
    const docRef = doc(collection(db, 'notifications'))
    batch.set(docRef, {
      ...notificationData,
      userId,
      read: false,
      dismissed: false,
      createdAt: serverTimestamp()
    })
    createdIds.push(docRef.id)
  })

  await batch.commit()
  return createdIds
}

/**
 * Create notification for all organization users
 */
export async function notifyAllOrganizationUsers(organizationId, notificationData, excludeUserId = null) {
  // Get all users for organization
  const usersQuery = query(
    collection(db, 'users'),
    where('organizationId', '==', organizationId)
  )

  const snapshot = await getDocs(usersQuery)
  const userIds = snapshot.docs
    .map(doc => doc.id)
    .filter(id => id !== excludeUserId)

  if (userIds.length === 0) return []

  return createBulkNotifications(userIds, {
    ...notificationData,
    organizationId
  })
}

// ============================================
// READ NOTIFICATIONS
// ============================================

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId, options = {}) {
  const {
    unreadOnly = false,
    category = null,
    maxResults = 50
  } = options

  let q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('dismissed', '==', false),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  let notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()
  }))

  // Apply filters
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read)
  }

  if (category) {
    notifications = notifications.filter(n => n.category === category)
  }

  // Filter expired notifications
  const now = new Date()
  notifications = notifications.filter(n => {
    if (!n.expiresAt) return true
    return new Date(n.expiresAt) > now
  })

  return notifications
}

/**
 * Subscribe to user notifications
 */
export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('dismissed', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50)
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()
    }))
    callback(notifications)
  })
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    where('dismissed', '==', false)
  )

  const snapshot = await getDocs(q)
  return snapshot.size
}

// ============================================
// UPDATE NOTIFICATIONS
// ============================================

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId) {
  const notificationRef = doc(db, 'notifications', notificationId)
  await updateDoc(notificationRef, {
    read: true,
    readAt: serverTimestamp()
  })
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  )

  const snapshot = await getDocs(q)

  // Process in batches of 500
  const batchSize = 500
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db)
    const chunk = snapshot.docs.slice(i, i + batchSize)

    chunk.forEach(docSnap => {
      batch.update(docSnap.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    })

    await batch.commit()
  }

  return snapshot.size
}

/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId) {
  const notificationRef = doc(db, 'notifications', notificationId)
  await updateDoc(notificationRef, {
    dismissed: true,
    dismissedAt: serverTimestamp()
  })
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('dismissed', '==', false)
  )

  const snapshot = await getDocs(q)

  const batchSize = 500
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db)
    const chunk = snapshot.docs.slice(i, i + batchSize)

    chunk.forEach(docSnap => {
      batch.update(docSnap.ref, {
        dismissed: true,
        dismissedAt: serverTimestamp()
      })
    })

    await batch.commit()
  }

  return snapshot.size
}

// ============================================
// DELETE NOTIFICATIONS
// ============================================

/**
 * Delete a notification permanently
 */
export async function deleteNotification(notificationId) {
  await deleteDoc(doc(db, 'notifications', notificationId))
}

/**
 * Clean up old notifications
 */
export async function cleanupOldNotifications(userId, daysOld = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('dismissed', '==', true)
  )

  const snapshot = await getDocs(q)
  const toDelete = snapshot.docs.filter(docSnap => {
    const createdAt = docSnap.data().createdAt?.toDate?.()
    return createdAt && createdAt < cutoffDate
  })

  const batchSize = 500
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = writeBatch(db)
    const chunk = toDelete.slice(i, i + batchSize)

    chunk.forEach(docSnap => {
      batch.delete(docSnap.ref)
    })

    await batch.commit()
  }

  return toDelete.length
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Create project notification
 */
export function notifyProjectUpdate(organizationId, userId, project, action, createdBy) {
  const messages = {
    created: `New project "${project.name}" has been created`,
    updated: `Project "${project.name}" has been updated`,
    status_change: `Project "${project.name}" status changed to ${project.status}`,
    assigned: `You have been assigned to project "${project.name}"`,
    completed: `Project "${project.name}" has been completed`
  }

  return createNotification({
    organizationId,
    userId,
    type: action === 'assigned' ? 'task' : 'info',
    category: 'project',
    title: `Project ${action.replace('_', ' ')}`,
    message: messages[action] || `Project "${project.name}" - ${action}`,
    entityType: 'project',
    entityId: project.id,
    entityName: project.name,
    link: `/projects/${project.id}`,
    createdBy
  })
}

/**
 * Create incident notification
 */
export function notifyIncident(organizationId, userId, incident, action, createdBy) {
  const severity = incident.severity || 'unknown'
  const priority = severity === 'critical' || severity === 'high' ? 'urgent' : 'normal'

  return createNotification({
    organizationId,
    userId,
    type: 'warning',
    category: 'incident',
    title: `Incident ${action}`,
    message: `${incident.title} - ${severity} severity`,
    entityType: 'incident',
    entityId: incident.id,
    entityName: incident.title,
    link: `/incidents/${incident.id}`,
    priority,
    actionRequired: action === 'reported',
    createdBy
  })
}

/**
 * Create CAPA notification
 */
export function notifyCapa(organizationId, userId, capa, action, createdBy) {
  return createNotification({
    organizationId,
    userId,
    type: action === 'overdue' ? 'error' : 'task',
    category: 'capa',
    title: `CAPA ${action}`,
    message: `${capa.title}`,
    entityType: 'capa',
    entityId: capa.id,
    entityName: capa.title,
    link: `/capas/${capa.id}`,
    priority: action === 'overdue' ? 'high' : 'normal',
    actionRequired: action === 'assigned' || action === 'overdue',
    createdBy
  })
}

/**
 * Create maintenance notification
 */
export function notifyMaintenance(organizationId, userId, equipment, maintenanceType, dueDate, createdBy) {
  const isOverdue = dueDate && new Date(dueDate) < new Date()

  return createNotification({
    organizationId,
    userId,
    type: isOverdue ? 'error' : 'reminder',
    category: 'maintenance',
    title: isOverdue ? 'Maintenance Overdue' : 'Maintenance Due',
    message: `${maintenanceType} for ${equipment.name} is ${isOverdue ? 'overdue' : 'due'}`,
    entityType: 'equipment',
    entityId: equipment.id,
    entityName: equipment.name,
    link: `/equipment/${equipment.id}`,
    priority: isOverdue ? 'high' : 'normal',
    actionRequired: true,
    createdBy
  })
}

/**
 * Create reminder notification
 */
export function createReminder(organizationId, userId, title, message, dueDate, link = null) {
  return createNotification({
    organizationId,
    userId,
    type: 'reminder',
    category: 'general',
    title,
    message,
    link,
    priority: 'normal',
    expiresAt: dueDate
  })
}

// ============================================
// NOTIFICATION FORMATTING
// ============================================

/**
 * Get notification icon
 */
export function getNotificationIcon(notification) {
  return NOTIFICATION_TYPES[notification.type]?.icon || 'Bell'
}

/**
 * Get notification color classes
 */
export function getNotificationColors(notification) {
  return NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info
}

/**
 * Format notification time
 */
export function formatNotificationTime(date) {
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

  return date.toLocaleDateString()
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications) {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  notifications.forEach(notification => {
    const date = notification.createdAt
    if (!date) {
      groups.older.push(notification)
      return
    }

    if (date >= today) {
      groups.today.push(notification)
    } else if (date >= yesterday) {
      groups.yesterday.push(notification)
    } else if (date >= weekAgo) {
      groups.thisWeek.push(notification)
    } else {
      groups.older.push(notification)
    }
  })

  return groups
}

export default {
  NOTIFICATION_TYPES,
  NOTIFICATION_CATEGORIES,
  createNotification,
  createBulkNotifications,
  notifyAllOrganizationUsers,
  getUserNotifications,
  subscribeToNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  dismissAllNotifications,
  deleteNotification,
  cleanupOldNotifications,
  notifyProjectUpdate,
  notifyIncident,
  notifyCapa,
  notifyMaintenance,
  createReminder,
  getNotificationIcon,
  getNotificationColors,
  formatNotificationTime,
  groupNotificationsByDate
}
