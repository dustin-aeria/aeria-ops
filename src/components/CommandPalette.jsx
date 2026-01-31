/**
 * Command Palette Component
 * Quick search and navigation with Cmd+K
 *
 * @location src/components/CommandPalette.jsx
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Command,
  FolderKanban,
  ClipboardList,
  Users,
  Plane,
  Package,
  Building2,
  Settings,
  BookOpen,
  Shield,
  AlertTriangle,
  Target,
  GraduationCap,
  ListChecks,
  Calendar,
  Plus,
  ArrowRight,
  FileText,
  Home,
  ChevronRight
} from 'lucide-react'
import { getProjects, getClients, getEquipment, getOperators } from '../lib/firestore'
import { useOrganizationContext } from '../contexts/OrganizationContext'

// Navigation items
const NAVIGATION_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/', keywords: ['home', 'dashboard', 'main'] },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects', keywords: ['project', 'mission', 'job'] },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar', keywords: ['calendar', 'schedule', 'events'] },
  { id: 'forms', label: 'Forms', icon: ClipboardList, path: '/forms', keywords: ['form', 'document', 'checklist'] },
  { id: 'policies', label: 'Policies & Procedures', icon: BookOpen, path: '/policies', keywords: ['policy', 'procedure', 'manual'] },
  { id: 'safety', label: 'Safety Dashboard', icon: Shield, path: '/safety', keywords: ['safety', 'hse', 'health'] },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, path: '/incidents', keywords: ['incident', 'accident', 'report'] },
  { id: 'capas', label: 'CAPAs', icon: Target, path: '/capas', keywords: ['capa', 'corrective', 'action'] },
  { id: 'training', label: 'Training', icon: GraduationCap, path: '/training', keywords: ['training', 'course', 'certification'] },
  { id: 'inspections', label: 'Inspections', icon: ListChecks, path: '/inspections', keywords: ['inspection', 'audit', 'check'] },
  { id: 'operators', label: 'Operators', icon: Users, path: '/operators', keywords: ['operator', 'crew', 'pilot', 'staff'] },
  { id: 'aircraft', label: 'Fleet', icon: Plane, path: '/aircraft', keywords: ['aircraft', 'drone', 'fleet', 'uav'] },
  { id: 'equipment', label: 'Equipment', icon: Package, path: '/equipment', keywords: ['equipment', 'gear', 'tool'] },
  { id: 'clients', label: 'Clients', icon: Building2, path: '/clients', keywords: ['client', 'customer', 'company'] },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', keywords: ['settings', 'config', 'preferences'] },
  { id: 'compliance', label: 'Compliance Hub', icon: FileText, path: '/compliance', keywords: ['compliance', 'regulatory', 'permit'] }
]

// Quick actions
const QUICK_ACTIONS = [
  { id: 'new-project', label: 'Create New Project', icon: Plus, action: 'navigate', path: '/projects?new=true', keywords: ['new', 'create', 'project'] },
  { id: 'new-incident', label: 'Report Incident', icon: AlertTriangle, action: 'navigate', path: '/incidents/new', keywords: ['new', 'incident', 'report'] },
  { id: 'new-capa', label: 'Create CAPA', icon: Target, action: 'navigate', path: '/capas/new', keywords: ['new', 'capa', 'corrective'] }
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { organizationId } = useOrganizationContext()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('commandPaletteRecent')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        // Ignore invalid JSON
      }
    }
  }, [])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    let items = []

    // Search navigation items
    const navMatches = NAVIGATION_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    ).map(item => ({
      ...item,
      type: 'navigation',
      category: 'Pages'
    }))
    items.push(...navMatches)

    // Search quick actions
    const actionMatches = QUICK_ACTIONS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    ).map(item => ({
      ...item,
      type: 'action',
      category: 'Actions'
    }))
    items.push(...actionMatches)

    // Search projects (if query is 3+ chars and organizationId available)
    if (q.length >= 3 && organizationId) {
      setIsSearching(true)
      try {
        const projects = await getProjects(organizationId)
        const projectMatches = projects
          .filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.clientName?.toLowerCase().includes(q) ||
            p.location?.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map(p => ({
            id: `project-${p.id}`,
            label: p.name,
            sublabel: p.clientName || p.location,
            icon: FolderKanban,
            path: `/projects/${p.id}`,
            type: 'project',
            category: 'Projects'
          }))
        items.push(...projectMatches)

        // Search clients
        const clients = await getClients(organizationId)
        const clientMatches = clients
          .filter(c => c.name?.toLowerCase().includes(q))
          .slice(0, 3)
          .map(c => ({
            id: `client-${c.id}`,
            label: c.name,
            sublabel: c.email || c.contactName,
            icon: Building2,
            path: `/clients`,
            type: 'client',
            category: 'Clients'
          }))
        items.push(...clientMatches)

        // Search operators
        const operators = await getOperators(organizationId)
        const operatorMatches = operators
          .filter(o =>
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
            o.email?.toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map(o => ({
            id: `operator-${o.id}`,
            label: `${o.firstName} ${o.lastName}`,
            sublabel: o.role || o.email,
            icon: Users,
            path: `/operators`,
            type: 'operator',
            category: 'Team'
          }))
        items.push(...operatorMatches)

      } catch {
        // Search failed, continue with local results
      } finally {
        setIsSearching(false)
      }
    }

    setResults(items)
    setSelectedIndex(0)
  }, [organizationId])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 150)
    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  // Handle selection
  const handleSelect = (item) => {
    // Save to recent
    const recent = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5)
    setRecentSearches(recent)
    localStorage.setItem('commandPaletteRecent', JSON.stringify(recent))

    // Navigate
    if (item.path) {
      navigate(item.path)
    }

    setIsOpen(false)
  }

  // Group results by category
  const groupedResults = results.reduce((acc, item) => {
    const cat = item.category || 'Results'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10vh] mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center px-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for pages, projects, actions..."
              className="w-full px-3 py-4 text-lg outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
              <Command className="w-3 h-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isSearching && (
              <div className="px-4 py-2 text-sm text-gray-500">
                Searching...
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  Recent
                </div>
                {recentSearches.map((item, index) => (
                  <ResultItem
                    key={item.id}
                    item={item}
                    isSelected={selectedIndex === index}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </div>
            )}

            {query && results.length === 0 && !isSearching && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="py-2">
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                  {category}
                </div>
                {items.map((item, index) => {
                  const globalIndex = results.indexOf(item)
                  return (
                    <ResultItem
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === globalIndex}
                      onClick={() => handleSelect(item)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultItem({ item, isSelected, onClick }) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
        isSelected ? 'bg-aeria-sky/50' : 'hover:bg-gray-50'
      }`}
    >
      <div className={`p-2 rounded-lg ${
        item.type === 'action' ? 'bg-green-100' :
        item.type === 'project' ? 'bg-blue-100' :
        'bg-gray-100'
      }`}>
        <Icon className={`w-4 h-4 ${
          item.type === 'action' ? 'text-green-700' :
          item.type === 'project' ? 'text-blue-700' :
          'text-gray-700'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.label}</p>
        {item.sublabel && (
          <p className="text-sm text-gray-500 truncate">{item.sublabel}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  )
}
