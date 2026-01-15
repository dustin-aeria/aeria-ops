import { useState, useEffect } from 'react'
import { 
  ClipboardList,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Edit3,
  Calendar,
  User,
  FolderKanban,
  X
} from 'lucide-react'

// Standard RPAS field forms
const formTemplates = [
  { 
    id: 'preflight_checklist', 
    name: 'Pre-Flight Checklist',
    description: 'Aircraft inspection and systems check before flight',
    category: 'flight'
  },
  { 
    id: 'postflight_checklist', 
    name: 'Post-Flight Checklist',
    description: 'Aircraft inspection and data management after flight',
    category: 'flight'
  },
  { 
    id: 'flight_log', 
    name: 'Flight Log',
    description: 'Individual flight record with times, locations, and notes',
    category: 'flight'
  },
  { 
    id: 'battery_log', 
    name: 'Battery Log',
    description: 'Battery cycle tracking and health monitoring',
    category: 'equipment'
  },
  { 
    id: 'maintenance_record', 
    name: 'Maintenance Record',
    description: 'Equipment maintenance and repair documentation',
    category: 'equipment'
  },
  { 
    id: 'site_inspection', 
    name: 'Site Inspection Form',
    description: 'On-site hazard assessment and conditions check',
    category: 'safety'
  },
  { 
    id: 'incident_report', 
    name: 'Incident Report',
    description: 'Documentation of incidents, accidents, or near-misses',
    category: 'safety'
  },
  { 
    id: 'jsa_form', 
    name: 'Job Safety Analysis (JSA)',
    description: 'Task-specific hazard identification and controls',
    category: 'safety'
  },
  { 
    id: 'crew_signoff', 
    name: 'Crew Sign-Off Sheet',
    description: 'Daily crew briefing acknowledgment',
    category: 'admin'
  },
  { 
    id: 'client_signoff', 
    name: 'Client Sign-Off',
    description: 'Client acceptance of deliverables',
    category: 'admin'
  },
  { 
    id: 'data_transfer', 
    name: 'Data Transfer Log',
    description: 'Chain of custody for collected data',
    category: 'admin'
  }
]

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'flight', label: 'Flight Operations' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'safety', label: 'Safety' },
  { value: 'admin', label: 'Administrative' }
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  issue: 'bg-amber-100 text-amber-700'
}

export default function Forms() {
  const [forms, setForms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showNewFormModal, setShowNewFormModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [newFormData, setNewFormData] = useState({
    projectName: '',
    notes: ''
  })

  // Load forms from localStorage (in real app, this would be Firestore)
  useEffect(() => {
    const saved = localStorage.getItem('aeria_forms')
    if (saved) {
      setForms(JSON.parse(saved))
    }
  }, [])

  // Save forms to localStorage
  const saveForms = (updatedForms) => {
    setForms(updatedForms)
    localStorage.setItem('aeria_forms', JSON.stringify(updatedForms))
  }

  // Create new form
  const createForm = () => {
    if (!selectedTemplate) return

    const newForm = {
      id: Date.now().toString(),
      templateId: selectedTemplate.id,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      projectName: newFormData.projectName,
      notes: newFormData.notes,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      completedBy: '',
      data: {}
    }

    saveForms([newForm, ...forms])
    setShowNewFormModal(false)
    setSelectedTemplate(null)
    setNewFormData({ projectName: '', notes: '' })
  }

  // Update form status
  const updateFormStatus = (formId, status) => {
    const updated = forms.map(f => {
      if (f.id === formId) {
        return {
          ...f,
          status,
          updatedAt: new Date().toISOString(),
          completedAt: status === 'completed' ? new Date().toISOString() : f.completedAt
        }
      }
      return f
    })
    saveForms(updated)
  }

  // Delete form
  const deleteForm = (formId) => {
    if (!confirm('Delete this form? This cannot be undone.')) return
    saveForms(forms.filter(f => f.id !== formId))
  }

  // Filter forms
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Stats
  const stats = {
    total: forms.length,
    completed: forms.filter(f => f.status === 'completed').length,
    inProgress: forms.filter(f => f.status === 'in_progress').length,
    draft: forms.filter(f => f.status === 'draft').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500">Field forms and checklists</p>
        </div>
        <button
          onClick={() => setShowNewFormModal(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Form
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Forms</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.draft}</p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
            placeholder="Search forms..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input w-full sm:w-auto"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Forms List */}
      {filteredForms.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {forms.length === 0 ? 'No forms yet' : 'No forms match your search'}
          </h3>
          <p className="text-gray-500 mb-4">
            {forms.length === 0 
              ? 'Start a new form to track field operations'
              : 'Try adjusting your search or filter'}
          </p>
          {forms.length === 0 && (
            <button
              onClick={() => setShowNewFormModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start a Form
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => (
            <div 
              key={form.id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{form.name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${statusColors[form.status]}`}>
                      {form.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {form.projectName && (
                      <span className="inline-flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" />
                        {form.projectName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1 capitalize">
                      <FileText className="w-3 h-3" />
                      {form.category}
                    </span>
                  </div>

                  {form.notes && (
                    <p className="text-sm text-gray-500 mt-2">{form.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {form.status !== 'completed' && (
                    <select
                      value={form.status}
                      onChange={(e) => updateFormStatus(form.id, e.target.value)}
                      className="input text-sm py-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="issue">Issue</option>
                    </select>
                  )}
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Form Modal */}
      {showNewFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNewFormModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Form</h2>
              <button
                onClick={() => setShowNewFormModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!selectedTemplate ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">Select a form template:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {formTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{template.name}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">{template.description}</p>
                        <span className="text-xs text-gray-400 capitalize mt-1 inline-block">
                          {template.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-sm text-aeria-blue hover:underline mb-4 inline-flex items-center gap-1"
                  >
                    ← Back to templates
                  </button>

                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                    <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label">Project / Job Name (optional)</label>
                      <input
                        type="text"
                        value={newFormData.projectName}
                        onChange={(e) => setNewFormData(prev => ({ ...prev, projectName: e.target.value }))}
                        className="input"
                        placeholder="e.g., Pipeline Inspection - Site A"
                      />
                    </div>
                    <div>
                      <label className="label">Notes (optional)</label>
                      <textarea
                        value={newFormData.notes}
                        onChange={(e) => setNewFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="input min-h-[80px]"
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedTemplate && (
              <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowNewFormModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createForm}
                  className="btn-primary"
                >
                  Create Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
