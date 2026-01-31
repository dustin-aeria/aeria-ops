/**
 * usePermissions.js
 * Hook for checking permissions in components
 *
 * Provides a clean API for permission checks without needing to
 * know the underlying role system.
 *
 * Usage:
 *   const { canEdit, canDelete, isAdmin } = usePermissions()
 *   if (canEdit) { ... }
 *
 * @location src/hooks/usePermissions.js
 */

import { useMemo } from 'react'
import { useOrganization } from './useOrganization'
import { PERMISSIONS, ROLE_INFO, getRoleLevel } from '../lib/rbac'

/**
 * Hook to get all permission flags for the current user
 * @returns {Object} Permission flags and helper functions
 */
export function usePermissions() {
  const {
    membership,
    hasPermission,
    hasRole,
    loading
  } = useOrganization()

  return useMemo(() => {
    const role = membership?.role
    const roleInfo = ROLE_INFO[role] || null
    const roleLevel = getRoleLevel(role)

    return {
      // Loading state
      loading,

      // Current role info
      role,
      roleLabel: roleInfo?.label || 'Unknown',
      roleLevel,

      // Permission checks (boolean flags)
      canView: hasPermission(PERMISSIONS.VIEW_DATA),
      canEdit: hasPermission(PERMISSIONS.CREATE_EDIT),
      canDelete: hasPermission(PERMISSIONS.DELETE),
      canApprove: hasPermission(PERMISSIONS.APPROVE),
      canManageTeam: hasPermission(PERMISSIONS.MANAGE_TEAM),
      canManageSettings: hasPermission(PERMISSIONS.MANAGE_SETTINGS),
      canReportIncidents: hasPermission(PERMISSIONS.REPORT_INCIDENTS),
      canRecordTraining: hasPermission(PERMISSIONS.RECORD_OWN_TRAINING),

      // Role checks
      isAdmin: hasRole(['admin']),
      isManagement: hasRole(['admin', 'management']),
      isOperator: hasRole(['admin', 'management', 'operator']),
      isViewer: role === 'viewer',

      // Helper functions for custom checks
      hasPermission,
      hasRole,

      /**
       * Check if user can perform a specific action
       * @param {string} action - Action name
       * @returns {boolean}
       */
      can: (action) => {
        switch (action) {
          case 'view':
            return hasPermission(PERMISSIONS.VIEW_DATA)
          case 'create':
          case 'edit':
          case 'createEdit':
            return hasPermission(PERMISSIONS.CREATE_EDIT)
          case 'delete':
            return hasPermission(PERMISSIONS.DELETE)
          case 'approve':
            return hasPermission(PERMISSIONS.APPROVE)
          case 'manageTeam':
            return hasPermission(PERMISSIONS.MANAGE_TEAM)
          case 'manageSettings':
            return hasPermission(PERMISSIONS.MANAGE_SETTINGS)
          case 'reportIncident':
          case 'reportIncidents':
            return hasPermission(PERMISSIONS.REPORT_INCIDENTS)
          case 'recordTraining':
            return hasPermission(PERMISSIONS.RECORD_OWN_TRAINING)
          default:
            return false
        }
      },

      /**
       * Check if user can manage another user's role
       * @param {string} targetRole - The target user's role
       * @returns {boolean}
       */
      canManageRole: (targetRole) => {
        if (!hasPermission(PERMISSIONS.MANAGE_TEAM)) return false
        const targetLevel = getRoleLevel(targetRole)
        return roleLevel > targetLevel
      }
    }
  }, [membership?.role, hasPermission, hasRole, loading])
}

/**
 * Hook to check a single permission
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function useHasPermission(permission) {
  const { hasPermission } = useOrganization()
  return hasPermission(permission)
}

/**
 * Hook to check if user has any of the specified roles
 * @param {string[]} roles - Roles to check
 * @returns {boolean}
 */
export function useHasRole(roles) {
  const { hasRole } = useOrganization()
  return hasRole(roles)
}

/**
 * Hook to get current user's role
 * @returns {string|null}
 */
export function useCurrentRole() {
  const { membership } = useOrganization()
  return membership?.role || null
}

/**
 * Hook for checking if current user is admin
 * @returns {boolean}
 */
export function useIsAdmin() {
  const { hasRole } = useOrganization()
  return hasRole(['admin'])
}

/**
 * Hook for checking if current user is management or higher
 * @returns {boolean}
 */
export function useIsManagement() {
  const { hasRole } = useOrganization()
  return hasRole(['admin', 'management'])
}

export default usePermissions
