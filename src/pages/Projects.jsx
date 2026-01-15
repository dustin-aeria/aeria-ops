import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FolderKanban, Filter } from 'lucide-react'

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your operations plans</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
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
        <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first project to get started with operations planning.
        </p>
        <button className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>
    </div>
  )
}
