/**
 * Inspections.jsx
 * Inspection management page for COR Element 5 compliance
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  ClipboardCheck,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  FileText,
  Play,
  Eye,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react'
import {
  getInspections,
  getInspectionTemplates,
  getFindings,
  getInspectionSummary,
  calculateCORInspectionMetrics,
  createDefaultTemplates,
  INSPECTION_TYPES,
  INSPECTION_STATUS,
  FINDING_STATUS,
  RISK_LEVELS
} from '../lib/firestoreInspections'
import InspectionModal from '../components/inspections/InspectionModal'
import InspectionTemplateModal from '../components/inspections/InspectionTemplateModal'
import InspectionFindingModal from '../components/inspections/InspectionFindingModal'

export default function Inspections() {
  const { userProfile } = useAuth()
  const operatorId = userProfile?.operatorId

  // Data state
  const [inspections, setInspections] = useState([])
  const [templates, setTemplates] = useState([])
  const [findings, setFindings] = useState([])
  const [summary, setSummary] = useState(null)
  const [corMetrics, setCORMetrics] = useState(null)

  // UI state
  const [activeTab, setActiveTab] = useState('inspections')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Modal state
  const [showInspectionModal, setShowInspectionModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showFindingModal, setShowFindingModal] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedFinding, setSelectedFinding] = useState(null)

  // Load data
  useEffect(() => {
    if (operatorId) {
      loadData()
    }
  }, [operatorId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [inspectionsData, templatesData, findingsData, summaryData, metricsData] = await Promise.all([
        getInspections(operatorId),
        getInspectionTemplates(operatorId),
        getFindings(operatorId),
        getInspectionSummary(operatorId),
        calculateCORInspectionMetrics(operatorId)
      ])

      setInspections(inspectionsData)
      setTemplates(templatesData)
      setFindings(findingsData)
      setSummary(summaryData)
      setCORMetrics(metricsData)

      // Create default templates if none exist
      if (templatesData.length === 0) {
        await createDefaultTemplates(operatorId)
        const newTemplates = await getInspectionTemplates(operatorId)
        setTemplates(newTemplates)
      }
    } catch (err) {
      console.error('Error loading inspection data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter inspections
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.inspectionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inspection.calculatedStatus === statusFilter
    const matchesType = typeFilter === 'all' || inspection.inspectionType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Filter findings
  const filteredFindings = findings.filter(finding => {
    const matchesSearch = finding.findingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || finding.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handlers
  const handleNewInspection = () => {
    setSelectedInspection(null)
    setShowInspectionModal(true)
  }

  const handleEditInspection = (inspection) => {
    setSelectedInspection(inspection)
    setShowInspectionModal(true)
  }

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    setShowTemplateModal(true)
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  const handleNewFinding = (inspection = null) => {
    setSelectedFinding(null)
    setSelectedInspection(inspection)
    setShowFindingModal(true)
  }

  const handleEditFinding = (finding) => {
    setSelectedFinding(finding)
    setShowFindingModal(true)
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-aeria-blue animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-aeria-blue" />
            Inspections
          </h1>
          <p className="text-gray-600 mt-1">COR Element 5: Workplace Inspections</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewTemplate}
            className="px-4 py-2 text-aeria-blue hover:bg-aeria-sky rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            New Template
          </button>
          <button
            onClick={handleNewInspection}
            className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Inspection
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Scheduled</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.scheduled || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{summary?.overdue || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">This Month</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.completedThisMonth || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Pass Rate</span>
            <Target className="w-4 h-4 text-aeria-blue" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.passRate || 0}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Open Findings</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{summary?.openFindings || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">COR Score</span>
            <ClipboardCheck className="w-4 h-4 text-aeria-blue" />
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            (corMetrics?.totalScore || 0) >= 80 ? 'text-green-600' :
            (corMetrics?.totalScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {corMetrics?.totalScore || 0}%
          </p>
        </div>
      </div>

      {/* COR Recommendations */}
      {corMetrics?.recommendations?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">COR Compliance Recommendations</h3>
          <ul className="space-y-1">
            {corMetrics.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-yellow-700 flex items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {rec.priority}
                </span>
                <span>{rec.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'inspections', label: 'Inspections', count: inspections.length },
            { id: 'templates', label: 'Templates', count: templates.filter(t => t.isActive).length },
            { id: 'findings', label: 'Findings', count: findings.filter(f => f.status !== 'verified').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setStatusFilter('all')
                setSearchTerm('')
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-aeria-blue text-aeria-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
          >
            <option value="all">All Status</option>
            {activeTab === 'inspections' && Object.entries(INSPECTION_STATUS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
            {activeTab === 'findings' && Object.entries(FINDING_STATUS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          {activeTab === 'inspections' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
            >
              <option value="all">All Types</option>
              {Object.entries(INSPECTION_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'inspections' && (
          <>
            {filteredInspections.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No inspections found</p>
                <button
                  onClick={handleNewInspection}
                  className="mt-4 px-4 py-2 text-aeria-blue hover:bg-aeria-sky rounded-lg"
                >
                  Schedule your first inspection
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspection</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInspections.map(inspection => (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{inspection.inspectionNumber}</p>
                          <p className="text-sm text-gray-500">{inspection.templateName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {INSPECTION_TYPES[inspection.inspectionType]?.label || inspection.inspectionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(inspection.scheduledDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          INSPECTION_STATUS[inspection.calculatedStatus]?.color || 'bg-gray-100'
                        }`}>
                          {INSPECTION_STATUS[inspection.calculatedStatus]?.label || inspection.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {inspection.overallResult ? (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            inspection.overallResult === 'pass' ? 'bg-green-100 text-green-800' :
                            inspection.overallResult === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {inspection.overallResult.charAt(0).toUpperCase() + inspection.overallResult.slice(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {inspection.status === 'scheduled' && (
                            <button
                              onClick={() => handleEditInspection(inspection)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Start Inspection"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditInspection(inspection)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {templates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No templates found</p>
                <button
                  onClick={handleNewTemplate}
                  className="mt-4 px-4 py-2 text-aeria-blue hover:bg-aeria-sky rounded-lg"
                >
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg ${
                      template.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </div>
                      {!template.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {template.checklistItems?.length || 0} items
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {template.frequency}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-sm text-aeria-blue hover:underline"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template)
                          handleNewInspection()
                        }}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'findings' && (
          <>
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No findings found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finding</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFindings.map(finding => (
                    <tr key={finding.id} className={`hover:bg-gray-50 ${finding.isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{finding.findingNumber}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{finding.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${RISK_LEVELS[finding.riskLevel]?.color}`}>
                          {RISK_LEVELS[finding.riskLevel]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${finding.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(finding.dueDate)}
                          {finding.isOverdue && ' (Overdue)'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${FINDING_STATUS[finding.status]?.color}`}>
                          {FINDING_STATUS[finding.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEditFinding(finding)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="View/Edit Finding"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <InspectionModal
        isOpen={showInspectionModal}
        onClose={() => {
          setShowInspectionModal(false)
          setSelectedInspection(null)
          loadData()
        }}
        inspection={selectedInspection}
        templates={templates.filter(t => t.isActive)}
        operatorId={operatorId}
        onCreateFinding={(inspection) => {
          setShowInspectionModal(false)
          handleNewFinding(inspection)
        }}
      />

      <InspectionTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false)
          setSelectedTemplate(null)
          loadData()
        }}
        template={selectedTemplate}
        operatorId={operatorId}
      />

      <InspectionFindingModal
        isOpen={showFindingModal}
        onClose={() => {
          setShowFindingModal(false)
          setSelectedFinding(null)
          setSelectedInspection(null)
          loadData()
        }}
        finding={selectedFinding}
        inspection={selectedInspection}
        operatorId={operatorId}
      />
    </div>
  )
}
