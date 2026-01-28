/**
 * PermitCard.jsx
 * Card display component for permits in grid or list views
 *
 * @location src/components/permits/PermitCard.jsx
 */

import React, { useState } from 'react'
import {
  FileCheck,
  Award,
  MapPin,
  Navigation,
  UserCheck,
  FileText,
  Calendar,
  Building2,
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  ChevronRight,
  Clock
} from 'lucide-react'
import PermitStatusBadge from './PermitStatusBadge'
import { PERMIT_TYPES, getDaysUntilExpiry } from '../../lib/firestorePermits'

const TYPE_ICONS = {
  sfoc: FileCheck,
  cor: Award,
  land_access: MapPin,
  airspace_auth: Navigation,
  client_approval: UserCheck,
  other: FileText
}

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  const date = dateValue?.toDate?.() || new Date(dateValue)
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatDaysRemaining(days) {
  if (days === null) return 'No expiry'
  if (days < 0) return `Expired ${Math.abs(days)} days ago`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days remaining`
}

export default function PermitCard({ permit, viewMode = 'grid', onView, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)

  const permitType = PERMIT_TYPES[permit.type] || PERMIT_TYPES.other
  const TypeIcon = TYPE_ICONS[permit.type] || FileText
  const daysRemaining = getDaysUntilExpiry(permit)

  const handleClick = () => {
    if (onView) onView(permit)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowMenu(false)
    if (onEdit) onEdit(permit)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    setShowMenu(false)
    if (window.confirm(`Delete "${permit.name}"? This cannot be undone.`)) {
      if (onDelete) onDelete(permit.id)
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      >
        {/* Icon */}
        <div className="p-2 rounded-lg bg-cyan-100">
          <TypeIcon className="w-5 h-5 text-cyan-700" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{permit.name}</h3>
            <PermitStatusBadge status={permit.status} size="sm" />
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              {permitType.shortLabel}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {permit.issuingAuthority || 'Unknown'}
            </span>
            {permit.permitNumber && (
              <span className="flex items-center gap-1">
                #{permit.permitNumber}
              </span>
            )}
          </div>
        </div>

        {/* Expiry Info */}
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {formatDate(permit.expiryDate)}
          </div>
          <div className={`text-xs ${
            daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' :
            daysRemaining !== null && daysRemaining <= 30 ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {formatDaysRemaining(daysRemaining)}
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  if (onView) onView(permit)
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <hr className="my-1" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-cyan-100">
          <TypeIcon className="w-5 h-5 text-cyan-700" />
        </div>
        <PermitStatusBadge status={permit.status} size="sm" />
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{permit.name}</h3>
      <p className="text-sm text-gray-500 mb-1">{permit.issuingAuthority}</p>
      {permit.permitNumber && (
        <p className="text-xs text-gray-400">#{permit.permitNumber}</p>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {permitType.shortLabel}
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(permit.expiryDate)}
          </span>
        </div>
        <div className={`text-xs mt-2 ${
          daysRemaining !== null && daysRemaining < 0 ? 'text-red-600' :
          daysRemaining !== null && daysRemaining <= 30 ? 'text-yellow-600' :
          'text-gray-500'
        }`}>
          <Clock className="w-3 h-3 inline mr-1" />
          {formatDaysRemaining(daysRemaining)}
        </div>
      </div>
    </div>
  )
}
