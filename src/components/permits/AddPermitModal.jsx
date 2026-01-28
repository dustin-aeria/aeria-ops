/**
 * AddPermitModal.jsx
 * Multi-step modal for creating and editing permits
 *
 * @location src/components/permits/AddPermitModal.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  FileCheck,
  Calendar,
  MapPin,
  Shield,
  FileText,
  Loader2,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'
import {
  PERMIT_TYPES,
  OPERATION_TYPES,
  CONDITION_CATEGORIES,
  createPermit,
  updatePermit
} from '../../lib/firestorePermits'
import PermitDocumentUpload from './PermitDocumentUpload'

const STEPS = [
  { id: 1, name: 'Basic Info', icon: FileCheck },
  { id: 2, name: 'Scope', icon: MapPin },
  { id: 3, name: 'Privileges & Conditions', icon: Shield },
  { id: 4, name: 'Documents', icon: FileText }
]

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function AddPermitModal({
  isOpen,
  onClose,
  onSave,
  operatorId,
  editPermit = null
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    type: 'sfoc',
    permitNumber: '',
    issuingAuthority: '',
    issuingOffice: '',
    contactEmail: '',
    issueDate: '',
    effectiveDate: '',
    expiryDate: '',

    // Step 2: Scope
    geographicArea: '',
    operationTypes: [],
    aircraftRegistrations: [],

    // Step 3: Privileges & Conditions
    privileges: [],
    conditions: [],
    notificationRequirements: [],

    // Step 4: Documents & Notes
    notes: '',
    tags: [],

    // Renewal
    renewalInfo: {
      isRenewalRequired: true,
      renewalLeadDays: 60,
      renewalStatus: null
    }
  })

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    if (isOpen) {
      if (editPermit) {
        // Populate form with existing permit data
        setFormData({
          name: editPermit.name || '',
          type: editPermit.type || 'sfoc',
          permitNumber: editPermit.permitNumber || '',
          issuingAuthority: editPermit.issuingAuthority || '',
          issuingOffice: editPermit.issuingOffice || '',
          contactEmail: editPermit.contactEmail || '',
          issueDate: formatDateForInput(editPermit.issueDate),
          effectiveDate: formatDateForInput(editPermit.effectiveDate),
          expiryDate: formatDateForInput(editPermit.expiryDate),
          geographicArea: editPermit.geographicArea || '',
          operationTypes: editPermit.operationTypes || [],
          aircraftRegistrations: editPermit.aircraftRegistrations || [],
          privileges: editPermit.privileges || [],
          conditions: editPermit.conditions || [],
          notificationRequirements: editPermit.notificationRequirements || [],
          notes: editPermit.notes || '',
          tags: editPermit.tags || [],
          renewalInfo: editPermit.renewalInfo || {
            isRenewalRequired: true,
            renewalLeadDays: 60,
            renewalStatus: null
          }
        })
      } else {
        // Reset to defaults
        setFormData({
          name: '',
          type: 'sfoc',
          permitNumber: '',
          issuingAuthority: PERMIT_TYPES.sfoc.authority,
          issuingOffice: '',
          contactEmail: '',
          issueDate: '',
          effectiveDate: '',
          expiryDate: '',
          geographicArea: '',
          operationTypes: [],
          aircraftRegistrations: [],
          privileges: [],
          conditions: [],
          notificationRequirements: [],
          notes: '',
          tags: [],
          renewalInfo: {
            isRenewalRequired: true,
            renewalLeadDays: 60,
            renewalStatus: null
          }
        })
      }
      setCurrentStep(1)
      setError('')
    }
  }, [isOpen, editPermit])

  function formatDateForInput(dateValue) {
    if (!dateValue) return ''
    const date = dateValue?.toDate?.() || new Date(dateValue)
    return date.toISOString().split('T')[0]
  }

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      issuingAuthority: PERMIT_TYPES[type]?.authority || prev.issuingAuthority
    }))
  }

  const handleOperationTypeToggle = (opType) => {
    setFormData(prev => ({
      ...prev,
      operationTypes: prev.operationTypes.includes(opType)
        ? prev.operationTypes.filter(t => t !== opType)
        : [...prev.operationTypes, opType]
    }))
  }

  const handleAddAircraft = () => {
    const registration = prompt('Enter aircraft registration:')
    if (registration?.trim()) {
      setFormData(prev => ({
        ...prev,
        aircraftRegistrations: [...prev.aircraftRegistrations, registration.trim().toUpperCase()]
      }))
    }
  }

  const handleRemoveAircraft = (registration) => {
    setFormData(prev => ({
      ...prev,
      aircraftRegistrations: prev.aircraftRegistrations.filter(r => r !== registration)
    }))
  }

  // Privilege management
  const handleAddPrivilege = () => {
    setFormData(prev => ({
      ...prev,
      privileges: [...prev.privileges, {
        id: generateId(),
        description: '',
        conditions: '',
        reference: ''
      }]
    }))
  }

  const handleUpdatePrivilege = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      privileges: prev.privileges.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }))
  }

  const handleRemovePrivilege = (id) => {
    setFormData(prev => ({
      ...prev,
      privileges: prev.privileges.filter(p => p.id !== id)
    }))
  }

  // Condition management
  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        id: generateId(),
        category: 'operational',
        description: '',
        isCritical: false
      }]
    }))
  }

  const handleUpdateCondition = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      )
    }))
  }

  const handleRemoveCondition = (id) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== id)
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Permit name is required'
        if (!formData.type) return 'Permit type is required'
        if (!formData.effectiveDate) return 'Effective date is required'
        return null
      case 2:
        return null // Scope is optional
      case 3:
        // Check that all privileges have descriptions
        for (const p of formData.privileges) {
          if (!p.description.trim()) return 'All privileges must have descriptions'
        }
        // Check that all conditions have descriptions
        for (const c of formData.conditions) {
          if (!c.description.trim()) return 'All conditions must have descriptions'
        }
        return null
      case 4:
        return null // Documents are optional
      default:
        return null
    }
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
      setError(error)
      return
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const handlePrevious = () => {
    setError('')
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSave = async () => {
    const error = validateStep(currentStep)
    if (error) {
      setError(error)
      return
    }

    setSaving(true)
    setError('')

    try {
      // Filter out empty privileges and conditions
      const cleanedData = {
        ...formData,
        operatorId,
        privileges: formData.privileges.filter(p => p.description.trim()),
        conditions: formData.conditions.filter(c => c.description.trim()),
        issueDate: formData.issueDate ? new Date(formData.issueDate) : null,
        effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      }

      if (editPermit) {
        await updatePermit(editPermit.id, cleanedData)
      } else {
        await createPermit(cleanedData)
      }

      onSave?.()
      onClose()
    } catch (err) {
      console.error('Error saving permit:', err)
      setError(err.message || 'Failed to save permit')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editPermit ? 'Edit Permit' : 'Add New Permit'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = step.id === currentStep
              const isComplete = step.id < currentStep

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-700'
                      : isComplete
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-400'
                  }`}>
                    {isComplete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Permit Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PERMIT_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTypeChange(key)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        formData.type === key
                          ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900 text-sm">{type.shortLabel}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{type.authority}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., BVLOS Pipeline Inspection SFOC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Permit Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Number
                  </label>
                  <input
                    type="text"
                    value={formData.permitNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, permitNumber: e.target.value }))}
                    placeholder="e.g., SFOC-2024-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                    placeholder="e.g., Transport Canada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Office and Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuing Office
                  </label>
                  <input
                    type="text"
                    value={formData.issuingOffice}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuingOffice: e.target.value }))}
                    placeholder="e.g., Prairie & Northern Region"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="e.g., sfoc@tc.gc.ca"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave blank for no expiry</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Geographic Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geographic Area
                </label>
                <textarea
                  value={formData.geographicArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, geographicArea: e.target.value }))}
                  placeholder="Describe the geographic area covered by this permit..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Operation Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation Types Permitted
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(OPERATION_TYPES).map(([key, type]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleOperationTypeToggle(key)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.operationTypes.includes(key)
                          ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aircraft Registrations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aircraft Registrations
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.aircraftRegistrations.map(reg => (
                    <span
                      key={reg}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {reg}
                      <button
                        type="button"
                        onClick={() => handleRemoveAircraft(reg)}
                        className="p-0.5 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddAircraft}
                  className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Aircraft
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              {/* Privileges */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Privileges
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPrivilege}
                    className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Privilege
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.privileges.map((privilege, index) => (
                    <div key={privilege.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-gray-500 mt-2">{index + 1}.</span>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={privilege.description}
                            onChange={(e) => handleUpdatePrivilege(privilege.id, 'description', e.target.value)}
                            placeholder="Privilege description (e.g., BVLOS operations up to 2km)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={privilege.conditions}
                              onChange={(e) => handleUpdatePrivilege(privilege.id, 'conditions', e.target.value)}
                              placeholder="Conditions (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={privilege.reference}
                              onChange={(e) => handleUpdatePrivilege(privilege.id, 'reference', e.target.value)}
                              placeholder="Reference (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrivilege(privilege.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.privileges.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      No privileges added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Conditions & Restrictions
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => (
                    <div key={condition.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-gray-500 mt-2">{index + 1}.</span>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={condition.description}
                            onChange={(e) => handleUpdateCondition(condition.id, 'description', e.target.value)}
                            placeholder="Condition description (e.g., Maximum altitude 400ft AGL)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          />
                          <div className="flex items-center gap-4">
                            <select
                              value={condition.category}
                              onChange={(e) => handleUpdateCondition(condition.id, 'category', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            >
                              {Object.entries(CONDITION_CATEGORIES).map(([key, cat]) => (
                                <option key={key} value={key}>{cat.label}</option>
                              ))}
                            </select>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={condition.isCritical}
                                onChange={(e) => handleUpdateCondition(condition.id, 'isCritical', e.target.checked)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700">Critical</span>
                            </label>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(condition.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.conditions.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">
                      No conditions added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Documents info */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Documents can be uploaded after saving the permit.
                  Complete the basic information first, then add documents from the permit detail view.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this permit..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Renewal Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Renewal Settings
                </label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.renewalInfo.isRenewalRequired}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        renewalInfo: { ...prev.renewalInfo, isRenewalRequired: e.target.checked }
                      }))}
                      className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-700">Renewal required</span>
                  </label>
                  {formData.renewalInfo.isRenewalRequired && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Start renewal process (days before expiry)
                      </label>
                      <input
                        type="number"
                        value={formData.renewalInfo.renewalLeadDays}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          renewalInfo: { ...prev.renewalInfo, renewalLeadDays: parseInt(e.target.value) || 60 }
                        }))}
                        min="0"
                        max="365"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          <div className="flex items-center gap-3">
            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editPermit ? 'Save Changes' : 'Create Permit'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
