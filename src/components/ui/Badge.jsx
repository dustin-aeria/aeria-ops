/**
 * Badge Component
 * Status badges, tags, and labels
 *
 * @location src/components/ui/Badge.jsx
 */

import React from 'react'
import { X } from 'lucide-react'

// ============================================
// BADGE VARIANTS
// ============================================

const BADGE_VARIANTS = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-gray-100 text-gray-600 border-gray-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200'
}

const BADGE_SIZES = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1 text-sm'
}

// ============================================
// BASE BADGE COMPONENT
// ============================================

/**
 * Base badge component
 */
export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'full',
  border = false,
  dot = false,
  dotColor,
  icon: Icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  className = ''
}) {
  const variantClasses = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default
  const sizeClasses = BADGE_SIZES[size] || BADGE_SIZES.sm
  const roundedClasses = rounded === 'full' ? 'rounded-full' : 'rounded-md'
  const borderClasses = border ? 'border' : ''

  return (
    <span
      className={`inline-flex items-center font-medium ${variantClasses} ${sizeClasses} ${roundedClasses} ${borderClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor || 'bg-current'}`}
        />
      )}
      {Icon && iconPosition === 'left' && (
        <Icon className="w-3 h-3 mr-1" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-3 h-3 ml-1" />
      )}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black/10 focus:outline-none"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}

// ============================================
// STATUS BADGE
// ============================================

const STATUS_CONFIGS = {
  // Generic
  active: { variant: 'success', label: 'Active', dot: true },
  inactive: { variant: 'default', label: 'Inactive', dot: true },
  pending: { variant: 'warning', label: 'Pending', dot: true },
  completed: { variant: 'success', label: 'Completed', dot: true },
  cancelled: { variant: 'default', label: 'Cancelled', dot: true },
  archived: { variant: 'default', label: 'Archived', dot: true },

  // Project
  planning: { variant: 'purple', label: 'Planning', dot: true },
  in_progress: { variant: 'primary', label: 'In Progress', dot: true },
  on_hold: { variant: 'orange', label: 'On Hold', dot: true },

  // Incident severity
  low: { variant: 'success', label: 'Low' },
  medium: { variant: 'warning', label: 'Medium' },
  high: { variant: 'orange', label: 'High' },
  critical: { variant: 'danger', label: 'Critical' },

  // Equipment
  available: { variant: 'success', label: 'Available', dot: true },
  in_use: { variant: 'primary', label: 'In Use', dot: true },
  maintenance: { variant: 'orange', label: 'Maintenance', dot: true },
  out_of_service: { variant: 'danger', label: 'Out of Service', dot: true },

  // Compliance
  compliant: { variant: 'success', label: 'Compliant' },
  non_compliant: { variant: 'danger', label: 'Non-Compliant' },
  due_soon: { variant: 'warning', label: 'Due Soon' },
  overdue: { variant: 'danger', label: 'Overdue' },
  expired: { variant: 'danger', label: 'Expired' },

  // Approval
  draft: { variant: 'default', label: 'Draft' },
  submitted: { variant: 'primary', label: 'Submitted' },
  under_review: { variant: 'purple', label: 'Under Review' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' },

  // Priority
  urgent: { variant: 'danger', label: 'Urgent' },
  normal: { variant: 'default', label: 'Normal' }
}

/**
 * Status badge with predefined styles
 */
export function StatusBadge({
  status,
  size = 'sm',
  showDot = true,
  customLabel,
  className = ''
}) {
  const config = STATUS_CONFIGS[status] || {
    variant: 'default',
    label: status,
    dot: false
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={showDot && config.dot}
      className={className}
    >
      {customLabel || config.label}
    </Badge>
  )
}

// ============================================
// COUNT BADGE
// ============================================

/**
 * Numeric count badge
 */
export function CountBadge({
  count,
  max = 99,
  variant = 'primary',
  size = 'xs',
  showZero = false,
  className = ''
}) {
  if (!showZero && (!count || count === 0)) {
    return null
  }

  const displayCount = count > max ? `${max}+` : count

  return (
    <Badge
      variant={variant}
      size={size}
      className={`min-w-[1.25rem] justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  )
}

/**
 * Notification dot (no number)
 */
export function NotificationDot({
  show = true,
  variant = 'danger',
  size = 'sm',
  pulse = false,
  className = ''
}) {
  if (!show) return null

  const sizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3'
  }

  const colorClasses = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  return (
    <span
      className={`inline-block rounded-full ${sizeClasses[size]} ${colorClasses[variant]} ${pulse ? 'animate-pulse' : ''} ${className}`}
    />
  )
}

// ============================================
// TAG COMPONENT
// ============================================

/**
 * Tag component (removable badge)
 */
export function Tag({
  children,
  variant = 'default',
  size = 'sm',
  onRemove,
  onClick,
  className = ''
}) {
  return (
    <Badge
      variant={variant}
      size={size}
      removable={!!onRemove}
      onRemove={onRemove}
      className={`${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      <span onClick={onClick}>{children}</span>
    </Badge>
  )
}

/**
 * Tag list component
 */
export function TagList({
  tags,
  variant = 'default',
  size = 'sm',
  removable = false,
  onRemove,
  maxVisible = null,
  className = ''
}) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags
  const hiddenCount = maxVisible ? tags.length - maxVisible : 0

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleTags.map((tag, index) => (
        <Tag
          key={typeof tag === 'string' ? tag : tag.id || index}
          variant={typeof tag === 'object' ? tag.variant : variant}
          size={size}
          onRemove={removable ? () => onRemove?.(tag) : undefined}
        >
          {typeof tag === 'string' ? tag : tag.label}
        </Tag>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="default" size={size}>
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  )
}

// ============================================
// LABEL BADGE
// ============================================

/**
 * Label with icon
 */
export function LabelBadge({
  label,
  value,
  icon: Icon,
  variant = 'default',
  size = 'sm',
  className = ''
}) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Badge variant={variant} size={size} rounded="md">
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {label}
        {value && (
          <>
            <span className="mx-1 opacity-50">:</span>
            <span className="font-semibold">{value}</span>
          </>
        )}
      </Badge>
    </div>
  )
}

// ============================================
// PRIORITY BADGE
// ============================================

/**
 * Priority indicator badge
 */
export function PriorityBadge({ priority, size = 'sm', showLabel = true }) {
  const configs = {
    urgent: { variant: 'danger', label: 'Urgent', icon: '!!' },
    high: { variant: 'orange', label: 'High', icon: '!' },
    medium: { variant: 'warning', label: 'Medium', icon: null },
    low: { variant: 'success', label: 'Low', icon: null },
    normal: { variant: 'default', label: 'Normal', icon: null }
  }

  const config = configs[priority] || configs.normal

  return (
    <Badge variant={config.variant} size={size}>
      {config.icon && <span className="mr-1 font-bold">{config.icon}</span>}
      {showLabel && config.label}
    </Badge>
  )
}

// ============================================
// CATEGORY BADGE
// ============================================

const CATEGORY_COLORS = {
  project: 'primary',
  incident: 'danger',
  capa: 'orange',
  equipment: 'purple',
  aircraft: 'indigo',
  client: 'success',
  operator: 'teal',
  document: 'info',
  training: 'pink'
}

/**
 * Category badge with consistent colors
 */
export function CategoryBadge({
  category,
  size = 'sm',
  showIcon = false,
  className = ''
}) {
  const variant = CATEGORY_COLORS[category] || 'default'
  const label = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}

// ============================================
// AVATAR BADGE
// ============================================

/**
 * Badge positioned on an avatar
 */
export function AvatarBadge({
  children,
  badge,
  position = 'bottom-right',
  className = ''
}) {
  const positionClasses = {
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2'
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      {children}
      <span className={`absolute ${positionClasses[position]}`}>
        {badge}
      </span>
    </div>
  )
}

// ============================================
// ONLINE STATUS
// ============================================

/**
 * Online/offline status indicator
 */
export function OnlineStatus({
  isOnline,
  showLabel = false,
  size = 'sm'
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <NotificationDot
        show
        variant={isOnline ? 'success' : 'default'}
        size={size}
      />
      {showLabel && (
        <span className={`text-${size} text-gray-600`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}

export default {
  Badge,
  StatusBadge,
  CountBadge,
  NotificationDot,
  Tag,
  TagList,
  LabelBadge,
  PriorityBadge,
  CategoryBadge,
  AvatarBadge,
  OnlineStatus,
  BADGE_VARIANTS,
  STATUS_CONFIGS
}
