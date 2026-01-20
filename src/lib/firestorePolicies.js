/**
 * firestorePolicies.js
 * Enhanced policy management Firestore functions
 *
 * Features:
 * - Version control with automatic snapshots
 * - Acknowledgment tracking with signatures
 * - Custom category management
 * - Default template system
 * - Role-based permissions
 *
 * @location src/lib/firestorePolicies.js
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
  limit,
  serverTimestamp,
  runTransaction,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// COLLECTION REFERENCES
// ============================================

const policiesRef = collection(db, 'policies')
const policyVersionsRef = collection(db, 'policyVersions')
const policyAcknowledgmentsRef = collection(db, 'policyAcknowledgments')
const policyCategoriesRef = collection(db, 'policyCategories')

// ============================================
// DEFAULT CATEGORY DEFINITIONS
// ============================================

export const DEFAULT_CATEGORIES = [
  {
    id: 'rpas',
    name: 'RPAS Operations',
    description: 'Policies governing remotely piloted aircraft system operations',
    icon: 'Plane',
    color: 'blue',
    numberRange: { start: 1001, end: 1999 },
    isDefault: true,
    isActive: true,
    order: 0
  },
  {
    id: 'crm',
    name: 'Crew Resource Management',
    description: 'Policies for crew coordination, communication, and decision making',
    icon: 'Users',
    color: 'purple',
    numberRange: { start: 2001, end: 2999 },
    isDefault: true,
    isActive: true,
    order: 1
  },
  {
    id: 'hse',
    name: 'Health, Safety & Environment',
    description: 'Workplace health, safety, and environmental protection policies',
    icon: 'HardHat',
    color: 'green',
    numberRange: { start: 3001, end: 3999 },
    isDefault: true,
    isActive: true,
    order: 2
  }
]

// ============================================
// POLICY CATEGORIES
// ============================================

/**
 * Get all policy categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories() {
  const q = query(policyCategoriesRef, orderBy('order', 'asc'))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    // Return default categories if none exist in Firestore
    return DEFAULT_CATEGORIES
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>}
 */
export async function getCategory(id) {
  const docRef = doc(db, 'policyCategories', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    // Check default categories
    const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === id)
    if (defaultCat) return defaultCat
    throw new Error('Category not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new custom category
 * @param {Object} data - Category data
 * @returns {Promise<Object>}
 */
export async function createCategory(data) {
  // Get existing categories to determine next order and number range
  const existingCategories = await getCategories()
  const maxOrder = Math.max(...existingCategories.map(c => c.order), -1)
  const maxRangeEnd = Math.max(...existingCategories.map(c => c.numberRange?.end || 0), 3999)

  const category = {
    name: data.name,
    description: data.description || '',
    icon: data.icon || 'FolderOpen',
    color: data.color || 'gray',
    numberRange: {
      start: maxRangeEnd + 1,
      end: maxRangeEnd + 1000
    },
    isDefault: false,
    isActive: true,
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null
  }

  const docRef = await addDoc(policyCategoriesRef, category)
  return { id: docRef.id, ...category }
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} data - Updated data
 */
export async function updateCategory(id, data) {
  const docRef = doc(db, 'policyCategories', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a custom category (not allowed for default categories)
 * @param {string} id - Category ID
 */
export async function deleteCategory(id) {
  // Check if it's a default category
  if (DEFAULT_CATEGORIES.some(c => c.id === id)) {
    throw new Error('Cannot delete default categories')
  }

  // Check if any policies use this category
  const policiesQuery = query(policiesRef, where('category', '==', id))
  const policiesSnapshot = await getDocs(policiesQuery)

  if (!policiesSnapshot.empty) {
    throw new Error('Cannot delete category with existing policies')
  }

  const docRef = doc(db, 'policyCategories', id)
  await deleteDoc(docRef)
}

/**
 * Seed default categories to Firestore
 * @returns {Promise<void>}
 */
export async function seedDefaultCategories() {
  const batch = writeBatch(db)

  for (const category of DEFAULT_CATEGORIES) {
    const docRef = doc(db, 'policyCategories', category.id)
    batch.set(docRef, {
      ...category,
      createdAt: serverTimestamp()
    }, { merge: true })
  }

  await batch.commit()
}

/**
 * Get next available policy number for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<string>}
 */
export async function getNextPolicyNumber(categoryId) {
  const category = await getCategory(categoryId)
  const range = category.numberRange || { start: 1001, end: 1999 }

  // Get all policies in category
  const q = query(policiesRef, where('category', '==', categoryId))
  const snapshot = await getDocs(q)

  // Find highest number in range
  let maxNumber = range.start - 1
  snapshot.docs.forEach(doc => {
    const num = parseInt(doc.data().number, 10)
    if (!isNaN(num) && num >= range.start && num <= range.end && num > maxNumber) {
      maxNumber = num
    }
  })

  const nextNumber = maxNumber + 1
  if (nextNumber > range.end) {
    throw new Error(`Category number range exhausted (${range.start}-${range.end})`)
  }

  return String(nextNumber)
}

// ============================================
// POLICY VERSION MANAGEMENT
// ============================================

/**
 * Create a version snapshot of a policy
 * @param {string} policyId - Policy ID
 * @param {Object} policyData - Full policy data to snapshot
 * @param {string} versionNotes - Description of changes
 * @param {string} createdBy - User ID
 * @returns {Promise<Object>}
 */
export async function createPolicyVersion(policyId, policyData, versionNotes = '', createdBy = null) {
  const version = {
    policyId,
    version: policyData.version || '1.0',
    content: policyData.content || '',
    sections: policyData.sections || [],
    title: policyData.title,
    description: policyData.description,
    versionNotes,
    changedFields: [],
    previousVersionId: policyData.previousVersionId || null,
    createdAt: serverTimestamp(),
    createdBy
  }

  const docRef = await addDoc(policyVersionsRef, version)
  return { id: docRef.id, ...version }
}

/**
 * Get all versions of a policy
 * @param {string} policyId - Policy ID
 * @returns {Promise<Array>}
 */
export async function getPolicyVersions(policyId) {
  const q = query(
    policyVersionsRef,
    where('policyId', '==', policyId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a specific version
 * @param {string} versionId - Version ID
 * @returns {Promise<Object>}
 */
export async function getPolicyVersion(versionId) {
  const docRef = doc(db, 'policyVersions', versionId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Version not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Rollback policy to a previous version
 * Creates a new version that restores the old content
 * @param {string} policyId - Policy ID
 * @param {string} versionId - Version ID to restore
 * @param {string} userId - User performing the rollback
 * @returns {Promise<Object>} Updated policy
 */
export async function rollbackToVersion(policyId, versionId, userId = null) {
  return await runTransaction(db, async (transaction) => {
    const policyRef = doc(db, 'policies', policyId)
    const versionRef = doc(db, 'policyVersions', versionId)

    const [policySnap, versionSnap] = await Promise.all([
      transaction.get(policyRef),
      transaction.get(versionRef)
    ])

    if (!policySnap.exists()) {
      throw new Error('Policy not found')
    }

    if (!versionSnap.exists()) {
      throw new Error('Version not found')
    }

    const currentPolicy = policySnap.data()
    const oldVersion = versionSnap.data()

    // Calculate new version number (increment major)
    const currentVersionParts = (currentPolicy.version || '1.0').split('.')
    const newMajor = parseInt(currentVersionParts[0]) + 1
    const newVersion = `${newMajor}.0`

    // Create version snapshot of current state before rollback
    const versionSnapshot = {
      policyId,
      version: currentPolicy.version,
      content: currentPolicy.content || '',
      sections: currentPolicy.sections || [],
      title: currentPolicy.title,
      description: currentPolicy.description,
      versionNotes: `Auto-saved before rollback to version ${oldVersion.version}`,
      changedFields: [],
      previousVersionId: null,
      createdAt: serverTimestamp(),
      createdBy: userId
    }

    const newVersionRef = doc(policyVersionsRef)
    transaction.set(newVersionRef, versionSnapshot)

    // Update policy with old version content
    transaction.update(policyRef, {
      content: oldVersion.content || '',
      sections: oldVersion.sections || [],
      version: newVersion,
      versionNotes: `Restored from version ${oldVersion.version}`,
      previousVersionId: newVersionRef.id,
      isLatest: true,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return {
      id: policyId,
      ...currentPolicy,
      content: oldVersion.content,
      sections: oldVersion.sections,
      version: newVersion
    }
  })
}

/**
 * Increment version number
 * @param {string} currentVersion - Current version string (e.g., "1.2")
 * @param {string} type - 'major' or 'minor'
 * @returns {string}
 */
export function incrementVersion(currentVersion, type = 'minor') {
  const parts = (currentVersion || '1.0').split('.')
  const major = parseInt(parts[0]) || 1
  const minor = parseInt(parts[1]) || 0

  if (type === 'major') {
    return `${major + 1}.0`
  }
  return `${major}.${minor + 1}`
}

/**
 * Compare two policies to find changed fields
 * @param {Object} oldPolicy - Original policy
 * @param {Object} newPolicy - Updated policy
 * @returns {Array<string>} List of changed field names
 */
export function findChangedFields(oldPolicy, newPolicy) {
  const compareFields = ['title', 'description', 'content', 'sections', 'owner', 'status']
  const changed = []

  for (const field of compareFields) {
    const oldVal = JSON.stringify(oldPolicy[field])
    const newVal = JSON.stringify(newPolicy[field])
    if (oldVal !== newVal) {
      changed.push(field)
    }
  }

  return changed
}

// ============================================
// POLICY ACKNOWLEDGMENTS
// ============================================

/**
 * Create an acknowledgment record
 * @param {Object} data - Acknowledgment data
 * @returns {Promise<Object>}
 */
export async function createAcknowledgment(data) {
  const acknowledgment = {
    policyId: data.policyId,
    policyVersion: data.policyVersion,
    userId: data.userId,
    userName: data.userName || '',
    userRole: data.userRole || '',
    acknowledgedAt: serverTimestamp(),
    signatureType: data.signatureType || 'checkbox', // checkbox | typed | drawn
    signatureData: data.signatureData || null,
    expiresAt: data.expiresAt || null,
    isValid: true
  }

  const docRef = await addDoc(policyAcknowledgmentsRef, acknowledgment)
  return { id: docRef.id, ...acknowledgment }
}

/**
 * Get all acknowledgments for a policy
 * @param {string} policyId - Policy ID
 * @returns {Promise<Array>}
 */
export async function getAcknowledgments(policyId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    orderBy('acknowledgedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get all acknowledgments for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getUserAcknowledgments(userId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('userId', '==', userId),
    orderBy('acknowledgedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get pending acknowledgments for a user
 * Checks which policies require acknowledgment that user hasn't acknowledged
 * @param {string} userId - User ID
 * @param {string} userRole - User's role
 * @returns {Promise<Array>}
 */
export async function getPendingAcknowledgments(userId, userRole) {
  // Get all policies that require acknowledgment
  const policiesQuery = query(
    policiesRef,
    where('acknowledgmentSettings.required', '==', true),
    where('status', '==', 'active')
  )
  const policiesSnapshot = await getDocs(policiesQuery)
  const requiredPolicies = policiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Get user's existing acknowledgments
  const userAcks = await getUserAcknowledgments(userId)
  const acknowledgedPolicyIds = new Set(
    userAcks
      .filter(ack => ack.isValid)
      .map(ack => `${ack.policyId}:${ack.policyVersion}`)
  )

  // Filter to policies user needs to acknowledge
  const pending = requiredPolicies.filter(policy => {
    // Check if user's role is in required roles
    const requiredRoles = policy.acknowledgmentSettings?.requiredRoles || []
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return false
    }

    // Check if already acknowledged current version
    const key = `${policy.id}:${policy.version}`
    return !acknowledgedPolicyIds.has(key)
  })

  return pending
}

/**
 * Check if a user has acknowledged a specific policy version
 * @param {string} policyId - Policy ID
 * @param {string} policyVersion - Policy version
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Acknowledgment record or null
 */
export async function checkAcknowledgmentStatus(policyId, policyVersion, userId) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', policyVersion),
    where('userId', '==', userId),
    where('isValid', '==', true),
    limit(1)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) return null

  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

/**
 * Invalidate acknowledgments when policy is updated to new version
 * @param {string} policyId - Policy ID
 * @param {string} oldVersion - Previous version
 */
export async function invalidateOldAcknowledgments(policyId, oldVersion) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', oldVersion),
    where('isValid', '==', true)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isValid: false })
  })

  await batch.commit()
}

/**
 * Get acknowledgment statistics for a policy
 * @param {string} policyId - Policy ID
 * @param {string} policyVersion - Policy version
 * @returns {Promise<Object>}
 */
export async function getAcknowledgmentStats(policyId, policyVersion) {
  const q = query(
    policyAcknowledgmentsRef,
    where('policyId', '==', policyId),
    where('policyVersion', '==', policyVersion),
    where('isValid', '==', true)
  )

  const snapshot = await getDocs(q)
  const acknowledgments = snapshot.docs.map(doc => doc.data())

  return {
    total: acknowledgments.length,
    byRole: acknowledgments.reduce((acc, ack) => {
      const role = ack.userRole || 'unknown'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
  }
}

// ============================================
// ENHANCED POLICY CRUD
// ============================================

/**
 * Create a new policy with full schema support
 * @param {Object} data - Policy data
 * @returns {Promise<Object>}
 */
export async function createPolicyEnhanced(data) {
  const policy = {
    // Core metadata
    number: data.number || '',
    title: data.title || '',
    category: data.category || 'rpas',
    description: data.description || '',

    // Source & Type
    type: data.type || 'custom', // default | custom
    isTemplate: data.isTemplate || false,
    derivedFrom: data.derivedFrom || null,

    // Versioning
    version: data.version || '1.0',
    versionNotes: data.versionNotes || 'Initial version',
    previousVersionId: null,
    isLatest: true,

    // Lifecycle
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    reviewDate: data.reviewDate || '',
    lastReviewedDate: null,
    retiredDate: null,

    // Ownership & Status
    owner: data.owner || '',
    status: data.status || 'draft', // draft | pending_review | pending_approval | active | retired

    // Content
    content: data.content || '', // Rich text/markdown content
    sections: (data.sections || []).map((section, index) => {
      if (typeof section === 'string') {
        return { id: `section_${index}`, title: section, content: '', order: index }
      }
      return {
        id: section.id || `section_${index}`,
        title: section.title || section,
        content: section.content || '',
        order: section.order ?? index
      }
    }),

    // Search & Organization
    keywords: data.keywords || [],
    relatedPolicies: data.relatedPolicies || [],
    regulatoryRefs: data.regulatoryRefs || [],

    // Attachments
    attachments: data.attachments || [],

    // Permissions
    permissions: data.permissions || {
      viewRoles: [], // Empty = all roles can view
      editRoles: ['admin', 'policy_editor'],
      approveRoles: ['admin', 'policy_approver']
    },

    // Acknowledgment settings
    acknowledgmentSettings: data.acknowledgmentSettings || {
      required: false,
      requiredRoles: [],
      deadline: null,
      reacknowledgmentPeriod: null, // days (365 = annual)
      signatureRequired: false,
      signatureType: 'checkbox'
    },

    // Audit trail
    createdAt: serverTimestamp(),
    createdBy: data.createdBy || null,
    updatedAt: serverTimestamp(),
    updatedBy: data.createdBy || null,

    // Organization reference (for multi-tenant future)
    organizationId: data.organizationId || 'default'
  }

  const docRef = await addDoc(policiesRef, policy)

  // Create initial version snapshot
  await createPolicyVersion(docRef.id, policy, 'Initial version', data.createdBy)

  return { id: docRef.id, ...policy }
}

/**
 * Update a policy with version management
 * @param {string} id - Policy ID
 * @param {Object} data - Updated data
 * @param {Object} options - Update options
 * @returns {Promise<Object>}
 */
export async function updatePolicyEnhanced(id, data, options = {}) {
  const { createNewVersion = false, versionType = 'minor', versionNotes = '', userId = null } = options

  return await runTransaction(db, async (transaction) => {
    const policyRef = doc(db, 'policies', id)
    const policySnap = await transaction.get(policyRef)

    if (!policySnap.exists()) {
      throw new Error('Policy not found')
    }

    const currentPolicy = policySnap.data()
    let updatedData = { ...data }

    if (createNewVersion) {
      // Check what fields changed
      const changedFields = findChangedFields(currentPolicy, data)

      if (changedFields.length > 0) {
        // Create version snapshot of current state
        const versionSnapshot = {
          policyId: id,
          version: currentPolicy.version,
          content: currentPolicy.content || '',
          sections: currentPolicy.sections || [],
          title: currentPolicy.title,
          description: currentPolicy.description,
          versionNotes: `Snapshot before update to ${incrementVersion(currentPolicy.version, versionType)}`,
          changedFields,
          previousVersionId: currentPolicy.previousVersionId || null,
          createdAt: serverTimestamp(),
          createdBy: userId
        }

        const versionRef = doc(policyVersionsRef)
        transaction.set(versionRef, versionSnapshot)

        // Update version number
        updatedData.version = incrementVersion(currentPolicy.version, versionType)
        updatedData.versionNotes = versionNotes
        updatedData.previousVersionId = versionRef.id

        // Optionally invalidate old acknowledgments
        // (handled separately as it's async)
      }
    }

    // Transform sections if needed
    if (updatedData.sections) {
      updatedData.sections = updatedData.sections.map((section, index) => {
        if (typeof section === 'string') {
          return { id: `section_${index}`, title: section, content: '', order: index }
        }
        return {
          id: section.id || `section_${index}`,
          title: section.title || section,
          content: section.content || '',
          order: section.order ?? index
        }
      })
    }

    transaction.update(policyRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    })

    return { id, ...currentPolicy, ...updatedData }
  })
}

/**
 * Get all policies with optional filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export async function getPoliciesEnhanced(filters = {}) {
  let q = policiesRef
  const constraints = []

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }

  if (filters.status) {
    constraints.push(where('status', '==', filters.status))
  }

  if (filters.type) {
    constraints.push(where('type', '==', filters.type))
  }

  if (filters.isTemplate !== undefined) {
    constraints.push(where('isTemplate', '==', filters.isTemplate))
  }

  constraints.push(orderBy('number', 'asc'))

  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  q = query(policiesRef, ...constraints)

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get default template policies
 * @returns {Promise<Array>}
 */
export async function getDefaultPolicies() {
  return getPoliciesEnhanced({ type: 'default', isTemplate: true })
}

/**
 * Adopt a template policy
 * Creates a new custom policy derived from the template
 * @param {string} templateId - Template policy ID
 * @param {Object} customizations - Custom values to override
 * @param {string} userId - User creating the policy
 * @returns {Promise<Object>}
 */
export async function adoptTemplate(templateId, customizations = {}, userId = null) {
  const template = await getPolicy(templateId)

  if (!template) {
    throw new Error('Template not found')
  }

  // Get next number for category
  const nextNumber = await getNextPolicyNumber(customizations.category || template.category)

  const newPolicy = {
    ...template,
    id: undefined,
    number: nextNumber,
    type: 'custom',
    isTemplate: false,
    derivedFrom: templateId,
    status: 'draft',
    version: '1.0',
    versionNotes: `Created from template: ${template.title}`,
    previousVersionId: null,
    isLatest: true,
    createdBy: userId,
    ...customizations
  }

  // Remove template-specific fields
  delete newPolicy.id
  delete newPolicy.createdAt
  delete newPolicy.updatedAt

  return createPolicyEnhanced(newPolicy)
}

/**
 * Get policy by ID (enhanced)
 * @param {string} id - Policy ID
 * @returns {Promise<Object>}
 */
export async function getPolicy(id) {
  const docRef = doc(db, 'policies', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Policy not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Delete a policy and its versions
 * @param {string} id - Policy ID
 */
export async function deletePolicyEnhanced(id) {
  // Delete all versions
  const versionsQuery = query(policyVersionsRef, where('policyId', '==', id))
  const versionsSnapshot = await getDocs(versionsQuery)

  const batch = writeBatch(db)

  versionsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  // Delete policy
  const policyRef = doc(db, 'policies', id)
  batch.delete(policyRef)

  await batch.commit()
}

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if a user can view a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canViewPolicy(policy, user) {
  if (!policy.permissions?.viewRoles?.length) {
    return true // No restrictions = everyone can view
  }
  return policy.permissions.viewRoles.includes(user.role) || user.role === 'admin'
}

/**
 * Check if a user can edit a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canEditPolicy(policy, user) {
  if (user.role === 'admin') return true
  if (user.policyPermissions?.canEdit) return true
  return policy.permissions?.editRoles?.includes(user.role)
}

/**
 * Check if a user can approve a policy
 * @param {Object} policy - Policy object
 * @param {Object} user - User object with role
 * @returns {boolean}
 */
export function canApprovePolicy(policy, user) {
  if (user.role === 'admin') return true
  if (user.policyPermissions?.canApprove) return true
  return policy.permissions?.approveRoles?.includes(user.role)
}

/**
 * Check if a user can manage categories
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageCategories(user) {
  return user.role === 'admin' || user.policyPermissions?.canManageCategories
}

/**
 * Check if a user can manage default templates
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canManageDefaults(user) {
  return user.role === 'admin' || user.policyPermissions?.canManageDefaults
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Submit policy for review
 * @param {string} id - Policy ID
 * @param {string} userId - User submitting
 */
export async function submitForReview(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'pending_review',
    submittedForReviewAt: serverTimestamp(),
    submittedForReviewBy: userId,
    updatedAt: serverTimestamp()
  })
}

/**
 * Submit policy for approval
 * @param {string} id - Policy ID
 * @param {string} userId - User submitting
 * @param {string} reviewNotes - Optional review notes
 */
export async function submitForApproval(id, userId, reviewNotes = '') {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'pending_approval',
    lastReviewedDate: new Date().toISOString().split('T')[0],
    reviewedBy: userId,
    reviewNotes,
    updatedAt: serverTimestamp()
  })
}

/**
 * Approve and publish a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User approving
 */
export async function approvePolicy(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'active',
    approvedBy: userId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

/**
 * Reject a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User rejecting
 * @param {string} reason - Rejection reason
 */
export async function rejectPolicy(id, userId, reason = '') {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'draft',
    rejectedBy: userId,
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  })
}

/**
 * Retire a policy
 * @param {string} id - Policy ID
 * @param {string} userId - User retiring
 */
export async function retirePolicy(id, userId) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    status: 'retired',
    retiredDate: new Date().toISOString().split('T')[0],
    retiredBy: userId,
    updatedAt: serverTimestamp()
  })
}
