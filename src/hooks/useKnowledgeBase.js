/**
 * useKnowledgeBase.js
 * Custom hook for Knowledge Base functionality
 *
 * Provides easy access to knowledge base search, indexing,
 * and suggestion capabilities throughout the application.
 *
 * @location src/hooks/useKnowledgeBase.js
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  searchKnowledgeBase,
  getIndexStatus,
  findRelevantDocs,
  findByRegulatoryRef,
  findByKeyword,
  refreshIndexStats
} from '../lib/firestoreKnowledgeBase'
import {
  indexAllPolicies,
  indexSinglePolicy,
  indexProject,
  indexEquipment,
  indexCrew,
  fullReindex
} from '../lib/knowledgeBaseIndexer'

/**
 * Main hook for knowledge base operations
 */
export function useKnowledgeBase() {
  const { user } = useAuth()

  const [indexStatus, setIndexStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [indexing, setIndexing] = useState(false)
  const [error, setError] = useState(null)

  // Load index status on mount
  useEffect(() => {
    if (user) {
      loadIndexStatus()
    }
  }, [user])

  const loadIndexStatus = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const status = await getIndexStatus(user.uid)
      setIndexStatus(status)
    } catch (err) {
      setError(err.message)
      console.error('Error loading index status:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const search = useCallback(async (query, options = {}) => {
    if (!user || !query) return []

    try {
      return await searchKnowledgeBase(user.uid, query, options)
    } catch (err) {
      console.error('Search error:', err)
      throw err
    }
  }, [user])

  const findForRequirement = useCallback(async (requirement) => {
    if (!user || !requirement) return null

    try {
      return await findRelevantDocs(user.uid, requirement)
    } catch (err) {
      console.error('Error finding docs:', err)
      throw err
    }
  }, [user])

  const findByRegRef = useCallback(async (regulatoryRef) => {
    if (!user || !regulatoryRef) return []

    try {
      return await findByRegulatoryRef(user.uid, regulatoryRef)
    } catch (err) {
      console.error('Error finding by reg ref:', err)
      throw err
    }
  }, [user])

  const reindexPolicies = useCallback(async (clearExisting = true) => {
    if (!user) return null

    setIndexing(true)
    setError(null)

    try {
      const result = await indexAllPolicies(user.uid, { clearExisting })
      await loadIndexStatus()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIndexing(false)
    }
  }, [user, loadIndexStatus])

  const reindexAll = useCallback(async () => {
    if (!user) return null

    setIndexing(true)
    setError(null)

    try {
      const result = await fullReindex(user.uid)
      await loadIndexStatus()
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIndexing(false)
    }
  }, [user, loadIndexStatus])

  const indexPolicy = useCallback(async (policy) => {
    if (!user || !policy) return null

    try {
      const result = await indexSinglePolicy(user.uid, policy)
      await loadIndexStatus()
      return result
    } catch (err) {
      console.error('Error indexing policy:', err)
      throw err
    }
  }, [user, loadIndexStatus])

  const indexProjectData = useCallback(async (project) => {
    if (!user || !project) return null

    try {
      const result = await indexProject(user.uid, project)
      await loadIndexStatus()
      return result
    } catch (err) {
      console.error('Error indexing project:', err)
      throw err
    }
  }, [user, loadIndexStatus])

  const indexEquipmentData = useCallback(async (equipment) => {
    if (!user || !equipment) return null

    try {
      const result = await indexEquipment(user.uid, equipment)
      await loadIndexStatus()
      return result
    } catch (err) {
      console.error('Error indexing equipment:', err)
      throw err
    }
  }, [user, loadIndexStatus])

  const indexCrewData = useCallback(async (crew) => {
    if (!user || !crew) return null

    try {
      const result = await indexCrew(user.uid, crew)
      await loadIndexStatus()
      return result
    } catch (err) {
      console.error('Error indexing crew:', err)
      throw err
    }
  }, [user, loadIndexStatus])

  return {
    // Status
    indexStatus,
    isIndexed: indexStatus?.isIndexed || false,
    totalChunks: indexStatus?.totalChunks || 0,
    loading,
    indexing,
    error,

    // Actions
    search,
    findForRequirement,
    findByRegRef,
    reindexPolicies,
    reindexAll,
    indexPolicy,
    indexProjectData,
    indexEquipmentData,
    indexCrewData,
    refreshStatus: loadIndexStatus
  }
}

/**
 * Hook for debounced search
 */
export function useKnowledgeBaseSearch(initialQuery = '', debounceMs = 300) {
  const { search } = useKnowledgeBase()

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      setError(null)

      try {
        const searchResults = await search(query)
        setResults(searchResults)
      } catch (err) {
        setError(err.message)
        setResults([])
      } finally {
        setSearching(false)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, search, debounceMs])

  return {
    query,
    setQuery,
    results,
    searching,
    error,
    clearResults: () => setResults([])
  }
}

/**
 * Hook for requirement-specific suggestions
 */
export function useRequirementSuggestions(requirement) {
  const { findForRequirement, isIndexed } = useKnowledgeBase()

  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSuggestions = useCallback(async () => {
    if (!requirement || !isIndexed) return

    setLoading(true)
    setError(null)

    try {
      const results = await findForRequirement(requirement)
      setSuggestions(results)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [requirement, isIndexed, findForRequirement])

  // Reset when requirement changes
  useEffect(() => {
    setSuggestions(null)
    setError(null)
  }, [requirement?.id])

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    directMatches: suggestions?.directMatches || [],
    relatedMatches: suggestions?.relatedMatches || [],
    gaps: suggestions?.gaps || [],
    hasSuggestions: (suggestions?.directMatches?.length || 0) + (suggestions?.relatedMatches?.length || 0) > 0
  }
}

export default useKnowledgeBase
