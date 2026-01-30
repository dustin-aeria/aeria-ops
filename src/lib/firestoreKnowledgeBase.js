/**
 * firestoreKnowledgeBase.js
 * Knowledge Base Indexing System for Compliance Assistant
 *
 * This system indexes organization documentation into searchable chunks,
 * enabling intelligent compliance assistance by finding relevant
 * policies, procedures, and evidence.
 *
 * Collections:
 * - knowledgeBase/{organizationId}/chunks - Indexed document chunks
 * - knowledgeBase/{organizationId}/indexStatus - Indexing status and metadata
 *
 * @location src/lib/firestoreKnowledgeBase.js
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// SOURCE TYPES
// ============================================

export const SOURCE_TYPES = {
  policy: {
    id: 'policy',
    name: 'Policy',
    description: 'Organizational policies and procedures',
    icon: 'FileText',
    color: 'blue'
  },
  project: {
    id: 'project',
    name: 'Project',
    description: 'Project documentation (SORA, site surveys, flight plans)',
    icon: 'FolderOpen',
    color: 'green'
  },
  equipment: {
    id: 'equipment',
    name: 'Equipment',
    description: 'Aircraft specs, maintenance records, certifications',
    icon: 'Plane',
    color: 'purple'
  },
  crew: {
    id: 'crew',
    name: 'Crew',
    description: 'Crew qualifications, training records, certifications',
    icon: 'Users',
    color: 'amber'
  },
  upload: {
    id: 'upload',
    name: 'Upload',
    description: 'User-uploaded reference documents',
    icon: 'Upload',
    color: 'gray'
  }
}

// ============================================
// KNOWLEDGE BASE CHUNKS
// ============================================

/**
 * Create a knowledge base chunk
 * @param {string} organizationId - Organization ID
 * @param {Object} chunkData - Chunk data
 * @returns {Promise<Object>}
 */
export async function createChunk(organizationId, chunkData) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')

  const chunk = {
    // Source identification
    sourceType: chunkData.sourceType, // 'policy', 'project', 'equipment', 'crew', 'upload'
    sourceId: chunkData.sourceId,
    sourceTitle: chunkData.sourceTitle,
    sourceNumber: chunkData.sourceNumber || null,

    // Content
    section: chunkData.section || null,
    sectionTitle: chunkData.sectionTitle || null,
    content: chunkData.content,
    contentPreview: chunkData.content.substring(0, 200),
    pageNumber: chunkData.pageNumber || null,

    // Search optimization
    keywords: chunkData.keywords || [],
    regulatoryRefs: chunkData.regulatoryRefs || [],
    categories: chunkData.categories || [],

    // Metadata
    version: chunkData.version || '1.0',
    effectiveDate: chunkData.effectiveDate || null,
    lastUpdated: serverTimestamp(),
    indexedAt: serverTimestamp(),

    // Computed fields for search
    searchText: buildSearchText(chunkData),
    wordCount: (chunkData.content || '').split(/\s+/).length
  }

  const docRef = await addDoc(chunksRef, chunk)
  return { id: docRef.id, ...chunk }
}

/**
 * Create multiple chunks in a batch
 * @param {string} organizationId - Organization ID
 * @param {Array} chunks - Array of chunk data
 * @returns {Promise<Object>} Result with counts
 */
export async function createChunksBatch(organizationId, chunks) {
  const batch = writeBatch(db)
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const results = { created: 0, errors: [] }

  for (const chunkData of chunks) {
    try {
      const chunk = {
        sourceType: chunkData.sourceType,
        sourceId: chunkData.sourceId,
        sourceTitle: chunkData.sourceTitle,
        sourceNumber: chunkData.sourceNumber || null,
        section: chunkData.section || null,
        sectionTitle: chunkData.sectionTitle || null,
        content: chunkData.content,
        contentPreview: chunkData.content.substring(0, 200),
        pageNumber: chunkData.pageNumber || null,
        keywords: chunkData.keywords || [],
        regulatoryRefs: chunkData.regulatoryRefs || [],
        categories: chunkData.categories || [],
        version: chunkData.version || '1.0',
        effectiveDate: chunkData.effectiveDate || null,
        lastUpdated: serverTimestamp(),
        indexedAt: serverTimestamp(),
        searchText: buildSearchText(chunkData),
        wordCount: (chunkData.content || '').split(/\s+/).length
      }

      const docRef = doc(chunksRef)
      batch.set(docRef, chunk)
      results.created++
    } catch (error) {
      results.errors.push({ chunkData, error: error.message })
    }
  }

  await batch.commit()
  return results
}

/**
 * Build searchable text from chunk data
 * @param {Object} chunkData - Chunk data
 * @returns {string} Combined searchable text
 */
function buildSearchText(chunkData) {
  const parts = [
    chunkData.sourceTitle || '',
    chunkData.sectionTitle || '',
    chunkData.content || '',
    ...(chunkData.keywords || []),
    ...(chunkData.regulatoryRefs || [])
  ]
  return parts.join(' ').toLowerCase()
}

/**
 * Get all chunks for an organization
 * @param {string} organizationId - Organization ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getChunks(organizationId, filters = {}) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  let q = query(chunksRef, orderBy('sourceTitle', 'asc'))

  if (filters.sourceType) {
    q = query(chunksRef, where('sourceType', '==', filters.sourceType), orderBy('sourceTitle', 'asc'))
  }

  if (filters.sourceId) {
    q = query(chunksRef, where('sourceId', '==', filters.sourceId), orderBy('indexedAt', 'desc'))
  }

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Delete all chunks for a source
 * @param {string} organizationId - Organization ID
 * @param {string} sourceType - Source type
 * @param {string} sourceId - Source ID
 */
export async function deleteChunksBySource(organizationId, sourceType, sourceId) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const q = query(
    chunksRef,
    where('sourceType', '==', sourceType),
    where('sourceId', '==', sourceId)
  )

  const snapshot = await getDocs(q)
  const batch = writeBatch(db)

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref)
  })

  await batch.commit()
  return { deleted: snapshot.docs.length }
}

/**
 * Clear all chunks for an organization
 * @param {string} organizationId - Organization ID
 */
export async function clearAllChunks(organizationId) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const snapshot = await getDocs(chunksRef)

  // Delete in batches of 500 (Firestore limit)
  const batches = []
  let currentBatch = writeBatch(db)
  let operationCount = 0

  for (const docSnapshot of snapshot.docs) {
    currentBatch.delete(docSnapshot.ref)
    operationCount++

    if (operationCount === 500) {
      batches.push(currentBatch)
      currentBatch = writeBatch(db)
      operationCount = 0
    }
  }

  if (operationCount > 0) {
    batches.push(currentBatch)
  }

  for (const batch of batches) {
    await batch.commit()
  }

  return { deleted: snapshot.docs.length }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Search knowledge base chunks
 * @param {string} organizationId - Organization ID
 * @param {string} searchQuery - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results with relevance scoring
 */
export async function searchKnowledgeBase(organizationId, searchQuery, options = {}) {
  const {
    sourceTypes = null,
    categories = null,
    regulatoryRef = null,
    maxResults = 20
  } = options

  // Get all chunks (in production, this would use a search index like Algolia or Typesense)
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  let q = chunksRef

  if (sourceTypes && sourceTypes.length > 0) {
    q = query(chunksRef, where('sourceType', 'in', sourceTypes))
  }

  const snapshot = await getDocs(q)
  const chunks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Score and filter results
  const queryTerms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2)
  const scoredResults = []

  for (const chunk of chunks) {
    // Apply additional filters
    if (categories && categories.length > 0) {
      if (!chunk.categories || !categories.some(c => chunk.categories.includes(c))) {
        continue
      }
    }

    if (regulatoryRef) {
      if (!chunk.regulatoryRefs || !chunk.regulatoryRefs.some(r =>
        r.toLowerCase().includes(regulatoryRef.toLowerCase())
      )) {
        continue
      }
    }

    // Calculate relevance score
    const score = calculateRelevanceScore(chunk, queryTerms, searchQuery)

    if (score > 0) {
      scoredResults.push({
        ...chunk,
        relevanceScore: score,
        matchedTerms: queryTerms.filter(term => chunk.searchText?.includes(term))
      })
    }
  }

  // Sort by relevance and limit
  scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
  return scoredResults.slice(0, maxResults)
}

/**
 * Calculate relevance score for a chunk
 * @param {Object} chunk - Chunk data
 * @param {Array} queryTerms - Parsed query terms
 * @param {string} originalQuery - Original search query
 * @returns {number} Relevance score (0-100)
 */
function calculateRelevanceScore(chunk, queryTerms, originalQuery) {
  let score = 0
  const searchText = chunk.searchText || ''
  const content = (chunk.content || '').toLowerCase()
  const title = (chunk.sourceTitle || '').toLowerCase()
  const sectionTitle = (chunk.sectionTitle || '').toLowerCase()
  const keywords = (chunk.keywords || []).map(k => k.toLowerCase())
  const regulatoryRefs = (chunk.regulatoryRefs || []).map(r => r.toLowerCase())

  // Exact phrase match in content (highest weight)
  if (content.includes(originalQuery.toLowerCase())) {
    score += 50
  }

  // Exact phrase in title
  if (title.includes(originalQuery.toLowerCase())) {
    score += 40
  }

  // Term matches
  for (const term of queryTerms) {
    // Title match
    if (title.includes(term)) {
      score += 15
    }

    // Section title match
    if (sectionTitle.includes(term)) {
      score += 12
    }

    // Keyword match
    if (keywords.some(k => k.includes(term))) {
      score += 10
    }

    // Regulatory reference match
    if (regulatoryRefs.some(r => r.includes(term))) {
      score += 8
    }

    // Content match
    if (content.includes(term)) {
      score += 5
      // Bonus for multiple occurrences
      const occurrences = (content.match(new RegExp(term, 'g')) || []).length
      score += Math.min(occurrences, 5)
    }
  }

  // Normalize to 0-100
  return Math.min(score, 100)
}

/**
 * Find chunks related to a regulatory reference
 * @param {string} organizationId - Organization ID
 * @param {string} regulatoryRef - Regulatory reference (e.g., "CAR 903.02")
 * @returns {Promise<Array>}
 */
export async function findByRegulatoryRef(organizationId, regulatoryRef) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const q = query(chunksRef, where('regulatoryRefs', 'array-contains', regulatoryRef))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Find chunks by keyword
 * @param {string} organizationId - Organization ID
 * @param {string} keyword - Keyword to search
 * @returns {Promise<Array>}
 */
export async function findByKeyword(organizationId, keyword) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const q = query(chunksRef, where('keywords', 'array-contains', keyword.toLowerCase()))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// ============================================
// INDEX STATUS TRACKING
// ============================================

/**
 * Get indexing status for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>}
 */
export async function getIndexStatus(organizationId) {
  const statusRef = doc(db, 'knowledgeBase', organizationId, 'meta', 'indexStatus')
  const snapshot = await getDoc(statusRef)

  if (!snapshot.exists()) {
    return {
      isIndexed: false,
      lastIndexedAt: null,
      totalChunks: 0,
      bySourceType: {}
    }
  }

  return snapshot.data()
}

/**
 * Update indexing status
 * @param {string} organizationId - Organization ID
 * @param {Object} status - Status data
 */
export async function updateIndexStatus(organizationId, status) {
  const statusRef = doc(db, 'knowledgeBase', organizationId, 'meta', 'indexStatus')
  await setDoc(statusRef, {
    ...status,
    lastUpdated: serverTimestamp()
  }, { merge: true })
}

/**
 * Calculate and update index statistics
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated statistics
 */
export async function refreshIndexStats(organizationId) {
  const chunksRef = collection(db, 'knowledgeBase', organizationId, 'chunks')
  const snapshot = await getDocs(chunksRef)

  const stats = {
    totalChunks: snapshot.docs.length,
    bySourceType: {},
    byCategory: {},
    uniqueSources: new Set(),
    regulatoryRefs: new Set()
  }

  for (const doc of snapshot.docs) {
    const data = doc.data()

    // Count by source type
    stats.bySourceType[data.sourceType] = (stats.bySourceType[data.sourceType] || 0) + 1

    // Track unique sources
    stats.uniqueSources.add(`${data.sourceType}:${data.sourceId}`)

    // Count by category
    for (const cat of (data.categories || [])) {
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1
    }

    // Collect regulatory refs
    for (const ref of (data.regulatoryRefs || [])) {
      stats.regulatoryRefs.add(ref)
    }
  }

  // Convert Sets to arrays for storage
  const status = {
    isIndexed: stats.totalChunks > 0,
    lastIndexedAt: serverTimestamp(),
    totalChunks: stats.totalChunks,
    uniqueSources: stats.uniqueSources.size,
    bySourceType: stats.bySourceType,
    byCategory: stats.byCategory,
    regulatoryRefs: [...stats.regulatoryRefs]
  }

  await updateIndexStatus(organizationId, status)
  return status
}

// ============================================
// COMPLIANCE SUGGESTION HELPERS
// ============================================

/**
 * Find relevant documentation for a compliance requirement
 * @param {string} organizationId - Organization ID
 * @param {Object} requirement - Compliance requirement object
 * @returns {Promise<Object>} Suggestions with ranked results
 */
export async function findRelevantDocs(organizationId, requirement) {
  const suggestions = {
    directMatches: [],
    relatedMatches: [],
    suggestedPolicies: [],
    gaps: []
  }

  // Search by regulatory reference if present
  if (requirement.regulatoryRef) {
    const regMatches = await findByRegulatoryRef(organizationId, requirement.regulatoryRef)
    suggestions.directMatches.push(...regMatches.slice(0, 5))
  }

  // Search by requirement text
  const textMatches = await searchKnowledgeBase(
    organizationId,
    requirement.shortText || requirement.text,
    { maxResults: 10 }
  )
  suggestions.relatedMatches.push(...textMatches.filter(
    m => !suggestions.directMatches.some(d => d.id === m.id)
  ))

  // Check suggested policies
  if (requirement.suggestedPolicies && requirement.suggestedPolicies.length > 0) {
    for (const policyNumber of requirement.suggestedPolicies) {
      const policyChunks = await searchKnowledgeBase(
        organizationId,
        policyNumber,
        { sourceTypes: ['policy'], maxResults: 3 }
      )

      if (policyChunks.length > 0) {
        suggestions.suggestedPolicies.push({
          policyNumber,
          found: true,
          chunks: policyChunks
        })
      } else {
        suggestions.gaps.push({
          type: 'missing-policy',
          policyNumber,
          message: `Policy ${policyNumber} not found in knowledge base`
        })
      }
    }
  }

  // Search by keywords from guidance
  if (requirement.guidance) {
    const keywords = extractKeywords(requirement.guidance)
    for (const keyword of keywords.slice(0, 3)) {
      const keywordMatches = await findByKeyword(organizationId, keyword)
      suggestions.relatedMatches.push(...keywordMatches.filter(
        m => !suggestions.directMatches.some(d => d.id === m.id) &&
          !suggestions.relatedMatches.some(r => r.id === m.id)
      ).slice(0, 2))
    }
  }

  // Rank and deduplicate
  suggestions.directMatches = rankResults(suggestions.directMatches)
  suggestions.relatedMatches = rankResults(suggestions.relatedMatches).slice(0, 10)

  return suggestions
}

/**
 * Extract keywords from text
 * @param {string} text - Source text
 * @returns {Array} Keywords
 */
function extractKeywords(text) {
  // Common compliance keywords to look for
  const complianceTerms = [
    'conops', 'sora', 'sail', 'oso', 'risk assessment', 'emergency', 'procedures',
    'maintenance', 'inspection', 'training', 'certification', 'qualification',
    'safety', 'operations', 'manual', 'airspace', 'bvlos', 'vlos', 'pilot',
    'crew', 'insurance', 'registration', 'c2 link', 'lost link', 'geo-fence'
  ]

  const textLower = text.toLowerCase()
  const found = complianceTerms.filter(term => textLower.includes(term))

  return found
}

/**
 * Rank results by relevance
 * @param {Array} results - Search results
 * @returns {Array} Ranked results
 */
function rankResults(results) {
  return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
}

// ============================================
// EXPORT
// ============================================

export default {
  SOURCE_TYPES,
  createChunk,
  createChunksBatch,
  getChunks,
  deleteChunksBySource,
  clearAllChunks,
  searchKnowledgeBase,
  findByRegulatoryRef,
  findByKeyword,
  getIndexStatus,
  updateIndexStatus,
  refreshIndexStats,
  findRelevantDocs
}
