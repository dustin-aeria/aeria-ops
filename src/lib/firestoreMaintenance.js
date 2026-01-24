/**
 * Firestore Equipment Maintenance Service
 * Track maintenance schedules and history for equipment
 *
 * @location src/lib/firestoreMaintenance.js
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
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// MAINTENANCE TYPES
// ============================================

export const MAINTENANCE_TYPES = {
  scheduled: { label: 'Scheduled', icon: 'Calendar', color: 'bg-blue-100 text-blue-700' },
  preventive: { label: 'Preventive', icon: 'Shield', color: 'bg-green-100 text-green-700' },
  corrective: { label: 'Corrective', icon: 'Wrench', color: 'bg-orange-100 text-orange-700' },
  emergency: { label: 'Emergency', icon: 'AlertTriangle', color: 'bg-red-100 text-red-700' },
  inspection: { label: 'Inspection', icon: 'ClipboardCheck', color: 'bg-purple-100 text-purple-700' },
  calibration: { label: 'Calibration', icon: 'Settings', color: 'bg-indigo-100 text-indigo-700' },
  firmware: { label: 'Firmware Update', icon: 'Download', color: 'bg-cyan-100 text-cyan-700' }
}

export const MAINTENANCE_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' }
}

export const MAINTENANCE_INTERVALS = {
  flight_hours: { label: 'Flight Hours', unit: 'hours' },
  calendar_days: { label: 'Calendar Days', unit: 'days' },
  flight_cycles: { label: 'Flight Cycles', unit: 'cycles' }
}

// ============================================
// MAINTENANCE RECORDS CRUD
// ============================================

/**
 * Create a maintenance record
 */
export async function createMaintenanceRecord(recordData) {
  const record = {
    equipmentId: recordData.equipmentId,
    equipmentName: recordData.equipmentName,
    operatorId: recordData.operatorId,
    type: recordData.type || 'scheduled',
    status: recordData.status || 'scheduled',
    description: recordData.description || '',
    notes: recordData.notes || '',
    scheduledDate: recordData.scheduledDate || null,
    completedDate: recordData.completedDate || null,
    performedBy: recordData.performedBy || null,
    performedByName: recordData.performedByName || null,
    cost: recordData.cost || null,
    parts: recordData.parts || [],
    documents: recordData.documents || [],
    nextMaintenanceDue: recordData.nextMaintenanceDue || null,
    flightHoursAtMaintenance: recordData.flightHoursAtMaintenance || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'maintenanceRecords'), record)
  return { id: docRef.id, ...record }
}

/**
 * Get maintenance records for equipment
 */
export async function getMaintenanceRecords(equipmentId, options = {}) {
  const { status = null, limit = 50 } = options

  let q = query(
    collection(db, 'maintenanceRecords'),
    where('equipmentId', '==', equipmentId),
    orderBy('scheduledDate', 'desc')
  )

  const snapshot = await getDocs(q)
  let records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledDate: doc.data().scheduledDate?.toDate?.() || doc.data().scheduledDate,
    completedDate: doc.data().completedDate?.toDate?.() || doc.data().completedDate,
    nextMaintenanceDue: doc.data().nextMaintenanceDue?.toDate?.() || doc.data().nextMaintenanceDue,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  if (status) {
    records = records.filter(r => r.status === status)
  }

  return records.slice(0, limit)
}

/**
 * Get all maintenance records for an operator
 */
export async function getAllMaintenanceRecords(operatorId, options = {}) {
  const { includeCompleted = true, upcoming = false } = options

  let q = query(
    collection(db, 'maintenanceRecords'),
    where('operatorId', '==', operatorId),
    orderBy('scheduledDate', 'asc')
  )

  const snapshot = await getDocs(q)
  let records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledDate: doc.data().scheduledDate?.toDate?.() || doc.data().scheduledDate,
    completedDate: doc.data().completedDate?.toDate?.() || doc.data().completedDate,
    nextMaintenanceDue: doc.data().nextMaintenanceDue?.toDate?.() || doc.data().nextMaintenanceDue,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))

  if (!includeCompleted) {
    records = records.filter(r => r.status !== 'completed' && r.status !== 'cancelled')
  }

  if (upcoming) {
    const now = new Date()
    records = records.filter(r => {
      const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
      return date >= now
    })
  }

  return records
}

/**
 * Update a maintenance record
 */
export async function updateMaintenanceRecord(recordId, updates) {
  const recordRef = doc(db, 'maintenanceRecords', recordId)
  await updateDoc(recordRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Complete a maintenance record
 */
export async function completeMaintenanceRecord(recordId, completionData) {
  await updateMaintenanceRecord(recordId, {
    status: 'completed',
    completedDate: completionData.completedDate || new Date(),
    performedBy: completionData.performedBy,
    performedByName: completionData.performedByName,
    notes: completionData.notes || '',
    cost: completionData.cost || null,
    parts: completionData.parts || [],
    flightHoursAtMaintenance: completionData.flightHoursAtMaintenance || null
  })
}

/**
 * Delete a maintenance record
 */
export async function deleteMaintenanceRecord(recordId) {
  await deleteDoc(doc(db, 'maintenanceRecords', recordId))
}

// ============================================
// MAINTENANCE SCHEDULES
// ============================================

/**
 * Create a maintenance schedule (recurring maintenance)
 */
export async function createMaintenanceSchedule(scheduleData) {
  const schedule = {
    equipmentId: scheduleData.equipmentId,
    equipmentName: scheduleData.equipmentName,
    operatorId: scheduleData.operatorId,
    name: scheduleData.name,
    description: scheduleData.description || '',
    type: scheduleData.type || 'scheduled',
    intervalType: scheduleData.intervalType || 'calendar_days',
    intervalValue: scheduleData.intervalValue || 30,
    lastPerformed: scheduleData.lastPerformed || null,
    nextDue: scheduleData.nextDue || null,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'maintenanceSchedules'), schedule)
  return { id: docRef.id, ...schedule }
}

/**
 * Get maintenance schedules for equipment
 */
export async function getMaintenanceSchedules(equipmentId) {
  const q = query(
    collection(db, 'maintenanceSchedules'),
    where('equipmentId', '==', equipmentId),
    where('isActive', '==', true)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    lastPerformed: doc.data().lastPerformed?.toDate?.() || doc.data().lastPerformed,
    nextDue: doc.data().nextDue?.toDate?.() || doc.data().nextDue,
    createdAt: doc.data().createdAt?.toDate?.(),
    updatedAt: doc.data().updatedAt?.toDate?.()
  }))
}

/**
 * Update maintenance schedule
 */
export async function updateMaintenanceSchedule(scheduleId, updates) {
  const scheduleRef = doc(db, 'maintenanceSchedules', scheduleId)
  await updateDoc(scheduleRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Deactivate maintenance schedule
 */
export async function deactivateMaintenanceSchedule(scheduleId) {
  await updateMaintenanceSchedule(scheduleId, { isActive: false })
}

// ============================================
// MAINTENANCE METRICS
// ============================================

/**
 * Get maintenance metrics for an operator
 */
export async function getMaintenanceMetrics(operatorId) {
  const records = await getAllMaintenanceRecords(operatorId, { includeCompleted: true })
  const now = new Date()

  // Calculate metrics
  const upcoming = records.filter(r => {
    if (r.status === 'completed' || r.status === 'cancelled') return false
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date >= now
  })

  const overdue = records.filter(r => {
    if (r.status === 'completed' || r.status === 'cancelled') return false
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date < now
  })

  const completedThisMonth = records.filter(r => {
    if (r.status !== 'completed') return false
    const date = r.completedDate instanceof Date ? r.completedDate : new Date(r.completedDate)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    return date >= monthStart
  })

  const totalCostThisMonth = completedThisMonth.reduce((sum, r) => sum + (r.cost || 0), 0)

  // Next 7 days
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingSevenDays = upcoming.filter(r => {
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date <= sevenDaysFromNow
  })

  return {
    totalUpcoming: upcoming.length,
    totalOverdue: overdue.length,
    completedThisMonth: completedThisMonth.length,
    totalCostThisMonth,
    upcomingSevenDays: upcomingSevenDays.length,
    overdueItems: overdue.slice(0, 5),
    upcomingItems: upcoming.slice(0, 5)
  }
}

/**
 * Get equipment health status
 */
export function getEquipmentHealthStatus(equipment, maintenanceRecords) {
  const now = new Date()
  const pendingRecords = maintenanceRecords.filter(r =>
    r.status !== 'completed' && r.status !== 'cancelled'
  )

  const overdueRecords = pendingRecords.filter(r => {
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date < now
  })

  if (overdueRecords.length > 0) {
    return {
      status: 'critical',
      label: 'Maintenance Overdue',
      color: 'bg-red-100 text-red-700',
      overdueCount: overdueRecords.length
    }
  }

  // Check if maintenance due within 7 days
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const soonRecords = pendingRecords.filter(r => {
    const date = r.scheduledDate instanceof Date ? r.scheduledDate : new Date(r.scheduledDate)
    return date <= sevenDaysFromNow
  })

  if (soonRecords.length > 0) {
    return {
      status: 'warning',
      label: 'Maintenance Due Soon',
      color: 'bg-yellow-100 text-yellow-700',
      soonCount: soonRecords.length
    }
  }

  return {
    status: 'good',
    label: 'Up to Date',
    color: 'bg-green-100 text-green-700'
  }
}

export default {
  MAINTENANCE_TYPES,
  MAINTENANCE_STATUS,
  MAINTENANCE_INTERVALS,
  createMaintenanceRecord,
  getMaintenanceRecords,
  getAllMaintenanceRecords,
  updateMaintenanceRecord,
  completeMaintenanceRecord,
  deleteMaintenanceRecord,
  createMaintenanceSchedule,
  getMaintenanceSchedules,
  updateMaintenanceSchedule,
  deactivateMaintenanceSchedule,
  getMaintenanceMetrics,
  getEquipmentHealthStatus
}
