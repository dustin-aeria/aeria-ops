/**
 * Permits & Certificates Data Operations
 * Store and track regulatory permits (SFOCs, CORs, airspace authorizations, etc.)
 *
 * @location src/lib/firestorePermits.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { uploadPermitDocument, deletePermitDocument } from './storageHelpers'

// ============================================
// COLLECTION REFERENCES
// ============================================

const permitsRef = collection(db, 'permits')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const PERMIT_TYPES = {
  sfoc: {
    label: 'Special Flight Operations Certificate',
    shortLabel: 'SFOC',
    authority: 'Transport Canada',
    icon: 'FileCheck'
  },
  cor: {
    label: 'Certificate of Registration',
    shortLabel: 'COR',
    authority: 'Transport Canada',
    icon: 'Award'
  },
  land_access: {
    label: 'Land Access Permit',
    shortLabel: 'Land Access',
    authority: 'Various',
    icon: 'MapPin'
  },
  airspace_auth: {
    label: 'Airspace Authorization',
    shortLabel: 'Airspace Auth',
    authority: 'NAV CANADA',
    icon: 'Navigation'
  },
  client_approval: {
    label: 'Client Approval',
    shortLabel: 'Client Approval',
    authority: 'Client',
    icon: 'UserCheck'
  },
  other: {
    label: 'Other Permit/Certificate',
    shortLabel: 'Other',
    authority: 'Various',
    icon: 'FileText'
  }
}

export const PERMIT_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', borderColor: 'border-green-500' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-500' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800', borderColor: 'border-red-500' },
  suspended: { label: 'Suspended', color: 'bg-gray-100 text-gray-800', borderColor: 'border-gray-500' }
}

export const OPERATION_TYPES = {
  bvlos: { label: 'BVLOS', description: 'Beyond Visual Line of Sight' },
  night: { label: 'Night Operations', description: 'Operations during night hours' },
  over_people: { label: 'Over People', description: 'Operations over people' },
  controlled_airspace: { label: 'Controlled Airspace', description: 'Operations in controlled airspace' },
  dangerous_goods: { label: 'Dangerous Goods', description: 'Transport of dangerous goods' },
  urban: { label: 'Urban Operations', description: 'Operations in urban environments' },
  swarm: { label: 'Swarm Operations', description: 'Multi-RPAS operations' }
}

export const CONDITION_CATEGORIES = {
  operational: { label: 'Operational', color: 'text-blue-600' },
  notification: { label: 'Notification', color: 'text-purple-600' },
  equipment: { label: 'Equipment', color: 'text-orange-600' },
  personnel: { label: 'Personnel', color: 'text-green-600' },
  reporting: { label: 'Reporting', color: 'text-cyan-600' }
}

export const EXPIRY_WARNING_DAYS = 30 // Warn 30 days before expiry

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate permit status based on expiry date
 */
export function calculatePermitStatus(permit) {
  // If manually suspended, keep that status
  if (permit.status === 'suspended') return 'suspended'

  // If no expiry date, it's active
  if (!permit.expiryDate) return 'active'

  const now = new Date()
  const expiryDate = permit.expiryDate?.toDate?.() || new Date(permit.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) return 'expiring_soon'
  return 'active'
}

/**
 * Get days until expiry (or days since expired if negative)
 */
export function getDaysUntilExpiry(permit) {
  if (!permit.expiryDate) return null

  const now = new Date()
  const expiryDate = permit.expiryDate?.toDate?.() || new Date(permit.expiryDate)
  return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
}

/**
 * Generate a unique ID for nested objects
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new permit
 */
export async function createPermit(permitData) {
  try {
    // Ensure nested arrays have IDs
    const privileges = (permitData.privileges || []).map(p => ({
      ...p,
      id: p.id || generateId()
    }))

    const conditions = (permitData.conditions || []).map(c => ({
      ...c,
      id: c.id || generateId()
    }))

    const notificationRequirements = (permitData.notificationRequirements || []).map(n => ({
      ...n,
      id: n.id || generateId()
    }))

    const newPermit = {
      ...permitData,
      privileges,
      conditions,
      notificationRequirements,
      documents: permitData.documents || [],
      aircraftRegistrations: permitData.aircraftRegistrations || [],
      operationTypes: permitData.operationTypes || [],
      tags: permitData.tags || [],
      status: calculatePermitStatus(permitData),
      renewalInfo: permitData.renewalInfo || {
        isRenewalRequired: true,
        renewalLeadDays: 60,
        renewalStatus: null
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(permitsRef, newPermit)
    return { id: docRef.id, ...newPermit }
  } catch (error) {
    console.error('Error creating permit:', error)
    throw error
  }
}

/**
 * Update a permit
 */
export async function updatePermit(permitId, updates) {
  try {
    const docRef = doc(permitsRef, permitId)

    // Recalculate status if expiry date changed
    if (updates.expiryDate !== undefined || updates.status === 'suspended') {
      updates.status = calculatePermitStatus({ ...updates, status: updates.status })
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: permitId, ...updates }
  } catch (error) {
    console.error('Error updating permit:', error)
    throw error
  }
}

/**
 * Get a permit by ID
 */
export async function getPermit(permitId) {
  try {
    const docRef = doc(permitsRef, permitId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
      id: snapshot.id,
      ...data,
      status: calculatePermitStatus(data)
    }
  } catch (error) {
    console.error('Error getting permit:', error)
    throw error
  }
}

/**
 * Get all permits for an organization
 */
export async function getPermits(organizationId, options = {}) {
  try {
    let q = query(
      permitsRef,
      where('organizationId', '==', organizationId)
    )

    // Add type filter if specified
    if (options.type) {
      q = query(q, where('type', '==', options.type))
    }

    const snapshot = await getDocs(q)
    let permits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: calculatePermitStatus(doc.data())
    }))

    // Apply status filter (must be done client-side since status is calculated)
    if (options.status) {
      permits = permits.filter(p => p.status === options.status)
    }

    // Sort by expiry date (soonest first)
    permits.sort((a, b) => {
      const aDate = a.expiryDate?.toDate?.() || new Date(a.expiryDate) || new Date('9999-12-31')
      const bDate = b.expiryDate?.toDate?.() || new Date(b.expiryDate) || new Date('9999-12-31')
      return aDate - bDate
    })

    return permits
  } catch (error) {
    console.error('Error getting permits:', error)
    throw error
  }
}

/**
 * Delete a permit
 */
export async function deletePermit(permitId) {
  try {
    // Get permit to find documents to delete
    const permit = await getPermit(permitId)

    // Delete associated documents from storage
    if (permit?.documents?.length > 0) {
      for (const doc of permit.documents) {
        if (doc.path) {
          try {
            await deletePermitDocument(doc.path)
          } catch (e) {
            console.warn('Failed to delete permit document:', e)
          }
        }
      }
    }

    const docRef = doc(permitsRef, permitId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting permit:', error)
    throw error
  }
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

/**
 * Add a document to a permit
 */
export async function addPermitDocument(permitId, file) {
  try {
    // Get current permit to get organizationId
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    // Upload file to storage
    const uploadResult = await uploadPermitDocument(file, permit.organizationId, permitId)

    // Get current documents
    const documents = permit.documents || []

    // Add new document
    documents.push({
      id: generateId(),
      ...uploadResult,
      uploadedAt: new Date().toISOString()
    })

    // Update permit
    await updatePermit(permitId, { documents })

    return uploadResult
  } catch (error) {
    console.error('Error adding permit document:', error)
    throw error
  }
}

/**
 * Remove a document from a permit
 */
export async function removePermitDocument(permitId, documentPath) {
  try {
    // Delete from storage
    await deletePermitDocument(documentPath)

    // Get current permit
    const permit = await getPermit(permitId)
    const documents = (permit.documents || []).filter(d => d.path !== documentPath)

    // Update permit
    await updatePermit(permitId, { documents })
  } catch (error) {
    console.error('Error removing permit document:', error)
    throw error
  }
}

// ============================================
// PRIVILEGES & CONDITIONS MANAGEMENT
// ============================================

/**
 * Add a privilege to a permit
 */
export async function addPermitPrivilege(permitId, privilege) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const privileges = permit.privileges || []
    privileges.push({
      id: generateId(),
      ...privilege
    })

    await updatePermit(permitId, { privileges })
    return privileges
  } catch (error) {
    console.error('Error adding permit privilege:', error)
    throw error
  }
}

/**
 * Update a privilege
 */
export async function updatePermitPrivilege(permitId, privilegeId, updates) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const privileges = (permit.privileges || []).map(p =>
      p.id === privilegeId ? { ...p, ...updates } : p
    )

    await updatePermit(permitId, { privileges })
    return privileges
  } catch (error) {
    console.error('Error updating permit privilege:', error)
    throw error
  }
}

/**
 * Remove a privilege
 */
export async function removePermitPrivilege(permitId, privilegeId) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const privileges = (permit.privileges || []).filter(p => p.id !== privilegeId)

    await updatePermit(permitId, { privileges })
    return privileges
  } catch (error) {
    console.error('Error removing permit privilege:', error)
    throw error
  }
}

/**
 * Add a condition to a permit
 */
export async function addPermitCondition(permitId, condition) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const conditions = permit.conditions || []
    conditions.push({
      id: generateId(),
      ...condition
    })

    await updatePermit(permitId, { conditions })
    return conditions
  } catch (error) {
    console.error('Error adding permit condition:', error)
    throw error
  }
}

/**
 * Update a condition
 */
export async function updatePermitCondition(permitId, conditionId, updates) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const conditions = (permit.conditions || []).map(c =>
      c.id === conditionId ? { ...c, ...updates } : c
    )

    await updatePermit(permitId, { conditions })
    return conditions
  } catch (error) {
    console.error('Error updating permit condition:', error)
    throw error
  }
}

/**
 * Remove a condition
 */
export async function removePermitCondition(permitId, conditionId) {
  try {
    const permit = await getPermit(permitId)
    if (!permit) throw new Error('Permit not found')

    const conditions = (permit.conditions || []).filter(c => c.id !== conditionId)

    await updatePermit(permitId, { conditions })
    return conditions
  } catch (error) {
    console.error('Error removing permit condition:', error)
    throw error
  }
}

// ============================================
// METRICS & REPORTING
// ============================================

/**
 * Get permit metrics for dashboard
 */
export async function getPermitMetrics(organizationId) {
  try {
    const permits = await getPermits(organizationId)

    let active = 0
    let expiringSoon = 0
    let expired = 0
    let suspended = 0
    const byType = {}

    for (const permit of permits) {
      const status = calculatePermitStatus(permit)

      if (status === 'active') active++
      else if (status === 'expiring_soon') expiringSoon++
      else if (status === 'expired') expired++
      else if (status === 'suspended') suspended++

      // Count by type
      byType[permit.type] = (byType[permit.type] || 0) + 1
    }

    // Get permits expiring soon (sorted by expiry date)
    const expiringPermits = permits
      .filter(p => calculatePermitStatus(p) === 'expiring_soon')
      .sort((a, b) => {
        const aDate = a.expiryDate?.toDate?.() || new Date(a.expiryDate)
        const bDate = b.expiryDate?.toDate?.() || new Date(b.expiryDate)
        return aDate - bDate
      })

    // Get expired permits
    const expiredPermits = permits
      .filter(p => calculatePermitStatus(p) === 'expired')

    return {
      totalPermits: permits.length,
      active,
      expiringSoon,
      expired,
      suspended,
      byType,
      expiringPermits,
      expiredPermits,
      complianceRate: permits.length > 0
        ? Math.round(((active + expiringSoon) / permits.length) * 100)
        : 100
    }
  } catch (error) {
    console.error('Error getting permit metrics:', error)
    throw error
  }
}

/**
 * Get permit expiry events for calendar
 */
export async function getPermitExpiryEvents(organizationId, daysAhead = 365) {
  try {
    const permits = await getPermits(organizationId)
    const events = []
    const now = new Date()
    const futureLimit = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    for (const permit of permits) {
      if (!permit.expiryDate) continue

      const expiryDate = permit.expiryDate?.toDate?.() || new Date(permit.expiryDate)

      // Include if expiry is in the future (or recently past for showing expired)
      if (expiryDate <= futureLimit) {
        const status = calculatePermitStatus(permit)
        const daysUntil = getDaysUntilExpiry(permit)

        events.push({
          id: `permit-expiry-${permit.id}`,
          title: `${permit.name} expires`,
          subtitle: PERMIT_TYPES[permit.type]?.shortLabel || permit.type,
          date: expiryDate,
          type: 'permit_expiry',
          source: 'permit',
          sourceId: permit.id,
          status,
          details: {
            permitType: permit.type,
            permitNumber: permit.permitNumber,
            issuingAuthority: permit.issuingAuthority,
            daysUntil
          }
        })
      }
    }

    return events
  } catch (error) {
    console.error('Error getting permit expiry events:', error)
    throw error
  }
}

/**
 * Get permit summary for compliance reports
 */
export async function getPermitSummary(organizationId) {
  try {
    const permits = await getPermits(organizationId)

    return permits.map(permit => ({
      id: permit.id,
      name: permit.name,
      type: permit.type,
      typeLabel: PERMIT_TYPES[permit.type]?.label || permit.type,
      permitNumber: permit.permitNumber,
      issuingAuthority: permit.issuingAuthority,
      effectiveDate: permit.effectiveDate,
      expiryDate: permit.expiryDate,
      status: calculatePermitStatus(permit),
      daysUntilExpiry: getDaysUntilExpiry(permit),
      privilegeCount: permit.privileges?.length || 0,
      conditionCount: permit.conditions?.length || 0,
      hasDocuments: (permit.documents?.length || 0) > 0
    }))
  } catch (error) {
    console.error('Error getting permit summary:', error)
    throw error
  }
}

/**
 * Search permits by text
 */
export async function searchPermits(organizationId, searchQuery) {
  try {
    const permits = await getPermits(organizationId)
    const query = searchQuery.toLowerCase()

    return permits.filter(permit =>
      permit.name?.toLowerCase().includes(query) ||
      permit.permitNumber?.toLowerCase().includes(query) ||
      permit.issuingAuthority?.toLowerCase().includes(query) ||
      permit.geographicArea?.toLowerCase().includes(query) ||
      permit.notes?.toLowerCase().includes(query) ||
      permit.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  } catch (error) {
    console.error('Error searching permits:', error)
    throw error
  }
}

export default {
  // CRUD
  createPermit,
  updatePermit,
  getPermit,
  getPermits,
  deletePermit,

  // Documents
  addPermitDocument,
  removePermitDocument,

  // Privileges & Conditions
  addPermitPrivilege,
  updatePermitPrivilege,
  removePermitPrivilege,
  addPermitCondition,
  updatePermitCondition,
  removePermitCondition,

  // Metrics
  getPermitMetrics,
  getPermitExpiryEvents,
  getPermitSummary,
  searchPermits,

  // Helpers
  calculatePermitStatus,
  getDaysUntilExpiry,

  // Constants
  PERMIT_TYPES,
  PERMIT_STATUS,
  OPERATION_TYPES,
  CONDITION_CATEGORIES,
  EXPIRY_WARNING_DAYS
}
