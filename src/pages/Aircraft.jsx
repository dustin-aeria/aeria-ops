import { Plus, Search, Plane, Filter } from 'lucide-react'
import { useState } from 'react'

export default function Aircraft() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aircraft</h1>
          <p className="text-gray-600 mt-1">RPAS fleet management</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Aircraft
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search aircraft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button className="btn-secondary inline-flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Empty state */}
      <div className="card text-center py-12">
        <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No aircraft yet</h3>
        <p className="text-gray-500 mb-4">
          Add aircraft to your fleet to assign them to operations.
        </p>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Aircraft
        </button>
      </div>
    </div>
  )
}
