/**
 * CategoryManager.jsx
 * Component for managing policy categories
 *
 * Features:
 * - View existing categories (default + custom)
 * - Create custom categories
 * - Edit category metadata
 * - Delete custom categories (with validation)
 *
 * @location src/components/policies/CategoryManager.jsx
 */

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  FolderPlus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  FolderOpen,
  Lock,
  Palette,
  Hash,
  FileText,
  Plane,
  Users,
  HardHat,
  Settings,
  Shield,
  Briefcase,
  Building,
  Wrench,
  Book
} from 'lucide-react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  DEFAULT_CATEGORIES
} from '../../lib/firestorePolicies'
import { usePolicyPermissions } from '../../hooks/usePolicyPermissions'

// Available icons for categories
const AVAILABLE_ICONS = {
  Plane: Plane,
  Users: Users,
  HardHat: HardHat,
  FolderOpen: FolderOpen,
  FileText: FileText,
  Settings: Settings,
  Shield: Shield,
  Briefcase: Briefcase,
  Building: Building,
  Wrench: Wrench,
  Book: Book
}

// Available colors
const AVAILABLE_COLORS = [
  { id: 'blue', name: 'Blue', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { id: 'green', name: 'Green', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'red', name: 'Red', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { id: 'gray', name: 'Gray', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
]

/**
 * Get color classes for a color ID
 */
function getColorClasses(colorId) {
  const color = AVAILABLE_COLORS.find(c => c.id === colorId)
  return color || AVAILABLE_COLORS[0]
}

/**
 * Category card component
 */
function CategoryCard({ category, onEdit, onDelete, canManage }) {
  const IconComponent = AVAILABLE_ICONS[category.icon] || FolderOpen
  const colorClasses = getColorClasses(category.color)

  return (
    <div className={`bg-white rounded-lg border ${colorClasses.border} p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
            <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
          </div>
        </div>

        {category.isDefault && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
            <Lock className="w-3 h-3" />
            Default
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {category.numberRange?.start}-{category.numberRange?.end}
          </span>
          <span className={`px-2 py-0.5 rounded ${colorClasses.bg} ${colorClasses.text}`}>
            {category.id}
          </span>
        </div>

        {canManage && !category.isDefault && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Edit category"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

CategoryCard.propTypes = {
  category: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  canManage: PropTypes.bool
}

/**
 * Category form modal
 */
function CategoryFormModal({ category, isOpen, onClose, onSave }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderOpen',
    color: 'gray'
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || 'FolderOpen',
        color: category.color || 'gray'
      })
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'FolderOpen',
        color: 'gray'
      })
    }
    setError('')
  }, [category, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const IconComponent = AVAILABLE_ICONS[formData.icon] || FolderOpen
  const colorClasses = getColorClasses(formData.color)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {category ? 'Edit Category' : 'New Category'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
              <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {formData.name || 'Category Name'}
              </p>
              <p className="text-sm text-gray-500">Preview</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Training & Development"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this category..."
            />
          </div>

          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.icon === name
                      ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.id }))}
                  className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                    formData.color === color.id
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

CategoryFormModal.propTypes = {
  category: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
}

/**
 * Delete confirmation modal
 */
function DeleteConfirmModal({ category, isOpen, onClose, onConfirm, loading }) {
  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{category.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete Category
          </button>
        </div>
      </div>
    </div>
  )
}

DeleteConfirmModal.propTypes = {
  category: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool
}

/**
 * Main CategoryManager component
 */
export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const permissions = usePolicyPermissions()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError('Failed to load categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData)
    } else {
      await createCategory(formData)
    }
    await loadCategories()
    setEditingCategory(null)
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    try {
      setDeleteLoading(true)
      await deleteCategory(deletingCategory.id)
      await loadCategories()
      setDeletingCategory(null)
    } catch (err) {
      setError(err.message || 'Failed to delete category')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const defaultCategories = categories.filter(c => c.isDefault)
  const customCategories = categories.filter(c => !c.isDefault)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Policy Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            Organize policies into logical groups
          </p>
        </div>

        {permissions.canManageCategories && (
          <button
            onClick={() => {
              setEditingCategory(null)
              setShowForm(true)
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Category
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Default categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          Default Categories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultCategories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => {}}
              onDelete={() => {}}
              canManage={false}
            />
          ))}
        </div>
      </div>

      {/* Custom categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-gray-400" />
          Custom Categories
        </h3>
        {customCategories.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FolderOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No custom categories yet</p>
            {permissions.canManageCategories && (
              <button
                onClick={() => {
                  setEditingCategory(null)
                  setShowForm(true)
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                Create your first category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={(cat) => {
                  setEditingCategory(cat)
                  setShowForm(true)
                }}
                onDelete={setDeletingCategory}
                canManage={permissions.canManageCategories}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      <CategoryFormModal
        category={editingCategory}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingCategory(null)
        }}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        category={deletingCategory}
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
