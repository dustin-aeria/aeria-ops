/**
 * Search Service
 * Unified search across all platform entities
 *
 * @location src/lib/searchService.js
 */

import { getProjects, getClients, getOperators, getAircraft, getEquipment } from './firestore'
import { getAllIncidents } from './firestoreIncidents'
import { getAllCapas } from './firestoreCapas'
import { logger } from './logger'

// ============================================
// SEARCH CONFIGURATION
// ============================================

export const SEARCH_ENTITIES = {
  projects: {
    label: 'Projects',
    icon: 'FolderKanban',
    color: 'bg-blue-100 text-blue-700',
    fields: ['name', 'projectCode', 'clientName', 'description'],
    route: '/projects'
  },
  clients: {
    label: 'Clients',
    icon: 'Building2',
    color: 'bg-green-100 text-green-700',
    fields: ['name', 'contactName', 'email', 'phone'],
    route: '/clients'
  },
  operators: {
    label: 'Team Members',
    icon: 'Users',
    color: 'bg-purple-100 text-purple-700',
    fields: ['firstName', 'lastName', 'email', 'role'],
    route: '/operators'
  },
  aircraft: {
    label: 'Aircraft',
    icon: 'Plane',
    color: 'bg-indigo-100 text-indigo-700',
    fields: ['nickname', 'make', 'model', 'serialNumber', 'registration'],
    route: '/aircraft'
  },
  equipment: {
    label: 'Equipment',
    icon: 'Package',
    color: 'bg-amber-100 text-amber-700',
    fields: ['name', 'manufacturer', 'model', 'serialNumber'],
    route: '/equipment'
  },
  incidents: {
    label: 'Incidents',
    icon: 'AlertTriangle',
    color: 'bg-red-100 text-red-700',
    fields: ['title', 'description', 'location', 'reportedByName'],
    route: '/incidents'
  },
  capas: {
    label: 'CAPAs',
    icon: 'Target',
    color: 'bg-orange-100 text-orange-700',
    fields: ['title', 'description', 'ownerName'],
    route: '/capas'
  }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Search across all entities
 */
export async function globalSearch(query, options = {}) {
  const {
    organizationId = null,
    entities = Object.keys(SEARCH_ENTITIES),
    limit = 10
  } = options

  if (!query || query.length < 2) {
    return { results: [], total: 0 }
  }

  const searchPromises = entities.map(entity =>
    searchEntity(entity, query, organizationId, limit)
  )

  const results = await Promise.all(searchPromises)
  const allResults = results.flat()

  // Sort by relevance (exact matches first, then partial)
  const sortedResults = sortByRelevance(allResults, query)

  return {
    results: sortedResults.slice(0, limit * 2),
    total: allResults.length,
    byEntity: entities.reduce((acc, entity, index) => {
      acc[entity] = results[index].length
      return acc
    }, {})
  }
}

/**
 * Search within a specific entity type
 */
export async function searchEntity(entityType, query, organizationId = null, maxResults = 20) {
  const config = SEARCH_ENTITIES[entityType]
  if (!config) return []

  try {
    let items = []

    switch (entityType) {
      case 'projects':
        items = await getProjects()
        break
      case 'clients':
        items = await getClients()
        break
      case 'operators':
        items = await getOperators()
        break
      case 'aircraft':
        items = await getAircraft()
        break
      case 'equipment':
        items = await getEquipment()
        break
      case 'incidents':
        items = organizationId ? await getAllIncidents(organizationId) : []
        break
      case 'capas':
        items = organizationId ? await getAllCapas(organizationId) : []
        break
      default:
        items = []
    }

    // Filter by search query
    const filtered = filterByQuery(items, query, config.fields)

    // Add entity type and route info
    return filtered.slice(0, maxResults).map(item => ({
      ...item,
      _entityType: entityType,
      _entityConfig: config,
      _matchedFields: getMatchedFields(item, query, config.fields),
      _route: getItemRoute(entityType, item)
    }))
  } catch (err) {
    logger.error(`Search error for ${entityType}:`, err)
    return []
  }
}

/**
 * Quick search for command palette
 */
export async function quickSearch(query, organizationId = null) {
  if (!query || query.length < 2) {
    return []
  }

  const results = await globalSearch(query, {
    organizationId,
    entities: ['projects', 'clients', 'operators', 'aircraft', 'equipment'],
    limit: 5
  })

  return results.results.slice(0, 10)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Filter items by search query
 */
function filterByQuery(items, query, fields) {
  const searchTerms = query.toLowerCase().split(/\s+/)

  return items.filter(item => {
    return searchTerms.every(term => {
      return fields.some(field => {
        const value = getNestedValue(item, field)
        if (!value) return false
        return String(value).toLowerCase().includes(term)
      })
    })
  })
}

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Get fields that matched the query
 */
function getMatchedFields(item, query, fields) {
  const searchTerms = query.toLowerCase().split(/\s+/)
  const matched = []

  fields.forEach(field => {
    const value = getNestedValue(item, field)
    if (value) {
      const valueStr = String(value).toLowerCase()
      if (searchTerms.some(term => valueStr.includes(term))) {
        matched.push({
          field,
          value: String(value)
        })
      }
    }
  })

  return matched
}

/**
 * Sort results by relevance
 */
function sortByRelevance(results, query) {
  const queryLower = query.toLowerCase()

  return results.sort((a, b) => {
    // Exact name/title match first
    const aName = (a.name || a.title || a.firstName || '').toLowerCase()
    const bName = (b.name || b.title || b.firstName || '').toLowerCase()

    const aExact = aName === queryLower
    const bExact = bName === queryLower
    if (aExact && !bExact) return -1
    if (bExact && !aExact) return 1

    // Starts with query
    const aStarts = aName.startsWith(queryLower)
    const bStarts = bName.startsWith(queryLower)
    if (aStarts && !bStarts) return -1
    if (bStarts && !aStarts) return 1

    // More matched fields = higher relevance
    const aMatches = a._matchedFields?.length || 0
    const bMatches = b._matchedFields?.length || 0
    if (aMatches !== bMatches) return bMatches - aMatches

    // Alphabetical
    return aName.localeCompare(bName)
  })
}

/**
 * Get route for an item
 */
function getItemRoute(entityType, item) {
  switch (entityType) {
    case 'projects':
      return `/projects/${item.id}`
    case 'clients':
      return `/clients`
    case 'operators':
      return `/operators`
    case 'aircraft':
      return `/aircraft`
    case 'equipment':
      return `/equipment/${item.id}`
    case 'incidents':
      return `/incidents/${item.id}`
    case 'capas':
      return `/capas/${item.id}`
    default:
      return '/'
  }
}

/**
 * Get display name for search result
 */
export function getResultDisplayName(result) {
  if (result.name) return result.name
  if (result.title) return result.title
  if (result.firstName && result.lastName) return `${result.firstName} ${result.lastName}`
  if (result.nickname) return result.nickname
  return 'Unnamed'
}

/**
 * Get subtitle for search result
 */
export function getResultSubtitle(result) {
  const entityType = result._entityType

  switch (entityType) {
    case 'projects':
      return result.clientName || result.status || 'Project'
    case 'clients':
      return result.contactName || result.email || 'Client'
    case 'operators':
      return result.role || result.email || 'Team Member'
    case 'aircraft':
      return `${result.make || ''} ${result.model || ''}`.trim() || 'Aircraft'
    case 'equipment':
      return `${result.manufacturer || ''} ${result.model || ''}`.trim() || 'Equipment'
    case 'incidents':
      return result.incidentDate ? new Date(result.incidentDate).toLocaleDateString() : 'Incident'
    case 'capas':
      return result.status || 'CAPA'
    default:
      return ''
  }
}

/**
 * Highlight matching text
 */
export function highlightMatch(text, query) {
  if (!text || !query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ============================================
// RECENT SEARCHES
// ============================================

const RECENT_SEARCHES_KEY = 'aeria_recent_searches'
const MAX_RECENT_SEARCHES = 10

/**
 * Get recent searches from local storage
 */
export function getRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add to recent searches
 */
export function addRecentSearch(query) {
  if (!query || query.length < 2) return

  const recent = getRecentSearches()
  const filtered = recent.filter(s => s.toLowerCase() !== query.toLowerCase())
  const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)

  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore storage errors
  }
}

export default {
  SEARCH_ENTITIES,
  globalSearch,
  searchEntity,
  quickSearch,
  getResultDisplayName,
  getResultSubtitle,
  highlightMatch,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches
}
