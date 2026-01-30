/**
 * Aeria Ops - Training Management Data Operations
 * Firestore functions for training courses, records, and compliance tracking
 *
 * COR Element 3: Training & Instruction of Workers (10-15% weight)
 * Required for COR certification compliance - tracks what, when, where, by whom
 *
 * @version 1.0.0
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
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// ERROR HANDLING HELPER
// ============================================

async function withErrorHandling(operation, operationName) {
  try {
    return await operation()
  } catch (error) {
    const enhancedError = new Error(`${operationName} failed: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.operationName = operationName
    throw enhancedError
  }
}

// ============================================
// COLLECTION REFERENCES
// ============================================

const trainingCoursesRef = collection(db, 'trainingCourses')
const trainingRecordsRef = collection(db, 'trainingRecords')
const trainingMatrixRef = collection(db, 'trainingMatrix')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const TRAINING_CATEGORIES = {
  safety: { label: 'Safety', color: 'bg-red-100 text-red-800', icon: 'Shield' },
  regulatory: { label: 'Regulatory', color: 'bg-blue-100 text-blue-800', icon: 'FileText' },
  equipment: { label: 'Equipment', color: 'bg-purple-100 text-purple-800', icon: 'Wrench' },
  emergency: { label: 'Emergency Response', color: 'bg-orange-100 text-orange-800', icon: 'AlertTriangle' },
  specialized: { label: 'Specialized', color: 'bg-green-100 text-green-800', icon: 'Award' },
  orientation: { label: 'Orientation', color: 'bg-yellow-100 text-yellow-800', icon: 'Users' },
  refresher: { label: 'Refresher', color: 'bg-gray-100 text-gray-800', icon: 'RefreshCw' }
}

export const TRAINING_STATUS = {
  current: { label: 'Current', color: 'bg-green-100 text-green-800' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' }
}

export const COMPETENCY_STATUS = {
  not_verified: { label: 'Not Verified', color: 'bg-gray-100 text-gray-800' },
  verified: { label: 'Verified Competent', color: 'bg-green-100 text-green-800' },
  requires_supervision: { label: 'Requires Supervision', color: 'bg-yellow-100 text-yellow-800' },
  not_competent: { label: 'Not Competent', color: 'bg-red-100 text-red-800' }
}

// COR-specific requirements
export const COR_TRAINING_REQUIREMENTS = {
  expiryWarningDays: 30, // Warn 30 days before expiry
  criticalExpiryDays: 7, // Critical warning 7 days before
  recordRetentionYears: 3, // Keep records for at least 3 years
  requiredFields: ['courseName', 'completionDate', 'provider', 'instructor', 'location', 'duration']
}

// Default training courses for RPAS operations
export const DEFAULT_TRAINING_COURSES = [
  {
    courseCode: 'RPAS-001',
    name: 'Basic RPAS Pilot Certificate',
    category: 'regulatory',
    provider: 'Transport Canada Approved',
    duration: 24,
    validityPeriod: 0, // Never expires (but recency required)
    description: 'Transport Canada Basic RPAS pilot certification'
  },
  {
    courseCode: 'RPAS-002',
    name: 'Advanced RPAS Pilot Certificate',
    category: 'regulatory',
    provider: 'Transport Canada Approved',
    duration: 40,
    validityPeriod: 0,
    description: 'Transport Canada Advanced RPAS pilot certification'
  },
  {
    courseCode: 'RPAS-003',
    name: 'Flight Review',
    category: 'regulatory',
    provider: 'Internal',
    duration: 2,
    validityPeriod: 24, // 24 months
    description: 'Recency flight review as per CARs 901.57'
  },
  {
    courseCode: 'HSE-001',
    name: 'Workplace Health & Safety Orientation',
    category: 'orientation',
    provider: 'Internal',
    duration: 4,
    validityPeriod: 12,
    description: 'General workplace health and safety orientation'
  },
  {
    courseCode: 'HSE-002',
    name: 'WHMIS Training',
    category: 'safety',
    provider: 'Internal/External',
    duration: 2,
    validityPeriod: 36,
    description: 'Workplace Hazardous Materials Information System'
  },
  {
    courseCode: 'HSE-003',
    name: 'First Aid - Level 1',
    category: 'emergency',
    provider: 'External',
    duration: 8,
    validityPeriod: 36,
    description: 'Occupational First Aid Level 1'
  },
  {
    courseCode: 'HSE-004',
    name: 'First Aid - Level 2',
    category: 'emergency',
    provider: 'External',
    duration: 16,
    validityPeriod: 36,
    description: 'Occupational First Aid Level 2'
  },
  {
    courseCode: 'HSE-005',
    name: 'Emergency Response Procedures',
    category: 'emergency',
    provider: 'Internal',
    duration: 2,
    validityPeriod: 12,
    description: 'Site-specific emergency response procedures'
  },
  {
    courseCode: 'EQP-001',
    name: 'Aircraft Type Rating',
    category: 'equipment',
    provider: 'Internal',
    duration: 4,
    validityPeriod: 12,
    description: 'Specific aircraft type familiarization and competency'
  },
  {
    courseCode: 'EQP-002',
    name: 'Payload Operations',
    category: 'equipment',
    provider: 'Internal',
    duration: 4,
    validityPeriod: 12,
    description: 'Payload operation and data collection procedures'
  },
  {
    courseCode: 'JHSC-001',
    name: 'JHSC Member Training',
    category: 'safety',
    provider: 'External',
    duration: 8,
    validityPeriod: 0,
    description: 'Joint Health & Safety Committee member certification'
  },
  {
    courseCode: 'COR-001',
    name: 'Internal Auditor Training',
    category: 'specialized',
    provider: 'Certifying Partner',
    duration: 14,
    validityPeriod: 36,
    description: 'COR Internal Auditor certification (minimum 14 hours)'
  }
]

// ============================================
// COURSE OPERATIONS
// ============================================

/**
 * Create a new training course
 */
export async function createCourse(courseData) {
  return withErrorHandling(async () => {
    const newCourse = {
      ...courseData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(trainingCoursesRef, newCourse)
    return { id: docRef.id, ...newCourse }
  }, 'createCourse')
}

/**
 * Update a course
 */
export async function updateCourse(courseId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingCoursesRef, courseId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: courseId, ...updates }
  }, 'updateCourse')
}

/**
 * Get a course by ID
 */
export async function getCourse(courseId) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingCoursesRef, courseId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getCourse')
}

/**
 * Get all courses for an operator
 */
export async function getCourses(organizationId, options = {}) {
  return withErrorHandling(async () => {
    const { category, activeOnly = true } = options

    let q = query(
      trainingCoursesRef,
      where('organizationId', '==', organizationId),
      orderBy('courseCode')
    )

    if (category) {
      q = query(
        trainingCoursesRef,
        where('organizationId', '==', organizationId),
        where('category', '==', category),
        orderBy('courseCode')
      )
    }

    const snapshot = await getDocs(q)
    let courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (activeOnly) {
      courses = courses.filter(c => c.isActive !== false)
    }

    return courses
  }, 'getCourses')
}

/**
 * Deactivate a course (soft delete)
 */
export async function deactivateCourse(courseId) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingCoursesRef, courseId)
    await updateDoc(docRef, {
      isActive: false,
      deactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'deactivateCourse')
}

/**
 * Seed default courses for a new operator
 */
export async function seedDefaultCourses(organizationId) {
  return withErrorHandling(async () => {
    const batch = writeBatch(db)
    const createdCourses = []

    for (const course of DEFAULT_TRAINING_COURSES) {
      const docRef = doc(trainingCoursesRef)
      const courseData = {
        ...course,
        organizationId,
        isActive: true,
        isDefault: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      batch.set(docRef, courseData)
      createdCourses.push({ id: docRef.id, ...courseData })
    }

    await batch.commit()
    return createdCourses
  }, 'seedDefaultCourses')
}

// ============================================
// TRAINING RECORD OPERATIONS
// ============================================

/**
 * Create a training record
 */
export async function createTrainingRecord(recordData) {
  return withErrorHandling(async () => {
    // Calculate expiry date if course has validity period
    let expiryDate = null
    if (recordData.validityPeriod && recordData.validityPeriod > 0 && recordData.completionDate) {
      const completionDate = recordData.completionDate?.toDate?.()
        || new Date(recordData.completionDate)
      expiryDate = new Date(completionDate)
      expiryDate.setMonth(expiryDate.getMonth() + recordData.validityPeriod)
    }

    const newRecord = {
      ...recordData,
      expiryDate: expiryDate ? Timestamp.fromDate(expiryDate) : null,
      competencyStatus: recordData.competencyStatus || 'not_verified',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(trainingRecordsRef, newRecord)
    return { id: docRef.id, ...newRecord }
  }, 'createTrainingRecord')
}

/**
 * Update a training record
 */
export async function updateTrainingRecord(recordId, updates) {
  return withErrorHandling(async () => {
    // Recalculate expiry date if completion date or validity period changed
    if (updates.completionDate && updates.validityPeriod) {
      const completionDate = updates.completionDate?.toDate?.()
        || new Date(updates.completionDate)
      const expiryDate = new Date(completionDate)
      expiryDate.setMonth(expiryDate.getMonth() + updates.validityPeriod)
      updates.expiryDate = Timestamp.fromDate(expiryDate)
    }

    const docRef = doc(trainingRecordsRef, recordId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: recordId, ...updates }
  }, 'updateTrainingRecord')
}

/**
 * Get a training record by ID
 */
export async function getTrainingRecord(recordId) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingRecordsRef, recordId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getTrainingRecord')
}

/**
 * Get training records for a crew member
 */
export async function getTrainingRecordsForCrewMember(organizationId, crewMemberId) {
  return withErrorHandling(async () => {
    const q = query(
      trainingRecordsRef,
      where('organizationId', '==', organizationId),
      where('crewMemberId', '==', crewMemberId),
      orderBy('completionDate', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: calculateTrainingStatus(doc.data())
    }))
  }, 'getTrainingRecordsForCrewMember')
}

/**
 * Get training records for a course
 */
export async function getTrainingRecordsForCourse(organizationId, courseId) {
  return withErrorHandling(async () => {
    const q = query(
      trainingRecordsRef,
      where('organizationId', '==', organizationId),
      where('courseId', '==', courseId),
      orderBy('completionDate', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: calculateTrainingStatus(doc.data())
    }))
  }, 'getTrainingRecordsForCourse')
}

/**
 * Get all training records for an operator
 */
export async function getAllTrainingRecords(organizationId, options = {}) {
  return withErrorHandling(async () => {
    const { limitCount = 500 } = options

    const q = query(
      trainingRecordsRef,
      where('organizationId', '==', organizationId),
      orderBy('completionDate', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: calculateTrainingStatus(doc.data())
    }))
  }, 'getAllTrainingRecords')
}

/**
 * Delete a training record
 */
export async function deleteTrainingRecord(recordId) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingRecordsRef, recordId)
    await deleteDoc(docRef)
  }, 'deleteTrainingRecord')
}

/**
 * Calculate training status based on expiry date
 */
export function calculateTrainingStatus(record) {
  if (!record.expiryDate) {
    return 'current' // No expiry = always current
  }

  const now = new Date()
  const expiryDate = record.expiryDate?.toDate?.() || new Date(record.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return 'expired'
  } else if (daysUntilExpiry <= COR_TRAINING_REQUIREMENTS.criticalExpiryDays) {
    return 'expiring_soon' // Critical
  } else if (daysUntilExpiry <= COR_TRAINING_REQUIREMENTS.expiryWarningDays) {
    return 'expiring_soon'
  }
  return 'current'
}

// ============================================
// TRAINING MATRIX OPERATIONS
// ============================================

/**
 * Create or update training requirements for a role
 */
export async function setRoleTrainingRequirements(organizationId, roleName, requiredCourses) {
  return withErrorHandling(async () => {
    // Check if role already exists
    const q = query(
      trainingMatrixRef,
      where('organizationId', '==', organizationId),
      where('roleName', '==', roleName),
      limit(1)
    )
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      // Update existing
      const docRef = doc(trainingMatrixRef, snapshot.docs[0].id)
      await updateDoc(docRef, {
        requiredCourses,
        updatedAt: serverTimestamp()
      })
      return { id: snapshot.docs[0].id, roleName, requiredCourses }
    } else {
      // Create new
      const newMatrix = {
        organizationId,
        roleName,
        requiredCourses,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(trainingMatrixRef, newMatrix)
      return { id: docRef.id, ...newMatrix }
    }
  }, 'setRoleTrainingRequirements')
}

/**
 * Get training requirements for a role
 */
export async function getRoleTrainingRequirements(organizationId, roleName) {
  return withErrorHandling(async () => {
    const q = query(
      trainingMatrixRef,
      where('organizationId', '==', organizationId),
      where('roleName', '==', roleName),
      limit(1)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  }, 'getRoleTrainingRequirements')
}

/**
 * Get all training matrix entries for an operator
 */
export async function getTrainingMatrix(organizationId) {
  return withErrorHandling(async () => {
    const q = query(
      trainingMatrixRef,
      where('organizationId', '==', organizationId),
      orderBy('roleName')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'getTrainingMatrix')
}

/**
 * Delete role requirements from matrix
 */
export async function deleteRoleRequirements(matrixId) {
  return withErrorHandling(async () => {
    const docRef = doc(trainingMatrixRef, matrixId)
    await deleteDoc(docRef)
  }, 'deleteRoleRequirements')
}

// ============================================
// COMPLIANCE & REPORTING
// ============================================

/**
 * Verify competency for a training record
 */
export async function verifyCompetency(recordId, verificationData) {
  return withErrorHandling(async () => {
    const { verifiedBy, competencyStatus, notes } = verificationData

    const docRef = doc(trainingRecordsRef, recordId)
    await updateDoc(docRef, {
      competencyStatus,
      competencyVerified: competencyStatus === 'verified',
      verifiedBy,
      verifiedDate: serverTimestamp(),
      competencyNotes: notes || null,
      updatedAt: serverTimestamp()
    })

    return { id: recordId, competencyStatus, competencyVerified: competencyStatus === 'verified' }
  }, 'verifyCompetency')
}

/**
 * Get training compliance summary for a crew member
 */
export async function getCrewMemberTrainingCompliance(organizationId, crewMemberId, roleName) {
  return withErrorHandling(async () => {
    // Get required training for role
    const roleRequirements = await getRoleTrainingRequirements(organizationId, roleName)
    const requiredCourseIds = roleRequirements?.requiredCourses?.map(c => c.courseId) || []

    // Get crew member's training records
    const records = await getTrainingRecordsForCrewMember(organizationId, crewMemberId)

    // Build compliance summary
    const compliance = {
      crewMemberId,
      roleName,
      totalRequired: requiredCourseIds.length,
      completed: 0,
      current: 0,
      expired: 0,
      expiringSoon: 0,
      missing: 0,
      courses: []
    }

    for (const courseId of requiredCourseIds) {
      const latestRecord = records.find(r => r.courseId === courseId)

      if (!latestRecord) {
        compliance.missing++
        compliance.courses.push({
          courseId,
          status: 'not_started',
          record: null
        })
      } else {
        const status = calculateTrainingStatus(latestRecord)
        compliance.completed++

        if (status === 'current') {
          compliance.current++
        } else if (status === 'expired') {
          compliance.expired++
        } else if (status === 'expiring_soon') {
          compliance.expiringSoon++
        }

        compliance.courses.push({
          courseId,
          status,
          record: latestRecord
        })
      }
    }

    compliance.complianceRate = compliance.totalRequired > 0
      ? Math.round((compliance.current / compliance.totalRequired) * 100)
      : 100

    return compliance
  }, 'getCrewMemberTrainingCompliance')
}

/**
 * Get organization-wide training compliance metrics
 */
export async function getTrainingMetrics(organizationId) {
  return withErrorHandling(async () => {
    const [courses, records] = await Promise.all([
      getCourses(organizationId),
      getAllTrainingRecords(organizationId)
    ])

    // Categorize records by status
    const statusCounts = { current: 0, expiring_soon: 0, expired: 0 }
    const byCourse = {}
    const byCategory = {}

    for (const record of records) {
      const status = calculateTrainingStatus(record)
      statusCounts[status] = (statusCounts[status] || 0) + 1

      // Group by course
      if (!byCourse[record.courseId]) {
        byCourse[record.courseId] = { current: 0, expiring_soon: 0, expired: 0 }
      }
      byCourse[record.courseId][status]++

      // Group by category
      const course = courses.find(c => c.id === record.courseId)
      if (course?.category) {
        if (!byCategory[course.category]) {
          byCategory[course.category] = { current: 0, expiring_soon: 0, expired: 0 }
        }
        byCategory[course.category][status]++
      }
    }

    // Find expiring records (next 30 days)
    const expiringRecords = records.filter(r => {
      const status = calculateTrainingStatus(r)
      return status === 'expiring_soon'
    })

    // Find expired records
    const expiredRecords = records.filter(r => {
      const status = calculateTrainingStatus(r)
      return status === 'expired'
    })

    return {
      totalCourses: courses.length,
      totalRecords: records.length,
      statusCounts,
      byCourse,
      byCategory,
      expiringCount: expiringRecords.length,
      expiredCount: expiredRecords.length,
      expiringRecords: expiringRecords.slice(0, 10), // Top 10 expiring
      expiredRecords: expiredRecords.slice(0, 10), // Top 10 expired
      complianceRate: records.length > 0
        ? Math.round((statusCounts.current / records.length) * 100)
        : 100,
      calculatedAt: new Date().toISOString()
    }
  }, 'getTrainingMetrics')
}

/**
 * Generate COR audit-ready training report
 */
export async function generateCORTrainingReport(organizationId, options = {}) {
  return withErrorHandling(async () => {
    const { startDate, endDate, crewMemberIds } = options

    let records = await getAllTrainingRecords(organizationId)

    // Filter by date range if specified
    if (startDate) {
      const start = new Date(startDate)
      records = records.filter(r => {
        const completionDate = r.completionDate?.toDate?.() || new Date(r.completionDate)
        return completionDate >= start
      })
    }
    if (endDate) {
      const end = new Date(endDate)
      records = records.filter(r => {
        const completionDate = r.completionDate?.toDate?.() || new Date(r.completionDate)
        return completionDate <= end
      })
    }

    // Filter by crew members if specified
    if (crewMemberIds && crewMemberIds.length > 0) {
      records = records.filter(r => crewMemberIds.includes(r.crewMemberId))
    }

    // Check for COR-required fields completeness
    const completeRecords = records.filter(r => {
      return COR_TRAINING_REQUIREMENTS.requiredFields.every(field => r[field])
    })

    const incompleteRecords = records.filter(r => {
      return !COR_TRAINING_REQUIREMENTS.requiredFields.every(field => r[field])
    })

    return {
      totalRecords: records.length,
      completeRecords: completeRecords.length,
      incompleteRecords: incompleteRecords.length,
      completenessRate: records.length > 0
        ? Math.round((completeRecords.length / records.length) * 100)
        : 100,
      records: records.map(r => ({
        ...r,
        missingFields: COR_TRAINING_REQUIREMENTS.requiredFields.filter(field => !r[field])
      })),
      dateRange: { startDate, endDate },
      generatedAt: new Date().toISOString()
    }
  }, 'generateCORTrainingReport')
}

// ============================================
// COR DASHBOARD HELPERS
// ============================================

/**
 * Get training summary for dashboard
 */
export async function getTrainingSummary(organizationId) {
  return withErrorHandling(async () => {
    const records = await getAllTrainingRecords(organizationId)

    let current = 0
    let expiringSoon = 0
    let expired = 0

    for (const record of records) {
      const status = calculateTrainingStatus(record)
      if (status === 'current') current++
      else if (status === 'expiring_soon') expiringSoon++
      else if (status === 'expired') expired++
    }

    return {
      totalRecords: records.length,
      current,
      expiringSoon,
      expired,
      complianceRate: records.length > 0
        ? Math.round((current / records.length) * 100)
        : 100
    }
  }, 'getTrainingSummary')
}

/**
 * Calculate COR Element 3 (Training) readiness score
 */
export async function getCORTrainingMetrics(organizationId) {
  return withErrorHandling(async () => {
    const [courses, records] = await Promise.all([
      getCourses(organizationId),
      getAllTrainingRecords(organizationId)
    ])

    // COR Criteria:
    // 1. Training program documented (courses defined)
    // 2. Training records complete (all required fields)
    // 3. Training current (not expired)
    // 4. Competency verified

    const activeCourses = courses.filter(c => c.isActive)
    const currentRecords = records.filter(r => calculateTrainingStatus(r) === 'current')
    const completeRecords = records.filter(r =>
      COR_TRAINING_REQUIREMENTS.requiredFields.every(field => r[field])
    )
    const verifiedRecords = records.filter(r => r.competencyVerified)

    // Scoring components (each max 25 points)
    const scores = {
      // 1. Program Documentation (have active courses defined)
      documentation: activeCourses.length >= 5 ? 25 : (activeCourses.length / 5) * 25,

      // 2. Record Completeness (all required fields)
      completeness: records.length > 0
        ? (completeRecords.length / records.length) * 25
        : 0,

      // 3. Training Currency (not expired)
      currency: records.length > 0
        ? (currentRecords.length / records.length) * 25
        : 0,

      // 4. Competency Verification
      verification: records.length > 0
        ? (verifiedRecords.length / records.length) * 25
        : 0
    }

    const totalScore = Math.round(
      scores.documentation + scores.completeness + scores.currency + scores.verification
    )

    const recommendations = []

    if (scores.documentation < 20) {
      recommendations.push({
        priority: 'medium',
        area: 'Documentation',
        message: 'Define more training courses to cover all job requirements'
      })
    }

    if (scores.completeness < 20) {
      recommendations.push({
        priority: 'high',
        area: 'Record Keeping',
        message: 'Complete all required fields for training records (what, when, where, by whom)'
      })
    }

    if (scores.currency < 20) {
      recommendations.push({
        priority: 'high',
        area: 'Currency',
        message: 'Address expired training records to maintain compliance'
      })
    }

    if (scores.verification < 20) {
      recommendations.push({
        priority: 'medium',
        area: 'Competency',
        message: 'Verify competency for more training records'
      })
    }

    return {
      totalScore,
      scores,
      metrics: {
        activeCourses: activeCourses.length,
        totalRecords: records.length,
        currentRecords: currentRecords.length,
        completeRecords: completeRecords.length,
        verifiedRecords: verifiedRecords.length
      },
      recommendations
    }
  }, 'getCORTrainingMetrics')
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Courses
  createCourse,
  updateCourse,
  getCourse,
  getCourses,
  deactivateCourse,
  seedDefaultCourses,

  // Records
  createTrainingRecord,
  updateTrainingRecord,
  getTrainingRecord,
  getTrainingRecordsForCrewMember,
  getTrainingRecordsForCourse,
  getAllTrainingRecords,
  deleteTrainingRecord,
  calculateTrainingStatus,

  // Matrix
  setRoleTrainingRequirements,
  getRoleTrainingRequirements,
  getTrainingMatrix,
  deleteRoleRequirements,

  // Compliance
  verifyCompetency,
  getCrewMemberTrainingCompliance,
  getTrainingMetrics,
  generateCORTrainingReport,

  // COR Dashboard
  getTrainingSummary,
  getCORTrainingMetrics,

  // Constants
  TRAINING_CATEGORIES,
  TRAINING_STATUS,
  COMPETENCY_STATUS,
  COR_TRAINING_REQUIREMENTS,
  DEFAULT_TRAINING_COURSES
}
