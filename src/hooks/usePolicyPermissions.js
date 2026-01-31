/**
 * usePolicyPermissions.js
 * Hook for checking policy-related permissions based on user role
 *
 * @location src/hooks/usePolicyPermissions.js
 */

import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
  owner: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: true,
    canManageDefaults: true
  },
  admin: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: true,
    canManageDefaults: true
  },
  manager: {
    canViewAll: true,
    canEdit: true,
    canApprove: true,
    canManageCategories: false,
    canManageDefaults: false
  },
  editor: {
    canViewAll: true,
    canEdit: true,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  },
  operator: {
    canViewAll: true,
    canEdit: false,
    canApprove: false,
    canManageCategories: false,
    canManageDefaults: false
  },
  viewer: {
    canViewAll: false,
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
  const { user, userProfile } = useAuth()

  const permissions = useMemo(() => {
    // SIMPLIFIED: All authenticated users have all permissions
    const isAuthenticated = !!user

    return {
      // Policy-specific permissions - all true for authenticated users
      canView: isAuthenticated,
      canEdit: isAuthenticated,
      canApprove: isAuthenticated,
      canDelete: isAuthenticated,

      // Category and template management
      canManageCategories: isAuthenticated,
      canManageDefaults: isAuthenticated,

      // Acknowledgment permissions
      canAcknowledge: isAuthenticated,
      canViewAcknowledgments: isAuthenticated,
      canManageAcknowledgments: isAuthenticated,

      // Version management
      canViewVersions: isAuthenticated,
      canRollback: isAuthenticated,

      // Workflow permissions
      canSubmitForReview: isAuthenticated,
      canSubmitForApproval: isAuthenticated,
      canPublish: isAuthenticated,
      canRetire: isAuthenticated,

      // Meta - all users are treated as platform admin
      permissionLevel: isAuthenticated ? PERMISSION_LEVELS.PLATFORM_ADMIN : null,
      isAdmin: isAuthenticated,
      isPlatformAdmin: isAuthenticated,
      isDevMode: isAuthenticated,
      canManageMasterPolicies: isAuthenticated,
      userRole: 'owner'
    }
  }, [user])

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
