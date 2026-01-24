/**
 * Loading States Components
 * Skeleton loaders and loading indicators
 *
 * @location src/components/ui/LoadingStates.jsx
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

// ============================================
// SPINNER COMPONENTS
// ============================================

/**
 * Simple spinner
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <Loader2
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
    />
  )
}

/**
 * Full page loading spinner
 */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}

/**
 * Inline loading state
 */
export function InlineLoader({ message = 'Loading...', size = 'sm' }) {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <Spinner size={size} />
      <span className="text-sm">{message}</span>
    </div>
  )
}

/**
 * Button loading state
 */
export function ButtonLoader({ size = 'sm' }) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  )
}

// ============================================
// SKELETON COMPONENTS
// ============================================

/**
 * Base skeleton element
 */
export function Skeleton({ className = '', animate = true }) {
  return (
    <div
      className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  )
}

/**
 * Text line skeleton
 */
export function SkeletonText({ lines = 1, lastLineWidth = 'full', className = '' }) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '2/3': 'w-2/3',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 ? widthClasses[lastLineWidth] : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({ size = 'md' }) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <Skeleton className={`rounded-full ${sizeClasses[size]}`} />
  )
}

/**
 * Button skeleton
 */
export function SkeletonButton({ size = 'md', width = 'auto' }) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  }

  const widthClasses = {
    auto: 'w-24',
    full: 'w-full',
    half: 'w-1/2'
  }

  return (
    <Skeleton className={`${sizeClasses[size]} ${widthClasses[width]} rounded-md`} />
  )
}

// ============================================
// SKELETON LAYOUTS
// ============================================

/**
 * Card skeleton
 */
export function SkeletonCard({ hasImage = false, lines = 3 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {hasImage && <Skeleton className="h-40 w-full rounded-md" />}
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={lines} lastLineWidth="2/3" />
      </div>
      <div className="flex gap-2 pt-2">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  )
}

/**
 * List item skeleton
 */
export function SkeletonListItem({ hasAvatar = true, lines = 2 }) {
  return (
    <div className="flex items-start gap-3 p-3 border-b border-gray-100">
      {hasAvatar && <SkeletonAvatar size="md" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        {lines > 1 && <Skeleton className="h-3 w-3/4" />}
        {lines > 2 && <Skeleton className="h-3 w-1/3" />}
      </div>
    </div>
  )
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton
            className={`h-4 ${
              i === 0 ? 'w-1/2' : i === columns - 1 ? 'w-16' : 'w-3/4'
            }`}
          />
        </td>
      ))}
    </tr>
  )
}

/**
 * Table skeleton
 */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex px-6 py-3 gap-8">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </div>
    </div>
  )
}

/**
 * Form skeleton
 */
export function SkeletonForm({ fields = 4, hasButton = true }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      {hasButton && (
        <div className="pt-4">
          <SkeletonButton size="md" width="auto" />
        </div>
      )}
    </div>
  )
}

/**
 * Stats card skeleton
 */
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

/**
 * Dashboard skeleton
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <SkeletonStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
      <SkeletonTable rows={5} columns={5} />
    </div>
  )
}

/**
 * Page header skeleton
 */
export function SkeletonPageHeader({ hasActions = true }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {hasActions && (
        <div className="flex gap-2">
          <SkeletonButton size="md" />
          <SkeletonButton size="md" />
        </div>
      )}
    </div>
  )
}

// ============================================
// SHIMMER EFFECT
// ============================================

/**
 * Shimmer skeleton (gradient animation)
 */
export function ShimmerSkeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
        }}
      />
    </div>
  )
}

// ============================================
// CONTENT LOADER
// ============================================

/**
 * Content placeholder with loading state
 */
export function ContentLoader({
  isLoading,
  skeleton,
  children,
  delay = 0
}) {
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    if (isLoading && delay > 0) {
      const timer = setTimeout(() => setShowSkeleton(true), delay)
      return () => clearTimeout(timer)
    }
    setShowSkeleton(isLoading)
  }, [isLoading, delay])

  if (showSkeleton) {
    return <>{skeleton}</>
  }

  return <>{children}</>
}

/**
 * Suspense-like loading boundary
 */
export function LoadingBoundary({
  isLoading,
  isEmpty,
  error,
  skeleton,
  emptyState,
  errorState,
  children
}) {
  if (error) {
    return errorState || (
      <div className="text-center py-12">
        <p className="text-red-600">Something went wrong</p>
      </div>
    )
  }

  if (isLoading) {
    return skeleton || <Spinner size="lg" className="mx-auto my-8" />
  }

  if (isEmpty) {
    return emptyState || (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return <>{children}</>
}

// ============================================
// PROGRESS INDICATORS
// ============================================

/**
 * Progress bar
 */
export function ProgressBar({ value, max = 100, showLabel = false, size = 'md' }) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`bg-blue-600 rounded-full ${sizeClasses[size]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}

/**
 * Circular progress
 */
export function CircularProgress({ value, max = 100, size = 'md' }) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeConfig = {
    sm: { size: 32, stroke: 3 },
    md: { size: 48, stroke: 4 },
    lg: { size: 64, stroke: 5 }
  }

  const { size: svgSize, stroke } = sizeConfig[size]
  const radius = (svgSize - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize}>
        <circle
          className="text-gray-200"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={svgSize / 2}
          cy={svgSize / 2}
        />
        <circle
          className="text-blue-600 transition-all duration-300"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={svgSize / 2}
          cy={svgSize / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <span className="absolute text-xs font-medium">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}

export default {
  Spinner,
  PageLoader,
  InlineLoader,
  ButtonLoader,
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonForm,
  SkeletonStats,
  SkeletonDashboard,
  SkeletonPageHeader,
  ShimmerSkeleton,
  ContentLoader,
  LoadingBoundary,
  ProgressBar,
  CircularProgress
}
