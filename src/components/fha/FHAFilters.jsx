/**
 * FHAFilters.jsx
 * Filter components for FHA Library
 *
 * @location src/components/fha/FHAFilters.jsx
 */

import { useState } from 'react'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Plane,
  Wrench,
  ThermometerSun,
  MapPin,
  AlertTriangle,
  Users,
  Target,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react'
import { FHA_CATEGORIES, FHA_STATUSES, FHA_SOURCES } from '../../lib/firestoreFHA'

// Icon mapping for categories
const categoryIcons = {
  flight_ops: Plane,
  equipment: Wrench,
  environmental: ThermometerSun,
  site_hazards: MapPin,
  emergency: AlertTriangle,
  personnel: Users,
  specialized: Target
}

// Color mapping for categories
const categoryColors = {
  flight_ops: 'blue',
  equipment: 'purple',
  environmental: 'orange',
  site_hazards: 'red',
  emergency: 'amber',
  personnel: 'green',
  specialized: 'indigo'
}

/**
 * Category filter chips
 */
export function CategoryFilters({ selected, onChange, counts = {} }) {
  const handleToggle = (categoryId) => {
    if (selected === categoryId) {
      onChange(null) // Deselect
    } else {
      onChange(categoryId)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FHA_CATEGORIES.map(category => {
        const Icon = categoryIcons[category.id] || Target
        const isSelected = selected === category.id
        const count = counts[category.id] || 0
        const color = categoryColors[category.id] || 'gray'

        return (
          <button
            key={category.id}
            onClick={() => handleToggle(category.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? `bg-${color}-100 text-${color}-800 ring-2 ring-${color}-500`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.name}
            {count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                isSelected ? `bg-${color}-200` : 'bg-gray-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Status filter buttons
 */
export function StatusFilters({ selected, onChange, counts = {} }) {
  const statusConfig = {
    active: { icon: CheckCircle, color: 'green', label: 'Active' },
    under_review: { icon: Clock, color: 'yellow', label: 'Under Review' },
    archived: { icon: Archive, color: 'gray', label: 'Archived' }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          !selected
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {FHA_STATUSES.map(status => {
        const config = statusConfig[status.id]
        const Icon = config.icon
        const isSelected = selected === status.id
        const count = counts[status.id] || 0

        return (
          <button
            key={status.id}
            onClick={() => onChange(isSelected ? null : status.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSelected
                ? `bg-${config.color}-100 text-${config.color}-800`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {config.label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                isSelected ? `bg-${config.color}-200` : 'bg-gray-200'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Risk level filter
 */
export function RiskLevelFilter({ selected, onChange, counts = {} }) {
  const riskLevels = [
    { id: 'critical', label: 'Critical', color: 'red', range: '17-25' },
    { id: 'high', label: 'High', color: 'orange', range: '10-16' },
    { id: 'medium', label: 'Medium', color: 'yellow', range: '5-9' },
    { id: 'low', label: 'Low', color: 'green', range: '1-4' }
  ]

  return (
    <div className="flex gap-2">
      {riskLevels.map(level => {
        const isSelected = selected === level.id
        const count = counts[level.id] || 0

        return (
          <button
            key={level.id}
            onClick={() => onChange(isSelected ? null : level.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isSelected
                ? `bg-${level.color}-100 text-${level.color}-800 ring-2 ring-${level.color}-400`
                : `bg-${level.color}-50 text-${level.color}-700 hover:bg-${level.color}-100`
            }`}
            title={`Risk score ${level.range}`}
          >
            <span className={`w-2 h-2 rounded-full bg-${level.color}-500`}></span>
            {level.label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-xs bg-${level.color}-200`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Source filter dropdown
 */
export function SourceFilter({ selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const sourceConfig = {
    default: { label: 'Default Templates', color: 'blue' },
    uploaded: { label: 'Uploaded', color: 'purple' },
    created: { label: 'Created', color: 'green' },
    field_triggered: { label: 'Field Triggered', color: 'orange' }
  }

  const selectedSource = selected ? sourceConfig[selected] : null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          selected
            ? `bg-${selectedSource.color}-100 text-${selectedSource.color}-800`
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Source: {selectedSource?.label || 'All'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onChange(null)
              setIsOpen(false)
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!selected ? 'bg-gray-100 font-medium' : ''}`}
          >
            All Sources
          </button>
          {FHA_SOURCES.map(source => (
            <button
              key={source.id}
              onClick={() => {
                onChange(source.id)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                selected === source.id ? 'bg-gray-100 font-medium' : ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-${sourceConfig[source.id].color}-500`}></span>
              {sourceConfig[source.id].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Search input
 */
export function SearchInput({ value, onChange, placeholder = 'Search FHAs...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

/**
 * Combined filter bar
 */
export default function FHAFilters({
  filters,
  onChange,
  counts = {},
  showSearch = true,
  showCategory = true,
  showStatus = true,
  showRiskLevel = true,
  showSource = true,
  compact = false
}) {
  const activeFilterCount = [
    filters.category,
    filters.status,
    filters.riskLevel,
    filters.source
  ].filter(Boolean).length

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const clearAll = () => {
    onChange({
      search: '',
      category: null,
      status: null,
      riskLevel: null,
      source: null
    })
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {showSearch && (
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={filters.search || ''}
              onChange={(v) => handleChange('search', v)}
            />
          </div>
        )}

        <button
          onClick={() => {}}
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {showSearch && (
        <SearchInput
          value={filters.search || ''}
          onChange={(v) => handleChange('search', v)}
        />
      )}

      {/* Filter rows */}
      <div className="space-y-3">
        {/* Category filters */}
        {showCategory && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
            <CategoryFilters
              selected={filters.category}
              onChange={(v) => handleChange('category', v)}
              counts={counts.byCategory || {}}
            />
          </div>
        )}

        {/* Status and risk level row */}
        <div className="flex flex-wrap gap-4">
          {showStatus && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
              <StatusFilters
                selected={filters.status}
                onChange={(v) => handleChange('status', v)}
                counts={counts.byStatus || {}}
              />
            </div>
          )}

          {showRiskLevel && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Risk Level</label>
              <RiskLevelFilter
                selected={filters.riskLevel}
                onChange={(v) => handleChange('riskLevel', v)}
                counts={counts.byRiskLevel || {}}
              />
            </div>
          )}

          {showSource && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Source</label>
              <SourceFilter
                selected={filters.source}
                onChange={(v) => handleChange('source', v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Active filters:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              {FHA_CATEGORIES.find(c => c.id === filters.category)?.name}
              <button onClick={() => handleChange('category', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded">
              {filters.status.replace('_', ' ')}
              <button onClick={() => handleChange('status', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.riskLevel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded capitalize">
              {filters.riskLevel}
              <button onClick={() => handleChange('riskLevel', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.source && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
              {filters.source.replace('_', ' ')}
              <button onClick={() => handleChange('source', null)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearAll}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
