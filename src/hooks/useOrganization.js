/**
 * useOrganization.js
 * Shorthand hook for accessing OrganizationContext
 *
 * @location src/hooks/useOrganization.js
 */

import { useOrganizationContext } from '../contexts/OrganizationContext'

/**
 * Hook to access organization context
 * Provides organization, membership, permissions, and helper functions
 *
 * @returns {Object} Organization context value
 * @property {Object|null} organization - Current organization object
 * @property {Object|null} membership - Current user's membership
 * @property {string|null} organizationId - Shorthand for organization?.id
 * @property {boolean} loading - True while loading organization data
 * @property {string|null} error - Error message if any
 * @property {Function} hasPermission - Check if user has a permission
 * @property {Function} hasRole - Check if user has any of specified roles
 * @property {Function} canManageMember - Check if user can manage a member
 * @property {boolean} isAdmin - True if user is organization admin
 * @property {boolean} isManagement - True if user is admin or management
 * @property {boolean} canEdit - True if user can create/edit data
 * @property {boolean} canDelete - True if user can delete data
 * @property {boolean} canManageTeam - True if user can manage team members
 * @property {boolean} canManageSettings - True if user can manage org settings
 * @property {boolean} hasOrganization - True if user has an organization
 *
 * @example
 * // Basic usage
 * const { organization, organizationId, loading } = useOrganization()
 *
 * @example
 * // Permission checks
 * const { hasPermission, canEdit, isAdmin } = useOrganization()
 * if (hasPermission('manageTeam')) { ... }
 * if (canEdit) { ... }
 *
 * @example
 * // Role checks
 * const { hasRole, membership } = useOrganization()
 * if (hasRole(['admin', 'management'])) { ... }
 */
export function useOrganization() {
  return useOrganizationContext()
}

export default useOrganization
