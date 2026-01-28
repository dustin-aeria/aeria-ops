/**
 * MaintenanceFilters.jsx
 * Filter controls for maintenance item list
 *
 * @location src/components/maintenance/MaintenanceFilters.jsx
 */

import { Search, Filter, X } from 'lucide-react'

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_soon', label: 'Due Soon' },
  { value: 'ok', label: 'Good Standing' },
  { value: 'grounded', label: 'Grounded' },
  { value: 'no_schedule', label: 'No Schedule' }
]

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'aircraft', label: 'Aircraft' },
  { value: 'equipment', label: 'Equipment' }
]

export default function MaintenanceFilters({
  filters,
  onFilterChange,
  onClearFilters,
  equipmentCategories = []
}) {
  const hasActiveFilters = filters.search || filters.status || filters.itemType || filters.category

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, serial number..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent bg-white"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="min-w-[140px]">
          <select
            value={filters.itemType || ''}
            onChange={(e) => onFilterChange({ ...filters, itemType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent bg-white"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category Filter (only shown when type is equipment or all) */}
        {filters.itemType !== 'aircraft' && equipmentCategories.length > 0 && (
          <div className="min-w-[160px]">
            <select
              value={filters.category || ''}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              {equipmentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">Quick filters:</span>
        <button
          onClick={() => onFilterChange({ ...filters, status: 'overdue' })}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            filters.status === 'overdue'
              ? 'bg-red-100 text-red-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>
        <button
          onClick={() => onFilterChange({ ...filters, status: 'due_soon' })}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            filters.status === 'due_soon'
              ? 'bg-amber-100 text-amber-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Due Soon
        </button>
        <button
          onClick={() => onFilterChange({ ...filters, status: 'grounded' })}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            filters.status === 'grounded'
              ? 'bg-red-100 text-red-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Grounded
        </button>
        <button
          onClick={() => onFilterChange({ ...filters, itemType: 'aircraft' })}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            filters.itemType === 'aircraft'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Aircraft Only
        </button>
        <button
          onClick={() => onFilterChange({ ...filters, itemType: 'equipment' })}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            filters.itemType === 'equipment'
              ? 'bg-purple-100 text-purple-700 font-medium'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Equipment Only
        </button>
      </div>
    </div>
  )
}
