/**
 * RoleSelector.jsx
 * Dropdown component for selecting member roles
 *
 * @location src/components/settings/RoleSelector.jsx
 */

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Shield, Check } from 'lucide-react'
import { ROLE_HIERARCHY } from '../../lib/firestoreOrganizations'

const ROLE_LABELS = {
  admin: 'Admin',
  management: 'Management',
  operator: 'Operator',
  viewer: 'Viewer'
}

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  management: 'bg-blue-100 text-blue-800 border-blue-200',
  operator: 'bg-green-100 text-green-800 border-green-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function RoleSelector({
  currentRole,
  onChange,
  disabled = false,
  excludeRoles = []
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Filter out excluded roles
  const availableRoles = ROLE_HIERARCHY.filter(role => !excludeRoles.includes(role))

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (role) => {
    if (role !== currentRole) {
      onChange(role)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border
          transition-colors
          ${ROLE_COLORS[currentRole] || ROLE_COLORS.operator}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
        `}
      >
        <Shield className="w-3 h-3" />
        <span className="capitalize">{ROLE_LABELS[currentRole] || currentRole}</span>
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          {availableRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleSelect(role)}
              className={`
                w-full px-3 py-2 text-left text-sm flex items-center justify-between
                hover:bg-gray-50 transition-colors
                ${role === currentRole ? 'bg-gray-50' : ''}
              `}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="capitalize">{ROLE_LABELS[role] || role}</span>
              </span>
              {role === currentRole && (
                <Check className="w-4 h-4 text-aeria-navy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
