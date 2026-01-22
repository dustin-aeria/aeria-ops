/**
 * TrainingCourseModal.jsx
 * Modal for creating/editing training courses
 */

import { useState, useEffect } from 'react'
import { X, Save, BookOpen, Trash2 } from 'lucide-react'
import {
  createCourse,
  updateCourse,
  deactivateCourse,
  TRAINING_CATEGORIES
} from '../../lib/firestoreTraining'

export default function TrainingCourseModal({
  isOpen,
  onClose,
  course,
  operatorId
}) {
  const [formData, setFormData] = useState({
    courseCode: '',
    name: '',
    description: '',
    category: 'safety',
    provider: '',
    duration: 1,
    validityPeriod: 12,
    requiredForRoles: [],
    isExternal: false
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!course

  useEffect(() => {
    if (course) {
      setFormData({
        courseCode: course.courseCode || '',
        name: course.name || '',
        description: course.description || '',
        category: course.category || 'safety',
        provider: course.provider || '',
        duration: course.duration || 1,
        validityPeriod: course.validityPeriod ?? 12,
        requiredForRoles: course.requiredForRoles || [],
        isExternal: course.isExternal || false
      })
    }
  }, [course])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const courseData = {
        ...formData,
        operatorId
      }

      if (isEditing) {
        await updateCourse(course.id, courseData)
      } else {
        await createCourse(courseData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving course:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this course? It will no longer appear in the course list.')) return

    setSaving(true)
    try {
      await deactivateCourse(course.id)
      onClose()
    } catch (err) {
      console.error('Error deactivating course:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Edit Course' : 'Add Training Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="e.g., HSE-001"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="Enter course name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Course description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="e.g., Internal, External Provider"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity Period (months)
              </label>
              <input
                type="number"
                name="validityPeriod"
                value={formData.validityPeriod}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Set to 0 for training that never expires
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isExternal"
              name="isExternal"
              checked={formData.isExternal}
              onChange={handleChange}
              className="w-4 h-4 text-aeria-blue border-gray-300 rounded focus:ring-aeria-blue"
            />
            <label htmlFor="isExternal" className="text-sm text-gray-700">
              External training (delivered by third-party provider)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing && !course.isDefault ? (
              <button
                type="button"
                onClick={handleDeactivate}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
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
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Create Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
