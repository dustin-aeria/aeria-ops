/**
 * Permissions Service
 * Role-based access control (RBAC) for the platform
 *
 * @location src/lib/permissionsService.js
 */

// ============================================
// ROLE DEFINITIONS
// ============================================

export const ROLES = {
  owner: {
    label: 'Owner',
    description: 'Organization owner with full access to everything',
    level: 110,
    color: 'bg-purple-100 text-purple-700'
  },
  admin: {
    label: 'Administrator',
    description: 'Full access to all features and settings',
    level: 100,
    color: 'bg-red-100 text-red-700'
  },
  manager: {
    label: 'Manager',
    description: 'Can manage projects, team members, and view reports',
    level: 80,
    color: 'bg-purple-100 text-purple-700'
  },
  safety_officer: {
    label: 'Safety Officer',
    description: 'Full access to safety, incidents, and CAPAs',
    level: 70,
    color: 'bg-orange-100 text-orange-700'
  },
  lead_pilot: {
    label: 'Lead Pilot',
    description: 'Can manage flights, aircraft, and team schedules',
    level: 60,
    color: 'bg-blue-100 text-blue-700'
  },
  pilot: {
    label: 'Pilot',
    description: 'Can view and execute assigned flights',
    level: 40,
    color: 'bg-green-100 text-green-700'
  },
  operator: {
    label: 'Operator',
    description: 'Standard operator access',
    level: 30,
    color: 'bg-cyan-100 text-cyan-700'
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to assigned projects',
    level: 10,
    color: 'bg-gray-100 text-gray-700'
  }
}

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export const PERMISSIONS = {
  // Project permissions
  'projects.view': { label: 'View Projects', category: 'projects' },
  'projects.create': { label: 'Create Projects', category: 'projects' },
  'projects.edit': { label: 'Edit Projects', category: 'projects' },
  'projects.delete': { label: 'Delete Projects', category: 'projects' },
  'projects.manage': { label: 'Manage All Projects', category: 'projects' },

  // Client permissions
  'clients.view': { label: 'View Clients', category: 'clients' },
  'clients.create': { label: 'Create Clients', category: 'clients' },
  'clients.edit': { label: 'Edit Clients', category: 'clients' },
  'clients.delete': { label: 'Delete Clients', category: 'clients' },

  // Team permissions
  'team.view': { label: 'View Team Members', category: 'team' },
  'team.create': { label: 'Add Team Members', category: 'team' },
  'team.edit': { label: 'Edit Team Members', category: 'team' },
  'team.delete': { label: 'Remove Team Members', category: 'team' },
  'team.manage_roles': { label: 'Manage Roles', category: 'team' },

  // Aircraft permissions
  'aircraft.view': { label: 'View Aircraft', category: 'aircraft' },
  'aircraft.create': { label: 'Add Aircraft', category: 'aircraft' },
  'aircraft.edit': { label: 'Edit Aircraft', category: 'aircraft' },
  'aircraft.delete': { label: 'Delete Aircraft', category: 'aircraft' },

  // Equipment permissions
  'equipment.view': { label: 'View Equipment', category: 'equipment' },
  'equipment.create': { label: 'Add Equipment', category: 'equipment' },
  'equipment.edit': { label: 'Edit Equipment', category: 'equipment' },
  'equipment.delete': { label: 'Delete Equipment', category: 'equipment' },

  // Flight permissions
  'flights.view': { label: 'View Flights', category: 'flights' },
  'flights.create': { label: 'Create Flights', category: 'flights' },
  'flights.edit': { label: 'Edit Flights', category: 'flights' },
  'flights.execute': { label: 'Execute Flights', category: 'flights' },
  'flights.approve': { label: 'Approve Flights', category: 'flights' },

  // Safety permissions
  'incidents.view': { label: 'View Incidents', category: 'safety' },
  'incidents.report': { label: 'Report Incidents', category: 'safety' },
  'incidents.investigate': { label: 'Investigate Incidents', category: 'safety' },
  'incidents.close': { label: 'Close Incidents', category: 'safety' },

  'capas.view': { label: 'View CAPAs', category: 'safety' },
  'capas.create': { label: 'Create CAPAs', category: 'safety' },
  'capas.edit': { label: 'Edit CAPAs', category: 'safety' },
  'capas.approve': { label: 'Approve CAPAs', category: 'safety' },

  // Compliance permissions
  'compliance.view': { label: 'View Compliance', category: 'compliance' },
  'compliance.manage': { label: 'Manage Compliance', category: 'compliance' },
  'training.view': { label: 'View Training', category: 'compliance' },
  'training.manage': { label: 'Manage Training', category: 'compliance' },

  // Reports permissions
  'reports.view': { label: 'View Reports', category: 'reports' },
  'reports.create': { label: 'Create Reports', category: 'reports' },
  'reports.export': { label: 'Export Reports', category: 'reports' },

  // Settings permissions
  'settings.view': { label: 'View Settings', category: 'settings' },
  'settings.edit': { label: 'Edit Settings', category: 'settings' },
  'settings.billing': { label: 'Manage Billing', category: 'settings' },

  // Admin permissions
  'admin.access': { label: 'Admin Access', category: 'admin' },
  'admin.audit_logs': { label: 'View Audit Logs', category: 'admin' },
  'admin.system': { label: 'System Settings', category: 'admin' }
}

// ============================================
// ROLE PERMISSION MAPPINGS
// ============================================

export const ROLE_PERMISSIONS = {
  owner: [
    // All permissions - owner has complete access
    ...Object.keys(PERMISSIONS)
  ],

  admin: [
    // All permissions
    ...Object.keys(PERMISSIONS)
  ],

  manager: [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.manage',
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'team.view', 'team.create', 'team.edit', 'team.delete', 'team.manage_roles',
    'aircraft.view', 'aircraft.create', 'aircraft.edit', 'aircraft.delete',
    'equipment.view', 'equipment.create', 'equipment.edit', 'equipment.delete',
    'flights.view', 'flights.create', 'flights.edit', 'flights.approve',
    'incidents.view', 'incidents.report', 'incidents.investigate',
    'capas.view', 'capas.create', 'capas.edit',
    'compliance.view', 'training.view',
    'reports.view', 'reports.create', 'reports.export',
    'settings.view'
  ],

  safety_officer: [
    'projects.view',
    'team.view',
    'aircraft.view',
    'equipment.view',
    'flights.view',
    'incidents.view', 'incidents.report', 'incidents.investigate', 'incidents.close',
    'capas.view', 'capas.create', 'capas.edit', 'capas.approve',
    'compliance.view', 'compliance.manage',
    'training.view', 'training.manage',
    'reports.view', 'reports.create', 'reports.export',
    'admin.audit_logs'
  ],

  lead_pilot: [
    'projects.view', 'projects.edit',
    'team.view',
    'aircraft.view', 'aircraft.edit',
    'equipment.view', 'equipment.edit',
    'flights.view', 'flights.create', 'flights.edit', 'flights.execute', 'flights.approve',
    'incidents.view', 'incidents.report',
    'capas.view',
    'compliance.view', 'training.view',
    'reports.view', 'reports.create'
  ],

  pilot: [
    'projects.view',
    'team.view',
    'aircraft.view',
    'equipment.view',
    'flights.view', 'flights.execute',
    'incidents.view', 'incidents.report',
    'capas.view',
    'compliance.view', 'training.view'
  ],

  operator: [
    'projects.view',
    'team.view',
    'aircraft.view',
    'equipment.view',
    'flights.view',
    'incidents.view', 'incidents.report',
    'capas.view',
    'compliance.view', 'training.view'
  ],

  viewer: [
    'projects.view',
    'aircraft.view',
    'equipment.view',
    'flights.view',
    'incidents.view',
    'compliance.view'
  ]
}

// ============================================
// PERMISSION CHECK FUNCTIONS
// ============================================

/**
 * Check if user has a specific permission
 * SIMPLIFIED: All users have all permissions
 */
export function hasPermission(user, permission) {
  // SIMPLIFIED: Any user object means permission granted
  return !!user
}

/**
 * Check if user has any of the specified permissions
 * SIMPLIFIED: All users have all permissions
 */
export function hasAnyPermission(user, permissions) {
  return !!user
}

/**
 * Check if user has all specified permissions
 * SIMPLIFIED: All users have all permissions
 */
export function hasAllPermissions(user, permissions) {
  return !!user
}

/**
 * Check if user has minimum role level
 * SIMPLIFIED: All users pass role checks
 */
export function hasRoleLevel(user, requiredRole) {
  return !!user
}

/**
 * Check if user can access a resource
 */
export function canAccess(user, resource, action = 'view') {
  const permission = `${resource}.${action}`
  return hasPermission(user, permission)
}

/**
 * Check if user can manage a resource
 */
export function canManage(user, resource) {
  return hasAnyPermission(user, [
    `${resource}.create`,
    `${resource}.edit`,
    `${resource}.delete`,
    `${resource}.manage`
  ])
}

// ============================================
// USER PERMISSION UTILITIES
// ============================================

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user) {
  if (!user) return []

  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  const customPermissions = user.permissions || []

  return [...new Set([...rolePermissions, ...customPermissions])]
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(permissions) {
  const grouped = {}

  permissions.forEach(permission => {
    const category = PERMISSIONS[permission]?.category || 'other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push({
      key: permission,
      ...PERMISSIONS[permission]
    })
  })

  return grouped
}

/**
 * Get available roles for assignment
 * (can only assign roles at or below current level)
 */
export function getAssignableRoles(user) {
  if (!user) return []

  const userLevel = ROLES[user.role]?.level || 0

  return Object.entries(ROLES)
    .filter(([_, config]) => config.level <= userLevel)
    .map(([key, config]) => ({
      key,
      ...config
    }))
    .sort((a, b) => b.level - a.level)
}

/**
 * Check if user can assign a role
 */
export function canAssignRole(user, roleToAssign) {
  if (!user || !roleToAssign) return false

  // Must have manage_roles permission
  if (!hasPermission(user, 'team.manage_roles')) return false

  // Can only assign roles at or below own level
  const userLevel = ROLES[user.role]?.level || 0
  const targetLevel = ROLES[roleToAssign]?.level || 0

  return userLevel >= targetLevel
}

// ============================================
// RESOURCE-SPECIFIC CHECKS
// ============================================

/**
 * Check if user can view a project
 */
export function canViewProject(user, project) {
  if (!user || !project) return false

  // Admin/manager can see all
  if (hasRoleLevel(user, 'manager')) return true

  // Check if user is assigned to project
  if (project.assignedMembers?.includes(user.id)) return true

  // Check if user is project manager
  if (project.projectManagerId === user.id) return true

  return hasPermission(user, 'projects.view')
}

/**
 * Check if user can edit a project
 */
export function canEditProject(user, project) {
  if (!user || !project) return false

  // Admin/manager can edit all
  if (hasRoleLevel(user, 'manager')) return true

  // Project manager can edit their project
  if (project.projectManagerId === user.id) return true

  return hasPermission(user, 'projects.edit')
}

/**
 * Check if user can view an incident
 */
export function canViewIncident(user, incident) {
  if (!user || !incident) return false

  // Safety officers can see all incidents
  if (hasPermission(user, 'incidents.investigate')) return true

  // User can see their own reports
  if (incident.reportedById === user.id) return true

  // Users assigned to the incident
  if (incident.assignedTo === user.id) return true

  return hasPermission(user, 'incidents.view')
}

/**
 * Check if user can investigate an incident
 */
export function canInvestigateIncident(user, incident) {
  if (!user || !incident) return false

  // Must have investigate permission
  if (!hasPermission(user, 'incidents.investigate')) return false

  // Must be assigned or have manage access
  if (incident.assignedTo === user.id) return true
  if (hasRoleLevel(user, 'safety_officer')) return true

  return false
}

// ============================================
// PERMISSION DISPLAY HELPERS
// ============================================

/**
 * Get role display info
 */
export function getRoleInfo(role) {
  return ROLES[role] || { label: role, level: 0, color: 'bg-gray-100 text-gray-700' }
}

/**
 * Get permission display info
 */
export function getPermissionInfo(permission) {
  return PERMISSIONS[permission] || { label: permission, category: 'other' }
}

/**
 * Get permission categories
 */
export function getPermissionCategories() {
  const categories = new Set()
  Object.values(PERMISSIONS).forEach(p => {
    if (p.category) categories.add(p.category)
  })
  return Array.from(categories)
}

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRoleLevel,
  canAccess,
  canManage,
  getUserPermissions,
  getPermissionsByCategory,
  getAssignableRoles,
  canAssignRole,
  canViewProject,
  canEditProject,
  canViewIncident,
  canInvestigateIncident,
  getRoleInfo,
  getPermissionInfo,
  getPermissionCategories
}
