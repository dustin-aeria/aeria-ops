/**
 * Muster - COR Audit Management Data Operations
 * Firestore functions for COR audits, certificates, auditors, and compliance tracking
 *
 * COR Certification Cycle Management:
 * - Year 0: Certification Audit (external required for large employers)
 * - Year 1: Maintenance Audit
 * - Year 2: Maintenance Audit
 * - Year 3: Re-certification Audit (external required for large employers)
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

const corAuditsRef = collection(db, 'corAudits')
const corCertificatesRef = collection(db, 'corCertificates')
const corAuditorsRef = collection(db, 'corAuditors')
const corDeficienciesRef = collection(db, 'corDeficiencies')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const AUDIT_TYPES = {
  certification: { label: 'Certification Audit', description: 'Initial COR certification audit', year: 0 },
  maintenance: { label: 'Maintenance Audit', description: 'Annual maintenance audit', year: 1 },
  recertification: { label: 'Re-certification Audit', description: '3-year re-certification audit', year: 3 }
}

export const AUDIT_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', order: 1 },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', order: 2 },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-800', order: 3 },
  passed: { label: 'Passed', color: 'bg-green-100 text-green-800', order: 4 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', order: 5 }
}

export const AUDITOR_TYPE = {
  internal: { label: 'Internal Auditor', trainingHours: 14 },
  external: { label: 'External Auditor', trainingHours: 35 }
}

export const AUDITOR_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  expired: { label: 'Certification Expired', color: 'bg-red-100 text-red-800' }
}

export const COR_TYPE = {
  OHS: { label: 'OHS COR', rebate: 10, description: 'Occupational Health & Safety' },
  RTW: { label: 'RTW COR', rebate: 5, description: 'Return to Work (requires OHS first)' }
}

export const CERTIFICATE_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  expiring: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
  revoked: { label: 'Revoked', color: 'bg-gray-100 text-gray-800' }
}

export const DEFICIENCY_SEVERITY = {
  minor: { label: 'Minor', color: 'bg-yellow-100 text-yellow-800', daysToResolve: 30 },
  major: { label: 'Major', color: 'bg-orange-100 text-orange-800', daysToResolve: 14 },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800', daysToResolve: 7 }
}

// COR 8 Required Elements (Large Employer)
export const COR_ELEMENTS = {
  element1: {
    name: 'Management Leadership & Commitment',
    weight: { min: 10, max: 15 },
    description: 'Written H&S policy, accountability system, resource allocation'
  },
  element2: {
    name: 'Safe Work Procedures & Written Instructions',
    weight: { min: 10, max: 15 },
    description: 'Written procedures, WHMIS, first aid, worker training'
  },
  element3: {
    name: 'Training & Instruction of Workers',
    weight: { min: 10, max: 15 },
    description: 'Job-specific training, competency verification, emergency procedures'
  },
  element4: {
    name: 'Hazard Identification & Control',
    weight: { min: 10, max: 15 },
    description: 'Hazard analysis, engineering/administrative/PPE controls'
  },
  element5: {
    name: 'Inspection of Premises, Equipment & Work Practices',
    weight: { min: 10, max: 15 },
    description: 'Regular inspections, corrective action follow-up'
  },
  element6: {
    name: 'Investigation of Accidents',
    weight: { min: 10, max: 15 },
    description: 'Incident reporting, investigation, preventive actions'
  },
  element7: {
    name: 'Program Administration',
    weight: { min: 5, max: 10 },
    description: 'Records management, statistics analysis, program evaluation'
  },
  element8: {
    name: 'Joint Health & Safety Committee',
    weight: { min: 5, max: 10 },
    description: 'JHSC membership, meetings, minutes, recommendations follow-up'
  }
}

// Verification methods (each min 10%, max 50%)
export const VERIFICATION_METHODS = {
  documentation: { label: 'Documentation Review', minPercent: 10, maxPercent: 50 },
  interviews: { label: 'Interviews/Questionnaires', minPercent: 10, maxPercent: 50 },
  observation: { label: 'Workplace Observation', minPercent: 10, maxPercent: 50 }
}

// COR Requirements
export const COR_REQUIREMENTS = {
  minimumOverallScore: 80, // 80% to pass
  minimumElementScore: 50, // 50% minimum on each element
  certificateValidityYears: 3,
  maintenanceAuditInterval: 6, // Minimum 6 months between audits
  auditReportDeadlineDays: 30 // Audit report due within 30 days
}

// ============================================
// AUDIT NUMBER GENERATION
// ============================================

export async function generateAuditNumber(organizationId) {
  const year = new Date().getFullYear()
  const yearPrefix = `COR-${year}-`

  const q = query(
    corAuditsRef,
    where('organizationId', '==', organizationId),
    where('auditNumber', '>=', yearPrefix),
    where('auditNumber', '<', `COR-${year + 1}-`),
    orderBy('auditNumber', 'desc'),
    limit(1)
  )

  const snapshot = await getDocs(q)

  let nextNumber = 1
  if (!snapshot.empty) {
    const lastAudit = snapshot.docs[0].data()
    const lastNumber = parseInt(lastAudit.auditNumber.split('-')[2], 10)
    nextNumber = lastNumber + 1
  }

  return `${yearPrefix}${String(nextNumber).padStart(3, '0')}`
}

// ============================================
// AUDIT OPERATIONS
// ============================================

/**
 * Schedule a new COR audit
 */
export async function scheduleAudit(auditData) {
  return withErrorHandling(async () => {
    const auditNumber = await generateAuditNumber(auditData.organizationId)

    // Initialize element scores structure
    const elementScores = Object.keys(COR_ELEMENTS).map(key => ({
      elementId: key,
      elementName: COR_ELEMENTS[key].name,
      documentationScore: null,
      interviewScore: null,
      observationScore: null,
      totalScore: null,
      passed: null,
      notes: ''
    }))

    const newAudit = {
      ...auditData,
      auditNumber,
      status: 'scheduled',
      elementScores,
      overallScore: null,
      deficiencies: [],
      certificateId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(corAuditsRef, newAudit)
    return { id: docRef.id, ...newAudit }
  }, 'scheduleAudit')
}

/**
 * Update audit details
 */
export async function updateAudit(auditId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(corAuditsRef, auditId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: auditId, ...updates }
  }, 'updateAudit')
}

/**
 * Get an audit by ID
 */
export async function getAudit(auditId) {
  return withErrorHandling(async () => {
    const docRef = doc(corAuditsRef, auditId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    return { id: docSnap.id, ...docSnap.data() }
  }, 'getAudit')
}

/**
 * Get all audits for an organization
 */
export async function getAudits(organizationId, options = {}) {
  return withErrorHandling(async () => {
    const { status, auditType, limitCount = 50 } = options

    let q = query(
      corAuditsRef,
      where('organizationId', '==', organizationId),
      orderBy('scheduledDate', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    let audits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Client-side filtering for additional criteria
    if (status) {
      audits = audits.filter(a => a.status === status)
    }
    if (auditType) {
      audits = audits.filter(a => a.auditType === auditType)
    }

    return audits
  }, 'getAudits')
}

/**
 * Update element scores during audit
 */
export async function updateElementScores(auditId, elementScores) {
  return withErrorHandling(async () => {
    // Calculate overall score
    let totalWeightedScore = 0
    let totalWeight = 0
    let allPassed = true

    const updatedScores = elementScores.map(score => {
      // Calculate total score for element (average of verification methods)
      const scores = [score.documentationScore, score.interviewScore, score.observationScore].filter(s => s !== null)
      const totalScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

      const passed = totalScore !== null && totalScore >= COR_REQUIREMENTS.minimumElementScore
      if (!passed && totalScore !== null) {
        allPassed = false
      }

      // Use mid-range weight for calculation
      const element = COR_ELEMENTS[score.elementId]
      const weight = element ? (element.weight.min + element.weight.max) / 2 : 10

      if (totalScore !== null) {
        totalWeightedScore += totalScore * weight
        totalWeight += weight
      }

      return { ...score, totalScore, passed }
    })

    const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : null
    const passed = allPassed && overallScore !== null && overallScore >= COR_REQUIREMENTS.minimumOverallScore

    const docRef = doc(corAuditsRef, auditId)
    await updateDoc(docRef, {
      elementScores: updatedScores,
      overallScore,
      status: passed ? 'passed' : overallScore !== null ? 'failed' : 'in_progress',
      updatedAt: serverTimestamp()
    })

    return { elementScores: updatedScores, overallScore, passed }
  }, 'updateElementScores')
}

/**
 * Complete an audit
 */
export async function completeAudit(auditId, completionData) {
  return withErrorHandling(async () => {
    const { overallScore, passed, completedDate, reportNotes } = completionData

    const status = passed ? 'passed' : 'failed'

    const docRef = doc(corAuditsRef, auditId)
    await updateDoc(docRef, {
      status,
      overallScore,
      completedDate: completedDate || serverTimestamp(),
      reportNotes,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return { id: auditId, status, overallScore }
  }, 'completeAudit')
}

// ============================================
// CERTIFICATE OPERATIONS
// ============================================

/**
 * Issue a new COR certificate
 */
export async function issueCertificate(certData) {
  return withErrorHandling(async () => {
    const issueDate = certData.issueDate || new Date()
    const expiryDate = new Date(issueDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + COR_REQUIREMENTS.certificateValidityYears)

    const newCertificate = {
      ...certData,
      status: 'active',
      issueDate: Timestamp.fromDate(new Date(issueDate)),
      expiryDate: Timestamp.fromDate(expiryDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(corCertificatesRef, newCertificate)

    // Link certificate to audit if provided
    if (certData.certificationAuditId) {
      const auditRef = doc(corAuditsRef, certData.certificationAuditId)
      await updateDoc(auditRef, { certificateId: docRef.id })
    }

    return { id: docRef.id, ...newCertificate }
  }, 'issueCertificate')
}

/**
 * Get certificate by ID
 */
export async function getCertificate(certificateId) {
  return withErrorHandling(async () => {
    const docRef = doc(corCertificatesRef, certificateId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      return null
    }
    const cert = { id: docSnap.id, ...docSnap.data() }
    cert.calculatedStatus = calculateCertificateStatus(cert)
    return cert
  }, 'getCertificate')
}

/**
 * Get all certificates for an organization
 */
export async function getCertificates(organizationId) {
  return withErrorHandling(async () => {
    const q = query(
      corCertificatesRef,
      where('organizationId', '==', organizationId),
      orderBy('issueDate', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const cert = { id: doc.id, ...doc.data() }
      cert.calculatedStatus = calculateCertificateStatus(cert)
      return cert
    })
  }, 'getCertificates')
}

/**
 * Get active certificate for an organization
 */
export async function getActiveCertificate(organizationId, corType = 'OHS') {
  return withErrorHandling(async () => {
    const q = query(
      corCertificatesRef,
      where('organizationId', '==', organizationId),
      where('corType', '==', corType),
      where('status', '==', 'active'),
      orderBy('issueDate', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      return null
    }

    const cert = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
    cert.calculatedStatus = calculateCertificateStatus(cert)
    return cert
  }, 'getActiveCertificate')
}

/**
 * Calculate certificate status based on expiry date
 */
export function calculateCertificateStatus(certificate) {
  if (certificate.status === 'revoked') return 'revoked'

  const now = new Date()
  const expiryDate = certificate.expiryDate?.toDate?.() || new Date(certificate.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return 'expired'
  } else if (daysUntilExpiry <= 90) { // 90 days warning
    return 'expiring'
  }
  return 'active'
}

/**
 * Revoke a certificate
 */
export async function revokeCertificate(certificateId, reason) {
  return withErrorHandling(async () => {
    const docRef = doc(corCertificatesRef, certificateId)
    await updateDoc(docRef, {
      status: 'revoked',
      revocationReason: reason,
      revokedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'revokeCertificate')
}

// ============================================
// AUDITOR OPERATIONS
// ============================================

/**
 * Register an auditor
 */
export async function registerAuditor(auditorData) {
  return withErrorHandling(async () => {
    // Calculate recertification due date (3 years from certification)
    let recertificationDue = null
    if (auditorData.certifiedDate) {
      recertificationDue = new Date(auditorData.certifiedDate)
      recertificationDue.setFullYear(recertificationDue.getFullYear() + 3)
    }

    const newAuditor = {
      ...auditorData,
      status: 'active',
      auditsCompleted: auditorData.auditsCompleted || 0,
      recertificationDue: recertificationDue ? Timestamp.fromDate(recertificationDue) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(corAuditorsRef, newAuditor)
    return { id: docRef.id, ...newAuditor }
  }, 'registerAuditor')
}

/**
 * Update auditor details
 */
export async function updateAuditor(auditorId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(corAuditorsRef, auditorId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: auditorId, ...updates }
  }, 'updateAuditor')
}

/**
 * Get all auditors for an organization
 */
export async function getAuditors(organizationId, options = {}) {
  return withErrorHandling(async () => {
    const { auditorType, activeOnly = true } = options

    let q = query(
      corAuditorsRef,
      where('organizationId', '==', organizationId),
      orderBy('name')
    )

    const snapshot = await getDocs(q)
    let auditors = snapshot.docs.map(doc => {
      const auditor = { id: doc.id, ...doc.data() }
      auditor.calculatedStatus = calculateAuditorStatus(auditor)
      return auditor
    })

    if (auditorType) {
      auditors = auditors.filter(a => a.auditorType === auditorType)
    }

    if (activeOnly) {
      auditors = auditors.filter(a => a.calculatedStatus === 'active')
    }

    return auditors
  }, 'getAuditors')
}

/**
 * Calculate auditor status based on recertification date
 */
export function calculateAuditorStatus(auditor) {
  if (auditor.status === 'inactive') return 'inactive'

  if (auditor.recertificationDue) {
    const now = new Date()
    const recertDate = auditor.recertificationDue?.toDate?.() || new Date(auditor.recertificationDue)
    if (recertDate < now) {
      return 'expired'
    }
  }

  return 'active'
}

/**
 * Record audit completion for auditor
 */
export async function recordAuditForAuditor(auditorId) {
  return withErrorHandling(async () => {
    const docRef = doc(corAuditorsRef, auditorId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Auditor not found')
    }

    const currentCount = docSnap.data().auditsCompleted || 0

    await updateDoc(docRef, {
      auditsCompleted: currentCount + 1,
      lastAuditDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'recordAuditForAuditor')
}

// ============================================
// DEFICIENCY OPERATIONS
// ============================================

/**
 * Add a deficiency finding
 */
export async function addDeficiency(deficiencyData) {
  return withErrorHandling(async () => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (DEFICIENCY_SEVERITY[deficiencyData.severity]?.daysToResolve || 30))

    const newDeficiency = {
      ...deficiencyData,
      status: 'open',
      dueDate: Timestamp.fromDate(dueDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(corDeficienciesRef, newDeficiency)
    return { id: docRef.id, ...newDeficiency }
  }, 'addDeficiency')
}

/**
 * Update deficiency status
 */
export async function updateDeficiency(deficiencyId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(corDeficienciesRef, deficiencyId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: deficiencyId, ...updates }
  }, 'updateDeficiency')
}

/**
 * Get deficiencies for an audit
 */
export async function getDeficienciesForAudit(auditId) {
  return withErrorHandling(async () => {
    const q = query(
      corDeficienciesRef,
      where('auditId', '==', auditId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'getDeficienciesForAudit')
}

/**
 * Get all open deficiencies for an organization
 */
export async function getOpenDeficiencies(organizationId) {
  return withErrorHandling(async () => {
    const q = query(
      corDeficienciesRef,
      where('organizationId', '==', organizationId),
      where('status', '==', 'open'),
      orderBy('dueDate')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'getOpenDeficiencies')
}

/**
 * Close a deficiency
 */
export async function closeDeficiency(deficiencyId, closureData) {
  return withErrorHandling(async () => {
    const { closedBy, closureNotes, verifiedBy } = closureData

    const docRef = doc(corDeficienciesRef, deficiencyId)
    await updateDoc(docRef, {
      status: 'closed',
      closedBy,
      closureNotes,
      verifiedBy,
      closedDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'closeDeficiency')
}

// ============================================
// COR READINESS & METRICS
// ============================================

/**
 * Calculate COR audit readiness score
 */
export async function calculateCORReadiness(organizationId) {
  return withErrorHandling(async () => {
    // This would integrate with other modules (JHSC, Training, Incidents, etc.)
    // For now, return a placeholder structure

    const readiness = {
      organizationId,
      overallScore: 0,
      elements: {},
      recommendations: [],
      calculatedAt: new Date().toISOString()
    }

    // Initialize element scores
    Object.entries(COR_ELEMENTS).forEach(([key, element]) => {
      readiness.elements[key] = {
        name: element.name,
        documentationScore: 0,
        interviewScore: 0,
        observationScore: 0,
        estimatedScore: 0,
        gaps: [],
        strengths: []
      }
    })

    // Calculate overall estimated score
    const elementScores = Object.values(readiness.elements).map(e => e.estimatedScore)
    readiness.overallScore = elementScores.length > 0
      ? Math.round(elementScores.reduce((a, b) => a + b, 0) / elementScores.length)
      : 0

    return readiness
  }, 'calculateCORReadiness')
}

/**
 * Get audit cycle status
 */
export async function getAuditCycleStatus(organizationId) {
  return withErrorHandling(async () => {
    const certificate = await getActiveCertificate(organizationId, 'OHS')
    const audits = await getAudits(organizationId)

    if (!certificate) {
      return {
        hasCertificate: false,
        nextAuditType: 'certification',
        nextAuditDue: null,
        cycleYear: 0,
        maintenanceAuditsCompleted: 0
      }
    }

    const issueDate = certificate.issueDate?.toDate?.() || new Date(certificate.issueDate)
    const now = new Date()
    const yearsSinceCert = (now - issueDate) / (1000 * 60 * 60 * 24 * 365)
    const cycleYear = Math.floor(yearsSinceCert) % 3

    // Count maintenance audits in current cycle
    const maintenanceAudits = audits.filter(a =>
      a.auditType === 'maintenance' &&
      a.status === 'passed' &&
      a.completedDate?.toDate?.() > issueDate
    )

    // Determine next audit type
    let nextAuditType
    let nextAuditDue

    if (cycleYear === 0) {
      nextAuditType = maintenanceAudits.length === 0 ? 'maintenance' : 'maintenance'
      const lastAudit = audits.find(a => a.status === 'passed')
      if (lastAudit) {
        nextAuditDue = new Date(lastAudit.completedDate?.toDate?.() || lastAudit.completedDate)
        nextAuditDue.setMonth(nextAuditDue.getMonth() + COR_REQUIREMENTS.maintenanceAuditInterval)
      }
    } else if (cycleYear >= 2) {
      nextAuditType = 'recertification'
      nextAuditDue = certificate.expiryDate?.toDate?.() || new Date(certificate.expiryDate)
    } else {
      nextAuditType = 'maintenance'
      const lastAudit = audits.find(a => a.status === 'passed')
      if (lastAudit) {
        nextAuditDue = new Date(lastAudit.completedDate?.toDate?.() || lastAudit.completedDate)
        nextAuditDue.setMonth(nextAuditDue.getMonth() + COR_REQUIREMENTS.maintenanceAuditInterval)
      }
    }

    return {
      hasCertificate: true,
      certificate,
      nextAuditType,
      nextAuditDue,
      cycleYear,
      maintenanceAuditsCompleted: maintenanceAudits.length,
      totalAudits: audits.length
    }
  }, 'getAuditCycleStatus')
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Audits
  scheduleAudit,
  updateAudit,
  getAudit,
  getAudits,
  updateElementScores,
  completeAudit,
  generateAuditNumber,

  // Certificates
  issueCertificate,
  getCertificate,
  getCertificates,
  getActiveCertificate,
  calculateCertificateStatus,
  revokeCertificate,

  // Auditors
  registerAuditor,
  updateAuditor,
  getAuditors,
  calculateAuditorStatus,
  recordAuditForAuditor,

  // Deficiencies
  addDeficiency,
  updateDeficiency,
  getDeficienciesForAudit,
  getOpenDeficiencies,
  closeDeficiency,

  // Readiness & Metrics
  calculateCORReadiness,
  getAuditCycleStatus,

  // Constants
  AUDIT_TYPES,
  AUDIT_STATUS,
  AUDITOR_TYPE,
  AUDITOR_STATUS,
  COR_TYPE,
  CERTIFICATE_STATUS,
  DEFICIENCY_SEVERITY,
  COR_ELEMENTS,
  VERIFICATION_METHODS,
  COR_REQUIREMENTS
}
