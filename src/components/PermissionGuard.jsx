/**
 * PermissionGuard.jsx
 * Components to conditionally render based on user permissions
 *
 * Usage:
 *   <PermissionGuard permission="createEdit">
 *     <button>Edit</button>
 *   </PermissionGuard>
 *
 *   <RequireAdmin fallback={<AccessDenied />}>
 *     <AdminPanel />
 *   </RequireAdmin>
 *
 * @location src/components/PermissionGuard.jsx
 */

import { useOrganization } from '../hooks/useOrganization'
import { AlertCircle, Lock } from 'lucide-react'

/**
 * Main permission guard component
 * Renders children only if user has the required permission or role
 *
 * @param {Object} props
 * @param {string} props.permission - Permission to check (e.g., 'createEdit', 'delete')
 * @param {string[]} props.roles - Array of allowed roles
 * @param {React.ReactNode} props.fallback - What to render if permission denied
 * @param {React.ReactNode} props.children - Content to render if permitted
 * @param {boolean} props.showDenied - Show a denial message instead of nothing
 */
export function PermissionGuard({
  permission,
  roles,
  fallback = null,
  children,
  showDenied = false
}) {
  const { hasPermission, hasRole, loading } = useOrganization()

  // While loading, don't render anything to prevent flash
  if (loading) return null

  // Check permission if provided
  if (permission && !hasPermission(permission)) {
    return showDenied ? <AccessDeniedMessage /> : fallback
  }

  // Check roles if provided
  if (roles && !hasRole(roles)) {
    return showDenied ? <AccessDeniedMessage /> : fallback
  }

  return children
}

/**
 * Default access denied message component
 */
export function AccessDeniedMessage({ message = "You don't have permission to view this content." }) {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
      <Lock className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

/**
 * Full-page access denied component for protected routes
 */
export function AccessDeniedPage({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  showBack = true
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">{message}</p>
      {showBack && (
        <button
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          Go Back
        </button>
      )}
    </div>
  )
}

// ============================================
// ROLE-SPECIFIC GUARDS
// ============================================

/**
 * Requires Admin role
 */
export function RequireAdmin({ children, fallback = null, showDenied = false }) {
  return (
    <PermissionGuard roles={['admin']} fallback={fallback} showDenied={showDenied}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Requires Admin or Management role
 */
export function RequireManagement({ children, fallback = null, showDenied = false }) {
  return (
    <PermissionGuard roles={['admin', 'management']} fallback={fallback} showDenied={showDenied}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Requires Admin, Management, or Operator role (excludes Viewer)
 */
export function RequireOperator({ children, fallback = null, showDenied = false }) {
  return (
    <PermissionGuard roles={['admin', 'management', 'operator']} fallback={fallback} showDenied={showDenied}>
      {children}
    </PermissionGuard>
  )
}

// ============================================
// PERMISSION-SPECIFIC GUARDS
// ============================================

/**
 * Can view data (all authenticated users)
 */
export function CanView({ children, fallback = null }) {
  return (
    <PermissionGuard permission="viewData" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can create and edit content
 */
export function CanEdit({ children, fallback = null }) {
  return (
    <PermissionGuard permission="createEdit" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can delete content
 */
export function CanDelete({ children, fallback = null }) {
  return (
    <PermissionGuard permission="delete" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can approve workflows
 */
export function CanApprove({ children, fallback = null }) {
  return (
    <PermissionGuard permission="approve" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can manage team members
 */
export function CanManageTeam({ children, fallback = null }) {
  return (
    <PermissionGuard permission="manageTeam" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can manage organization settings
 */
export function CanManageSettings({ children, fallback = null }) {
  return (
    <PermissionGuard permission="manageSettings" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

/**
 * Can report incidents
 */
export function CanReportIncidents({ children, fallback = null }) {
  return (
    <PermissionGuard permission="reportIncidents" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

// ============================================
// UTILITY COMPONENTS
// ============================================

/**
 * Shows content only if user CANNOT perform action
 * Useful for showing upgrade prompts or alternative actions
 */
export function IfNoPermission({ permission, roles, children }) {
  const { hasPermission, hasRole } = useOrganization()

  if (permission && hasPermission(permission)) return null
  if (roles && hasRole(roles)) return null

  return children
}

/**
 * Shows different content based on permission
 */
export function PermissionSwitch({ permission, allowed, denied }) {
  const { hasPermission } = useOrganization()

  if (hasPermission(permission)) {
    return allowed
  }
  return denied
}

export default PermissionGuard
