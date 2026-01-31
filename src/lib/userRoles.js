/**
 * userRoles.js
 *
 * @deprecated This file is deprecated. Import from './rbac.js' instead.
 *
 * This file now re-exports from rbac.js for backwards compatibility.
 * All new code should import directly from rbac.js.
 *
 * @location src/lib/userRoles.js
 */

// Re-export everything from the new unified RBAC system
export {
  ROLES as USER_ROLES_ENUM,
  ROLE_HIERARCHY,
  ROLE_INFO as USER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleLevel as hasMinimumRoleLevel,
  isRoleHigherOrEqual as canManageUser,
  getAssignableRoles,
  getRoleInfo,
  getRolePermissionsList as getRolePermissions,
  isValidRole
} from './rbac'

// Legacy exports for backwards compatibility
export const DEFAULT_ROLE = 'operator'

// Mapped role options for select inputs
import { getRoleOptions } from './rbac'
export const ROLE_OPTIONS = getRoleOptions()

// Console warning for developers
if (typeof console !== 'undefined' && import.meta.env?.DEV) {
  console.warn(
    '[DEPRECATED] userRoles.js is deprecated. Import from rbac.js instead:\n' +
    "  import { hasPermission, ROLES } from './lib/rbac'"
  )
}
