/**
 * OrganizationSettings.jsx
 * Organization settings page for managing org details, branding, and subscription
 *
 * @location src/pages/settings/OrganizationSettings.jsx
 */

import { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import { updateOrganization } from '../../lib/firestoreOrganizations'
import {
  Building2,
  Palette,
  Globe,
  Clock,
  Ruler,
  Save,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'

const TIMEZONES = [
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/Edmonton', label: 'Mountain Time (Edmonton)' },
  { value: 'America/Winnipeg', label: 'Central Time (Winnipeg)' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Halifax', label: 'Atlantic Time (Halifax)' },
  { value: 'America/St_Johns', label: 'Newfoundland Time (St. John\'s)' },
  { value: 'UTC', label: 'UTC' }
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (International)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
]

const MEASUREMENT_SYSTEMS = [
  { value: 'metric', label: 'Metric (meters, km)' },
  { value: 'imperial', label: 'Imperial (feet, miles)' }
]

export default function OrganizationSettings() {
  const { organization, refreshOrganization, canManageSettings } = useOrganization()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    branding: {
      logoUrl: '',
      primaryColor: '#3B82F6'
    },
    settings: {
      timezone: 'America/Toronto',
      dateFormat: 'MM/DD/YYYY',
      measurementSystem: 'imperial'
    }
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        slug: organization.slug || '',
        branding: {
          logoUrl: organization.branding?.logoUrl || '',
          primaryColor: organization.branding?.primaryColor || '#3B82F6'
        },
        settings: {
          timezone: organization.settings?.timezone || 'America/Toronto',
          dateFormat: organization.settings?.dateFormat || 'MM/DD/YYYY',
          measurementSystem: organization.settings?.measurementSystem || 'imperial'
        }
      })
    }
  }, [organization])

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setSaved(false)
  }

  const handleSave = async () => {
    if (!organization?.id || !canManageSettings) return

    setSaving(true)
    setError(null)

    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        branding: formData.branding,
        settings: formData.settings
      })

      await refreshOrganization()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving organization settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organization found</p>
        </div>
      </div>
    )
  }

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to manage organization settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Building2 className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
            <p className="text-sm text-gray-500">Basic information about your organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange(null, 'name', e.target.value)}
              className="input"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              disabled
              className="input bg-gray-50 text-gray-500"
              placeholder="organization-slug"
            />
            <p className="text-xs text-gray-500 mt-1">URL slug cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Palette className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
            <p className="text-sm text-gray-500">Customize your organization's appearance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.branding.logoUrl}
              onChange={(e) => handleChange('branding', 'logoUrl', e.target.value)}
              className="input"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.branding.primaryColor}
                onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                className="w-12 h-10 p-1 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.branding.primaryColor}
                onChange={(e) => handleChange('branding', 'primaryColor', e.target.value)}
                className="input flex-1"
                placeholder="#3B82F6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Globe className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Regional Settings</h2>
            <p className="text-sm text-gray-500">Configure timezone, date format, and units</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={formData.settings.timezone}
              onChange={(e) => handleChange('settings', 'timezone', e.target.value)}
              className="input"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={formData.settings.dateFormat}
              onChange={(e) => handleChange('settings', 'dateFormat', e.target.value)}
              className="input"
            >
              {DATE_FORMATS.map(df => (
                <option key={df.value} value={df.value}>{df.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Ruler className="w-4 h-4 inline mr-1" />
              Measurement System
            </label>
            <select
              value={formData.settings.measurementSystem}
              onChange={(e) => handleChange('settings', 'measurementSystem', e.target.value)}
              className="input"
            >
              {MEASUREMENT_SYSTEMS.map(ms => (
                <option key={ms.value} value={ms.value}>{ms.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Info (Read-only) */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Building2 className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-500">Your current plan details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {organization.subscription?.plan || 'Starter'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {organization.subscription?.status || 'Active'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Max Users</p>
            <p className="text-lg font-semibold text-gray-900">
              {organization.subscription?.maxUsers || 5}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
