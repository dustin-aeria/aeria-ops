/**
 * PermitConditionsSection.jsx
 * Display and manage conditions for a permit
 *
 * @location src/components/permits/PermitConditionsSection.jsx
 */

import React, { useState } from 'react'
import { AlertTriangle, Plus, Edit3, Trash2, Save, Info } from 'lucide-react'
import { CONDITION_CATEGORIES } from '../../lib/firestorePermits'

export default function PermitConditionsSection({
  conditions = [],
  onAdd,
  onUpdate,
  onRemove,
  readOnly = false
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    category: 'operational',
    isCritical: false
  })

  const handleStartAdd = () => {
    setFormData({ description: '', category: 'operational', isCritical: false })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleStartEdit = (condition) => {
    setFormData({
      description: condition.description || '',
      category: condition.category || 'operational',
      isCritical: condition.isCritical || false
    })
    setEditingId(condition.id)
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
    setFormData({ description: '', category: 'operational', isCritical: false })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ description: '', category: 'operational', isCritical: false })
  }

  const handleRemove = async (conditionId) => {
    if (window.confirm('Remove this condition?')) {
      await onRemove?.(conditionId)
    }
  }

  // Group conditions by category
  const groupedConditions = conditions.reduce((acc, condition) => {
    const category = condition.category || 'operational'
    if (!acc[category]) acc[category] = []
    acc[category].push(condition)
    return acc
  }, {})

  // Sort to show critical conditions first within each category
  Object.keys(groupedConditions).forEach(category => {
    groupedConditions[category].sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1
      if (!a.isCritical && b.isCritical) return 1
      return 0
    })
  })

  const renderForm = () => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., Maximum altitude 400ft AGL"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {Object.entries(CONDITION_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCritical}
              onChange={(e) => setFormData(prev => ({ ...prev, isCritical: e.target.checked }))}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Critical Condition</span>
          </label>
        </div>
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
          Conditions
        </h3>
        {!readOnly && !isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Condition
          </button>
        )}
      </div>

      {conditions.length === 0 && !isAdding ? (
        <div className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No conditions defined
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(CONDITION_CATEGORIES).map(([categoryKey, categoryConfig]) => {
            const categoryConditions = groupedConditions[categoryKey]
            if (!categoryConditions || categoryConditions.length === 0) return null

            return (
              <div key={categoryKey}>
                <h4 className={`text-xs font-medium ${categoryConfig.color} uppercase tracking-wider mb-2`}>
                  {categoryConfig.label}
                </h4>
                <div className="space-y-2">
                  {categoryConditions.map(condition => (
                    <div key={condition.id}>
                      {editingId === condition.id ? (
                        renderForm()
                      ) : (
                        <div className={`p-3 rounded-lg border transition-colors group ${
                          condition.isCritical
                            ? 'bg-red-50 border-red-200 hover:border-red-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-start gap-3">
                            {condition.isCritical ? (
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${condition.isCritical ? 'text-red-900 font-medium' : 'text-gray-900'}`}>
                                {condition.isCritical && (
                                  <span className="text-xs uppercase font-bold text-red-600 mr-2">CRITICAL:</span>
                                )}
                                {condition.description}
                              </p>
                            </div>
                            {!readOnly && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleStartEdit(condition)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemove(condition.id)}
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
              </div>
            )
          })}
        </div>
      )}

      {isAdding && renderForm()}
    </div>
  )
}
