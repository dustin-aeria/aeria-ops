/**
 * ComplianceProjectView.jsx
 * Full-featured page for Q&A compliance projects with Knowledge Base integration
 *
 * @location src/pages/ComplianceProjectView.jsx
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Database,
  Search,
  ChevronRight,
  AlertCircle,
  Loader2,
  XCircle,
  RefreshCw,
  FileText,
  FolderOpen,
  Plane,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getComplianceProject } from '../lib/firestoreCompliance'
import { ComplianceProjectEditor, KnowledgeBasePanel, BatchIndexPanel } from '../components/compliance'
import { useKnowledgeBase } from '../hooks/useKnowledgeBase'
import { logger } from '../lib/logger'

// Source type icons
const SOURCE_ICONS = {
  policy: FileText,
  project: FolderOpen,
  equipment: Plane,
  crew: Users
}

export default function ComplianceProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Project state
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // KB panel state
  const [showKBPanel, setShowKBPanel] = useState(false)
  const [kbTab, setKbTab] = useState('search')

  // Knowledge Base hook
  const { indexStatus, isIndexed, indexing } = useKnowledgeBase()

  // Load project
  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getComplianceProject(id)
      if (!data) {
        setError('Project not found')
      } else {
        setProject(data)
      }
    } catch (err) {
      logger.error('Error loading project:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Project</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/compliance"
            className="inline-flex items-center gap-2 text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Compliance Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/compliance"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{project?.name || 'Q&A Project'}</h1>
                <p className="text-sm text-gray-500">
                  {project?.questions?.length || 0} questions
                  {project?.description && ` - ${project.description}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* KB Status Indicator */}
            {!isIndexed && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">Knowledge Base not indexed</span>
              </div>
            )}

            {/* KB Panel Toggle */}
            <button
              onClick={() => setShowKBPanel(!showKBPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showKBPanel
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
              {isIndexed && (
                <span className="w-2 h-2 rounded-full bg-green-500" title="Knowledge Base indexed" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Q&A Editor */}
        <div className={`flex-1 transition-all ${showKBPanel ? '' : ''}`}>
          <ComplianceProjectEditor projectId={id} />
        </div>

        {/* Knowledge Base Panel */}
        {showKBPanel && (
          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-4">
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Knowledge Base
                  </h2>
                  <button
                    onClick={() => setShowKBPanel(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setKbTab('search')}
                    className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      kbTab === 'search'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 inline-block mr-1" />
                    Search
                  </button>
                  <button
                    onClick={() => setKbTab('index')}
                    className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      kbTab === 'index'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5 inline-block mr-1" />
                    Index
                    {!isIndexed && (
                      <span className="ml-1 w-1.5 h-1.5 inline-block rounded-full bg-amber-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Panel Content */}
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {kbTab === 'search' ? (
                  <>
                    {!isIndexed ? (
                      <div className="text-center py-6">
                        <Database className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                          Index your policies to enable search
                        </p>
                        <button
                          onClick={() => setKbTab('index')}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Go to Index tab
                        </button>
                      </div>
                    ) : (
                      <KnowledgeBasePanel compact />
                    )}
                  </>
                ) : (
                  <BatchIndexPanel compact />
                )}
              </div>

              {/* Index Stats */}
              {isIndexed && indexStatus && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{indexStatus.totalChunks || 0} chunks indexed</span>
                    <div className="flex items-center gap-2">
                      {Object.entries(indexStatus.bySourceType || {}).map(([type, count]) => {
                        const Icon = SOURCE_ICONS[type] || FileText
                        return (
                          <span key={type} className="flex items-center gap-1" title={type}>
                            <Icon className="w-3 h-3" />
                            {count}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
