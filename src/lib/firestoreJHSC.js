/**
 * Aeria Ops - JHSC (Joint Health & Safety Committee) Data Operations
 * Firestore functions for JHSC committee management, meetings, minutes, and recommendations
 *
 * COR Element 8: Joint Health & Safety Committee (5-10% weight)
 * Required for COR certification compliance
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
  writeBatch,
  runTransaction
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

const jhscCommitteesRef = collection(db, 'jhscCommittees')
const jhscMembersRef = collection(db, 'jhscMembers')
const jhscMeetingsRef = collection(db, 'jhscMeetings')
const jhscMinutesRef = collection(db, 'jhscMinutes')
const jhscRecommendationsRef = collection(db, 'jhscRecommendations')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const MEETING_FREQUENCY = {
  monthly: { label: 'Monthly', days: 30 },
  bi_monthly: { label: 'Bi-Monthly', days: 60 },
  quarterly: { label: 'Quarterly', days: 90 }
}

export const MEMBER_ROLES = {
  worker_rep: { label: 'Worker Representative', type: 'worker' },
  employer_rep: { label: 'Employer Representative', type: 'employer' },
  co_chair_worker: { label: 'Co-Chair (Worker)', type: 'worker', isChair: true },
  co_chair_employer: { label: 'Co-Chair (Employer)', type: 'employer', isChair: true }
}

export const MEETING_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
}

export const RECOMMENDATION_STATUS = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', order: 1 },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', order: 2 },
  pending_response: { label: 'Pending Management Response', color: 'bg-orange-100 text-orange-800', order: 3 },
  implemented: { label: 'Implemented', color: 'bg-green-100 text-green-800', order: 4 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', order: 5 },
  deferred: { label: 'Deferred', color: 'bg-purple-100 text-purple-800', order: 6 }
}

export const RECOMMENDATION_PRIORITY = {
  critical: { label: 'Critical', color: 'bg-red-600 text-white', responseDays: 7 },
  high: { label: 'High', color: 'bg-orange-500 text-white', responseDays: 14 },
  medium: { label: 'Medium', color: 'bg-yellow-500 text-black', responseDays: 30 },
  low: { label: 'Low', color: 'bg-green-500 text-white', responseDays: 60 }
}

// COR-specific: Response time requirements
export const COR_REQUIREMENTS = {
  managementResponseDays: 21, // COR requires management response within 21 days
  meetingMinutesDistributionDays: 14, // Minutes must be distributed within 14 days
  minimumMeetingsPerYear: 4 // Minimum quarterly meetings required
}

// ============================================
// NUMBER GENERATION
// ============================================

/**
 * Generate a unique meeting number in format JHSC-YYYY-NNN
 */
export async function generateMeetingNumber(operatorId) {
  const year = new Date().getFullYear()
  const yearPrefix = `JHSC-${year}-`

  const q = query(
    jhscMeetingsRef,
    where('operatorId', '==', operatorId),
    where('meetingNumber', '>=', yearPrefix),
    where('meetingNumber', '<', `JHSC-${year + 1}-`),
    orderBy('meetingNumber', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)

  let nextNumber = 1
  if (!snapshot.empty) {
    const lastMeeting = snapshot.docs[0].data()
    const lastNumber = parseInt(lastMeeting.meetingNumber.split('-')[2], 10)
    nextNumber = lastNumber + 1
  }

  return `${yearPrefix}${String(nextNumber).padStart(3, '0')}`
}

/**
 * Generate a unique recommendation number in format JHSC-REC-YYYY-NNN
 */
export async function generateRecommendationNumber(operatorId) {
  const year = new Date().getFullYear()
  const yearPrefix = `JHSC-REC-${year}-`

  const q = query(
    jhscRecommendationsRef,
    where('operatorId', '==', operatorId),
    where('recommendationNumber', '>=', yearPrefix),
    where('recommendationNumber', '<', `JHSC-REC-${year + 1}-`),
    orderBy('recommendationNumber', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)

  let nextNumber = 1
  if (!snapshot.empty) {
    const lastRec = snapshot.docs[0].data()
    const lastNumber = parseInt(lastRec.recommendationNumber.split('-')[3], 10)
    nextNumber = lastNumber + 1
  }

  return `${yearPrefix}${String(nextNumber).padStart(3, '0')}`
}

// ============================================
// COMMITTEE OPERATIONS
// ============================================

/**
 * Get or create the JHSC committee for an operator
 */
export async function getOrCreateCommittee(operatorId, committeeData = {}) {
  return withErrorHandling(async () => {
    // Check if committee exists
    const q = query(
      jhscCommitteesRef,
      where('operatorId', '==', operatorId),
      limit(1)
    )
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }

    // Create new committee with defaults
    const newCommittee = {
      operatorId,
      name: committeeData.name || 'Joint Health & Safety Committee',
      meetingFrequency: committeeData.meetingFrequency || 'monthly',
      minimumWorkerReps: committeeData.minimumWorkerReps || 2,
      minimumEmployerReps: committeeData.minimumEmployerReps || 2,
      quorumRequirement: committeeData.quorumRequirement || 'majority', // 'majority' or specific number
      meetingLocation: committeeData.meetingLocation || '',
      standardAgendaItems: committeeData.standardAgendaItems || [
        'Review of previous meeting minutes',
        'Review of incidents since last meeting',
        'Workplace inspection reports',
        'Safety concerns and hazard reports',
        'Training updates',
        'Old business',
        'New business',
        'Next meeting date'
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(jhscCommitteesRef, newCommittee)
    return { id: docRef.id, ...newCommittee }
  }, 'getOrCreateCommittee')
}

/**
 * Update committee settings
 */
export async function updateCommittee(committeeId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscCommitteesRef, committeeId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: committeeId, ...updates }
  }, 'updateCommittee')
}

/**
 * Get committee by ID
 */
export async function getCommittee(committeeId) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscCommitteesRef, committeeId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getCommittee')
}

// ============================================
// MEMBER OPERATIONS
// ============================================

/**
 * Add a member to the committee
 */
export async function addMember(memberData) {
  return withErrorHandling(async () => {
    const newMember = {
      ...memberData,
      status: 'active',
      trainingCompleted: memberData.trainingCompleted || false,
      trainingDate: memberData.trainingDate || null,
      appointedDate: memberData.appointedDate || Timestamp.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(jhscMembersRef, newMember)
    return { id: docRef.id, ...newMember }
  }, 'addMember')
}

/**
 * Update a member
 */
export async function updateMember(memberId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMembersRef, memberId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: memberId, ...updates }
  }, 'updateMember')
}

/**
 * Get all members for a committee
 */
export async function getCommitteeMembers(operatorId, includeInactive = false) {
  return withErrorHandling(async () => {
    let q = query(
      jhscMembersRef,
      where('operatorId', '==', operatorId),
      orderBy('role')
    )

    if (!includeInactive) {
      q = query(
        jhscMembersRef,
        where('operatorId', '==', operatorId),
        where('status', '==', 'active'),
        orderBy('role')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'getCommitteeMembers')
}

/**
 * Deactivate a member (soft delete)
 */
export async function deactivateMember(memberId) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMembersRef, memberId)
    await updateDoc(docRef, {
      status: 'inactive',
      deactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'deactivateMember')
}

/**
 * Check if committee has required composition
 */
export async function checkCommitteeComposition(operatorId) {
  return withErrorHandling(async () => {
    const members = await getCommitteeMembers(operatorId)

    const workerReps = members.filter(m =>
      MEMBER_ROLES[m.role]?.type === 'worker'
    )
    const employerReps = members.filter(m =>
      MEMBER_ROLES[m.role]?.type === 'employer'
    )
    const hasWorkerCoChair = members.some(m => m.role === 'co_chair_worker')
    const hasEmployerCoChair = members.some(m => m.role === 'co_chair_employer')

    return {
      totalMembers: members.length,
      workerReps: workerReps.length,
      employerReps: employerReps.length,
      hasWorkerCoChair,
      hasEmployerCoChair,
      isBalanced: workerReps.length >= employerReps.length, // COR requires at least equal worker reps
      hasCoChairs: hasWorkerCoChair && hasEmployerCoChair,
      meetsMinimum: members.length >= 4, // Minimum 2 worker + 2 employer
      issues: []
    }
  }, 'checkCommitteeComposition')
}

// ============================================
// MEETING OPERATIONS
// ============================================

/**
 * Schedule a new meeting
 */
export async function scheduleMeeting(meetingData) {
  return withErrorHandling(async () => {
    const meetingNumber = await generateMeetingNumber(meetingData.operatorId)

    const newMeeting = {
      ...meetingData,
      meetingNumber,
      status: 'scheduled',
      attendees: meetingData.attendees || [],
      quorumMet: false,
      minutesId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(jhscMeetingsRef, newMeeting)
    return { id: docRef.id, ...newMeeting }
  }, 'scheduleMeeting')
}

/**
 * Update meeting details
 */
export async function updateMeeting(meetingId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMeetingsRef, meetingId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: meetingId, ...updates }
  }, 'updateMeeting')
}

/**
 * Get a meeting by ID
 */
export async function getMeeting(meetingId) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMeetingsRef, meetingId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getMeeting')
}

/**
 * Get all meetings for an operator
 */
export async function getMeetings(operatorId, options = {}) {
  return withErrorHandling(async () => {
    const { status, limitCount = 50, year } = options

    let q = query(
      jhscMeetingsRef,
      where('operatorId', '==', operatorId),
      orderBy('scheduledDate', 'desc'),
      limit(limitCount)
    )

    if (status) {
      q = query(
        jhscMeetingsRef,
        where('operatorId', '==', operatorId),
        where('status', '==', status),
        orderBy('scheduledDate', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    let meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Filter by year if specified
    if (year) {
      meetings = meetings.filter(m => {
        const meetingDate = m.scheduledDate?.toDate?.() || new Date(m.scheduledDate)
        return meetingDate.getFullYear() === year
      })
    }

    return meetings
  }, 'getMeetings')
}

/**
 * Complete a meeting and update attendance
 */
export async function completeMeeting(meetingId, completionData) {
  return withErrorHandling(async () => {
    const { attendees, actualDate, quorumMet } = completionData

    const docRef = doc(jhscMeetingsRef, meetingId)
    await updateDoc(docRef, {
      status: 'completed',
      actualDate: actualDate || Timestamp.now(),
      attendees,
      quorumMet,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { id: meetingId, status: 'completed' }
  }, 'completeMeeting')
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(meetingId, reason) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMeetingsRef, meetingId)
    await updateDoc(docRef, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'cancelMeeting')
}

/**
 * Calculate next meeting date based on frequency
 */
export function calculateNextMeetingDate(lastMeetingDate, frequency) {
  const date = lastMeetingDate?.toDate?.() || new Date(lastMeetingDate) || new Date()
  const days = MEETING_FREQUENCY[frequency]?.days || 30
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

// ============================================
// MINUTES OPERATIONS
// ============================================

/**
 * Create meeting minutes
 */
export async function createMinutes(minutesData) {
  return withErrorHandling(async () => {
    const newMinutes = {
      ...minutesData,
      status: 'draft',
      distributedTo: [],
      distributedDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(jhscMinutesRef, newMinutes)

    // Link minutes to meeting
    if (minutesData.meetingId) {
      const meetingRef = doc(jhscMeetingsRef, minutesData.meetingId)
      await updateDoc(meetingRef, { minutesId: docRef.id })
    }

    return { id: docRef.id, ...newMinutes }
  }, 'createMinutes')
}

/**
 * Update minutes
 */
export async function updateMinutes(minutesId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMinutesRef, minutesId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: minutesId, ...updates }
  }, 'updateMinutes')
}

/**
 * Get minutes by ID
 */
export async function getMinutes(minutesId) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscMinutesRef, minutesId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getMinutes')
}

/**
 * Get minutes for a meeting
 */
export async function getMinutesForMeeting(meetingId) {
  return withErrorHandling(async () => {
    const q = query(
      jhscMinutesRef,
      where('meetingId', '==', meetingId),
      limit(1)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return null
    }
    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() }
  }, 'getMinutesForMeeting')
}

/**
 * Approve and distribute minutes
 */
export async function approveAndDistributeMinutes(minutesId, approvalData) {
  return withErrorHandling(async () => {
    const { approvedBy, distributedTo } = approvalData

    const docRef = doc(jhscMinutesRef, minutesId)
    await updateDoc(docRef, {
      status: 'approved',
      approvedBy,
      approvedDate: serverTimestamp(),
      distributedTo,
      distributedDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { id: minutesId, status: 'approved' }
  }, 'approveAndDistributeMinutes')
}

// ============================================
// RECOMMENDATION OPERATIONS
// ============================================

/**
 * Create a new recommendation
 */
export async function createRecommendation(recData) {
  return withErrorHandling(async () => {
    const recommendationNumber = await generateRecommendationNumber(recData.operatorId)

    // Calculate target date based on priority
    const priorityConfig = RECOMMENDATION_PRIORITY[recData.priority] || RECOMMENDATION_PRIORITY.medium
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + priorityConfig.responseDays)

    const newRecommendation = {
      ...recData,
      recommendationNumber,
      status: 'open',
      targetDate: recData.targetDate || Timestamp.fromDate(targetDate),
      managementResponse: null,
      responseDate: null,
      implementationNotes: null,
      implementedDate: null,
      verifiedBy: null,
      verifiedDate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(jhscRecommendationsRef, newRecommendation)
    return { id: docRef.id, ...newRecommendation }
  }, 'createRecommendation')
}

/**
 * Update a recommendation
 */
export async function updateRecommendation(recId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscRecommendationsRef, recId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: recId, ...updates }
  }, 'updateRecommendation')
}

/**
 * Get a recommendation by ID
 */
export async function getRecommendation(recId) {
  return withErrorHandling(async () => {
    const docRef = doc(jhscRecommendationsRef, recId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getRecommendation')
}

/**
 * Get all recommendations for an operator
 */
export async function getRecommendations(operatorId, options = {}) {
  return withErrorHandling(async () => {
    const { status, meetingId, limitCount = 100 } = options

    let q
    if (meetingId) {
      q = query(
        jhscRecommendationsRef,
        where('operatorId', '==', operatorId),
        where('meetingId', '==', meetingId),
        orderBy('createdAt', 'desc')
      )
    } else if (status) {
      q = query(
        jhscRecommendationsRef,
        where('operatorId', '==', operatorId),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    } else {
      q = query(
        jhscRecommendationsRef,
        where('operatorId', '==', operatorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'getRecommendations')
}

/**
 * Record management response to a recommendation
 */
export async function recordManagementResponse(recId, responseData) {
  return withErrorHandling(async () => {
    const { response, respondedBy, accepted } = responseData

    const docRef = doc(jhscRecommendationsRef, recId)
    await updateDoc(docRef, {
      managementResponse: response,
      responseDate: serverTimestamp(),
      respondedBy,
      status: accepted ? 'in_progress' : 'rejected',
      updatedAt: serverTimestamp()
    })

    return { id: recId, status: accepted ? 'in_progress' : 'rejected' }
  }, 'recordManagementResponse')
}

/**
 * Mark recommendation as implemented
 */
export async function markRecommendationImplemented(recId, implementationData) {
  return withErrorHandling(async () => {
    const { notes, implementedBy } = implementationData

    const docRef = doc(jhscRecommendationsRef, recId)
    await updateDoc(docRef, {
      status: 'implemented',
      implementationNotes: notes,
      implementedBy,
      implementedDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { id: recId, status: 'implemented' }
  }, 'markRecommendationImplemented')
}

/**
 * Verify recommendation effectiveness
 */
export async function verifyRecommendation(recId, verificationData) {
  return withErrorHandling(async () => {
    const { verifiedBy, verificationNotes, effective } = verificationData

    const docRef = doc(jhscRecommendationsRef, recId)
    await updateDoc(docRef, {
      verifiedBy,
      verifiedDate: serverTimestamp(),
      verificationNotes,
      verificationEffective: effective,
      updatedAt: serverTimestamp()
    })

    return { id: recId, verified: true }
  }, 'verifyRecommendation')
}

// ============================================
// COR COMPLIANCE METRICS
// ============================================

/**
 * Calculate JHSC compliance metrics for COR audits
 */
export async function calculateJHSCMetrics(operatorId, year = new Date().getFullYear()) {
  return withErrorHandling(async () => {
    const [committee, members, meetings, recommendations] = await Promise.all([
      getOrCreateCommittee(operatorId),
      getCommitteeMembers(operatorId),
      getMeetings(operatorId, { year }),
      getRecommendations(operatorId)
    ])

    const composition = await checkCommitteeComposition(operatorId)

    // Calculate meeting compliance
    const completedMeetings = meetings.filter(m => m.status === 'completed')
    const meetingsWithMinutes = completedMeetings.filter(m => m.minutesId)
    const meetingsWithQuorum = completedMeetings.filter(m => m.quorumMet)

    // Calculate recommendation metrics
    const openRecs = recommendations.filter(r => r.status === 'open')
    const overdueRecs = recommendations.filter(r => {
      if (r.status !== 'open' && r.status !== 'in_progress') return false
      const target = r.targetDate?.toDate?.() || new Date(r.targetDate)
      return target < new Date()
    })
    const implementedRecs = recommendations.filter(r => r.status === 'implemented')
    const respondedWithin21Days = recommendations.filter(r => {
      if (!r.responseDate || !r.createdAt) return false
      const created = r.createdAt?.toDate?.() || new Date(r.createdAt)
      const responded = r.responseDate?.toDate?.() || new Date(r.responseDate)
      const daysDiff = (responded - created) / (1000 * 60 * 60 * 24)
      return daysDiff <= COR_REQUIREMENTS.managementResponseDays
    })

    // Calculate member training compliance
    const trainedMembers = members.filter(m => m.trainingCompleted)

    return {
      // Committee Composition
      composition,
      memberCount: members.length,
      trainedMemberCount: trainedMembers.length,
      trainingComplianceRate: members.length > 0
        ? Math.round((trainedMembers.length / members.length) * 100)
        : 0,

      // Meeting Metrics
      meetingsHeld: completedMeetings.length,
      meetingsRequired: COR_REQUIREMENTS.minimumMeetingsPerYear,
      meetingComplianceRate: Math.round((completedMeetings.length / COR_REQUIREMENTS.minimumMeetingsPerYear) * 100),
      minutesCompletionRate: completedMeetings.length > 0
        ? Math.round((meetingsWithMinutes.length / completedMeetings.length) * 100)
        : 0,
      quorumRate: completedMeetings.length > 0
        ? Math.round((meetingsWithQuorum.length / completedMeetings.length) * 100)
        : 0,

      // Recommendation Metrics
      totalRecommendations: recommendations.length,
      openRecommendations: openRecs.length,
      overdueRecommendations: overdueRecs.length,
      implementedRecommendations: implementedRecs.length,
      responseComplianceRate: recommendations.length > 0
        ? Math.round((respondedWithin21Days.length / recommendations.length) * 100)
        : 100,

      // Overall COR Readiness Score (Element 8)
      overallScore: calculateOverallJHSCScore({
        composition,
        meetingsHeld: completedMeetings.length,
        meetingsRequired: COR_REQUIREMENTS.minimumMeetingsPerYear,
        minutesCompletionRate: completedMeetings.length > 0
          ? (meetingsWithMinutes.length / completedMeetings.length) * 100
          : 0,
        trainingComplianceRate: members.length > 0
          ? (trainedMembers.length / members.length) * 100
          : 0,
        overdueRecommendations: overdueRecs.length
      }),

      year,
      calculatedAt: new Date().toISOString()
    }
  }, 'calculateJHSCMetrics')
}

/**
 * Calculate overall JHSC score for COR (Element 8)
 * Weighted scoring based on COR audit criteria
 */
function calculateOverallJHSCScore(metrics) {
  let score = 0
  const maxScore = 100

  // Committee composition (25 points)
  if (metrics.composition.meetsMinimum) score += 10
  if (metrics.composition.isBalanced) score += 5
  if (metrics.composition.hasCoChairs) score += 10

  // Meeting frequency (25 points)
  const meetingRatio = metrics.meetingsHeld / metrics.meetingsRequired
  score += Math.min(25, Math.round(meetingRatio * 25))

  // Minutes completion (20 points)
  score += Math.round((metrics.minutesCompletionRate / 100) * 20)

  // Member training (15 points)
  score += Math.round((metrics.trainingComplianceRate / 100) * 15)

  // Recommendation follow-up (15 points)
  if (metrics.overdueRecommendations === 0) {
    score += 15
  } else if (metrics.overdueRecommendations <= 2) {
    score += 10
  } else if (metrics.overdueRecommendations <= 5) {
    score += 5
  }

  return Math.min(maxScore, score)
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Committee
  getOrCreateCommittee,
  updateCommittee,
  getCommittee,

  // Members
  addMember,
  updateMember,
  getCommitteeMembers,
  deactivateMember,
  checkCommitteeComposition,

  // Meetings
  scheduleMeeting,
  updateMeeting,
  getMeeting,
  getMeetings,
  completeMeeting,
  cancelMeeting,
  calculateNextMeetingDate,

  // Minutes
  createMinutes,
  updateMinutes,
  getMinutes,
  getMinutesForMeeting,
  approveAndDistributeMinutes,

  // Recommendations
  createRecommendation,
  updateRecommendation,
  getRecommendation,
  getRecommendations,
  recordManagementResponse,
  markRecommendationImplemented,
  verifyRecommendation,

  // Metrics
  calculateJHSCMetrics,

  // Number generators
  generateMeetingNumber,
  generateRecommendationNumber,

  // Constants
  MEETING_FREQUENCY,
  MEMBER_ROLES,
  MEETING_STATUS,
  RECOMMENDATION_STATUS,
  RECOMMENDATION_PRIORITY,
  COR_REQUIREMENTS
}
