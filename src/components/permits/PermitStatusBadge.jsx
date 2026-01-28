/**
 * PermitStatusBadge.jsx
 * Status indicator badge for permits
 *
 * @location src/components/permits/PermitStatusBadge.jsx
 */

import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, PauseCircle } from 'lucide-react'
import { PERMIT_STATUS } from '../../lib/firestorePermits'

const STATUS_ICONS = {
  active: CheckCircle2,
  expiring_soon: AlertTriangle,
  expired: XCircle,
  suspended: PauseCircle
}

export default function PermitStatusBadge({ status, size = 'md', showLabel = true }) {
  const config = PERMIT_STATUS[status] || PERMIT_STATUS.active
  const Icon = STATUS_ICONS[status] || CheckCircle2

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  )
}
