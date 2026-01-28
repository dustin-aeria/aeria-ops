/**
 * PolicyLibrarySelector.jsx
 * Modal for selecting and importing policies from the master library
 *
 * Allows users to:
 * - Browse all available master policies
 * - Filter by category
 * - Select specific policies to import
 * - Preview policy details before importing
 *
 * @location src/components/policies/PolicyLibrarySelector.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Search,
  Check,
  FileText,
  Plane,
  Users,
  HardHat,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { getPublishedMasterPolicies } from '../../lib/firestoreMasterPolicies'
import { getPoliciesEnhanced, createPolicyEnhanced } from '../../lib/firestorePolicies'
import { useAuth } from '../../contexts/AuthContext'
import { logger } from '../../lib/logger'

const CATEGORIES = {
  rpas: {
    id: 'rpas',
    name: 'RPAS Operations',
    icon: Plane,
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  crm: {
    id: 'crm',
    name: 'Crew Resource Management',
    icon: Users,
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  hse: {
    id: 'hse',
    name: 'Health, Safety & Environment',
    icon: HardHat,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  }
}

export default function PolicyLibrarySelector({ isOpen, onClose, onImported }) {
  const { user } = useAuth()
  const [masterPolicies, setMasterPolicies] = useState([])
  const [existingPolicies, setExistingPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [selectedPolicies, setSelectedPolicies] = useState(new Set())
  const [previewPolicy, setPreviewPolicy] = useState(null)
  const [importResults, setImportResults] = useState(null)

  // Load master policies and existing policies
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [master, existing] = await Promise.all([
          getPublishedMasterPolicies(),
          getPoliciesEnhanced()
        ])
        setMasterPolicies(master)
        setExistingPolicies(existing)
      } catch (err) {
        logger.error('Failed to load policies:', err)
        setError('Failed to load policy library. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen])

  // Get existing policy numbers for comparison
  const existingNumbers = useMemo(() => {
    return new Set(existingPolicies.map(p => p.number))
  }, [existingPolicies])

  // Filter policies
  const filteredPolicies = useMemo(() => {
    let result = [...masterPolicies]

    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.number?.includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    return result.sort((a, b) => (a.number || '').localeCompare(b.number || '', undefined, { numeric: true }))
  }, [masterPolicies, categoryFilter, searchQuery])

  // Group by category for display
  const groupedPolicies = useMemo(() => {
    const groups = {}
    for (const policy of filteredPolicies) {
      const cat = policy.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(policy)
    }
    return groups
  }, [filteredPolicies])

  // Stats
  const stats = useMemo(() => {
    const available = masterPolicies.filter(p => !existingNumbers.has(p.number)).length
    const alreadyHave = masterPolicies.filter(p => existingNumbers.has(p.number)).length
    return { total: masterPolicies.length, available, alreadyHave }
  }, [masterPolicies, existingNumbers])

  // Toggle policy selection
  const toggleSelection = (policyId) => {
    const newSelection = new Set(selectedPolicies)
    if (newSelection.has(policyId)) {
      newSelection.delete(policyId)
    } else {
      newSelection.add(policyId)
    }
    setSelectedPolicies(newSelection)
  }

  // Select all visible policies that aren't already imported
  const selectAllNew = () => {
    const newSelection = new Set(selectedPolicies)
    for (const policy of filteredPolicies) {
      if (!existingNumbers.has(policy.number)) {
        newSelection.add(policy.id)
      }
    }
    setSelectedPolicies(newSelection)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedPolicies(new Set())
  }

  // Import selected policies
  const handleImport = async () => {
    if (selectedPolicies.size === 0 || !user) return

    setImporting(true)
    setError('')
    const results = { imported: 0, skipped: 0, errors: [] }

    for (const policyId of selectedPolicies) {
      const masterPolicy = masterPolicies.find(p => p.id === policyId)
      if (!masterPolicy) continue

      // Skip if already exists
      if (existingNumbers.has(masterPolicy.number)) {
        results.skipped++
        continue
      }

      try {
        await createPolicyEnhanced({
          number: masterPolicy.number,
          title: masterPolicy.title,
          category: masterPolicy.category,
          description: masterPolicy.description,
          content: masterPolicy.content,
          version: '1.0',
          status: 'active',
          owner: masterPolicy.metadata?.owner || '',
          regulatoryRefs: masterPolicy.metadata?.regulatoryRefs || [],
          keywords: masterPolicy.metadata?.keywords || [],
          sections: masterPolicy.metadata?.sections || [],
          effectiveDate: masterPolicy.metadata?.effectiveDate || new Date().toISOString().split('T')[0],
          reviewDate: masterPolicy.metadata?.reviewDate || null,
          sourceId: masterPolicy.id,
          sourceVersion: masterPolicy.version,
          isCustomized: false
        }, user.uid)

        results.imported++
      } catch (err) {
        logger.error(`Failed to import policy ${masterPolicy.number}:`, err)
        results.errors.push({ number: masterPolicy.number, error: err.message })
      }
    }

    setImportResults(results)
    setImporting(false)

    if (results.imported > 0) {
      // Reload existing policies
      const updated = await getPoliciesEnhanced()
      setExistingPolicies(updated)
      setSelectedPolicies(new Set())
      onImported?.()
    }
  }

  // Reset state on close
  const handleClose = () => {
    setSelectedPolicies(new Set())
    setPreviewPolicy(null)
    setImportResults(null)
    setSearchQuery('')
    setCategoryFilter(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Policy Library</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select policies to add to your library. You can customize them after importing.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <strong>{stats.total}</strong> policies available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">
              <strong>{stats.available}</strong> new to import
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              <strong>{stats.alreadyHave}</strong> already in your library
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-medium text-aeria-navy">
              {selectedPolicies.size} selected
            </span>
            {selectedPolicies.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === null
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.values(CATEGORIES).map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    categoryFilter === cat.id
                      ? `${cat.bgColor} ${cat.textColor}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              )
            })}
          </div>
          <button
            onClick={selectAllNew}
            className="text-sm text-aeria-navy hover:underline whitespace-nowrap"
          >
            Select all new
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Policy list */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-aeria-navy animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No policies found matching your criteria</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPolicies).map(([category, policies]) => {
                  const cat = CATEGORIES[category] || CATEGORIES.rpas
                  const Icon = cat.icon
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 ${cat.textColor}`} />
                        <h3 className={`font-semibold ${cat.textColor}`}>{cat.name}</h3>
                        <span className="text-xs text-gray-500">({policies.length})</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {policies.map(policy => {
                          const isExisting = existingNumbers.has(policy.number)
                          const isSelected = selectedPolicies.has(policy.id)
                          return (
                            <div
                              key={policy.id}
                              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                isExisting
                                  ? 'bg-gray-50 border-gray-200 opacity-60'
                                  : isSelected
                                  ? 'bg-aeria-sky/30 border-aeria-light-blue/50'
                                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                              onClick={() => !isExisting && toggleSelection(policy.id)}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isExisting
                                    ? 'bg-gray-200 border-gray-300'
                                    : isSelected
                                    ? 'bg-aeria-navy border-aeria-navy'
                                    : 'border-gray-300'
                                }`}>
                                  {(isExisting || isSelected) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>

                                {/* Policy number */}
                                <span className={`px-2 py-0.5 rounded text-sm font-bold ${cat.bgColor} ${cat.textColor}`}>
                                  {policy.number}
                                </span>

                                {/* Title */}
                                <span className="flex-1 font-medium text-gray-900 truncate">
                                  {policy.title}
                                </span>

                                {/* Status */}
                                {isExisting && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    Already imported
                                  </span>
                                )}

                                {/* Preview button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPreviewPolicy(policy)
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Preview panel */}
          {previewPolicy && (
            <div className="w-96 border-l border-gray-200 overflow-y-auto bg-gray-50 p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                    CATEGORIES[previewPolicy.category]?.bgColor || 'bg-gray-100'
                  } ${CATEGORIES[previewPolicy.category]?.textColor || 'text-gray-700'}`}>
                    {previewPolicy.number}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2">{previewPolicy.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewPolicy(null)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{previewPolicy.description}</p>

              {previewPolicy.metadata?.owner && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Owner</p>
                  <p className="text-sm text-gray-900">{previewPolicy.metadata.owner}</p>
                </div>
              )}

              {previewPolicy.metadata?.sections?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Sections</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {previewPolicy.metadata.sections.map((section, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        {section}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {previewPolicy.metadata?.regulatoryRefs?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Regulatory References</p>
                  <div className="flex flex-wrap gap-1">
                    {previewPolicy.metadata.regulatoryRefs.map((ref, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!existingNumbers.has(previewPolicy.number) && (
                <button
                  onClick={() => {
                    toggleSelection(previewPolicy.id)
                    setPreviewPolicy(null)
                  }}
                  className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedPolicies.has(previewPolicy.id)
                      ? 'bg-gray-200 text-gray-700'
                      : 'bg-aeria-navy text-white hover:bg-aeria-navy/90'
                  }`}
                >
                  {selectedPolicies.has(previewPolicy.id) ? 'Remove from selection' : 'Add to selection'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Import results */}
        {importResults && (
          <div className="px-6 py-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">
                Successfully imported <strong>{importResults.imported}</strong> policies.
                {importResults.skipped > 0 && ` ${importResults.skipped} skipped (already exist).`}
                {importResults.errors.length > 0 && ` ${importResults.errors.length} failed.`}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>Imported policies can be edited to fit your organization's needs</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedPolicies.size === 0 || importing}
              className="px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Import {selectedPolicies.size} {selectedPolicies.size === 1 ? 'Policy' : 'Policies'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
