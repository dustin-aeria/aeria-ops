/**
 * Audit Trail Service
 * Track all system activities for compliance and debugging
 *
 * @location src/lib/auditTrail.js
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// AUDIT ACTION TYPES
// ============================================

export const AUDIT_ACTIONS = {
  // Auth actions
  login: { label: 'Login', category: 'auth', icon: 'LogIn' },
  logout: { label: 'Logout', category: 'auth', icon: 'LogOut' },
  password_change: { label: 'Password Changed', category: 'auth', icon: 'Key' },

  // Create actions
  create: { label: 'Created', category: 'crud', icon: 'Plus' },
  create_project: { label: 'Project Created', category: 'project', icon: 'FolderPlus' },
  create_incident: { label: 'Incident Reported', category: 'safety', icon: 'AlertTriangle' },
  create_capa: { label: 'CAPA Created', category: 'safety', icon: 'Target' },

  // Update actions
  update: { label: 'Updated', category: 'crud', icon: 'Edit' },
  status_change: { label: 'Status Changed', category: 'workflow', icon: 'RefreshCw' },
  assign: { label: 'Assigned', category: 'workflow', icon: 'UserPlus' },
  approve: { label: 'Approved', category: 'workflow', icon: 'CheckCircle' },
  reject: { label: 'Rejected', category: 'workflow', icon: 'XCircle' },

  // Delete actions
  delete: { label: 'Deleted', category: 'crud', icon: 'Trash2' },
  archive: { label: 'Archived', category: 'crud', icon: 'Archive' },
  restore: { label: 'Restored', category: 'crud', icon: 'RotateCcw' },

  // Document actions
  upload: { label: 'File Uploaded', category: 'document', icon: 'Upload' },
  download: { label: 'File Downloaded', category: 'document', icon: 'Download' },
  view: { label: 'Viewed', category: 'document', icon: 'Eye' },
  export: { label: 'Exported', category: 'document', icon: 'FileOutput' },

  // Compliance actions
  sign: { label: 'Signed', category: 'compliance', icon: 'PenTool' },
  acknowledge: { label: 'Acknowledged', category: 'compliance', icon: 'CheckSquare' },
  complete_training: { label: 'Training Completed', category: 'compliance', icon: 'GraduationCap' },
  complete_inspection: { label: 'Inspection Completed', category: 'compliance', icon: 'ClipboardCheck' },

  // System actions
  settings_change: { label: 'Settings Changed', category: 'system', icon: 'Settings' },
  bulk_operation: { label: 'Bulk Operation', category: 'system', icon: 'Layers' },
  import: { label: 'Data Imported', category: 'system', icon: 'Upload' }
}

export const ENTITY_TYPES = {
  project: 'Project',
  incident: 'Incident',
  capa: 'CAPA',
  equipment: 'Equipment',
  aircraft: 'Aircraft',
  operator: 'Operator',
  client: 'Client',
  policy: 'Policy',
  procedure: 'Procedure',
  training: 'Training',
  inspection: 'Inspection',
  attachment: 'Attachment',
  checklist: 'Checklist',
  flight_log: 'Flight Log',
  user: 'User',
  settings: 'Settings'
}

// ============================================
// AUDIT LOG FUNCTIONS
// ============================================

/**
 * Log an audit event
 */
export async function logAuditEvent(eventData) {
  const event = {
    organizationId: eventData.organizationId,
    userId: eventData.userId,
    userName: eventData.userName,
    userEmail: eventData.userEmail,
    action: eventData.action,
    actionLabel: AUDIT_ACTIONS[eventData.action]?.label || eventData.action,
    category: AUDIT_ACTIONS[eventData.action]?.category || 'other',
    entityType: eventData.entityType,
    entityId: eventData.entityId,
    entityName: eventData.entityName || null,
    details: eventData.details || {},
    previousValue: eventData.previousValue || null,
    newValue: eventData.newValue || null,
    ipAddress: eventData.ipAddress || null,
    userAgent: eventData.userAgent || null,
    timestamp: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'auditLogs'), event)
  return { id: docRef.id, ...event }
}

/**
 * Log multiple audit events
 */
export async function logBulkAuditEvents(events) {
  const promises = events.map(event => logAuditEvent(event))
  return Promise.all(promises)
}

// ============================================
// AUDIT LOG QUERIES
// ============================================

/**
 * Get audit logs for an organization
 */
export async function getOrganizationAuditLogs(organizationId, options = {}) {
  const {
    action = null,
    entityType = null,
    userId = null,
    startDate = null,
    endDate = null,
    maxResults = 100
  } = options

  let q = query(
    collection(db, 'auditLogs'),
    where('organizationId', '==', organizationId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  let logs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()
  }))

  // Apply filters
  if (action) {
    logs = logs.filter(log => log.action === action)
  }
  if (entityType) {
    logs = logs.filter(log => log.entityType === entityType)
  }
  if (userId) {
    logs = logs.filter(log => log.userId === userId)
  }
  if (startDate) {
    const start = new Date(startDate)
    logs = logs.filter(log => log.timestamp >= start)
  }
  if (endDate) {
    const end = new Date(endDate)
    logs = logs.filter(log => log.timestamp <= end)
  }

  return logs
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(entityType, entityId, options = {}) {
  const { maxResults = 50 } = options

  const q = query(
    collection(db, 'auditLogs'),
    where('entityType', '==', entityType),
    where('entityId', '==', entityId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()
  }))
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId, options = {}) {
  const { maxResults = 100 } = options

  const q = query(
    collection(db, 'auditLogs'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()
  }))
}

/**
 * Get recent activity across organization
 */
export async function getRecentActivity(organizationId, maxResults = 20) {
  const q = query(
    collection(db, 'auditLogs'),
    where('organizationId', '==', organizationId),
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()
  }))
}

// ============================================
// AUDIT LOG ANALYTICS
// ============================================

/**
 * Get activity summary for a period
 */
export async function getActivitySummary(organizationId, startDate, endDate) {
  const logs = await getOrganizationAuditLogs(organizationId, {
    startDate,
    endDate,
    maxResults: 10000
  })

  const summary = {
    totalEvents: logs.length,
    byAction: {},
    byCategory: {},
    byUser: {},
    byEntityType: {},
    byDay: {}
  }

  logs.forEach(log => {
    // By action
    summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1

    // By category
    const category = log.category || 'other'
    summary.byCategory[category] = (summary.byCategory[category] || 0) + 1

    // By user
    const userId = log.userId || 'unknown'
    if (!summary.byUser[userId]) {
      summary.byUser[userId] = { name: log.userName, count: 0 }
    }
    summary.byUser[userId].count++

    // By entity type
    if (log.entityType) {
      summary.byEntityType[log.entityType] = (summary.byEntityType[log.entityType] || 0) + 1
    }

    // By day
    if (log.timestamp) {
      const day = log.timestamp.toISOString().split('T')[0]
      summary.byDay[day] = (summary.byDay[day] || 0) + 1
    }
  })

  return summary
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(organizationId, userId) {
  const logs = await getUserAuditLogs(userId, { maxResults: 1000 })

  const stats = {
    totalActions: logs.length,
    lastActive: logs[0]?.timestamp || null,
    mostCommonAction: null,
    actionsThisWeek: 0,
    actionsThisMonth: 0
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const actionCounts = {}

  logs.forEach(log => {
    // Count by action
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1

    // Count recent activity
    if (log.timestamp >= weekAgo) stats.actionsThisWeek++
    if (log.timestamp >= monthAgo) stats.actionsThisMonth++
  })

  // Find most common action
  let maxCount = 0
  Object.entries(actionCounts).forEach(([action, count]) => {
    if (count > maxCount) {
      maxCount = count
      stats.mostCommonAction = action
    }
  })

  return stats
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create audit event for entity change
 */
export function createChangeEvent(entityType, entityId, entityName, userId, userName, action, changes = {}) {
  return {
    entityType,
    entityId,
    entityName,
    userId,
    userName,
    action,
    details: changes
  }
}

/**
 * Format audit log for display
 */
export function formatAuditLog(log) {
  const actionInfo = AUDIT_ACTIONS[log.action] || { label: log.action }
  const entityLabel = ENTITY_TYPES[log.entityType] || log.entityType

  let description = `${log.userName || 'Unknown user'} ${actionInfo.label.toLowerCase()}`

  if (log.entityName) {
    description += ` ${entityLabel.toLowerCase()} "${log.entityName}"`
  } else if (log.entityType) {
    description += ` a ${entityLabel.toLowerCase()}`
  }

  return {
    ...log,
    description,
    actionInfo,
    entityLabel
  }
}

export default {
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  logAuditEvent,
  logBulkAuditEvents,
  getOrganizationAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  getRecentActivity,
  getActivitySummary,
  getUserActivityStats,
  createChangeEvent,
  formatAuditLog
}
