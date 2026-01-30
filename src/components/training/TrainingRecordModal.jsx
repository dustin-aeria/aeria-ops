/**
 * TrainingRecordModal.jsx
 * Modal for creating/editing training records
 * COR-compliant: tracks what, when, where, by whom
 */

import { useState, useEffect } from 'react'
import { X, Save, Award, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  createTrainingRecord,
  updateTrainingRecord,
  deleteTrainingRecord,
  verifyCompetency,
  TRAINING_STATUS,
  COMPETENCY_STATUS,
  COR_TRAINING_REQUIREMENTS
} from '../../lib/firestoreTraining'

export default function TrainingRecordModal({
  isOpen,
  onClose,
  record,
  course,
  organizationId,
  courses = []
}) {
  const [formData, setFormData] = useState({
    courseId: '',
    courseName: '',
    crewMemberId: '',
    crewMemberName: '',
    completionDate: new Date().toISOString().split('T')[0],
    provider: '',
    instructor: '',
    location: '',
    duration: 0,
    certificateNumber: '',
    notes: '',
    validityPeriod: 12
  })
  const [competencyData, setCompetencyData] = useState({
    competencyStatus: 'not_verified',
    verifiedBy: '',
    competencyNotes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showCompetencySection, setShowCompetencySection] = useState(false)

  const isEditing = !!record

  useEffect(() => {
    if (record) {
      setFormData({
        courseId: record.courseId || '',
        courseName: record.courseName || '',
        crewMemberId: record.crewMemberId || '',
        crewMemberName: record.crewMemberName || '',
        completionDate: record.completionDate
          ? (record.completionDate.toDate?.() || new Date(record.completionDate)).toISOString().split('T')[0]
          : '',
        provider: record.provider || '',
        instructor: record.instructor || '',
        location: record.location || '',
        duration: record.duration || 0,
        certificateNumber: record.certificateNumber || '',
        notes: record.notes || '',
        validityPeriod: record.validityPeriod ?? 12
      })
      setCompetencyData({
        competencyStatus: record.competencyStatus || 'not_verified',
        verifiedBy: record.verifiedBy || '',
        competencyNotes: record.competencyNotes || ''
      })
      setShowCompetencySection(record.competencyStatus !== 'not_verified')
    } else if (course) {
      // Pre-fill from selected course
      setFormData(prev => ({
        ...prev,
        courseId: course.id,
        courseName: course.name,
        provider: course.provider || '',
        duration: course.duration || 0,
        validityPeriod: course.validityPeriod ?? 12
      }))
    }
  }, [record, course])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))

    // Auto-fill course name when course is selected
    if (name === 'courseId') {
      const selectedCourse = courses.find(c => c.id === value)
      if (selectedCourse) {
        setFormData(prev => ({
          ...prev,
          courseName: selectedCourse.name,
          provider: prev.provider || selectedCourse.provider || '',
          duration: prev.duration || selectedCourse.duration || 0,
          validityPeriod: selectedCourse.validityPeriod ?? 12
        }))
      }
    }
  }

  const handleCompetencyChange = (e) => {
    const { name, value } = e.target
    setCompetencyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate COR required fields
      const missingFields = COR_TRAINING_REQUIREMENTS.requiredFields.filter(
        field => !formData[field]
      )
      if (missingFields.length > 0) {
        setError(`COR requires: ${missingFields.join(', ')}`)
        setSaving(false)
        return
      }

      const recordData = {
        ...formData,
        organizationId,
        completionDate: new Date(formData.completionDate)
      }

      if (isEditing) {
        await updateTrainingRecord(record.id, recordData)

        // Update competency if changed
        if (showCompetencySection) {
          await verifyCompetency(record.id, {
            ...competencyData,
            verifiedBy: competencyData.verifiedBy || 'System'
          })
        }
      } else {
        await createTrainingRecord(recordData)
      }

      onClose()
    } catch (err) {
      console.error('Error saving training record:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this training record? This cannot be undone.')) return

    setSaving(true)
    try {
      await deleteTrainingRecord(record.id)
      onClose()
    } catch (err) {
      console.error('Error deleting record:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Check COR completeness
  const checkCORCompleteness = () => {
    const missing = COR_TRAINING_REQUIREMENTS.requiredFields.filter(field => !formData[field])
    return {
      isComplete: missing.length === 0,
      missingFields: missing
    }
  }

  const corStatus = checkCORCompleteness()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-aeria-blue" />
            {isEditing ? 'Edit Training Record' : 'Add Training Record'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COR Completeness Indicator */}
        <div className={`mx-4 mt-4 p-3 rounded-lg ${corStatus.isComplete ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            {corStatus.isComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">COR Compliant Record</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800 font-medium">
                  Missing COR fields: {corStatus.missingFields.join(', ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Course Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                <option value="">Select a course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent bg-gray-50"
                readOnly={!!formData.courseId}
              />
            </div>
          </div>

          {/* Crew Member */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crew Member ID *
              </label>
              <input
                type="text"
                name="crewMemberId"
                value={formData.crewMemberId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="Enter crew member ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crew Member Name *
              </label>
              <input
                type="text"
                name="crewMemberName"
                value={formData.crewMemberName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="Full name"
              />
            </div>
          </div>

          {/* When - Completion Date & Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date * <span className="text-xs text-gray-500">(When)</span>
              </label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
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
                Validity (months)
              </label>
              <input
                type="number"
                name="validityPeriod"
                value={formData.validityPeriod}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Where - Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location * <span className="text-xs text-gray-500">(Where)</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="e.g., Main Office, Online, External Facility"
            />
          </div>

          {/* By Whom - Provider & Instructor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Provider * <span className="text-xs text-gray-500">(By Whom)</span>
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="e.g., Internal, ABC Training Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor Name * <span className="text-xs text-gray-500">(By Whom)</span>
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                placeholder="Name of instructor"
              />
            </div>
          </div>

          {/* Certificate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Number
            </label>
            <input
              type="text"
              name="certificateNumber"
              value={formData.certificateNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Certificate or credential number (if applicable)"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          {/* Competency Verification (for editing) */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Competency Verification</h3>
                <button
                  type="button"
                  onClick={() => setShowCompetencySection(!showCompetencySection)}
                  className="text-sm text-aeria-blue hover:text-aeria-navy"
                >
                  {showCompetencySection ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCompetencySection && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Competency Status
                    </label>
                    <select
                      name="competencyStatus"
                      value={competencyData.competencyStatus}
                      onChange={handleCompetencyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                    >
                      {Object.entries(COMPETENCY_STATUS).map(([key, status]) => (
                        <option key={key} value={key}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verified By
                    </label>
                    <input
                      type="text"
                      name="verifiedBy"
                      value={competencyData.verifiedBy}
                      onChange={handleCompetencyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Name of verifier"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Notes
                    </label>
                    <textarea
                      name="competencyNotes"
                      value={competencyData.competencyNotes}
                      onChange={handleCompetencyChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                      placeholder="Notes about competency assessment..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
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
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
