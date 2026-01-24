/**
 * Firestore Project Templates Service
 * Save and reuse project configurations
 *
 * @location src/lib/firestoreTemplates.js
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
// TEMPLATE CATEGORIES
// ============================================

export const TEMPLATE_CATEGORIES = {
  inspection: { label: 'Inspection', icon: 'ClipboardCheck', color: 'bg-blue-100 text-blue-700' },
  mapping: { label: 'Mapping/Survey', icon: 'Map', color: 'bg-green-100 text-green-700' },
  photography: { label: 'Photography/Video', icon: 'Camera', color: 'bg-purple-100 text-purple-700' },
  construction: { label: 'Construction', icon: 'Building', color: 'bg-orange-100 text-orange-700' },
  agriculture: { label: 'Agriculture', icon: 'Leaf', color: 'bg-lime-100 text-lime-700' },
  emergency: { label: 'Emergency Response', icon: 'AlertTriangle', color: 'bg-red-100 text-red-700' },
  training: { label: 'Training', icon: 'GraduationCap', color: 'bg-indigo-100 text-indigo-700' },
  other: { label: 'Other', icon: 'Folder', color: 'bg-gray-100 text-gray-700' }
}

// Fields to include in templates (exclude project-specific data)
const TEMPLATE_FIELDS = [
  'sections',
  'needsAnalysis',
  'flightPlan',
  'emergency',
  'ppe',
  'comms',
  'hseRisks',
  'soraAssessment'
]

// ============================================
// CREATE TEMPLATE
// ============================================

/**
 * Create a template from a project
 */
export async function createTemplateFromProject(project, templateData) {
  // Extract template-worthy fields from project
  const templateContent = {}
  TEMPLATE_FIELDS.forEach(field => {
    if (project[field] !== undefined) {
      templateContent[field] = JSON.parse(JSON.stringify(project[field]))
    }
  })

  const template = {
    name: templateData.name,
    description: templateData.description || '',
    category: templateData.category || 'other',
    operatorId: templateData.operatorId,
    createdBy: templateData.createdBy,
    createdByName: templateData.createdByName,
    isPublic: templateData.isPublic || false,
    content: templateContent,
    sourceProjectId: project.id || null,
    sourceProjectName: project.name || null,
    usageCount: 0,
    tags: templateData.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'projectTemplates'), template)
  return { id: docRef.id, ...template }
}

/**
 * Create a blank template
 */
export async function createTemplate(templateData) {
  const template = {
    name: templateData.name,
    description: templateData.description || '',
    category: templateData.category || 'other',
    operatorId: templateData.operatorId,
    createdBy: templateData.createdBy,
    createdByName: templateData.createdByName,
    isPublic: templateData.isPublic || false,
    content: templateData.content || {},
    sourceProjectId: null,
    sourceProjectName: null,
    usageCount: 0,
    tags: templateData.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'projectTemplates'), template)
  return { id: docRef.id, ...template }
}

// ============================================
// READ TEMPLATES
// ============================================

/**
 * Get all templates for an operator
 */
export async function getTemplates(operatorId, options = {}) {
  const { category = null, includePublic = true } = options

  // Get operator's templates
  let q = query(
    collection(db, 'projectTemplates'),
    where('operatorId', '==', operatorId),
    orderBy('updatedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  let templates = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))

  // Optionally include public templates from other operators
  if (includePublic) {
    const publicQ = query(
      collection(db, 'projectTemplates'),
      where('isPublic', '==', true),
      orderBy('usageCount', 'desc')
    )
    const publicSnapshot = await getDocs(publicQ)
    const publicTemplates = publicSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }))
      .filter(t => t.operatorId !== operatorId) // Exclude own templates

    templates = [...templates, ...publicTemplates]
  }

  // Filter by category if specified
  if (category) {
    templates = templates.filter(t => t.category === category)
  }

  return templates
}

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId) {
  const docRef = doc(db, 'projectTemplates', templateId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Template not found')
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate(),
    updatedAt: snapshot.data().updatedAt?.toDate()
  }
}

// ============================================
// UPDATE TEMPLATE
// ============================================

/**
 * Update a template
 */
export async function updateTemplate(templateId, updates) {
  const templateRef = doc(db, 'projectTemplates', templateId)
  await updateDoc(templateRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Increment usage count
 */
export async function incrementTemplateUsage(templateId) {
  const template = await getTemplate(templateId)
  await updateTemplate(templateId, {
    usageCount: (template.usageCount || 0) + 1
  })
}

// ============================================
// DELETE TEMPLATE
// ============================================

/**
 * Delete a template
 */
export async function deleteTemplate(templateId) {
  await deleteDoc(doc(db, 'projectTemplates', templateId))
}

// ============================================
// APPLY TEMPLATE
// ============================================

/**
 * Apply a template to create new project data
 */
export async function applyTemplate(templateId, baseProjectData = {}) {
  const template = await getTemplate(templateId)

  // Merge template content with base project data
  const projectData = {
    ...baseProjectData,
    ...template.content,
    templateId: templateId,
    templateName: template.name
  }

  // Increment usage count
  await incrementTemplateUsage(templateId)

  return projectData
}

/**
 * Get template content to preview
 */
export function getTemplatePreview(template) {
  const content = template.content || {}
  const preview = {
    sections: content.sections ? Object.keys(content.sections).filter(k => content.sections[k]).length : 0,
    hasFlightPlan: !!content.flightPlan,
    hasEmergencyPlan: !!content.emergency,
    hasPPE: !!content.ppe,
    hasComms: !!content.comms,
    hasHSERisks: content.hseRisks?.length > 0,
    hasSORA: !!content.soraAssessment,
    hasNeedsAnalysis: !!content.needsAnalysis
  }
  return preview
}

export default {
  TEMPLATE_CATEGORIES,
  createTemplateFromProject,
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  incrementTemplateUsage,
  deleteTemplate,
  applyTemplate,
  getTemplatePreview
}
