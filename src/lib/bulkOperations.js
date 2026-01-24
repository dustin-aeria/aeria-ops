/**
 * Bulk Operations Service
 * Handle batch operations on multiple records
 *
 * @location src/lib/bulkOperations.js
 */

import {
  writeBatch,
  doc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// Maximum batch size for Firestore
const MAX_BATCH_SIZE = 500

// ============================================
// BULK UPDATE HELPER
// ============================================

/**
 * Execute updates in batches
 */
async function executeInBatches(updates, collectionName) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  }

  // Split into chunks of MAX_BATCH_SIZE
  for (let i = 0; i < updates.length; i += MAX_BATCH_SIZE) {
    const chunk = updates.slice(i, i + MAX_BATCH_SIZE)
    const batch = writeBatch(db)

    try {
      chunk.forEach(({ id, data }) => {
        const docRef = doc(db, collectionName, id)
        batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
      results.success += chunk.length
    } catch (err) {
      logger.error(`Batch update failed:`, err)
      results.failed += chunk.length
      results.errors.push(err.message)
    }
  }

  return results
}

// ============================================
// PROJECT BULK OPERATIONS
// ============================================

/**
 * Bulk update project status
 */
export async function bulkUpdateProjectStatus(projectIds, newStatus, userId) {
  const updates = projectIds.map(id => ({
    id,
    data: {
      status: newStatus,
      statusUpdatedBy: userId,
      statusUpdatedAt: serverTimestamp()
    }
  }))

  return executeInBatches(updates, 'projects')
}

/**
 * Bulk archive projects
 */
export async function bulkArchiveProjects(projectIds, userId) {
  const updates = projectIds.map(id => ({
    id,
    data: {
      status: 'archived',
      archivedBy: userId,
      archivedAt: serverTimestamp()
    }
  }))

  return executeInBatches(updates, 'projects')
}

/**
 * Bulk assign client to projects
 */
export async function bulkAssignClient(projectIds, clientId, clientName) {
  const updates = projectIds.map(id => ({
    id,
    data: {
      clientId,
      clientName
    }
  }))

  return executeInBatches(updates, 'projects')
}

// ============================================
// EQUIPMENT BULK OPERATIONS
// ============================================

/**
 * Bulk update equipment status
 */
export async function bulkUpdateEquipmentStatus(equipmentIds, newStatus) {
  const updates = equipmentIds.map(id => ({
    id,
    data: { status: newStatus }
  }))

  return executeInBatches(updates, 'equipment')
}

/**
 * Bulk update equipment category
 */
export async function bulkUpdateEquipmentCategory(equipmentIds, category) {
  const updates = equipmentIds.map(id => ({
    id,
    data: { category }
  }))

  return executeInBatches(updates, 'equipment')
}

/**
 * Bulk update equipment maintenance dates
 */
export async function bulkUpdateMaintenanceDate(equipmentIds, nextServiceDate) {
  const updates = equipmentIds.map(id => ({
    id,
    data: { nextServiceDate }
  }))

  return executeInBatches(updates, 'equipment')
}

// ============================================
// AIRCRAFT BULK OPERATIONS
// ============================================

/**
 * Bulk update aircraft status
 */
export async function bulkUpdateAircraftStatus(aircraftIds, newStatus) {
  const updates = aircraftIds.map(id => ({
    id,
    data: { status: newStatus }
  }))

  return executeInBatches(updates, 'aircraft')
}

// ============================================
// OPERATOR BULK OPERATIONS
// ============================================

/**
 * Bulk update operator status
 */
export async function bulkUpdateOperatorStatus(operatorIds, newStatus) {
  const updates = operatorIds.map(id => ({
    id,
    data: { status: newStatus }
  }))

  return executeInBatches(updates, 'operators')
}

/**
 * Bulk assign role to operators
 */
export async function bulkAssignRole(operatorIds, role) {
  const updates = operatorIds.map(id => ({
    id,
    data: { role }
  }))

  return executeInBatches(updates, 'operators')
}

// ============================================
// INCIDENT BULK OPERATIONS
// ============================================

/**
 * Bulk update incident status
 */
export async function bulkUpdateIncidentStatus(incidentIds, newStatus, userId) {
  const updates = incidentIds.map(id => ({
    id,
    data: {
      status: newStatus,
      statusUpdatedBy: userId,
      statusHistory: {
        status: newStatus,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      }
    }
  }))

  return executeInBatches(updates, 'incidents')
}

/**
 * Bulk assign investigator to incidents
 */
export async function bulkAssignInvestigator(incidentIds, investigatorId, investigatorName) {
  const updates = incidentIds.map(id => ({
    id,
    data: {
      investigatorId,
      investigatorName,
      status: 'investigating'
    }
  }))

  return executeInBatches(updates, 'incidents')
}

// ============================================
// TRAINING BULK OPERATIONS
// ============================================

/**
 * Bulk update training record status
 */
export async function bulkUpdateTrainingStatus(recordIds, newStatus) {
  const updates = recordIds.map(id => ({
    id,
    data: { status: newStatus }
  }))

  return executeInBatches(updates, 'trainingRecords')
}

// ============================================
// CAPA BULK OPERATIONS
// ============================================

/**
 * Bulk update CAPA status
 */
export async function bulkUpdateCapaStatus(capaIds, newStatus, userId) {
  const updates = capaIds.map(id => ({
    id,
    data: {
      status: newStatus,
      statusUpdatedBy: userId
    }
  }))

  return executeInBatches(updates, 'capas')
}

/**
 * Bulk assign owner to CAPAs
 */
export async function bulkAssignCapaOwner(capaIds, ownerId, ownerName) {
  const updates = capaIds.map(id => ({
    id,
    data: {
      ownerId,
      ownerName
    }
  }))

  return executeInBatches(updates, 'capas')
}

// ============================================
// GENERIC BULK DELETE
// ============================================

/**
 * Bulk delete records (soft delete with archived flag)
 */
export async function bulkSoftDelete(ids, collectionName, userId) {
  const updates = ids.map(id => ({
    id,
    data: {
      isDeleted: true,
      deletedBy: userId,
      deletedAt: serverTimestamp()
    }
  }))

  return executeInBatches(updates, collectionName)
}

/**
 * Bulk restore soft-deleted records
 */
export async function bulkRestore(ids, collectionName) {
  const updates = ids.map(id => ({
    id,
    data: {
      isDeleted: false,
      deletedBy: null,
      deletedAt: null
    }
  }))

  return executeInBatches(updates, collectionName)
}

// ============================================
// BULK EXPORT HELPER
// ============================================

/**
 * Export records to JSON format
 */
export function exportToJSON(records, filename = 'export') {
  const data = JSON.stringify(records, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export records to CSV format
 */
export function exportToCSV(records, fields, filename = 'export') {
  // Header row
  const header = fields.map(f => f.label || f.key).join(',')

  // Data rows
  const rows = records.map(record => {
    return fields.map(f => {
      let value = record[f.key]

      // Handle nested fields
      if (f.key.includes('.')) {
        const parts = f.key.split('.')
        value = parts.reduce((obj, key) => obj?.[key], record)
      }

      // Format value
      if (value === null || value === undefined) {
        value = ''
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      // Escape quotes and wrap in quotes if contains comma
      value = String(value).replace(/"/g, '""')
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`
      }

      return value
    }).join(',')
  })

  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default {
  bulkUpdateProjectStatus,
  bulkArchiveProjects,
  bulkAssignClient,
  bulkUpdateEquipmentStatus,
  bulkUpdateEquipmentCategory,
  bulkUpdateMaintenanceDate,
  bulkUpdateAircraftStatus,
  bulkUpdateOperatorStatus,
  bulkAssignRole,
  bulkUpdateIncidentStatus,
  bulkAssignInvestigator,
  bulkUpdateTrainingStatus,
  bulkUpdateCapaStatus,
  bulkAssignCapaOwner,
  bulkSoftDelete,
  bulkRestore,
  exportToJSON,
  exportToCSV
}
