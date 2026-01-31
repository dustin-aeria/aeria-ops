/**
 * rbac.js
 * Unified Role-Based Access Control definitions
 *
 * This is the single source of truth for all role and permission definitions.
 * Import from this file instead of firestoreOrganizations for RBAC constants.
 *
 * @location src/lib/rbac.js
 */

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ROLES = {
  ADMIN: 'admin',
  MANAGEMENT: 'management',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
}

export const ROLE_HIERARCHY = ['admin', 'management', 'operator', 'viewer']

export const ROLE_INFO = {
  admin: {
    id: 'admin',
    label: 'Admin',
    description: 'Full access to all features and settings',
    level: 100,
    color: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
    icon: 'Shield'
  },
  management: {
    id: 'management',
    label: 'Management',
    description: 'Can create, edit, delete, and approve content',
    level: 70,
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    icon: 'Briefcase'
  },
  operator: {
    id: 'operator',
    label: 'Operator',
    description: 'Can view and edit content, report incidents',
    level: 40,
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    icon: 'User'
  },
  viewer: {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to all data',
    level: 10,
    color: 'bg-gray-100 text-gray-600',
    borderColor: 'border-gray-200',
    icon: 'Eye'
  }
}

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export const PERMISSIONS = {
  // Data access
  VIEW_DATA: 'viewData',
  CREATE_EDIT: 'createEdit',
  DELETE: 'delete',
  APPROVE: 'approve',

  // Team & Settings
  MANAGE_TEAM: 'manageTeam',
  MANAGE_SETTINGS: 'manageSettings',

  // Special actions
  REPORT_INCIDENTS: 'reportIncidents',
  RECORD_OWN_TRAINING: 'recordOwnTraining'
}

export const PERMISSION_INFO = {
  [PERMISSIONS.VIEW_DATA]: {
    label: 'View Data',
    description: 'Read access to all organization data',
    category: 'Data'
  },
  [PERMISSIONS.CREATE_EDIT]: {
    label: 'Create & Edit',
    description: 'Create new items and edit existing ones',
    category: 'Data'
  },
  [PERMISSIONS.DELETE]: {
    label: 'Delete',
    description: 'Permanently remove items',
    category: 'Data'
  },
  [PERMISSIONS.APPROVE]: {
    label: 'Approve',
    description: 'Approve workflows, projects, and compliance items',
    category: 'Workflows'
  },
  [PERMISSIONS.MANAGE_TEAM]: {
    label: 'Manage Team',
    description: 'Invite members, change roles, remove members',
    category: 'Administration'
  },
  [PERMISSIONS.MANAGE_SETTINGS]: {
    label: 'Manage Settings',
    description: 'Change organization settings and configuration',
    category: 'Administration'
  },
  [PERMISSIONS.REPORT_INCIDENTS]: {
    label: 'Report Incidents',
    description: 'Submit incident reports',
    category: 'Safety'
  },
  [PERMISSIONS.RECORD_OWN_TRAINING]: {
    label: 'Record Training',
    description: 'Log own training completions',
    category: 'Training'
  }
}

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================

export const ROLE_PERMISSIONS = {
  admin: {
    [PERMISSIONS.VIEW_DATA]: true,
    [PERMISSIONS.CREATE_EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
    [PERMISSIONS.MANAGE_TEAM]: true,
    [PERMISSIONS.MANAGE_SETTINGS]: true,
    [PERMISSIONS.REPORT_INCIDENTS]: true,
    [PERMISSIONS.RECORD_OWN_TRAINING]: true
  },
  management: {
    [PERMISSIONS.VIEW_DATA]: true,
    [PERMISSIONS.CREATE_EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
    [PERMISSIONS.MANAGE_TEAM]: false,
    [PERMISSIONS.MANAGE_SETTINGS]: false,
    [PERMISSIONS.REPORT_INCIDENTS]: true,
    [PERMISSIONS.RECORD_OWN_TRAINING]: true
  },
  operator: {
    [PERMISSIONS.VIEW_DATA]: true,
    [PERMISSIONS.CREATE_EDIT]: true,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
    [PERMISSIONS.MANAGE_TEAM]: false,
    [PERMISSIONS.MANAGE_SETTINGS]: false,
    [PERMISSIONS.REPORT_INCIDENTS]: true,
    [PERMISSIONS.RECORD_OWN_TRAINING]: true
  },
  viewer: {
    [PERMISSIONS.VIEW_DATA]: true,
    [PERMISSIONS.CREATE_EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
    [PERMISSIONS.MANAGE_TEAM]: false,
    [PERMISSIONS.MANAGE_SETTINGS]: false,
    [PERMISSIONS.REPORT_INCIDENTS]: false,
    [PERMISSIONS.RECORD_OWN_TRAINING]: false
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  return ROLE_PERMISSIONS[role][permission] === true
}

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - Role name
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  if (!role || !Array.isArray(permissions)) return false
  return permissions.some(perm => hasPermission(role, perm))
}

/**
 * Check if a role has all of the specified permissions
 * @param {string} role - Role name
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  if (!role || !Array.isArray(permissions)) return false
  return permissions.every(perm => hasPermission(role, perm))
}

/**
 * Get the level/priority of a role (higher = more permissions)
 * @param {string} role - Role name
 * @returns {number}
 */
export function getRoleLevel(role) {
  return ROLE_INFO[role]?.level ?? 0
}

/**
 * Check if roleA is higher than or equal to roleB in hierarchy
 * @param {string} roleA - First role
 * @param {string} roleB - Second role
 * @returns {boolean}
 */
export function isRoleHigherOrEqual(roleA, roleB) {
  return getRoleLevel(roleA) >= getRoleLevel(roleB)
}

/**
 * Check if a user can assign a specific role to another user
 * @param {string} assignerRole - Role of the user doing the assignment
 * @param {string} targetRole - Role being assigned
 * @returns {boolean}
 */
export function canAssignRole(assignerRole, targetRole) {
  if (!hasPermission(assignerRole, PERMISSIONS.MANAGE_TEAM)) return false
  const assignerLevel = getRoleLevel(assignerRole)
  const targetLevel = getRoleLevel(targetRole)
  return assignerLevel > targetLevel
}

/**
 * Get roles that a user can assign to others
 * @param {string} userRole - The user's current role
 * @returns {Object[]} Array of assignable roles with info
 */
export function getAssignableRoles(userRole) {
  if (!hasPermission(userRole, PERMISSIONS.MANAGE_TEAM)) return []

  const userLevel = getRoleLevel(userRole)
  return Object.entries(ROLE_INFO)
    .filter(([_, info]) => info.level < userLevel)
    .map(([key, info]) => ({ value: key, ...info }))
    .sort((a, b) => b.level - a.level)
}

/**
 * Get all permissions for a role
 * @param {string} role - Role name
 * @returns {string[]} Array of permission names
 */
export function getRolePermissionsList(role) {
  if (!role || !ROLE_PERMISSIONS[role]) return []
  return Object.entries(ROLE_PERMISSIONS[role])
    .filter(([_, hasIt]) => hasIt)
    .map(([perm]) => perm)
}

/**
 * Get role display info
 * @param {string} role - Role name
 * @returns {Object|null}
 */
export function getRoleInfo(role) {
  return ROLE_INFO[role] || null
}

/**
 * Get permission display info
 * @param {string} permission - Permission name
 * @returns {Object|null}
 */
export function getPermissionInfo(permission) {
  return PERMISSION_INFO[permission] || null
}

/**
 * Check if a role exists
 * @param {string} role - Role name
 * @returns {boolean}
 */
export function isValidRole(role) {
  return role && ROLE_HIERARCHY.includes(role)
}

/**
 * Get role options for select inputs (sorted by level descending)
 * @param {Object} options - Options
 * @param {string[]} options.exclude - Roles to exclude
 * @returns {Object[]}
 */
export function getRoleOptions({ exclude = [] } = {}) {
  return Object.entries(ROLE_INFO)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, info]) => ({
      value: key,
      label: info.label,
      description: info.description,
      level: info.level
    }))
    .sort((a, b) => b.level - a.level)
}

// ============================================
// EXPORTS
// ============================================

export default {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_INFO,
  PERMISSIONS,
  PERMISSION_INFO,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRoleLevel,
  isRoleHigherOrEqual,
  canAssignRole,
  getAssignableRoles,
  getRolePermissionsList,
  getRoleInfo,
  getPermissionInfo,
  isValidRole,
  getRoleOptions
}
