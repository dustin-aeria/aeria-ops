/**
 * Project Templates Component
 * Manage and apply project templates
 *
 * @location src/components/projects/ProjectTemplates.jsx
 */

import { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Save,
  Trash2,
  Copy,
  Edit,
  Eye,
  Check,
  X,
  ClipboardCheck,
  Map,
  Camera,
  Building,
  Leaf,
  AlertTriangle,
  GraduationCap,
  Folder,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search
} from 'lucide-react'
import {
  TEMPLATE_CATEGORIES,
  getTemplates,
  createTemplateFromProject,
  deleteTemplate,
  updateTemplate,
  getTemplatePreview
} from '../../lib/firestoreTemplates'
import { useAuth } from '../../contexts/AuthContext'

const CATEGORY_ICONS = {
  inspection: ClipboardCheck,
  mapping: Map,
  photography: Camera,
  construction: Building,
  agriculture: Leaf,
  emergency: AlertTriangle,
  training: GraduationCap,
  other: Folder
}

export default function ProjectTemplates({ project, onApplyTemplate, mode = 'select' }) {
  const { user, userProfile } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedTemplate, setExpandedTemplate] = useState(null)

  // Save template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'other',
    isPublic: false,
    tags: ''
  })

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [user?.uid])

  const loadTemplates = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const data = await getTemplates(user.uid)
      setTemplates(data)
    } catch (err) {
      // Templates are optional
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim() || !project) return

    setSaving(true)
    try {
      await createTemplateFromProject(project, {
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        category: newTemplate.category,
        isPublic: newTemplate.isPublic,
        tags: newTemplate.tags.split(',').map(t => t.trim()).filter(Boolean),
        organizationId: user.uid,
        createdBy: user.uid,
        createdByName: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : userProfile?.email || 'Unknown'
      })

      setShowSaveModal(false)
      setNewTemplate({
        name: '',
        description: '',
        category: 'other',
        isPublic: false,
        tags: ''
      })
      loadTemplates()
    } catch (err) {
      alert('Failed to save template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return

    try {
      await deleteTemplate(templateId)
      loadTemplates()
    } catch (err) {
      alert('Failed to delete template.')
    }
  }

  const handleApplyTemplate = (template) => {
    if (onApplyTemplate) {
      onApplyTemplate(template)
    }
  }

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || t.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Separate own vs public templates
  const ownTemplates = filteredTemplates.filter(t => t.organizationId === user?.uid)
  const publicTemplates = filteredTemplates.filter(t => t.organizationId !== user?.uid)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-aeria-navy" />
          Project Templates
        </h3>
        {mode === 'manage' && project && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save as Template
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
        >
          <option value="">All Categories</option>
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No templates found</p>
          {mode === 'manage' && project && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="mt-3 text-aeria-blue hover:underline"
            >
              Save current project as template
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Own Templates */}
          {ownTemplates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Templates</h4>
              <div className="grid gap-3">
                {ownTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isOwn={true}
                    isExpanded={expandedTemplate === template.id}
                    onToggleExpand={() => setExpandedTemplate(
                      expandedTemplate === template.id ? null : template.id
                    )}
                    onApply={() => handleApplyTemplate(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                    mode={mode}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Public Templates */}
          {publicTemplates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Community Templates
              </h4>
              <div className="grid gap-3">
                {publicTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isOwn={false}
                    isExpanded={expandedTemplate === template.id}
                    onToggleExpand={() => setExpandedTemplate(
                      expandedTemplate === template.id ? null : template.id
                    )}
                    onApply={() => handleApplyTemplate(template)}
                    mode={mode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save as Template</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Standard Inspection Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Describe what this template is for..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                >
                  {Object.entries(TEMPLATE_CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                  placeholder="e.g., inspection, solar, routine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newTemplate.isPublic}
                  onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                  className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                />
                <span className="text-sm text-gray-700">
                  Share publicly with other operators
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!newTemplate.name.trim() || saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ template, isOwn, isExpanded, onToggleExpand, onApply, onDelete, mode }) {
  const CategoryIcon = CATEGORY_ICONS[template.category] || Folder
  const categoryConfig = TEMPLATE_CATEGORIES[template.category] || TEMPLATE_CATEGORIES.other
  const preview = getTemplatePreview(template)

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${categoryConfig.color}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                {template.name}
                {template.isPublic ? (
                  <Globe className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                )}
              </h4>
              {template.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded ${categoryConfig.color}`}>
                  {categoryConfig.label}
                </span>
                {template.usageCount > 0 && (
                  <span className="text-xs text-gray-400">
                    Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'select' && (
              <button
                onClick={onApply}
                className="btn-primary text-sm py-1.5 px-3"
              >
                Use Template
              </button>
            )}
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isOwn && (
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Preview */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">Template includes:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {preview.sections > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                {preview.sections} sections enabled
              </div>
            )}
            {preview.hasFlightPlan && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                Flight plan
              </div>
            )}
            {preview.hasEmergencyPlan && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                Emergency plan
              </div>
            )}
            {preview.hasPPE && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                PPE requirements
              </div>
            )}
            {preview.hasComms && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                Communications
              </div>
            )}
            {preview.hasHSERisks && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                HSE risks
              </div>
            )}
            {preview.hasSORA && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                SORA assessment
              </div>
            )}
            {preview.hasNeedsAnalysis && (
              <div className="flex items-center gap-1 text-gray-600">
                <Check className="w-3.5 h-3.5 text-green-500" />
                Needs analysis
              </div>
            )}
          </div>
          {template.createdByName && (
            <p className="text-xs text-gray-400 mt-2">
              Created by {template.createdByName}
              {template.sourceProjectName && ` from "${template.sourceProjectName}"`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
