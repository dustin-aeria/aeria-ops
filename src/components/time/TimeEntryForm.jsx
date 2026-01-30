/**
 * TimeEntryForm.jsx
 * Form for creating and editing time entries
 *
 * @location src/components/time/TimeEntryForm.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { X, Clock, Calendar, Briefcase, DollarSign, FileText } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProjects } from '../../lib/firestore'
import { getOperators } from '../../lib/firestore'
import {
  createTimeEntry,
  updateTimeEntry,
  calculateTotalHours,
  TASK_TYPES
} from '../../lib/firestoreTimeTracking'
import { logger } from '../../lib/logger'
import { FormField } from '../ui/FormField'
import { Select, NativeSelect } from '../ui/Select'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Toggle } from '../ui/Toggle'

/**
 * Time Entry Form Component
 */
export default function TimeEntryForm({
  entry = null, // Existing entry for editing, null for new
  projectId = null, // Pre-selected project (when adding from project view)
  siteId = null, // Pre-selected site
  onClose,
  onSaved
}) {
  const { user, userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    projectId: entry?.projectId || projectId || '',
    siteId: entry?.siteId || siteId || '',
    date: entry?.date || new Date().toISOString().split('T')[0],
    startTime: entry?.startTime || '08:00',
    endTime: entry?.endTime || '17:00',
    breakMinutes: entry?.breakMinutes || 30,
    taskType: entry?.taskType || 'field_work',
    description: entry?.description || '',
    billable: entry?.billable ?? true,
    billingRate: entry?.billingRate || userProfile?.hourlyRate || 0
  })

  // Data for selectors
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const projectList = await getProjects({ status: 'active' })
      // Also get planning and completed projects for time entry flexibility
      const planningProjects = await getProjects({ status: 'planning' })
      const completedProjects = await getProjects({ status: 'completed' })
      setProjects([...projectList, ...planningProjects, ...completedProjects])
    } catch (err) {
      logger.error('Failed to load projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  // Get selected project details
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === formData.projectId)
  }, [projects, formData.projectId])

  // Get sites for selected project
  const availableSites = useMemo(() => {
    if (!selectedProject?.sites) return []
    return selectedProject.sites.map(site => ({
      value: site.id,
      label: site.name || 'Unnamed Site'
    }))
  }, [selectedProject])

  // Calculate total hours
  const totalHours = useMemo(() => {
    return calculateTotalHours(
      formData.startTime,
      formData.endTime,
      formData.breakMinutes
    )
  }, [formData.startTime, formData.endTime, formData.breakMinutes])

  // Calculate billing amount
  const billingAmount = useMemo(() => {
    if (!formData.billable) return 0
    return totalHours * (formData.billingRate || 0)
  }, [totalHours, formData.billable, formData.billingRate])

  // Project options for select
  const projectOptions = useMemo(() => {
    return projects.map(p => ({
      value: p.id,
      label: p.name || 'Unnamed Project'
    }))
  }, [projects])

  // Task type options
  const taskTypeOptions = Object.entries(TASK_TYPES).map(([value, { label }]) => ({
    value,
    label
  }))

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      // Clear site if project changes
      if (field === 'projectId' && value !== prev.projectId) {
        updated.siteId = ''
      }

      return updated
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.projectId) {
      setError('Please select a project')
      return
    }
    if (!formData.date) {
      setError('Please select a date')
      return
    }
    if (totalHours <= 0) {
      setError('Total hours must be greater than 0')
      return
    }

    setLoading(true)

    try {
      const entryData = {
        ...formData,
        projectName: selectedProject?.name || '',
        siteName: availableSites.find(s => s.value === formData.siteId)?.label || '',
        operatorId: user.uid,
        operatorName: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName || ''}`
          : user.email,
        totalHours,
        billingAmount,
        createdBy: user.uid
      }

      if (entry?.id) {
        // Update existing entry
        await updateTimeEntry(entry.id, entryData)
        logger.info('Time entry updated:', entry.id)
      } else {
        // Create new entry
        await createTimeEntry(entryData)
        logger.info('Time entry created')
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      logger.error('Failed to save time entry:', err)
      setError(err.message || 'Failed to save time entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {entry ? 'Edit Time Entry' : 'Log Time'}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Project Selection */}
      <FormField
        label="Project"
        required
        description="Select the project you worked on"
      >
        <Select
          value={formData.projectId}
          onChange={(val) => handleChange('projectId', val)}
          options={projectOptions}
          placeholder={loadingProjects ? 'Loading projects...' : 'Select project...'}
          disabled={loadingProjects || !!projectId}
        />
      </FormField>

      {/* Site Selection (if project has multiple sites) */}
      {availableSites.length > 1 && (
        <FormField
          label="Site"
          description="Select the specific site (optional)"
        >
          <Select
            value={formData.siteId}
            onChange={(val) => handleChange('siteId', val)}
            options={[{ value: '', label: 'All sites / General' }, ...availableSites]}
            placeholder="Select site..."
          />
        </FormField>
      )}

      {/* Date */}
      <FormField
        label="Date"
        required
      >
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </FormField>

      {/* Time Inputs */}
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Start Time" required>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
        </FormField>

        <FormField label="End Time" required>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
          />
        </FormField>

        <FormField label="Break (min)">
          <Input
            type="number"
            min="0"
            step="5"
            value={formData.breakMinutes}
            onChange={(e) => handleChange('breakMinutes', parseInt(e.target.value) || 0)}
          />
        </FormField>
      </div>

      {/* Total Hours Display */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <Clock className="w-5 h-5 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Total Hours</div>
          <div className="text-lg font-semibold text-gray-900">
            {totalHours.toFixed(2)} hours
          </div>
        </div>
      </div>

      {/* Task Type */}
      <FormField
        label="Task Type"
        required
        description="Categorize the type of work"
      >
        <Select
          value={formData.taskType}
          onChange={(val) => handleChange('taskType', val)}
          options={taskTypeOptions}
        />
      </FormField>

      {/* Description */}
      <FormField
        label="Description"
        description="Brief description of work performed"
      >
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What did you work on?"
          rows={3}
        />
      </FormField>

      {/* Billing Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">Billing</span>
          </div>
          <Toggle
            checked={formData.billable}
            onChange={(checked) => handleChange('billable', checked)}
            label="Billable"
          />
        </div>

        {formData.billable && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hourly Rate">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.billingRate}
                  onChange={(e) => handleChange('billingRate', parseFloat(e.target.value) || 0)}
                  className="pl-7"
                />
              </div>
            </FormField>

            <FormField label="Total Amount">
              <div className="flex items-center h-10 px-3 bg-gray-100 rounded-lg text-gray-900 font-medium">
                ${billingAmount.toFixed(2)}
              </div>
            </FormField>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : entry ? 'Update Entry' : 'Log Time'}
        </Button>
      </div>
    </form>
  )
}
