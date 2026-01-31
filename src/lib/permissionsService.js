/**
 * permissionsService.js
 *
 * @deprecated This file is deprecated. Import from './rbac.js' instead.
 *
 * This file now re-exports from rbac.js for backwards compatibility.
 * All new code should import directly from rbac.js.
 *
 * @location src/lib/permissionsService.js
 */

// Re-export everything from the new unified RBAC system
export {
  ROLES,
  ROLE_INFO,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleLevel as hasRoleLevel,
  getAssignableRoles,
  getRoleInfo,
  getPermissionInfo,
  isValidRole
} from './rbac'

// Compatibility functions
import { hasPermission as checkPermission, hasAnyPermission as checkAnyPermission } from './rbac'

/**
 * Check if user can access a resource
 * @deprecated Use hasPermission from rbac.js instead
 */
export function canAccess(user, resource, action = 'view') {
  if (!user?.role) return false
  const permission = action === 'view' ? 'viewData' : 'createEdit'
  return checkPermission(user.role, permission)
}

/**
 * Check if user can manage a resource
 * @deprecated Use hasPermission from rbac.js instead
 */
export function canManage(user, resource) {
  if (!user?.role) return false
  return checkAnyPermission(user.role, ['createEdit', 'delete'])
}

/**
 * Get all permissions for a user
 * @deprecated Use getRolePermissionsList from rbac.js instead
 */
export function getUserPermissions(user) {
  if (!user?.role) return []
  const { ROLE_PERMISSIONS } = require('./rbac')
  const rolePermissions = ROLE_PERMISSIONS[user.role] || {}
  return Object.entries(rolePermissions)
    .filter(([_, has]) => has)
    .map(([perm]) => perm)
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(permissions) {
  const { PERMISSION_INFO } = require('./rbac')
  const grouped = {}

  permissions.forEach(permission => {
    const info = PERMISSION_INFO[permission]
    const category = info?.category || 'other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push({
      key: permission,
      ...info
    })
  })

  return grouped
}

/**
 * Check if user can assign a role
 * @deprecated Use canAssignRole from rbac.js instead
 */
export function canAssignRole(user, roleToAssign) {
  const { canAssignRole: checkCanAssign } = require('./rbac')
  if (!user?.role) return false
  return checkCanAssign(user.role, roleToAssign)
}

/**
 * Resource-specific checks - these now just check general permissions
 * @deprecated Use hasPermission from rbac.js instead
 */
export function canViewProject(user, project) {
  return !!user && checkPermission(user.role || 'viewer', 'viewData')
}

export function canEditProject(user, project) {
  return !!user && checkPermission(user.role || 'viewer', 'createEdit')
}

export function canViewIncident(user, incident) {
  return !!user && checkPermission(user.role || 'viewer', 'viewData')
}

export function canInvestigateIncident(user, incident) {
  return !!user && checkPermission(user.role || 'viewer', 'approve')
}

/**
 * Get permission categories
 */
export function getPermissionCategories() {
  const { PERMISSION_INFO } = require('./rbac')
  const categories = new Set()
  Object.values(PERMISSION_INFO).forEach(p => {
    if (p.category) categories.add(p.category)
  })
  return Array.from(categories)
}

// Default export for backwards compatibility
export default {
  ROLES: require('./rbac').ROLES,
  PERMISSIONS: require('./rbac').PERMISSIONS,
  ROLE_PERMISSIONS: require('./rbac').ROLE_PERMISSIONS,
  hasPermission: checkPermission,
  hasAnyPermission: checkAnyPermission,
  hasAllPermissions: require('./rbac').hasAllPermissions,
  hasRoleLevel: require('./rbac').getRoleLevel,
  canAccess,
  canManage,
  getUserPermissions,
  getPermissionsByCategory,
  getAssignableRoles: require('./rbac').getAssignableRoles,
  canAssignRole,
  canViewProject,
  canEditProject,
  canViewIncident,
  canInvestigateIncident,
  getRoleInfo: require('./rbac').getRoleInfo,
  getPermissionInfo: require('./rbac').getPermissionInfo,
  getPermissionCategories
}

// Console warning for developers
if (typeof console !== 'undefined' && import.meta.env?.DEV) {
  console.warn(
    '[DEPRECATED] permissionsService.js is deprecated. Import from rbac.js instead:\n' +
    "  import { hasPermission, ROLES, PERMISSIONS } from './lib/rbac'"
  )
}
