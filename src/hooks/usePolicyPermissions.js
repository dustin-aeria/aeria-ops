/**
 * usePolicyPermissions.js
 * Hook for checking policy-related permissions based on user role
 *
 * @location src/hooks/usePolicyPermissions.js
 */

import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from './useOrganization'

/**
 * Permission levels for quick reference
 */
export const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  APPROVER: 'approver',
  ADMIN: 'admin',
  PLATFORM_ADMIN: 'platformAdmin'
}

/**
 * Default permission configuration by role
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: true,
    canManageDefaults: true
  },
  management: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: false,
    canManageDefaults: false
  },
  operator: {
    canViewAll: true,
    canEdit: true,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  },
  viewer: {
    canViewAll: true,
    canEdit: false,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  }
}

/**
 * Hook to get policy permissions for the current user
 * @param {Object} policy - Optional specific policy to check against
 * @returns {Object} Permission flags and helper functions
 */
export function usePolicyPermissions(policy = null) {
  const { user } = useAuth()
  const { membership, hasPermission, isAdmin, isManagement, canEdit, canDelete, canApprove } = useOrganization()

  const permissions = useMemo(() => {
    const isAuthenticated = !!user
    const userRole = membership?.role || 'viewer'
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[userRole] || DEFAULT_ROLE_PERMISSIONS.viewer

    return {
      // Policy-specific permissions based on actual role
      canView: isAuthenticated && hasPermission('viewData'),
      canEdit: isAuthenticated && canEdit,
      canApprove: isAuthenticated && canApprove,
      canDelete: isAuthenticated && canDelete,

      // Category and template management - admin only
      canManageCategories: isAuthenticated && isAdmin,
      canManageDefaults: isAuthenticated && isAdmin,

      // Acknowledgment permissions
      canAcknowledge: isAuthenticated, // All users can acknowledge
      canViewAcknowledgments: isAuthenticated && isManagement,
      canManageAcknowledgments: isAuthenticated && isAdmin,

      // Version management
      canViewVersions: isAuthenticated,
      canRollback: isAuthenticated && isAdmin,

      // Workflow permissions
      canSubmitForReview: isAuthenticated && canEdit,
      canSubmitForApproval: isAuthenticated && isManagement,
      canPublish: isAuthenticated && canApprove,
      canRetire: isAuthenticated && isAdmin,

      // Meta
      permissionLevel: isAdmin ? PERMISSION_LEVELS.ADMIN :
                       isManagement ? PERMISSION_LEVELS.APPROVER :
                       canEdit ? PERMISSION_LEVELS.EDITOR : PERMISSION_LEVELS.VIEWER,
      isAdmin: isAdmin,
      canManageMasterPolicies: isAdmin,
      userRole: userRole
    }
  }, [user, membership?.role, hasPermission, isAdmin, isManagement, canEdit, canDelete, canApprove])

  return permissions
}

/**
 * Hook to check if user has pending policy acknowledgments
 * @returns {Object} { hasPending, count, loading }
 */
export function usePendingAcknowledgments() {
  const { user, userProfile } = useAuth()

  // This would typically fetch from Firestore
  // For now, return structure that can be enhanced
  return useMemo(() => {
    if (!user) {
      return { hasPending: false, count: 0, loading: false, policies: [] }
    }

    const pendingPolicies = userProfile?.pendingAcknowledgments || []

    return {
      hasPending: pendingPolicies.length > 0,
      count: pendingPolicies.length,
      loading: false,
      policies: pendingPolicies
    }
  }, [user, userProfile])
}

/**
 * Check if user can perform a specific action on a policy
 * Useful for conditional rendering
 * @param {string} action - Action name (view, edit, approve, delete, etc.)
 * @param {Object} policy - Policy object
 * @returns {boolean}
 */
export function useCanPerformAction(action, policy) {
  const permissions = usePolicyPermissions(policy)

  return useMemo(() => {
    switch (action) {
      case 'view':
        return permissions.canView
      case 'edit':
        return permissions.canEdit
      case 'approve':
        return permissions.canApprove
      case 'delete':
        return permissions.canDelete
      case 'acknowledge':
        return permissions.canAcknowledge
      case 'rollback':
        return permissions.canRollback
      case 'submit_review':
        return permissions.canSubmitForReview
      case 'submit_approval':
        return permissions.canSubmitForApproval
      case 'publish':
        return permissions.canPublish
      case 'retire':
        return permissions.canRetire
      default:
        return false
    }
  }, [action, permissions])
}

export default usePolicyPermissions
