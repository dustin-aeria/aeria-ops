/**
 * Progress Component
 * Progress bars, indicators, and step trackers
 *
 * @location src/components/ui/Progress.jsx
 */

import React, { useEffect, useState } from 'react'
import { Check, Circle, Clock, AlertCircle } from 'lucide-react'

// ============================================
// BASE PROGRESS BAR
// ============================================

/**
 * Base progress bar component
 */
export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelPosition = 'right',
  animated = false,
  striped = false,
  indeterminate = false,
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  }

  const variantClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-cyan-500',
    gray: 'bg-gray-600'
  }

  const trackColor = 'bg-gray-200'
  const barColor = variantClasses[variant] || variantClasses.primary

  return (
    <div className={`${className}`}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`flex-1 ${sizeClasses[size]} ${trackColor} rounded-full overflow-hidden`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full ${barColor} rounded-full transition-all duration-300
              ${striped ? 'bg-stripes' : ''}
              ${animated && !indeterminate ? 'animate-pulse' : ''}
              ${indeterminate ? 'animate-indeterminate w-1/3' : ''}
            `}
            style={indeterminate ? undefined : { width: `${percentage}%` }}
          />
        </div>
        {showLabel && labelPosition === 'right' && (
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

/**
 * Circular progress indicator
 */
export function CircularProgress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  thickness = 'md',
  showValue = true,
  valueFormat = (v) => `${Math.round(v)}%`,
  children,
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeConfig = {
    xs: { size: 32, text: 'text-xs' },
    sm: { size: 48, text: 'text-sm' },
    md: { size: 64, text: 'text-base' },
    lg: { size: 96, text: 'text-lg' },
    xl: { size: 128, text: 'text-2xl' }
  }

  const thicknessConfig = {
    thin: 2,
    md: 4,
    thick: 6
  }

  const variantColors = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-500',
    danger: 'text-red-600',
    info: 'text-cyan-500'
  }

  const config = sizeConfig[size] || sizeConfig.md
  const strokeWidth = thicknessConfig[thickness] || thicknessConfig.md
  const radius = (config.size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={config.size}
        height={config.size}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress arc */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${variantColors[variant]}`}
        />
      </svg>
      {(showValue || children) && (
        <div className={`absolute inset-0 flex items-center justify-center ${config.text}`}>
          {children || (showValue && (
            <span className="font-semibold text-gray-900">
              {valueFormat(percentage)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// MULTI-SEGMENT PROGRESS
// ============================================

/**
 * Progress bar with multiple segments
 */
export function MultiProgress({
  segments = [],
  size = 'md',
  showLabels = false,
  className = ''
}) {
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  }

  const total = segments.reduce((sum, seg) => sum + seg.value, 0)

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex flex-wrap gap-4 mb-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded ${segment.color || 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">{segment.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {segment.value} ({total > 0 ? Math.round((segment.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      )}
      <div className={`flex ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        {segments.map((segment, index) => {
          const width = total > 0 ? (segment.value / total) * 100 : 0
          return (
            <div
              key={index}
              className={`${segment.color || 'bg-gray-400'} transition-all duration-300`}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// STEP PROGRESS
// ============================================

/**
 * Step-based progress indicator
 */
export function StepProgress({
  steps = [],
  currentStep = 0,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const isHorizontal = orientation === 'horizontal'

  const sizeConfig = {
    sm: { icon: 'h-6 w-6', text: 'text-xs', connector: isHorizontal ? 'h-0.5' : 'w-0.5' },
    md: { icon: 'h-8 w-8', text: 'text-sm', connector: isHorizontal ? 'h-0.5' : 'w-0.5' },
    lg: { icon: 'h-10 w-10', text: 'text-base', connector: isHorizontal ? 'h-1' : 'w-1' }
  }

  const config = sizeConfig[size] || sizeConfig.md

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed'
    if (index === currentStep) return 'current'
    return 'upcoming'
  }

  const getStatusClasses = (status) => {
    if (variant === 'simple') {
      switch (status) {
        case 'completed':
          return { circle: 'bg-blue-600 text-white', text: 'text-gray-900', connector: 'bg-blue-600' }
        case 'current':
          return { circle: 'border-2 border-blue-600 bg-white text-blue-600', text: 'text-blue-600', connector: 'bg-gray-200' }
        default:
          return { circle: 'border-2 border-gray-300 bg-white text-gray-400', text: 'text-gray-500', connector: 'bg-gray-200' }
      }
    }

    switch (status) {
      case 'completed':
        return { circle: 'bg-green-600 text-white', text: 'text-gray-900', connector: 'bg-green-600' }
      case 'current':
        return { circle: 'border-2 border-blue-600 bg-blue-100 text-blue-600', text: 'text-blue-600', connector: 'bg-gray-200' }
      default:
        return { circle: 'border-2 border-gray-300 bg-white text-gray-400', text: 'text-gray-500', connector: 'bg-gray-200' }
    }
  }

  return (
    <div
      className={`
        ${isHorizontal ? 'flex items-start' : 'flex flex-col'}
        ${className}
      `}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index)
        const classes = getStatusClasses(status)
        const isLast = index === steps.length - 1

        return (
          <div
            key={index}
            className={`
              ${isHorizontal ? 'flex-1 flex flex-col items-center' : 'flex items-start'}
              ${!isLast && !isHorizontal ? 'pb-8' : ''}
            `}
          >
            {/* Step indicator */}
            <div className={`flex items-center ${isHorizontal ? 'w-full' : ''}`}>
              {/* Connector before (vertical only) */}
              {!isHorizontal && index > 0 && (
                <div className={`absolute -top-4 left-4 h-4 ${config.connector} ${classes.connector}`} />
              )}

              <div
                className={`
                  ${config.icon} rounded-full flex items-center justify-center
                  ${classes.circle} flex-shrink-0 relative z-10
                `}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className={config.text}>{index + 1}</span>
                )}
              </div>

              {/* Connector after (horizontal only) */}
              {isHorizontal && !isLast && (
                <div className={`flex-1 ${config.connector} mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Step content */}
            <div className={`${isHorizontal ? 'text-center mt-2' : 'ml-4'}`}>
              <p className={`font-medium ${classes.text} ${config.text}`}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {step.description}
                </p>
              )}
            </div>

            {/* Vertical connector */}
            {!isHorizontal && !isLast && (
              <div className={`absolute left-4 top-8 ${config.connector} h-full ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// PROGRESS WITH STEPS
// ============================================

/**
 * Progress bar with step markers
 */
export function ProgressWithSteps({
  value = 0,
  steps = [],
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const percentage = Math.min(Math.max(value, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600'
  }

  return (
    <div className={className}>
      <div className={`relative ${sizeClasses[size]} bg-gray-200 rounded-full`}>
        <div
          className={`h-full ${variantClasses[variant]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {/* Step markers */}
        {steps.map((step, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${step.value}%` }}
          >
            <div
              className={`
                h-4 w-4 rounded-full border-2 -ml-2
                ${step.value <= percentage ? `${variantClasses[variant]} border-white` : 'bg-white border-gray-300'}
              `}
            />
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="absolute text-xs text-gray-600"
            style={{ left: `${step.value}%`, transform: 'translateX(-50%)' }}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// ANIMATED PROGRESS
// ============================================

/**
 * Progress bar with animation on mount
 */
export function AnimatedProgress({
  value = 0,
  duration = 1000,
  ...props
}) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startValue = animatedValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + (value - startValue) * eased
      setAnimatedValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <ProgressBar value={animatedValue} {...props} />
}

// ============================================
// PROGRESS WITH STATUS
// ============================================

/**
 * Progress bar with status icon
 */
export function ProgressWithStatus({
  value = 0,
  status = 'in-progress',
  title,
  description,
  className = ''
}) {
  const statusConfig = {
    'in-progress': {
      icon: Clock,
      color: 'text-blue-600',
      barColor: 'primary',
      label: 'In Progress'
    },
    completed: {
      icon: Check,
      color: 'text-green-600',
      barColor: 'success',
      label: 'Completed'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      barColor: 'danger',
      label: 'Error'
    },
    paused: {
      icon: Circle,
      color: 'text-yellow-600',
      barColor: 'warning',
      label: 'Paused'
    }
  }

  const config = statusConfig[status] || statusConfig['in-progress']
  const Icon = config.icon

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>
      <ProgressBar
        value={value}
        variant={config.barColor}
        showLabel
        labelPosition="right"
      />
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}

// ============================================
// UPLOAD PROGRESS
// ============================================

/**
 * File upload progress indicator
 */
export function UploadProgress({
  fileName,
  progress = 0,
  status = 'uploading',
  onCancel,
  onRetry,
  className = ''
}) {
  const statusConfig = {
    uploading: { color: 'primary', label: 'Uploading...' },
    processing: { color: 'info', label: 'Processing...' },
    completed: { color: 'success', label: 'Completed' },
    error: { color: 'danger', label: 'Failed' }
  }

  const config = statusConfig[status] || statusConfig.uploading

  return (
    <div className={`p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">{fileName}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'uploading' && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Retry
            </button>
          )}
          {(status === 'uploading' || status === 'processing') && (
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
      <ProgressBar
        value={progress}
        variant={config.color}
        size="sm"
        animated={status === 'uploading'}
        indeterminate={status === 'processing'}
      />
    </div>
  )
}

// ============================================
// GRADIENT PROGRESS
// ============================================

/**
 * Progress bar with gradient fill
 */
export function GradientProgress({
  value = 0,
  max = 100,
  gradient = 'from-blue-500 to-purple-600',
  size = 'md',
  showLabel = true,
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// COUNTDOWN PROGRESS
// ============================================

/**
 * Countdown timer with progress
 */
export function CountdownProgress({
  duration,
  onComplete,
  autoStart = true,
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const [remaining, setRemaining] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)

  useEffect(() => {
    if (!isRunning || remaining <= 0) return

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval)
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, remaining, onComplete])

  const percentage = (remaining / duration) * 100
  const seconds = Math.ceil(remaining / 1000)

  return (
    <div className={className}>
      <CircularProgress
        value={percentage}
        size={size}
        variant={variant}
        showValue={false}
      >
        <span className="font-mono font-bold">{seconds}s</span>
      </CircularProgress>
    </div>
  )
}

export default {
  ProgressBar,
  CircularProgress,
  MultiProgress,
  StepProgress,
  ProgressWithSteps,
  AnimatedProgress,
  ProgressWithStatus,
  UploadProgress,
  GradientProgress,
  CountdownProgress
}
