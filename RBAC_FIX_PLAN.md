# RBAC Fix Plan for Muster

## Executive Summary

The current RBAC implementation is **completely bypassed** - all permission functions return `true` for any authenticated user. This plan provides a phased approach to implement proper role-based access control.

---

## Final RBAC Structure

| Role | Level | View | Create/Edit | Delete | Approve | Manage Team | Manage Settings |
|------|-------|------|-------------|--------|---------|-------------|-----------------|
| **Admin** | 100 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Management** | 70 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Operator** | 40 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Viewer** | 10 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Operator Special Permissions
- Can report incidents (create incident reports)
- Can record own training completions
- Cannot delete or approve anything

### Signup Behavior
- New user creates organization → Automatically assigned **Admin** role

---

## Phase A: Critical Fixes (Security Holes)

### A1. Fix Core Permission Functions

**File: `src/lib/firestoreOrganizations.js`**

Replace the simplified permission functions:

```javascript
// REPLACE lines 91-103

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  return ROLE_PERMISSIONS[role][permission] === true
}

/**
 * Check if roleA is higher or equal in hierarchy to roleB
 */
export function isRoleHigherOrEqual(roleA, roleB) {
  const indexA = ROLE_HIERARCHY.indexOf(roleA)
  const indexB = ROLE_HIERARCHY.indexOf(roleB)
  if (indexA === -1 || indexB === -1) return false
  return indexA <= indexB // Lower index = higher role
}
```

### A2. Update ROLE_PERMISSIONS Object

**File: `src/lib/firestoreOrganizations.js`**

Replace lines 35-86 with the new 4-role system:

```javascript
export const ORGANIZATION_ROLES = {
  admin: 'admin',
  management: 'management',
  operator: 'operator',
  viewer: 'viewer'
}

export const ROLE_HIERARCHY = ['admin', 'management', 'operator', 'viewer']

export const ROLE_PERMISSIONS = {
  admin: {
    viewData: true,
    createEdit: true,
    delete: true,
    approve: true,
    manageTeam: true,
    manageSettings: true,
    reportIncidents: true,
    recordOwnTraining: true
  },
  management: {
    viewData: true,
    createEdit: true,
    delete: true,
    approve: true,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: true,
    recordOwnTraining: true
  },
  operator: {
    viewData: true,
    createEdit: true,
    delete: false,
    approve: false,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: true,
    recordOwnTraining: true
  },
  viewer: {
    viewData: true,
    createEdit: false,
    delete: false,
    approve: false,
    manageTeam: false,
    manageSettings: false,
    reportIncidents: false,
    recordOwnTraining: false
  }
}
```

### A3. Fix OrganizationContext Permission Helpers

**File: `src/contexts/OrganizationContext.jsx`**

Replace the simplified permission functions (lines 100-123 and 197-208):

```javascript
// Replace hasPermission function (around line 100)
const hasPermission = useCallback((permission) => {
  if (!membership?.role) return false
  const rolePerms = ROLE_PERMISSIONS[membership.role]
  return rolePerms?.[permission] === true
}, [membership?.role])

// Replace hasRole function (around line 110)
const hasRole = useCallback((allowedRoles) => {
  if (!membership?.role) return false
  return allowedRoles.includes(membership.role)
}, [membership?.role])

// Replace canManageMember function (around line 120)
const canManageMember = useCallback((targetRole) => {
  if (!membership?.role) return false
  const myIndex = ROLE_HIERARCHY.indexOf(membership.role)
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole)
  if (myIndex === -1 || targetIndex === -1) return false
  return myIndex < targetIndex // Can only manage lower roles
}, [membership?.role])
```

Update convenience flags (lines 197-208):

```javascript
// Computed permission flags based on actual role
isAdmin: membership?.role === 'admin',
isManagement: hasRole(['admin', 'management']),
canEdit: hasPermission('createEdit'),
canDelete: hasPermission('delete'),
canApprove: hasPermission('approve'),
canManageTeam: hasPermission('manageTeam'),
canManageSettings: hasPermission('manageSettings'),
canReportIncidents: hasPermission('reportIncidents'),
hasOrganization: !!organization,

// Remove these hardcoded flags:
// isDevMode: true,  <- DELETE
// isPlatformAdmin: !!user  <- DELETE
```

### A4. Fix Signup to Assign Admin Role

**File: `src/lib/firestoreOrganizations.js`**

In `createOrganization` function (around line 157), change:

```javascript
// CHANGE FROM:
role: ORGANIZATION_ROLES.owner,

// CHANGE TO:
role: ORGANIZATION_ROLES.admin,
```

### A5. Update Firestore Rules

**File: `firestore.rules`**

Update the helper functions to match new role names:

```javascript
// Replace hasRole function (around line 28)
function hasRole(orgId, allowedRoles) {
  let membership = getMembership(orgId);
  return membership != null &&
    membership.data.status == 'active' &&
    membership.data.role in allowedRoles;
}

// Update canManageTeam (around line 36)
function canManageTeam(orgId) {
  return hasRole(orgId, ['admin']);
}

// Update canDelete (around line 41)
function canDelete(orgId) {
  return hasRole(orgId, ['admin', 'management']);
}

// Update canEdit (around line 46)
function canEdit(orgId) {
  return hasRole(orgId, ['admin', 'management', 'operator']);
}

// NEW: Add canApprove function
function canApprove(orgId) {
  return hasRole(orgId, ['admin', 'management']);
}
```

Update organization member rules (around lines 80-97):

```javascript
// Allow creating membership if user has admin permission
allow create: if isAuthenticated() && (
  (request.resource.data.userId == request.auth.uid &&
   request.resource.data.role == 'admin') ||
  canManageTeam(request.resource.data.organizationId)
);
```

---

## Phase B: Core RBAC Infrastructure

### B1. Consolidate Role Definitions

**Delete these files (or mark as deprecated):**
- `src/lib/userRoles.js` - Replace with firestoreOrganizations roles
- `src/lib/permissionsService.js` - Replace with firestoreOrganizations roles

**Create new unified file: `src/lib/rbac.js`**

```javascript
/**
 * rbac.js
 * Unified Role-Based Access Control definitions
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGEMENT: 'management',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
}

export const ROLE_HIERARCHY = ['admin', 'management', 'operator', 'viewer']

export const ROLE_INFO = {
  admin: {
    label: 'Admin',
    description: 'Full access to all features and settings',
    level: 100,
    color: 'bg-purple-100 text-purple-800'
  },
  management: {
    label: 'Management',
    description: 'Can create, edit, delete, and approve content',
    level: 70,
    color: 'bg-blue-100 text-blue-800'
  },
  operator: {
    label: 'Operator',
    description: 'Can view and edit content, report incidents',
    level: 40,
    color: 'bg-green-100 text-green-800'
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to all data',
    level: 10,
    color: 'bg-gray-100 text-gray-600'
  }
}

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

// Helper functions
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  return ROLE_PERMISSIONS[role][permission] === true
}

export function getRoleLevel(role) {
  return ROLE_INFO[role]?.level ?? 0
}

export function canAssignRole(assignerRole, targetRole) {
  const assignerLevel = getRoleLevel(assignerRole)
  const targetLevel = getRoleLevel(targetRole)
  // Can only assign roles with lower level
  return assignerLevel > targetLevel
}

export function getAssignableRoles(userRole) {
  const userLevel = getRoleLevel(userRole)
  return Object.entries(ROLE_INFO)
    .filter(([_, info]) => info.level < userLevel)
    .map(([key, info]) => ({ value: key, ...info }))
    .sort((a, b) => b.level - a.level)
}
```

### B2. Create Permission Guard Component

**New file: `src/components/PermissionGuard.jsx`**

```javascript
/**
 * PermissionGuard.jsx
 * Component to conditionally render based on permissions
 */

import { useOrganization } from '../hooks/useOrganization'

export function PermissionGuard({
  permission,
  roles,
  fallback = null,
  children
}) {
  const { hasPermission, hasRole } = useOrganization()

  // Check permission if provided
  if (permission && !hasPermission(permission)) {
    return fallback
  }

  // Check roles if provided
  if (roles && !hasRole(roles)) {
    return fallback
  }

  return children
}

export function RequireAdmin({ children, fallback = null }) {
  return (
    <PermissionGuard roles={['admin']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function RequireManagement({ children, fallback = null }) {
  return (
    <PermissionGuard roles={['admin', 'management']} fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CanEdit({ children, fallback = null }) {
  return (
    <PermissionGuard permission="createEdit" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}

export function CanDelete({ children, fallback = null }) {
  return (
    <PermissionGuard permission="delete" fallback={fallback}>
      {children}
    </PermissionGuard>
  )
}
```

### B3. Create usePermissions Hook

**New file: `src/hooks/usePermissions.js`**

```javascript
/**
 * usePermissions.js
 * Hook for checking permissions in components
 */

import { useMemo } from 'react'
import { useOrganization } from './useOrganization'
import { PERMISSIONS } from '../lib/rbac'

export function usePermissions() {
  const { membership, hasPermission, hasRole } = useOrganization()

  return useMemo(() => ({
    // Current role
    role: membership?.role,

    // Permission checks
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

    // Raw check functions
    hasPermission,
    hasRole
  }), [membership?.role, hasPermission, hasRole])
}
```

---

## Phase C: UI/UX Updates

### C1. Update InviteMemberModal Roles

**File: `src/components/settings/InviteMemberModal.jsx`**

Update AVAILABLE_ROLES (around line 21):

```javascript
const AVAILABLE_ROLES = [
  { value: 'management', label: 'Management', description: 'Can create, edit, delete, and approve content' },
  { value: 'operator', label: 'Operator', description: 'Can view and edit content, report incidents' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to all data' }
]
```

Note: Admin cannot be invited - first user is Admin, additional Admins would need to be promoted.

### C2. Update RoleSelector Component

**File: `src/components/settings/RoleSelector.jsx`**

Update ROLE_LABELS and ROLE_COLORS:

```javascript
const ROLE_LABELS = {
  admin: 'Admin',
  management: 'Management',
  operator: 'Operator',
  viewer: 'Viewer'
}

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  management: 'bg-blue-100 text-blue-800 border-blue-200',
  operator: 'bg-green-100 text-green-800 border-green-200',
  viewer: 'bg-gray-100 text-gray-600 border-gray-200'
}
```

### C3. Update TeamMembers Page

**File: `src/pages/settings/TeamMembers.jsx`**

Update ROLE_COLORS and the permissions info section:

```javascript
const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  management: 'bg-blue-100 text-blue-800',
  operator: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-600'
}

// Update the Role Permissions Info section (around line 347-378)
// to reflect the new 4-role system
```

### C4. Add Permission Guards to Protected Pages

**File: `src/pages/Settings.jsx`**

Wrap admin-only sections:

```javascript
import { RequireAdmin, CanEdit } from '../components/PermissionGuard'

// Around team management section:
<RequireAdmin>
  <TeamMembers />
</RequireAdmin>
```

### C5. Conditional UI Based on Permissions

Throughout the application, wrap action buttons:

```javascript
// Example in a list component:
import { CanEdit, CanDelete } from '../components/PermissionGuard'

// Edit button
<CanEdit>
  <button onClick={handleEdit}>Edit</button>
</CanEdit>

// Delete button
<CanDelete>
  <button onClick={handleDelete}>Delete</button>
</CanDelete>
```

---

## Phase D: Testing & Migration

### D1. Create Test Users Script

Create test accounts with each role to verify permissions work correctly.

### D2. Migrate Existing Users

**Migration Script (run once):**

```javascript
// Migrate 'owner' to 'admin', keep other roles as-is or map them

const ROLE_MIGRATION_MAP = {
  'owner': 'admin',
  'admin': 'admin',
  'manager': 'management',
  'operator': 'operator',
  'viewer': 'viewer'
}
```

### D3. Update Firestore Indexes

Ensure any role-based queries have proper indexes in `firestore.indexes.json`.

### D4. Testing Checklist

- [ ] New user signup → Admin role assigned
- [ ] Admin can access all features
- [ ] Admin can invite members with any role (except Admin)
- [ ] Admin can change member roles
- [ ] Admin can access Settings/Team Management
- [ ] Management can create/edit/delete content
- [ ] Management can approve workflows
- [ ] Management CANNOT access Team Management
- [ ] Operator can create/edit content
- [ ] Operator can report incidents
- [ ] Operator CANNOT delete content
- [ ] Operator CANNOT approve workflows
- [ ] Viewer can only view content
- [ ] Viewer CANNOT create/edit/delete anything
- [ ] Firestore rules enforce permissions server-side

---

## Files to Modify Summary

### Phase A (Critical)
1. `src/lib/firestoreOrganizations.js` - Fix permission functions, update roles
2. `src/contexts/OrganizationContext.jsx` - Fix permission helpers
3. `firestore.rules` - Update role names in rules

### Phase B (Infrastructure)
4. Create `src/lib/rbac.js` - Unified RBAC definitions
5. Create `src/components/PermissionGuard.jsx` - Permission guard components
6. Create `src/hooks/usePermissions.js` - Permissions hook
7. Delete/deprecate `src/lib/userRoles.js`
8. Delete/deprecate `src/lib/permissionsService.js`

### Phase C (UI/UX)
9. `src/components/settings/InviteMemberModal.jsx` - Update role options
10. `src/components/settings/RoleSelector.jsx` - Update role labels/colors
11. `src/pages/settings/TeamMembers.jsx` - Update UI for new roles
12. `src/pages/Settings.jsx` - Add permission guards
13. Various pages - Add CanEdit/CanDelete guards to buttons

### Phase D (Testing)
14. Create migration script for existing users
15. Create test users for each role
16. Verify all permissions work correctly

---

## Estimated Impact

- **Security**: All permission bypasses will be closed
- **Breaking Changes**:
  - 'owner' role → 'admin'
  - 'manager' role → 'management'
  - Existing users will need role migration
- **UI Changes**:
  - Role selector shows 3 options (management, operator, viewer)
  - Some buttons will be hidden for lower roles
