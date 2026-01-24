/**
 * Empty States Components
 * Placeholder states for empty data scenarios
 *
 * @location src/components/ui/EmptyStates.jsx
 */

import React from 'react'
import {
  Inbox,
  Search,
  FileQuestion,
  FolderOpen,
  Users,
  Package,
  Plane,
  AlertTriangle,
  Target,
  FileText,
  Calendar,
  CheckCircle,
  Bell,
  Settings,
  Database,
  Filter
} from 'lucide-react'

// ============================================
// BASE EMPTY STATE
// ============================================

/**
 * Base empty state component
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      title: 'text-base',
      description: 'text-sm'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base'
    }
  }

  const styles = sizeClasses[size]

  return (
    <div className={`text-center ${styles.container} ${className}`}>
      <Icon className={`mx-auto text-gray-400 ${styles.icon}`} />
      <h3 className={`mt-4 font-medium text-gray-900 ${styles.title}`}>
        {title}
      </h3>
      {description && (
        <p className={`mt-2 text-gray-500 max-w-md mx-auto ${styles.description}`}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {action && (
            <button
              onClick={action}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel || 'Get Started'}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {secondaryActionLabel || 'Learn More'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// ENTITY-SPECIFIC EMPTY STATES
// ============================================

/**
 * No projects empty state
 */
export function EmptyProjects({ onCreateProject }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Get started by creating your first project to manage drone operations."
      action={onCreateProject}
      actionLabel="Create Project"
    />
  )
}

/**
 * No team members empty state
 */
export function EmptyTeamMembers({ onInviteMember }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Add team members to collaborate on projects and operations."
      action={onInviteMember}
      actionLabel="Invite Team Member"
    />
  )
}

/**
 * No equipment empty state
 */
export function EmptyEquipment({ onAddEquipment }) {
  return (
    <EmptyState
      icon={Package}
      title="No equipment registered"
      description="Track your equipment inventory by adding your first item."
      action={onAddEquipment}
      actionLabel="Add Equipment"
    />
  )
}

/**
 * No aircraft empty state
 */
export function EmptyAircraft({ onAddAircraft }) {
  return (
    <EmptyState
      icon={Plane}
      title="No aircraft in fleet"
      description="Register your drones and aircraft to track flights and maintenance."
      action={onAddAircraft}
      actionLabel="Add Aircraft"
    />
  )
}

/**
 * No incidents empty state
 */
export function EmptyIncidents({ showPositive = true }) {
  return (
    <EmptyState
      icon={showPositive ? CheckCircle : AlertTriangle}
      title={showPositive ? "No incidents reported" : "No incidents found"}
      description={
        showPositive
          ? "Great news! There are no incidents to review. Keep up the safe operations."
          : "No incidents match your current filters."
      }
    />
  )
}

/**
 * No CAPAs empty state
 */
export function EmptyCapas({ onCreateCapa }) {
  return (
    <EmptyState
      icon={Target}
      title="No CAPAs"
      description="Corrective and preventive actions will appear here when created from incidents."
      action={onCreateCapa}
      actionLabel="Create CAPA"
    />
  )
}

/**
 * No documents empty state
 */
export function EmptyDocuments({ onUpload }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents"
      description="Upload documents, certificates, and other files to keep them organized."
      action={onUpload}
      actionLabel="Upload Document"
    />
  )
}

/**
 * No notifications empty state
 */
export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! New notifications will appear here."
      size="sm"
    />
  )
}

/**
 * No scheduled events empty state
 */
export function EmptySchedule({ onSchedule }) {
  return (
    <EmptyState
      icon={Calendar}
      title="Nothing scheduled"
      description="Schedule flights, maintenance, and other events to see them here."
      action={onSchedule}
      actionLabel="Schedule Event"
    />
  )
}

// ============================================
// SEARCH/FILTER EMPTY STATES
// ============================================

/**
 * No search results empty state
 */
export function NoSearchResults({ query, onClearSearch }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try adjusting your search terms.`
          : "We couldn't find any matching results."
      }
      action={onClearSearch}
      actionLabel="Clear Search"
    />
  )
}

/**
 * No filter results empty state
 */
export function NoFilterResults({ onClearFilters }) {
  return (
    <EmptyState
      icon={Filter}
      title="No matching results"
      description="Try adjusting or clearing your filters to see more results."
      action={onClearFilters}
      actionLabel="Clear Filters"
    />
  )
}

/**
 * Page not found empty state
 */
export function PageNotFound({ onGoHome }) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      action={onGoHome}
      actionLabel="Go to Home"
      size="lg"
    />
  )
}

// ============================================
// ERROR/OFFLINE STATES
// ============================================

/**
 * Error state
 */
export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description={message || "We encountered an error. Please try again."}
      action={onRetry}
      actionLabel="Try Again"
    />
  )
}

/**
 * Offline state
 */
export function OfflineState() {
  return (
    <EmptyState
      icon={Database}
      title="You're offline"
      description="Check your internet connection and try again."
    />
  )
}

/**
 * Access denied state
 */
export function AccessDenied({ onRequestAccess }) {
  return (
    <EmptyState
      icon={Settings}
      title="Access denied"
      description="You don't have permission to view this content. Contact an administrator if you think this is a mistake."
      action={onRequestAccess}
      actionLabel="Request Access"
    />
  )
}

// ============================================
// FEATURE-SPECIFIC EMPTY STATES
// ============================================

/**
 * Empty activity feed
 */
export function EmptyActivity() {
  return (
    <EmptyState
      icon={Inbox}
      title="No recent activity"
      description="Activity from your team will appear here."
      size="sm"
    />
  )
}

/**
 * Empty comments
 */
export function EmptyComments({ onAddComment }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-sm">No comments yet</p>
      {onAddComment && (
        <button
          onClick={onAddComment}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Add the first comment
        </button>
      )}
    </div>
  )
}

/**
 * Empty attachments
 */
export function EmptyAttachments({ onUpload }) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
      <FileText className="mx-auto h-8 w-8 text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">No attachments</p>
      {onUpload && (
        <button
          onClick={onUpload}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Upload a file
        </button>
      )}
    </div>
  )
}

/**
 * Empty table
 */
export function EmptyTable({ columns = 4, message = 'No data available' }) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="px-6 py-12 text-center text-sm text-gray-500"
      >
        <Inbox className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        {message}
      </td>
    </tr>
  )
}

/**
 * Empty dropdown/select
 */
export function EmptyDropdown({ message = 'No options available' }) {
  return (
    <div className="px-4 py-3 text-sm text-gray-500 text-center">
      {message}
    </div>
  )
}

// ============================================
// ILLUSTRATED EMPTY STATES
// ============================================

/**
 * Welcome state for new users
 */
export function WelcomeState({ userName, onGetStarted }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Plane className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome{userName ? `, ${userName}` : ''}!
      </h2>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        You're all set up and ready to manage your drone operations. Let's get started by creating your first project.
      </p>
      <div className="mt-8">
        <button
          onClick={onGetStarted}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

/**
 * Coming soon state
 */
export function ComingSoonState({ featureName }) {
  return (
    <EmptyState
      icon={Settings}
      title="Coming Soon"
      description={
        featureName
          ? `${featureName} is currently under development. Check back soon!`
          : "This feature is currently under development. Check back soon!"
      }
      size="lg"
    />
  )
}

export default {
  EmptyState,
  EmptyProjects,
  EmptyTeamMembers,
  EmptyEquipment,
  EmptyAircraft,
  EmptyIncidents,
  EmptyCapas,
  EmptyDocuments,
  EmptyNotifications,
  EmptySchedule,
  NoSearchResults,
  NoFilterResults,
  PageNotFound,
  ErrorState,
  OfflineState,
  AccessDenied,
  EmptyActivity,
  EmptyComments,
  EmptyAttachments,
  EmptyTable,
  EmptyDropdown,
  WelcomeState,
  ComingSoonState
}
