/**
 * PolicyVersionHistory.jsx
 * Component for viewing and managing policy version history
 *
 * Features:
 * - Timeline view of all versions
 * - Version comparison (diff view)
 * - Rollback to previous versions
 * - Download previous versions
 *
 * @location src/components/policies/PolicyVersionHistory.jsx
 */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
  GitBranch,
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { getPolicyVersions, rollbackToVersion } from '../../lib/firestorePolicies'
import { usePolicyPermissions } from '../../hooks/usePolicyPermissions'
import { logger } from '../../lib/logger'

/**
 * Format a Firestore timestamp or date string
 */
function formatDate(date) {
  if (!date) return 'Unknown'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Version timeline item component
 */
function VersionItem({ version, isLatest, isExpanded, onToggle, onRollback, canRollback, rolling }) {
  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div
          className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            isLatest
              ? 'bg-green-100 border-green-500 text-green-600'
              : 'bg-white border-gray-300 text-gray-400'
          }`}
        >
          {isLatest ? (
            <Check className="w-4 h-4" />
          ) : (
            <GitBranch className="w-4 h-4" />
          )}
        </div>

        {/* Version card */}
        <div className="flex-1 pb-6">
          <div
            className={`bg-white border rounded-lg overflow-hidden ${
              isLatest ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <button
              onClick={onToggle}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-sm font-bold ${
                    isLatest
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  v{version.version}
                </span>
                {isLatest && (
                  <span className="text-xs text-green-600 font-medium">Current</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(version.createdAt)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 py-3 border-t border-gray-100 space-y-4">
                {/* Version notes */}
                {version.versionNotes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Version Notes</p>
                    <p className="text-sm text-gray-700">{version.versionNotes}</p>
                  </div>
                )}

                {/* Changed fields */}
                {version.changedFields?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Changed Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {version.changedFields.map((field, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content preview */}
                {version.content && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Content Preview</p>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-600 max-h-32 overflow-y-auto">
                      {version.content.substring(0, 500)}
                      {version.content.length > 500 && '...'}
                    </div>
                  </div>
                )}

                {/* Sections */}
                {version.sections?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Sections ({version.sections.length})</p>
                    <div className="space-y-1">
                      {version.sections.map((section, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          {typeof section === 'string' ? section : section.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isLatest && canRollback && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={onRollback}
                      disabled={rolling}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {rolling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Restore this version
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

VersionItem.propTypes = {
  version: PropTypes.object.isRequired,
  isLatest: PropTypes.bool,
  isExpanded: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onRollback: PropTypes.func.isRequired,
  canRollback: PropTypes.bool,
  rolling: PropTypes.bool
}

/**
 * Main PolicyVersionHistory component
 */
export default function PolicyVersionHistory({ policy, onVersionRestored }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [rollingBack, setRollingBack] = useState(false)

  const permissions = usePolicyPermissions(policy)

  // Load versions
  useEffect(() => {
    if (policy?.id) {
      loadVersions()
    }
  }, [policy?.id])

  const loadVersions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPolicyVersions(policy.id)
      setVersions(data)
      // Auto-expand the latest version
      if (data.length > 0) {
        setExpandedId(data[0].id)
      }
    } catch (err) {
      setError('Failed to load version history')
      logger.error('Error loading versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRollback = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version? A new version will be created from the current state before restoring.')) {
      return
    }

    try {
      setRollingBack(true)
      setError('')
      await rollbackToVersion(policy.id, versionId)
      await loadVersions()
      onVersionRestored?.()
    } catch (err) {
      setError(err.message || 'Failed to restore version')
    } finally {
      setRollingBack(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No version history available</p>
        <p className="text-sm text-gray-400">
          Versions are created when the policy content is modified
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-gray-500" />
          Version History
        </h3>
        <span className="text-sm text-gray-500">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Current version info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">
              Current Version: {policy.version}
            </p>
            {policy.versionNotes && (
              <p className="text-sm text-green-600 mt-0.5">{policy.versionNotes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Version timeline */}
      <div className="mt-6">
        {versions.map((version, index) => (
          <VersionItem
            key={version.id}
            version={version}
            isLatest={index === 0}
            isExpanded={expandedId === version.id}
            onToggle={() => setExpandedId(expandedId === version.id ? null : version.id)}
            onRollback={() => handleRollback(version.id)}
            canRollback={permissions.canRollback}
            rolling={rollingBack}
          />
        ))}
      </div>
    </div>
  )
}

PolicyVersionHistory.propTypes = {
  policy: PropTypes.object.isRequired,
  onVersionRestored: PropTypes.func
}
