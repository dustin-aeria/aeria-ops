/**
 * FormBuilder.jsx
 * Custom form builder component for creating user-defined forms
 *
 * Features:
 * - Drag-and-drop field ordering
 * - Field type selection
 * - Field configuration (label, required, validation)
 * - Preview mode
 * - Save to Firestore
 *
 * @location src/components/forms/FormBuilder.jsx
 */

import { useState, useCallback } from 'react'
import {
  X,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Eye,
  Save,
  ChevronDown,
  ChevronRight,
  Type,
  Hash,
  Calendar,
  List,
  CheckSquare,
  FileText,
  Upload,
  Pencil,
  User,
  MapPin,
  Clock,
  ToggleLeft,
  AlignLeft
} from 'lucide-react'

// Available field types for the form builder
const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text' },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, description: 'Multi-line text' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'time', label: 'Time', icon: Clock, description: 'Time picker' },
  { type: 'datetime', label: 'Date & Time', icon: Calendar, description: 'Date and time picker' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Single selection' },
  { type: 'multiselect', label: 'Multi-Select', icon: CheckSquare, description: 'Multiple selection' },
  { type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, description: 'Yes/No toggle' },
  { type: 'yesno', label: 'Yes/No', icon: ToggleLeft, description: 'Yes/No radio buttons' },
  { type: 'signature', label: 'Signature', icon: Pencil, description: 'Digital signature' },
  { type: 'file_upload', label: 'File Upload', icon: Upload, description: 'File attachment' },
  { type: 'gps', label: 'GPS Location', icon: MapPin, description: 'GPS coordinates' }
]

// Field configuration panel
function FieldConfigPanel({ field, onChange, onClose }) {
  const [options, setOptions] = useState(field.options || [])
  const [newOption, setNewOption] = useState('')

  const updateField = (key, value) => {
    onChange({ ...field, [key]: value })
  }

  const addOption = () => {
    if (newOption.trim()) {
      const newOptions = [...options, { value: newOption.trim().toLowerCase().replace(/\s+/g, '_'), label: newOption.trim() }]
      setOptions(newOptions)
      onChange({ ...field, options: newOptions })
      setNewOption('')
    }
  }

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    onChange({ ...field, options: newOptions })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Configure Field</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Label *</label>
            <input
              type="text"
              value={field.label || ''}
              onChange={(e) => updateField('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              placeholder="Enter field label"
            />
          </div>

          {/* Placeholder */}
          {['text', 'textarea', 'number'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => updateField('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                placeholder="Hint text shown in empty field"
              />
            </div>
          )}

          {/* Help Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
            <input
              type="text"
              value={field.helpText || ''}
              onChange={(e) => updateField('helpText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              placeholder="Additional instructions for users"
            />
          </div>

          {/* Required */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="field-required"
              checked={field.required || false}
              onChange={(e) => updateField('required', e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
            <label htmlFor="field-required" className="text-sm font-medium text-gray-700">
              Required field
            </label>
          </div>

          {/* Number-specific options */}
          {field.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                <input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) => updateField('min', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                <input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) => updateField('max', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Text-specific options */}
          {field.type === 'text' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Length</label>
                <input
                  type="number"
                  value={field.minLength ?? ''}
                  onChange={(e) => updateField('minLength', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Length</label>
                <input
                  type="number"
                  value={field.maxLength ?? ''}
                  onChange={(e) => updateField('maxLength', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Textarea rows */}
          {field.type === 'textarea' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
              <input
                type="number"
                value={field.rows || 3}
                onChange={(e) => updateField('rows', Number(e.target.value))}
                min={2}
                max={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              />
            </div>
          )}

          {/* Select/Multiselect options */}
          {['select', 'multiselect'].includes(field.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2 mb-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOptions = [...options]
                        newOptions[index] = { ...opt, label: e.target.value }
                        setOptions(newOptions)
                        onChange({ ...field, options: newOptions })
                      }}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option..."
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* File upload options */}
          {field.type === 'file_upload' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accepted File Types</label>
                <input
                  type="text"
                  value={field.accept || ''}
                  onChange={(e) => updateField('accept', e.target.value)}
                  placeholder="e.g., .pdf,.doc,.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="field-multiple"
                  checked={field.multiple || false}
                  onChange={(e) => updateField('multiple', e.target.checked)}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <label htmlFor="field-multiple" className="text-sm font-medium text-gray-700">
                  Allow multiple files
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// Field item in the builder
function FieldItem({ field, index, onConfigure, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  const fieldType = FIELD_TYPES.find(t => t.type === field.type)
  const Icon = fieldType?.icon || Type

  return (
    <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg group hover:border-aeria-navy/30 transition-colors">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 -rotate-90" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 rotate-90" />
        </button>
      </div>

      <div className="w-8 h-8 bg-aeria-sky rounded flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-aeria-navy" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {field.label || 'Untitled Field'}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="text-xs text-gray-500">{fieldType?.label || field.type}</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onConfigure}
          className="p-1.5 text-gray-400 hover:text-aeria-navy hover:bg-gray-100 rounded"
          title="Configure"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Section component
function SectionBuilder({ section, sectionIndex, onUpdate, onDelete, onAddField }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [configuringField, setConfiguringField] = useState(null)

  const updateField = (fieldIndex, updatedField) => {
    const newFields = [...section.fields]
    newFields[fieldIndex] = updatedField
    onUpdate({ ...section, fields: newFields })
  }

  const deleteField = (fieldIndex) => {
    const newFields = section.fields.filter((_, i) => i !== fieldIndex)
    onUpdate({ ...section, fields: newFields })
  }

  const moveField = (fieldIndex, direction) => {
    const newIndex = fieldIndex + direction
    if (newIndex < 0 || newIndex >= section.fields.length) return

    const newFields = [...section.fields]
    const temp = newFields[fieldIndex]
    newFields[fieldIndex] = newFields[newIndex]
    newFields[newIndex] = temp
    onUpdate({ ...section, fields: newFields })
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
        </button>

        <input
          type="text"
          value={section.title || ''}
          onChange={(e) => onUpdate({ ...section, title: e.target.value })}
          placeholder="Section Title"
          className="flex-1 px-3 py-1.5 text-sm font-medium bg-transparent border-0 focus:ring-0 focus:outline-none"
        />

        <span className="text-xs text-gray-400">{section.fields.length} fields</span>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
          title="Delete Section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {section.fields.map((field, fieldIndex) => (
            <FieldItem
              key={field.id}
              field={field}
              index={fieldIndex}
              onConfigure={() => setConfiguringField(fieldIndex)}
              onDelete={() => deleteField(fieldIndex)}
              onMoveUp={() => moveField(fieldIndex, -1)}
              onMoveDown={() => moveField(fieldIndex, 1)}
              isFirst={fieldIndex === 0}
              isLast={fieldIndex === section.fields.length - 1}
            />
          ))}

          <button
            type="button"
            onClick={() => onAddField(sectionIndex)}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-aeria-navy hover:text-aeria-navy transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>
      )}

      {configuringField !== null && (
        <FieldConfigPanel
          field={section.fields[configuringField]}
          onChange={(updated) => updateField(configuringField, updated)}
          onClose={() => setConfiguringField(null)}
        />
      )}
    </div>
  )
}

// Field type picker modal
function FieldTypePicker({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Field</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FIELD_TYPES.map((fieldType) => {
            const Icon = fieldType.icon
            return (
              <button
                key={fieldType.type}
                onClick={() => onSelect(fieldType.type)}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-aeria-navy hover:bg-aeria-sky/20 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-aeria-sky rounded flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-aeria-navy" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{fieldType.label}</div>
                  <div className="text-xs text-gray-500">{fieldType.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Preview component
function FormPreview({ formData, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-gray-900">{formData.name || 'Untitled Form'}</h3>
            <p className="text-sm text-gray-500">Preview Mode</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {formData.description && (
            <p className="text-gray-600">{formData.description}</p>
          )}

          {formData.sections.map((section, sectionIndex) => (
            <div key={section.id} className="border border-gray-200 rounded-lg">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">{section.title || `Section ${sectionIndex + 1}`}</h4>
              </div>
              <div className="p-4 space-y-4">
                {section.fields.map((field) => {
                  const fieldType = FIELD_TYPES.find(t => t.type === field.type)
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label || 'Untitled Field'}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          rows={field.rows || 3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'time' && (
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'datetime' && (
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.type === 'select' && (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                          <option>Select...</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-4 h-4" disabled />
                          <span className="text-sm text-gray-600">Check if applicable</span>
                        </div>
                      )}

                      {field.type === 'yesno' && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" disabled />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" disabled />
                            <span>No</span>
                          </label>
                        </div>
                      )}

                      {field.type === 'signature' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                          Click to sign
                        </div>
                      )}

                      {field.type === 'file_upload' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                          <Upload className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">Click to upload</p>
                        </div>
                      )}

                      {field.type === 'gps' && (
                        <input
                          type="text"
                          placeholder="Lat, Long"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          disabled
                        />
                      )}

                      {field.helpText && (
                        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main FormBuilder component
export default function FormBuilder({ isOpen, onClose, onSave, existingForm }) {
  const [formData, setFormData] = useState(existingForm || {
    id: `custom_${Date.now()}`,
    name: '',
    shortName: '',
    description: '',
    category: 'custom',
    sections: [{
      id: `section_${Date.now()}`,
      title: 'Form Fields',
      fields: []
    }]
  })

  const [showFieldPicker, setShowFieldPicker] = useState(null) // sectionIndex or null
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const updateSection = (index, updatedSection) => {
    const newSections = [...formData.sections]
    newSections[index] = updatedSection
    setFormData({ ...formData, sections: newSections })
  }

  const deleteSection = (index) => {
    if (formData.sections.length <= 1) {
      alert('Form must have at least one section')
      return
    }
    const newSections = formData.sections.filter((_, i) => i !== index)
    setFormData({ ...formData, sections: newSections })
  }

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          id: `section_${Date.now()}`,
          title: `Section ${formData.sections.length + 1}`,
          fields: []
        }
      ]
    })
  }

  const addField = (sectionIndex, fieldType) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType,
      label: '',
      required: false
    }

    const newSections = [...formData.sections]
    newSections[sectionIndex].fields.push(newField)
    setFormData({ ...formData, sections: newSections })
    setShowFieldPicker(null)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a form name')
      return
    }

    const hasFields = formData.sections.some(s => s.fields.length > 0)
    if (!hasFields) {
      alert('Please add at least one field to the form')
      return
    }

    setSaving(true)
    try {
      await onSave({
        ...formData,
        shortName: formData.shortName || formData.name,
        icon: 'FileText',
        isCustom: true,
        createdAt: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      alert('Failed to save form: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {existingForm ? 'Edit Form' : 'Create Custom Form'}
            </h2>
            <p className="text-sm text-gray-500">Design your own form with custom fields</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                placeholder="e.g., Daily Safety Checklist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                placeholder="e.g., DSC"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              placeholder="Brief description of this form's purpose"
            />
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Sections</h3>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1 text-sm text-aeria-navy hover:text-aeria-blue"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {formData.sections.map((section, sectionIndex) => (
              <SectionBuilder
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                onUpdate={(updated) => updateSection(sectionIndex, updated)}
                onDelete={() => deleteSection(sectionIndex)}
                onAddField={() => setShowFieldPicker(sectionIndex)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      </div>

      {/* Field Type Picker */}
      {showFieldPicker !== null && (
        <FieldTypePicker
          onSelect={(type) => addField(showFieldPicker, type)}
          onClose={() => setShowFieldPicker(null)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <FormPreview
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
