/**
 * PermitPrivilegesSection.jsx
 * Display and manage privileges for a permit
 *
 * @location src/components/permits/PermitPrivilegesSection.jsx
 */

import React, { useState } from 'react'
import { CheckCircle2, Plus, Edit3, Trash2, X, Save, AlertCircle } from 'lucide-react'

export default function PermitPrivilegesSection({
  privileges = [],
  onAdd,
  onUpdate,
  onRemove,
  readOnly = false
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    conditions: '',
    reference: ''
  })

  const handleStartAdd = () => {
    setFormData({ description: '', conditions: '', reference: '' })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleStartEdit = (privilege) => {
    setFormData({
      description: privilege.description || '',
      conditions: privilege.conditions || '',
      reference: privilege.reference || ''
    })
    setEditingId(privilege.id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.description.trim()) return

    if (editingId) {
      await onUpdate?.(editingId, formData)
      setEditingId(null)
    } else {
      await onAdd?.(formData)
      setIsAdding(false)
    }
    setFormData({ description: '', conditions: '', reference: '' })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ description: '', conditions: '', reference: '' })
  }

  const handleRemove = async (privilegeId) => {
    if (window.confirm('Remove this privilege?')) {
      await onRemove?.(privilegeId)
    }
  }

  const renderForm = () => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Privilege Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., BVLOS operations up to 2km from pilot"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conditions (optional)
        </label>
        <input
          type="text"
          value={formData.conditions}
          onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
          placeholder="e.g., Visual observer required beyond 1km"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reference (optional)
        </label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
          placeholder="e.g., Section 3.2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.description.trim()}
          className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-1"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Privileges
        </h3>
        {!readOnly && !isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Privilege
          </button>
        )}
      </div>

      {privileges.length === 0 && !isAdding ? (
        <div className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No privileges defined
        </div>
      ) : (
        <div className="space-y-2">
          {privileges.map(privilege => (
            <div key={privilege.id}>
              {editingId === privilege.id ? (
                renderForm()
              ) : (
                <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{privilege.description}</p>
                      {privilege.conditions && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {privilege.conditions}
                        </p>
                      )}
                      {privilege.reference && (
                        <p className="text-xs text-gray-400 mt-1">
                          Ref: {privilege.reference}
                        </p>
                      )}
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(privilege)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(privilege.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding && renderForm()}
    </div>
  )
}
