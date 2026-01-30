/**
 * Firestore Notification Service
 * Handle in-app notifications for users
 *
 * @location src/lib/firestoreNotifications.js
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
  limit as firebaseLimit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// NOTIFICATION TYPES
// ============================================

export const NOTIFICATION_TYPES = {
  mention: {
    label: 'Mention',
    icon: 'AtSign',
    color: 'bg-blue-100 text-blue-700',
    description: 'You were mentioned in a comment'
  },
  assignment: {
    label: 'Assignment',
    icon: 'UserPlus',
    color: 'bg-green-100 text-green-700',
    description: 'You were assigned to a project or task'
  },
  deadline: {
    label: 'Deadline',
    icon: 'Clock',
    color: 'bg-orange-100 text-orange-700',
    description: 'A deadline is approaching'
  },
  approval: {
    label: 'Approval',
    icon: 'CheckCircle',
    color: 'bg-purple-100 text-purple-700',
    description: 'An item needs your approval'
  },
  update: {
    label: 'Update',
    icon: 'RefreshCw',
    color: 'bg-gray-100 text-gray-700',
    description: 'Something was updated'
  },
  alert: {
    label: 'Alert',
    icon: 'AlertTriangle',
    color: 'bg-red-100 text-red-700',
    description: 'Important alert'
  },
  training: {
    label: 'Training',
    icon: 'GraduationCap',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Training related notification'
  },
  inspection: {
    label: 'Inspection',
    icon: 'ClipboardCheck',
    color: 'bg-teal-100 text-teal-700',
    description: 'Inspection related notification'
  },
  system: {
    label: 'System',
    icon: 'Bell',
    color: 'bg-gray-100 text-gray-700',
    description: 'System notification'
  }
}

// ============================================
// CREATE NOTIFICATION
// ============================================

/**
 * Create a new notification
 */
export async function createNotification(notificationData) {
  const notification = {
    userId: notificationData.userId,
    organizationId: notificationData.organizationId,
    type: notificationData.type || 'system',
    title: notificationData.title,
    message: notificationData.message,
    link: notificationData.link || null,
    entityType: notificationData.entityType || null,
    entityId: notificationData.entityId || null,
    isRead: false,
    isArchived: false,
    metadata: notificationData.metadata || {},
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'notifications'), notification)
  return { id: docRef.id, ...notification }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(userIds, notificationData) {
  const batch = writeBatch(db)

  userIds.forEach(userId => {
    const docRef = doc(collection(db, 'notifications'))
    batch.set(docRef, {
      userId,
      organizationId: notificationData.organizationId,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      link: notificationData.link || null,
      entityType: notificationData.entityType || null,
      entityId: notificationData.entityId || null,
      isRead: false,
      isArchived: false,
      metadata: notificationData.metadata || {},
      createdAt: serverTimestamp()
    })
  })

  await batch.commit()
}

// ============================================
// READ NOTIFICATIONS
// ============================================

/**
 * Get notifications for a user
 */
export async function getNotifications(userId, options = {}) {
  const {
    includeRead = true,
    includeArchived = false,
    limitCount = 50
  } = options

  let q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    firebaseLimit(limitCount)
  )

  const snapshot = await getDocs(q)
  let notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }))

  // Filter based on options
  if (!includeRead) {
    notifications = notifications.filter(n => !n.isRead)
  }
  if (!includeArchived) {
    notifications = notifications.filter(n => !n.isArchived)
  }

  return notifications
}

/**
 * Subscribe to notifications for real-time updates
 */
export function subscribeToNotifications(userId, callback, options = {}) {
  const { limitCount = 50 } = options

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    firebaseLimit(limitCount)
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }))
      .filter(n => !n.isArchived)

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
    where('isRead', '==', false),
    where('isArchived', '==', false)
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
    isRead: true,
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
    where('isRead', '==', false)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      isRead: true,
      readAt: serverTimestamp()
    })
  })

  await batch.commit()
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId) {
  const notificationRef = doc(db, 'notifications', notificationId)
  await updateDoc(notificationRef, {
    isArchived: true,
    archivedAt: serverTimestamp()
  })
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
  await deleteDoc(doc(db, 'notifications', notificationId))
}

/**
 * Clear all notifications for a user
 */
export async function clearAllNotifications(userId) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Send a mention notification
 */
export async function notifyMention(mentionedUserId, authorName, entityType, entityId, entityName, organizationId) {
  return createNotification({
    userId: mentionedUserId,
    organizationId,
    type: 'mention',
    title: 'You were mentioned',
    message: `${authorName} mentioned you in ${entityName}`,
    link: `/${entityType}s/${entityId}`,
    entityType,
    entityId
  })
}

/**
 * Send an assignment notification
 */
export async function notifyAssignment(assignedUserId, assignerName, entityType, entityId, entityName, organizationId) {
  return createNotification({
    userId: assignedUserId,
    organizationId,
    type: 'assignment',
    title: 'New Assignment',
    message: `${assignerName} assigned you to ${entityName}`,
    link: `/${entityType}s/${entityId}`,
    entityType,
    entityId
  })
}

/**
 * Send a deadline reminder notification
 */
export async function notifyDeadline(userId, entityType, entityId, entityName, daysUntil, organizationId) {
  const message = daysUntil === 0
    ? `${entityName} is due today`
    : daysUntil === 1
      ? `${entityName} is due tomorrow`
      : `${entityName} is due in ${daysUntil} days`

  return createNotification({
    userId,
    organizationId,
    type: 'deadline',
    title: 'Deadline Approaching',
    message,
    link: `/${entityType}s/${entityId}`,
    entityType,
    entityId,
    metadata: { daysUntil }
  })
}

/**
 * Send an approval request notification
 */
export async function notifyApprovalRequest(approverId, requesterName, entityType, entityId, entityName, organizationId) {
  return createNotification({
    userId: approverId,
    organizationId,
    type: 'approval',
    title: 'Approval Required',
    message: `${requesterName} requested your approval for ${entityName}`,
    link: `/${entityType}s/${entityId}`,
    entityType,
    entityId
  })
}

export default {
  NOTIFICATION_TYPES,
  createNotification,
  createBulkNotifications,
  getNotifications,
  subscribeToNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  clearAllNotifications,
  notifyMention,
  notifyAssignment,
  notifyDeadline,
  notifyApprovalRequest
}
