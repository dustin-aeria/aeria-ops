/**
 * PermitDetailPanel.jsx
 * Full detail view for a permit
 *
 * @location src/components/permits/PermitDetailPanel.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  X,
  Edit3,
  Calendar,
  Building2,
  MapPin,
  Clock,
  FileCheck,
  Award,
  Navigation,
  UserCheck,
  FileText,
  Plane,
  Bell,
  ExternalLink,
  Loader2
} from 'lucide-react'
import PermitStatusBadge from './PermitStatusBadge'
import PermitPrivilegesSection from './PermitPrivilegesSection'
import PermitConditionsSection from './PermitConditionsSection'
import PermitDocumentUpload from './PermitDocumentUpload'
import {
  PERMIT_TYPES,
  OPERATION_TYPES,
  getDaysUntilExpiry,
  getPermit,
  updatePermit,
  addPermitDocument,
  removePermitDocument,
  addPermitPrivilege,
  updatePermitPrivilege,
  removePermitPrivilege,
  addPermitCondition,
  updatePermitCondition,
  removePermitCondition
} from '../../lib/firestorePermits'

const TYPE_ICONS = {
  sfoc: FileCheck,
  cor: Award,
  land_access: MapPin,
  airspace_auth: Navigation,
  client_approval: UserCheck,
  other: FileText
}

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  const date = dateValue?.toDate?.() || new Date(dateValue)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDaysRemaining(days) {
  if (days === null) return 'No expiry date'
  if (days < 0) return `Expired ${Math.abs(days)} days ago`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days remaining`
}

export default function PermitDetailPanel({
  permitId,
  onClose,
  onEdit,
  onUpdate
}) {
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (permitId) {
      loadPermit()
    }
  }, [permitId])

  const loadPermit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getPermit(permitId)
      setPermit(data)
    } catch (err) {
      console.error('Error loading permit:', err)
      setError('Failed to load permit details')
    } finally {
      setLoading(false)
    }
  }

  // Document handlers
  const handleUploadDocument = async (file) => {
    await addPermitDocument(permitId, file)
    await loadPermit()
    onUpdate?.()
  }

  const handleRemoveDocument = async (path) => {
    await removePermitDocument(permitId, path)
    await loadPermit()
    onUpdate?.()
  }

  // Privilege handlers
  const handleAddPrivilege = async (privilege) => {
    await addPermitPrivilege(permitId, privilege)
    await loadPermit()
    onUpdate?.()
  }

  const handleUpdatePrivilege = async (privilegeId, updates) => {
    await updatePermitPrivilege(permitId, privilegeId, updates)
    await loadPermit()
    onUpdate?.()
  }

  const handleRemovePrivilege = async (privilegeId) => {
    await removePermitPrivilege(permitId, privilegeId)
    await loadPermit()
    onUpdate?.()
  }

  // Condition handlers
  const handleAddCondition = async (condition) => {
    await addPermitCondition(permitId, condition)
    await loadPermit()
    onUpdate?.()
  }

  const handleUpdateCondition = async (conditionId, updates) => {
    await updatePermitCondition(permitId, conditionId, updates)
    await loadPermit()
    onUpdate?.()
  }

  const handleRemoveCondition = async (conditionId) => {
    await removePermitCondition(permitId, conditionId)
    await loadPermit()
    onUpdate?.()
  }

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (error || !permit) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-40 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Permit Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-600">{error || 'Permit not found'}</p>
        </div>
      </div>
    )
  }

  const permitType = PERMIT_TYPES[permit.type] || PERMIT_TYPES.other
  const TypeIcon = TYPE_ICONS[permit.type] || FileText
  const daysRemaining = getDaysUntilExpiry(permit)

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-100">
              <TypeIcon className="w-6 h-6 text-cyan-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{permit.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <PermitStatusBadge status={permit.status} />
                <span className="text-sm text-gray-500">{permitType.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(permit)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Edit"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {permit.permitNumber && (
            <div>
              <span className="text-gray-500">Permit #:</span>
              <span className="ml-2 font-medium text-gray-900">{permit.permitNumber}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Authority:</span>
            <span className="ml-2 font-medium text-gray-900">{permit.issuingAuthority || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Dates Section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Validity Period
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Issued
              </div>
              <p className="font-medium text-gray-900">{formatDate(permit.issueDate)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Effective
              </div>
              <p className="font-medium text-gray-900">{formatDate(permit.effectiveDate)}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              permit.status === 'expired' ? 'bg-red-50' :
              permit.status === 'expiring_soon' ? 'bg-yellow-50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                Expires
              </div>
              <p className={`font-medium ${
                permit.status === 'expired' ? 'text-red-700' :
                permit.status === 'expiring_soon' ? 'text-yellow-700' : 'text-gray-900'
              }`}>
                {formatDate(permit.expiryDate)}
              </p>
              <p className={`text-xs mt-1 ${
                daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' :
                daysRemaining !== null && daysRemaining <= 30 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {formatDaysRemaining(daysRemaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Scope Section */}
        {(permit.geographicArea || permit.operationTypes?.length > 0 || permit.aircraftRegistrations?.length > 0) && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Scope
            </h3>

            {permit.geographicArea && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Geographic Area
                </div>
                <p className="text-sm text-gray-900">{permit.geographicArea}</p>
              </div>
            )}

            {permit.operationTypes?.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  Operation Types
                </div>
                <div className="flex flex-wrap gap-2">
                  {permit.operationTypes.map(opType => (
                    <span
                      key={opType}
                      className="px-2 py-1 bg-cyan-50 text-cyan-700 text-sm rounded-lg"
                    >
                      {OPERATION_TYPES[opType]?.label || opType}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {permit.aircraftRegistrations?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Plane className="w-3.5 h-3.5" />
                  Aircraft
                </div>
                <div className="flex flex-wrap gap-2">
                  {permit.aircraftRegistrations.map(reg => (
                    <span
                      key={reg}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-mono"
                    >
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privileges Section */}
        <div className="p-6 border-b border-gray-200">
          <PermitPrivilegesSection
            privileges={permit.privileges || []}
            onAdd={handleAddPrivilege}
            onUpdate={handleUpdatePrivilege}
            onRemove={handleRemovePrivilege}
          />
        </div>

        {/* Conditions Section */}
        <div className="p-6 border-b border-gray-200">
          <PermitConditionsSection
            conditions={permit.conditions || []}
            onAdd={handleAddCondition}
            onUpdate={handleUpdateCondition}
            onRemove={handleRemoveCondition}
          />
        </div>

        {/* Notification Requirements */}
        {permit.notificationRequirements?.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Notification Requirements
            </h3>
            <div className="space-y-2">
              {permit.notificationRequirements.map(req => (
                <div key={req.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">{req.agency}</p>
                      <p className="text-xs text-purple-700">{req.timing} via {req.method}</p>
                      {req.contactInfo && (
                        <p className="text-xs text-purple-600 mt-1">{req.contactInfo}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div className="p-6 border-b border-gray-200">
          <PermitDocumentUpload
            documents={permit.documents || []}
            onUpload={handleUploadDocument}
            onRemove={handleRemoveDocument}
          />
        </div>

        {/* Notes */}
        {permit.notes && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Notes
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{permit.notes}</p>
          </div>
        )}

        {/* Contact Info */}
        {(permit.issuingOffice || permit.contactEmail) && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              {permit.issuingOffice && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{permit.issuingOffice}</span>
                </div>
              )}
              {permit.contactEmail && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${permit.contactEmail}`}
                    className="text-cyan-600 hover:text-cyan-700 hover:underline"
                  >
                    {permit.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
