/**
 * Alert Component
 * Inline alerts and notifications for user feedback
 *
 * @location src/components/ui/Alert.jsx
 */

import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

// ============================================
// ALERT VARIANTS
// ============================================

const ALERT_VARIANTS = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
    title: 'text-blue-800',
    description: 'text-blue-700',
    link: 'text-blue-700 hover:text-blue-800',
    close: 'text-blue-500 hover:text-blue-600 hover:bg-blue-100'
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    title: 'text-green-800',
    description: 'text-green-700',
    link: 'text-green-700 hover:text-green-800',
    close: 'text-green-500 hover:text-green-600 hover:bg-green-100'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    title: 'text-yellow-800',
    description: 'text-yellow-700',
    link: 'text-yellow-700 hover:text-yellow-800',
    close: 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    title: 'text-red-800',
    description: 'text-red-700',
    link: 'text-red-700 hover:text-red-800',
    close: 'text-red-500 hover:text-red-600 hover:bg-red-100'
  },
  neutral: {
    container: 'bg-gray-50 border-gray-200 text-gray-800',
    icon: Info,
    iconColor: 'text-gray-500',
    title: 'text-gray-800',
    description: 'text-gray-600',
    link: 'text-gray-700 hover:text-gray-800',
    close: 'text-gray-500 hover:text-gray-600 hover:bg-gray-100'
  }
}

// ============================================
// BASE ALERT
// ============================================

/**
 * Base alert component
 */
export function Alert({
  variant = 'info',
  title,
  children,
  icon: CustomIcon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  actions,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true)
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = CustomIcon || config.icon

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      className={`
        relative border rounded-lg p-4
        ${config.container}
        ${className}
      `}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
        )}
        <div className={`flex-1 ${showIcon ? 'ml-3' : ''}`}>
          {title && (
            <h3 className={`text-sm font-medium ${config.title}`}>
              {title}
            </h3>
          )}
          {children && (
            <div className={`text-sm ${title ? 'mt-2' : ''} ${config.description}`}>
              {children}
            </div>
          )}
          {actions && (
            <div className="mt-4 flex gap-3">
              {actions}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className={`rounded-md p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.close}`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// INLINE ALERT
// ============================================

/**
 * Simple inline alert without border
 */
export function InlineAlert({
  variant = 'info',
  children,
  icon: CustomIcon,
  className = ''
}) {
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = CustomIcon || config.icon

  return (
    <div className={`flex items-center gap-2 ${config.description} ${className}`}>
      <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconColor}`} />
      <span className="text-sm">{children}</span>
    </div>
  )
}

// ============================================
// BANNER ALERT
// ============================================

/**
 * Full-width banner alert
 */
export function BannerAlert({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  action,
  actionLabel,
  onAction,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true)
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = config.icon

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div className={`${config.container} border-y ${className}`}>
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center flex-1 min-w-0">
            <span className={`flex p-2 rounded-lg ${variant === 'info' ? 'bg-blue-100' : variant === 'success' ? 'bg-green-100' : variant === 'warning' ? 'bg-yellow-100' : variant === 'error' ? 'bg-red-100' : 'bg-gray-100'}`}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </span>
            <p className="ml-3 font-medium text-sm truncate">
              {children}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {action || (actionLabel && onAction && (
              <button
                onClick={onAction}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${config.link} border border-current`}
              >
                {actionLabel}
              </button>
            ))}
            {dismissible && (
              <button
                onClick={handleDismiss}
                className={`rounded-md p-1 ${config.close}`}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ALERT WITH LIST
// ============================================

/**
 * Alert with a list of items
 */
export function AlertWithList({
  variant = 'error',
  title,
  items = [],
  dismissible = false,
  onDismiss,
  className = ''
}) {
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.error
  const Icon = config.icon

  return (
    <Alert
      variant={variant}
      title={title}
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      <ul className="list-disc list-inside space-y-1 mt-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ul>
    </Alert>
  )
}

// ============================================
// ALERT WITH LINK
// ============================================

/**
 * Alert with an action link
 */
export function AlertWithLink({
  variant = 'info',
  title,
  children,
  linkText,
  linkHref,
  external = false,
  onLinkClick,
  className = ''
}) {
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info

  return (
    <Alert variant={variant} title={title} className={className}>
      {children}
      {linkText && (
        <div className="mt-3">
          {linkHref ? (
            <a
              href={linkHref}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-1 text-sm font-medium ${config.link}`}
            >
              {linkText}
              {external && <ExternalLink className="h-3 w-3" />}
            </a>
          ) : (
            <button
              onClick={onLinkClick}
              className={`text-sm font-medium ${config.link}`}
            >
              {linkText}
            </button>
          )}
        </div>
      )}
    </Alert>
  )
}

// ============================================
// EXPANDABLE ALERT
// ============================================

/**
 * Alert with expandable details
 */
export function ExpandableAlert({
  variant = 'info',
  title,
  summary,
  children,
  defaultExpanded = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = config.icon

  return (
    <div className={`border rounded-lg ${config.container} ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center text-left"
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${config.title}`}>{title}</h3>}
          {summary && <p className={`text-sm ${title ? 'mt-1' : ''} ${config.description}`}>{summary}</p>}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className={`px-4 pb-4 pt-0 ml-8 text-sm ${config.description}`}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// AUTO-DISMISSING ALERT
// ============================================

/**
 * Alert that auto-dismisses after timeout
 */
export function AutoDismissAlert({
  variant = 'success',
  children,
  duration = 5000,
  onDismiss,
  showProgress = true,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!isVisible) return

    const interval = 50
    const step = (100 * interval) / duration

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setIsVisible(false)
          onDismiss?.()
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration, isVisible, onDismiss])

  if (!isVisible) return null

  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.success

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Alert
        variant={variant}
        dismissible
        onDismiss={() => {
          setIsVisible(false)
          onDismiss?.()
        }}
      >
        {children}
      </Alert>
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full transition-all ease-linear ${
              variant === 'success' ? 'bg-green-500' :
              variant === 'info' ? 'bg-blue-500' :
              variant === 'warning' ? 'bg-yellow-500' :
              variant === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// ERROR ALERT WITH RETRY
// ============================================

/**
 * Error alert with retry button
 */
export function ErrorAlert({
  title = 'Error',
  error,
  onRetry,
  retryLabel = 'Try again',
  showDetails = false,
  className = ''
}) {
  const [showError, setShowError] = useState(false)
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : null

  return (
    <Alert
      variant="error"
      title={title}
      className={className}
      actions={
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
            >
              <RefreshCw className="h-4 w-4" />
              {retryLabel}
            </button>
          )}
          {showDetails && errorStack && (
            <button
              onClick={() => setShowError(!showError)}
              className="px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800"
            >
              {showError ? 'Hide details' : 'Show details'}
            </button>
          )}
        </div>
      }
    >
      <p>{errorMessage}</p>
      {showError && errorStack && (
        <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
          {errorStack}
        </pre>
      )}
    </Alert>
  )
}

// ============================================
// STATUS ALERT
// ============================================

/**
 * Alert for status messages
 */
export function StatusAlert({
  status,
  messages = {},
  className = ''
}) {
  const statusConfig = {
    loading: {
      variant: 'neutral',
      icon: () => (
        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full" />
      )
    },
    success: { variant: 'success' },
    error: { variant: 'error' },
    warning: { variant: 'warning' },
    info: { variant: 'info' }
  }

  const config = statusConfig[status] || statusConfig.info
  const message = messages[status] || status

  return (
    <Alert
      variant={config.variant}
      icon={config.icon}
      className={className}
    >
      {message}
    </Alert>
  )
}

// ============================================
// CALLOUT
// ============================================

/**
 * Callout for important information
 */
export function Callout({
  variant = 'info',
  title,
  children,
  icon: CustomIcon,
  className = ''
}) {
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = CustomIcon || config.icon

  return (
    <div className={`border-l-4 p-4 ${
      variant === 'info' ? 'border-l-blue-500 bg-blue-50' :
      variant === 'success' ? 'border-l-green-500 bg-green-50' :
      variant === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
      variant === 'error' ? 'border-l-red-500 bg-red-50' :
      'border-l-gray-500 bg-gray-50'
    } ${className}`}>
      <div className="flex">
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <div className="ml-3">
          {title && (
            <h4 className={`text-sm font-medium ${config.title}`}>{title}</h4>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''} ${config.description}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// TOAST-STYLE ALERT
// ============================================

/**
 * Floating toast-style alert
 */
export function ToastAlert({
  variant = 'info',
  title,
  description,
  onClose,
  action,
  className = ''
}) {
  const config = ALERT_VARIANTS[variant] || ALERT_VARIANTS.info
  const Icon = config.icon

  return (
    <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// NOTIFICATION BADGE
// ============================================

/**
 * Small notification badge
 */
export function NotificationBadge({
  variant = 'info',
  children,
  dot = false,
  className = ''
}) {
  const colorClasses = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800'
  }

  const dotColorClasses = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    neutral: 'bg-gray-500'
  }

  if (dot) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
        <span className={`h-2 w-2 rounded-full ${dotColorClasses[variant]}`} />
        {children}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default {
  Alert,
  InlineAlert,
  BannerAlert,
  AlertWithList,
  AlertWithLink,
  ExpandableAlert,
  AutoDismissAlert,
  ErrorAlert,
  StatusAlert,
  Callout,
  ToastAlert,
  NotificationBadge,
  ALERT_VARIANTS
}
