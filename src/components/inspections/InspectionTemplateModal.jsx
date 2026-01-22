/**
 * InspectionTemplateModal.jsx
 * Modal for creating and editing inspection templates/checklists
 */

import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, GripVertical, FileText } from 'lucide-react'
import {
  createInspectionTemplate,
  updateInspectionTemplate,
  deactivateInspectionTemplate,
  INSPECTION_TYPES,
  INSPECTION_FREQUENCY
} from '../../lib/firestoreInspections'

export default function InspectionTemplateModal({
  isOpen,
  onClose,
  template,
  operatorId
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'workplace',
    frequency: 'monthly'
  })
  const [checklistItems, setChecklistItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!template

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        type: template.type || 'workplace',
        frequency: template.frequency || 'monthly'
      })
      setChecklistItems(template.checklistItems || [])
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'workplace',
        frequency: 'monthly'
      })
      setChecklistItems([])
    }
  }, [template])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addChecklistItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      section: 'General',
      item: '',
      expectedCondition: '',
      isCritical: false
    }
    setChecklistItems(prev => [...prev, newItem])
  }

  const updateChecklistItem = (id, field, value) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    )
  }

  const removeChecklistItem = (id) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const moveItem = (fromIndex, toIndex) => {
    const newItems = [...checklistItems]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    setChecklistItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (checklistItems.length === 0) {
      setError('Add at least one checklist item')
      return
    }

    const emptyItems = checklistItems.filter(item => !item.item.trim())
    if (emptyItems.length > 0) {
      setError('All checklist items must have a description')
      return
    }

    setSaving(true)

    try {
      const templateData = {
        ...formData,
        operatorId,
        checklistItems
      }

      if (isEditing) {
        await updateInspectionTemplate(template.id, templateData)
      } else {
        await createInspectionTemplate(templateData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving template:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm('Deactivate this template? It will no longer be available for new inspections.')) return

    setSaving(true)
    try {
      await deactivateInspectionTemplate(template.id)
      onClose()
    } catch (err) {
      console.error('Error deactivating template:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Get unique sections from items
  const sections = [...new Set(checklistItems.map(item => item.section))].filter(Boolean)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Edit Template' : 'Create Inspection Template'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Template Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  placeholder="e.g., Daily Workplace Safety Inspection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                >
                  {Object.entries(INSPECTION_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                >
                  {Object.entries(INSPECTION_FREQUENCY).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue"
                  placeholder="Brief description of what this inspection covers"
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Checklist Items</h3>
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-aeria-blue hover:bg-aeria-sky rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {checklistItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No checklist items yet</p>
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="mt-2 text-aeria-blue hover:underline text-sm"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-3 ${item.isCritical ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="p-1 text-gray-400 cursor-grab"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>

                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Section</label>
                              <input
                                type="text"
                                value={item.section}
                                onChange={(e) => updateChecklistItem(item.id, 'section', e.target.value)}
                                list="sections"
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-aeria-blue"
                                placeholder="General"
                              />
                              <datalist id="sections">
                                {sections.map(s => <option key={s} value={s} />)}
                              </datalist>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Item *</label>
                              <input
                                type="text"
                                value={item.item}
                                onChange={(e) => updateChecklistItem(item.id, 'item', e.target.value)}
                                required
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-aeria-blue"
                                placeholder="What to inspect"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">Expected Condition</label>
                              <input
                                type="text"
                                value={item.expectedCondition}
                                onChange={(e) => updateChecklistItem(item.id, 'expectedCondition', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-aeria-blue"
                                placeholder="What is acceptable"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={item.isCritical}
                                onChange={(e) => updateChecklistItem(item.id, 'isCritical', e.target.checked)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-red-600">Critical</span>
                            </label>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeChecklistItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {checklistItems.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {checklistItems.length} item(s) •
                  {checklistItems.filter(i => i.isCritical).length} critical
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            {isEditing && template.isActive ? (
              <button
                type="button"
                onClick={handleDeactivate}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Deactivate
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
