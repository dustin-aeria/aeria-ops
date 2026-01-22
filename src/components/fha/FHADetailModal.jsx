/**
 * FHADetailModal.jsx
 * Read-only modal for viewing FHA details
 *
 * @location src/components/fha/FHADetailModal.jsx
 */

import {
  X,
  Edit,
  Download,
  Calendar,
  Tag,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  Archive,
  AlertTriangle
} from 'lucide-react'
import {
  FHA_CATEGORIES,
  LIKELIHOOD_RATINGS,
  SEVERITY_RATINGS,
  getRiskLevel
} from '../../lib/firestoreFHA'
import { ControlMeasuresDisplay } from './ControlMeasuresEditor'
import { RiskBadgeWithMatrix } from './FHARiskMatrix'

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Active' },
    under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Under Review' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Archive, label: 'Archived' }
  }

  const config = statusConfig[status] || statusConfig.active
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

// Source badge component
function SourceBadge({ source }) {
  const sourceConfig = {
    default: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Default Template' },
    uploaded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Uploaded' },
    created: { bg: 'bg-green-100', text: 'text-green-700', label: 'Created' },
    field_triggered: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Field Triggered' }
  }

  const config = sourceConfig[source] || sourceConfig.created

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

// Section component
function Section({ title, children, className = '' }) {
  return (
    <div className={`${className}`}>
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h4>
      {children}
    </div>
  )
}

/**
 * Main FHA Detail Modal
 */
export default function FHADetailModal({ isOpen, onClose, fha, onEdit }) {
  if (!isOpen || !fha) return null

  const category = FHA_CATEGORIES.find(c => c.id === fha.category)
  const initialRisk = getRiskLevel(fha.riskScore)
  const residualRisk = getRiskLevel(fha.residualRiskScore)
  const riskReduction = fha.riskScore - fha.residualRiskScore

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Check if review is overdue
  const isReviewOverdue = () => {
    if (!fha.reviewDate) return false
    const reviewDate = fha.reviewDate.toDate ? fha.reviewDate.toDate() : new Date(fha.reviewDate)
    return reviewDate <= new Date()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-12">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {fha.fhaNumber}
                  </span>
                  <StatusBadge status={fha.status} />
                  <SourceBadge source={fha.source} />
                  {isReviewOverdue() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-sm">
                      <Clock className="w-3 h-3" />
                      Review Overdue
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{fha.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{category?.name || fha.category}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit?.(fha)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
            {/* Description */}
            {fha.description && (
              <Section title="Description">
                <p className="text-gray-700 whitespace-pre-wrap">{fha.description}</p>
              </Section>
            )}

            {/* Consequences */}
            {fha.consequences && (
              <Section title="Potential Consequences">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-amber-800 whitespace-pre-wrap">{fha.consequences}</p>
                  </div>
                </div>
              </Section>
            )}

            {/* Risk Assessment */}
            <Section title="Risk Assessment">
              <div className="grid grid-cols-2 gap-6">
                {/* Initial Risk */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-3">Initial Risk (Before Controls)</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Likelihood:</span>
                      <span className="font-medium">
                        {fha.likelihood} - {LIKELIHOOD_RATINGS.find(l => l.value === fha.likelihood)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Severity:</span>
                      <span className="font-medium">
                        {fha.severity} - {SEVERITY_RATINGS.find(s => s.value === fha.severity)?.label}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Risk Score:</span>
                        <RiskBadgeWithMatrix likelihood={fha.likelihood} severity={fha.severity} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Residual Risk */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-600 mb-3">Residual Risk (After Controls)</h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Likelihood:</span>
                      <span className="font-medium">
                        {fha.residualLikelihood} - {LIKELIHOOD_RATINGS.find(l => l.value === fha.residualLikelihood)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Severity:</span>
                      <span className="font-medium">
                        {fha.residualSeverity} - {SEVERITY_RATINGS.find(s => s.value === fha.residualSeverity)?.label}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Risk Score:</span>
                        <RiskBadgeWithMatrix likelihood={fha.residualLikelihood} severity={fha.residualSeverity} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Reduction Summary */}
              <div className={`mt-4 p-3 rounded-lg ${
                riskReduction > 0 ? 'bg-green-50 border border-green-200' :
                riskReduction < 0 ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    riskReduction > 0 ? 'text-green-700' :
                    riskReduction < 0 ? 'text-red-700' :
                    'text-gray-600'
                  }`}>
                    Risk Reduction
                  </span>
                  <span className={`font-bold ${
                    riskReduction > 0 ? 'text-green-700' :
                    riskReduction < 0 ? 'text-red-700' :
                    'text-gray-600'
                  }`}>
                    {fha.riskScore} → {fha.residualRiskScore}
                    {riskReduction !== 0 && (
                      <span className="ml-2">
                        ({riskReduction > 0 ? '-' : '+'}{Math.abs(riskReduction)} points)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Section>

            {/* Control Measures */}
            <Section title="Control Measures">
              <ControlMeasuresDisplay controlMeasures={fha.controlMeasures || []} />
            </Section>

            {/* Source Document */}
            {fha.sourceDocument && (
              <Section title="Source Document">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{fha.sourceDocument.name}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded {formatDate(fha.sourceDocument.uploadedAt)}
                    </p>
                  </div>
                  <a
                    href={fha.sourceDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </Section>
            )}

            {/* Keywords & References */}
            {(fha.keywords?.length > 0 || fha.regulatoryRefs?.length > 0) && (
              <Section title="Keywords & References">
                {fha.keywords?.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500">Keywords:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {fha.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {fha.regulatoryRefs?.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Regulatory References:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {fha.regulatoryRefs.map((ref, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* Linked Field Forms */}
            {fha.linkedFieldForms?.length > 0 && (
              <Section title="Linked Field Forms">
                <div className="space-y-2">
                  {fha.linkedFieldForms.map((form, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{form.name || form.id}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Notes */}
            {fha.notes && (
              <Section title="Notes">
                <p className="text-gray-700 whitespace-pre-wrap">{fha.notes}</p>
              </Section>
            )}

            {/* Metadata */}
            <Section title="Metadata" className="text-sm text-gray-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Review Date: {formatDate(fha.reviewDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Created: {formatDate(fha.createdAt)}</span>
                </div>
                {fha.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Last Updated: {formatDate(fha.updatedAt)}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(fha)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit FHA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
